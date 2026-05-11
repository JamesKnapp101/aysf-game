import { ROOM_NAME_TOKEN_END, ROOM_NAME_TOKEN_START } from "@game/constants";
import { advanceTurn } from "@game/engine/turn";
import { createInitialState } from "@game/gameInit";
import {
  AQUARIUM_DROWNING_DAMAGE_PER_TURN,
  AQUARIUM_OXYGEN_LOSS_PER_TURN,
} from "@game/helpers/environmentHelpers";
import { buildRoomItemsDescription } from "@game/helpers/descriptionHelpers";
import { triggerPlayerDeath } from "@game/helpers/gameHelpers";
import { applyStatusEffectToPlayer } from "@game/rules/status";
import { getRadiationIntensity } from "@game/selectors/statusSelectors";
import { buildRoomDescription } from "@game/text/roomDescription";
import { describe, expect, it } from "vitest";
import { AQUARIUM_BREATHER_ITEM_ID } from "src/world/Items/creatures/octopus";
import { INITIAL_WORLD } from "src/world/World";
import {
  buildDamageNotification,
  GOSSIP_NOTIFICATION_TEXT,
  buildMemoryNotification,
  buildScoreNotification,
} from "../game/rules/notifications";
import { getItemsInRoom } from "../game/selectors/roomSelectors";
import {
  createTestState,
  expectInventoryToContain,
  getLastLogEntry,
  patchRoomDarkness,
  runCommand,
  runCommands,
  setInventory,
} from "./helpers/gameTestHelpers";

describe("General gameplay", () => {
  it("seeds starting-room objects in the initial world chunk", async () => {
    const state = createInitialState(INITIAL_WORLD);
    const itemIds = getItemsInRoom(state, "StairWellSeven").map((item) => item.id);

    expect(itemIds).toEqual(
      expect.arrayContaining([
        "MysteriousNote",
        "damagedFlashlight",
        "seed",
      ]),
    );

    const next = await runCommand(state, "take flashlight");

    expect(expectInventoryToContain(next, "damagedFlashlight")).toBe(true);
  });

  it("lets the player move from room to room", async () => {
    const initial = createTestState({ roomId: "LevelSixCorridorBend" });

    const next = await runCommand(initial, "east");

    expect(next.player.roomId).toBe("LevelSixStairAccess");
  });

  it("lets the player move through standard doors", async () => {
    const initial = createTestState({ roomId: "LevelThreeCorridorOne" });

    const next = await runCommand(initial, "east");

    expect(next.player.roomId).toBe("LivingQuartersOneEast");
    expect(getLastLogEntry(next)).toContain("You open the door and step through.");
  });

  it("logs the full panel description the first time the player enters a room", async () => {
    const start = createTestState({
      roomId: "LevelThreeCorridorThree",
      visitedRooms: ["LevelThreeCorridorThree"],
    });

    const next = await runCommand(start, "east");
    const fullPanelDescription = buildRoomDescription(
      next,
      "LivingQuartersThreeEast",
      {
        mode: "panel",
        forceFull: true,
      },
    );
    const roomName = `${ROOM_NAME_TOKEN_START}${
      next.world.rooms.find((room) => room.id === "LivingQuartersThreeEast")
        ?.name
    }${ROOM_NAME_TOKEN_END}`;
    const lastLogEntry = getLastLogEntry(next);

    expect(lastLogEntry).toContain("You open the door and step through.");
    expect(lastLogEntry).toContain(`${roomName}\n${fullPanelDescription}`);
    expect(
      lastLogEntry.indexOf("You open the door and step through."),
    ).toBeLessThan(lastLogEntry.indexOf(roomName));
  });

  it("logs only non-scenery objects on revisiting a room", async () => {
    const start = createTestState({
      roomId: "LevelThreeCorridorThree",
      visitedRooms: ["LevelThreeCorridorThree", "LivingQuartersThreeEast"],
    });

    const next = await runCommand(start, "east");
    const itemOnlyDescription = buildRoomItemsDescription(
      next,
      "LivingQuartersThreeEast",
    );
    const lastLogEntry = getLastLogEntry(next);

    expect(lastLogEntry).toContain(itemOnlyDescription);
    expect(lastLogEntry).not.toContain(
      "This is a small living room dominated by a large seating area",
    );
    expect(lastLogEntry).not.toContain(
      "To the west is the unit's front door.",
    );
  });

  it("lets the player pick up collectable items", async () => {
    const initial = setInventory(
      createTestState({ roomId: "ThreeWestBed" }),
      [],
    );

    const next = await runCommand(initial, "take research notes");

    expect(expectInventoryToContain(next, "ResearchNotes")).toBe(true);
  });

  it("lets the player drop carried items and keeps them in the current room", async () => {
    const initial = await runCommand(
      setInventory(createTestState({ roomId: "ThreeWestBed" }), []),
      "take research notes",
    );

    const next = await runCommand(initial, "drop research notes");
    const itemsHere = getItemsInRoom(next, "ThreeWestBed").map((item) => item.id);

    expect(expectInventoryToContain(next, "ResearchNotes")).toBe(false);
    expect(itemsHere).toContain("ResearchNotes");
  });

  it("logs player activity into the transcript", async () => {
    const next = await runCommand(
      setInventory(createTestState({ roomId: "ThreeWestBed" }), []),
      "take research notes",
    );

    expect(
      next.log.some(
        (entry) =>
          entry.includes("> take research notes") && entry.includes("Taken."),
      ),
    ).toBe(true);
  });

  it("stores loggable readable text in the player log and removes the original note", async () => {
    const start = setInventory(createTestState({ roomId: "ThreeWestBed" }), []);

    const next = await runCommands(start, [
      "take research notes",
      "read research notes",
    ]);

    expect(next.player.log).toHaveLength(1);
    expect(next.player.log[0]?.title).toContain("Research Notes");
    expect(expectInventoryToContain(next, "ResearchNotes")).toBe(false);
    expect(next.world.items.find((item) => item.id === "ResearchNotes")?.location).toBe(
      "unknown",
    );
  });

  it("shows readable text without logging or removing non-loggable items", async () => {
    const start = setInventory(createTestState({ roomId: "ThreeWestBath" }), []);

    const next = await runCommands(start, ["take ice bag", "read ice bag"]);

    expect(next.player.log).toHaveLength(0);
    expect(expectInventoryToContain(next, "IceBag")).toBe(true);
  });

  it("keeps status effects active for their duration and then removes them", async () => {
    const withEffect = applyStatusEffectToPlayer(
      createTestState(),
      "drunk",
      1,
      2,
    );

    const afterOneTurn = advanceTurn(withEffect);
    const afterTwoTurns = advanceTurn(afterOneTurn);

    expect(afterOneTurn.player.statusEffects.map((effect) => effect.id)).toContain(
      "drunk",
    );
    expect(afterTwoTurns.player.statusEffects.map((effect) => effect.id)).not.toContain(
      "drunk",
    );
  });

  it("logs smarter status messages only when the effect starts and ends", async () => {
    const withEffect = applyStatusEffectToPlayer(
      createTestState(),
      "smarter",
      100,
      3,
    );

    const afterFirstTurn = advanceTurn(withEffect);
    const afterMiddleTurn = advanceTurn(afterFirstTurn);
    const afterLastTurn = advanceTurn(afterMiddleTurn);
    const transcript = afterLastTurn.log.join("\n");

    expect(afterFirstTurn.log.join("\n")).toContain(
      "You feel a strange tingle that travels up your spine",
    );
    expect(afterMiddleTurn.log.join("\n")).not.toContain(
      "Your newfound enlightenment warbles",
    );
    expect(transcript).toContain("Your newfound enlightenment warbles");
    expect(transcript.match(/strange tingle/g)).toHaveLength(1);
    expect(transcript.match(/newfound enlightenment warbles/g)).toHaveLength(1);
    expect(afterLastTurn.player.statusEffects.map((effect) => effect.id)).not.toContain(
      "smarter",
    );
  });

  it("logs stronger status messages only when the effect starts and ends", async () => {
    const withEffect = applyStatusEffectToPlayer(
      createTestState(),
      "stronger",
      100,
      3,
    );

    const afterFirstTurn = advanceTurn(withEffect);
    const afterMiddleTurn = advanceTurn(afterFirstTurn);
    const afterLastTurn = advanceTurn(afterMiddleTurn);
    const transcript = afterLastTurn.log.join("\n");

    expect(afterFirstTurn.log.join("\n")).toContain(
      "You feel a warmth flooding through you",
    );
    expect(afterMiddleTurn.log.join("\n")).not.toContain(
      "You feel a twitch in your shoulder",
    );
    expect(transcript).toContain("You feel a twitch in your shoulder");
    expect(transcript.match(/warmth flooding through you/g)).toHaveLength(1);
    expect(transcript.match(/twitch in your shoulder/g)).toHaveLength(1);
    expect(afterLastTurn.player.statusEffects.map((effect) => effect.id)).not.toContain(
      "stronger",
    );
  });

  it("applies radiation intensity to health loss during turn advancement", async () => {
    const withRadiation = applyStatusEffectToPlayer(
      createTestState(),
      "radiation",
      20,
      3,
    );

    const afterTurn = advanceTurn(withRadiation);

    expect(getRadiationIntensity(afterTurn)).toBe(20);
    expect(afterTurn.player.vitals.health).toBe(99);
  });

  it("shows the full room description when a room is lit", async () => {
    const state = createTestState({ roomId: "LevelSixCorridorBend" });

    const description = buildRoomDescription(state, state.player.roomId, {
      mode: "panel",
      forceFull: true,
    });

    expect(description).toContain("The corridor has experienced some minor structural damage");
    expect(description).not.toContain("It's pitch black");
  });

  it("shows the dark-room fallback when the player cannot see", async () => {
    const state = setInventory(
      createTestState({ roomId: "LivingQuartersThreeWest" }),
      [],
    );

    const description = buildRoomDescription(state, state.player.roomId, {
      mode: "panel",
      forceFull: true,
    });

    expect(description).toBe("It's pitch black in here, you can't see a thing.");
  });

  it("inserts scenery descriptions in their configured order", async () => {
    const state = patchRoomDarkness(
      createTestState({ roomId: "ThreeWestBed" }),
      "ThreeWestBed",
      false,
    );

    const description = buildRoomDescription(state, "ThreeWestBed", {
      mode: "panel",
      forceFull: true,
    });

    const first = description.indexOf("In the northeast corner of the room is a bunk with red bedding");
    const second = description.indexOf(
      "next to which is a wooden end table, also red",
    );
    const third = description.indexOf(
      "In the northwest corner of the room is a bunk with blue bedding",
    );

    expect(first).toBeGreaterThan(-1);
    expect(second).toBeGreaterThan(first);
    expect(third).toBeGreaterThan(second);
  });

  it("updates score when the player completes a score-bearing task", async () => {
    const start = setInventory(createTestState({ roomId: "PowerGrid" }), []);
    const seeded = {
      ...start,
      world: {
        ...start.world,
        items: start.world.items.map((item) =>
          item.id === "PowerStationKey"
            ? { ...item, location: "PowerGrid" }
            : item,
        ),
      },
      itemState: {
        ...start.itemState,
        itemRoomId: {
          ...start.itemState.itemRoomId,
          PowerStationKey: "PowerGrid",
        },
      },
    };
    const next = await runCommand(seeded, "take key");

    expect(next.worldState.scoresTriggered.obtained_power_key).toBe(true);
    expect(next.score).toBe(5);
    expect(next.uiState.notifications).toContainEqual({
      id: 1,
      ...buildScoreNotification("obtained_power_key"),
    });
  });

  it("updates memory rating when the player completes a memory-bearing task", async () => {
    const start = patchRoomDarkness(
      createTestState({ roomId: "ThreeWestBath" }),
      "ThreeWestBath",
      false,
    );

    const next = await runCommand(start, "examine mirror");

    expect(next.player.memoriesTriggered.own_image).toBe(true);
    expect(next.rating).toBe(5);
    expect(next.uiState.notifications).toContainEqual({
      id: 1,
      ...buildMemoryNotification(5),
    });
  });

  it("shows restored hair in the mirror after hairychew finishes", async () => {
    const start = patchRoomDarkness(
      setInventory(createTestState({ roomId: "ThreeWestBath" }), ["hairychew"]),
      "ThreeWestBath",
      false,
    );

    const grown = await runCommands(start, [
      "eat chewable",
      "wait",
      "wait",
      "wait",
    ]);

    expect(grown.player.mirror.hasHair).toBe(true);

    const reflected = await runCommand(grown, "examine mirror");

    expect(reflected.log.join("\n")).toContain(
      "head covered in a shock of blond hair",
    );
  });

  it("runs MindGun corpse memories outside real-world time", async () => {
    const base = setInventory(createTestState({ roomId: "StairWellSeven" }), [
      "MindGun",
      "MindCap",
    ]);
    const start = {
      ...base,
      player: {
        ...base.player,
        statusEffects: [
          { id: "radiation" as const, intensity: 100, remainingTurns: 3 },
        ],
      },
      itemState: {
        ...base.itemState,
        wornByPlayer: {
          ...base.itemState.wornByPlayer,
          head: "MindCap",
        },
      },
    };

    const linked = await runCommand(start, "shoot corpse with scanner");

    expect(linked.player.roomId).toBe("FallenCorpseMemory");
    expect(linked.worldState.activeExperience).toMatchObject({
      experienceId: "fallen_corpse_memory",
      returnRoomId: "StairWellSeven",
    });
    const initialTurnsRemaining =
      linked.worldState.activeExperience?.turnsRemaining ?? 0;
    expect(initialTurnsRemaining).toBeGreaterThan(1);
    expect(linked.player.vitals.health).toBe(100);

    const waited = await runCommand(linked, "wait");

    expect(waited.player.roomId).toBe("FallenCorpseMemory");
    expect(waited.worldState.activeExperience?.turnsRemaining).toBe(
      initialTurnsRemaining - 1,
    );
    expect(waited.player.vitals.health).toBe(100);

    let returned = waited;
    for (let i = 0; i < initialTurnsRemaining && returned.worldState.activeExperience; i += 1) {
      returned = await runCommand(returned, "wait");
    }
    const returnedTranscript = returned.log.join("\n");

    expect(returned.player.roomId).toBe("StairWellSeven");
    expect(returned.worldState.activeExperience).toBeUndefined();
    expect(returned.player.vitals.health).toBe(100);
    expect(returnedTranscript.indexOf("The memory collapses")).toBeLessThan(
      returnedTranscript.indexOf("Bottom of Stairwell"),
    );
  });

  it("runs timed events inside MindGun corpse memories", async () => {
    const base = setInventory(
      createTestState({ roomId: "LevelThreeCorridorThree" }),
      ["MindGun", "MindCap"],
    );
    const start = {
      ...base,
      itemState: {
        ...base.itemState,
        wornByPlayer: {
          ...base.itemState.wornByPlayer,
          head: "MindCap",
        },
      },
    };

    const linked = await runCommand(start, "shoot corpse with scanner");

    expect(linked.player.roomId).toBe("HalvedCorpseMemory");
    expect(linked.worldState.darkRooms.HalvedCorpseMemory).not.toBe(true);

    const afterOneTurn = await runCommand(linked, "wait");

    expect(afterOneTurn.worldState.activeExperience?.turnsRemaining).toBe(2);
    expect(afterOneTurn.worldState.darkRooms.HalvedCorpseMemory).not.toBe(true);
    expect(getLastLogEntry(afterOneTurn)).toContain("octopus nursery");
    expect(afterOneTurn.player.spiltTea).toContainEqual({
      id: "nursery mishap",
      title: "Lil-Lilly Tendwick made a costly mistake at the Aquarium",
      summary:
        "Lil-Lilly Tendwick apparently set the water temperature incorrectly at the aquarium's octopus nursery, with unfortunate results.",
      tags: [],
      type: "gossip",
    });
    expect(afterOneTurn.uiState.notifications).toContainEqual({
      id: 1,
      kind: "gossip",
      text: GOSSIP_NOTIFICATION_TEXT,
    });

    const afterBlackout = await runCommand(afterOneTurn, "wait");

    expect(afterBlackout.worldState.activeExperience?.turnsRemaining).toBe(1);
    expect(afterBlackout.worldState.darkRooms.HalvedCorpseMemory).toBe(true);
    expect(afterBlackout.itemState.itemRoomId.LilLillyCorridorThree).toBe(
      "NOWHERE",
    );
    expect(getLastLogEntry(afterBlackout)).toContain("The lights go out");

    const returned = await runCommand(afterBlackout, "wait");

    expect(returned.player.roomId).toBe("LevelThreeCorridorThree");
    expect(returned.worldState.activeExperience).toBeUndefined();
    expect(returned.log.join("\n")).toContain(
      "In the dark, Lil-Lilly makes it only a few steps",
    );

    const replayed = await runCommand(returned, "shoot corpse with scanner");

    expect(replayed.player.roomId).toBe("HalvedCorpseMemory");
    expect(replayed.worldState.darkRooms.HalvedCorpseMemory).toBe(false);
    expect(replayed.itemState.itemRoomId.LilLillyCorridorThree).toBe(
      "HalvedCorpseMemory",
    );

    const replayedAfterOneTurn = await runCommand(replayed, "wait");
    expect(
      replayedAfterOneTurn.player.spiltTea.filter(
        (topic) => topic.id === "nursery mishap",
      ),
    ).toHaveLength(1);
    expect(
      replayedAfterOneTurn.uiState.notifications.filter(
        (notification) => notification.kind === "gossip",
      ),
    ).toHaveLength(1);
  });

  it("aborts active memories back to the return room", async () => {
    const base = setInventory(createTestState({ roomId: "StairWellSeven" }), [
      "MindGun",
      "MindCap",
    ]);
    const start = {
      ...base,
      itemState: {
        ...base.itemState,
        wornByPlayer: {
          ...base.itemState.wornByPlayer,
          head: "MindCap",
        },
      },
    };

    const linked = await runCommand(start, "shoot corpse with scanner");
    const aborted = await runCommand(linked, "abort");

    expect(aborted.player.roomId).toBe("StairWellSeven");
    expect(aborted.worldState.activeExperience).toBeUndefined();
    expect(getLastLogEntry(aborted)).toContain(
      "pull yourself free",
    );
  });

  it("revives the player in a previously visited lit room and leaves behind a husk", async () => {
    const start = createTestState({
      roomId: "LevelSixCorridorEnd",
      visitedRooms: ["LevelSixCorridorEnd", "LevelSixCorridorBend"],
      rng: () => 0,
    });

    const next = triggerPlayerDeath(
      start,
      "Everything goes wrong.",
      "test cause",
    );

    expect(next.player.roomId).toBe("LevelSixCorridorBend");
    expect(next.worldState.visitedRooms[next.player.roomId]).toBe(true);
    expect(next.worldState.darkRooms[next.player.roomId]).not.toBe(true);
    expect(
      next.world.items.some(
        (item) =>
          item.id.startsWith("playerRegenHusk") &&
          item.location === next.player.roomId,
      ),
    ).toBe(true);
  });

  it("drains oxygen underwater and starts damaging health after the air runs out", async () => {
    const baseState = createTestState({ roomId: "AqOpen1" });
    const start = {
      ...baseState,
      player: {
        ...baseState.player,
        vitals: {
          ...baseState.player.vitals,
          health: 50,
          oxygen: AQUARIUM_OXYGEN_LOSS_PER_TURN * 2,
        },
      },
    };

    const afterOne = advanceTurn(start);
    const afterTwo = advanceTurn(afterOne);
    const afterThree = advanceTurn(afterTwo);

    expect(afterOne.player.vitals.oxygen).toBe(AQUARIUM_OXYGEN_LOSS_PER_TURN);
    expect(afterOne.player.vitals.health).toBe(50);
    expect(afterTwo.player.vitals.oxygen).toBe(0);
    expect(afterTwo.player.vitals.health).toBe(50);
    expect(afterThree.player.vitals.oxygen).toBe(0);
    expect(afterThree.player.vitals.health).toBe(
      50 - AQUARIUM_DROWNING_DAMAGE_PER_TURN,
    );
    expect(afterThree.uiState.notifications).toContainEqual({
      id: 1,
      ...buildDamageNotification(AQUARIUM_DROWNING_DAMAGE_PER_TURN),
    });
  });

  it("refills oxygen immediately when the player reaches dry air", async () => {
    const baseState = createTestState({ roomId: "AqOpen1" });
    const start = {
      ...baseState,
      player: {
        ...baseState.player,
        vitals: {
          ...baseState.player.vitals,
          oxygen: 10,
        },
      },
    };

    const next = await runCommand(start, "south");

    expect(next.player.roomId).toBe("AqStart");
    expect(next.player.vitals.oxygen).toBe(100);
  });

  it("refills oxygen and prevents underwater loss while the breather is worn", async () => {
    const baseState = setInventory(createTestState({ roomId: "AqOpen1" }), [
      AQUARIUM_BREATHER_ITEM_ID,
    ]);
    const start = {
      ...baseState,
      player: {
        ...baseState.player,
        vitals: {
          ...baseState.player.vitals,
          oxygen: 30,
        },
      },
    };

    const worn = await runCommand(start, "wear breather");
    const afterWait = await runCommand(worn, "wait");

    expect(worn.itemState.wornByPlayer.face).toBe(AQUARIUM_BREATHER_ITEM_ID);
    expect(worn.player.vitals.oxygen).toBe(100);
    expect(afterWait.player.vitals.oxygen).toBe(100);
  });
});

