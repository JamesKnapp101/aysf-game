import { advanceTurn } from "@game/engine/turn";
import {
  AQUARIUM_DROWNING_DAMAGE_PER_TURN,
  AQUARIUM_OXYGEN_LOSS_PER_TURN,
} from "@game/helpers/environmentHelpers";
import { triggerPlayerDeath } from "@game/helpers/gameHelpers";
import { applyStatusEffectToPlayer } from "@game/rules/status";
import { getRadiationIntensity } from "@game/selectors/statusSelectors";
import { buildRoomDescription } from "@game/text/roomDescription";
import { describe, expect, it } from "vitest";
import { AQUARIUM_BREATHER_ITEM_ID } from "src/world/Items/creatures/octopus";
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
  it("lets the player move from room to room", () => {
    const initial = createTestState({ roomId: "LevelSixCorridorBend" });

    const next = runCommand(initial, "east");

    expect(next.player.roomId).toBe("LevelSixStairAccess");
  });

  it("lets the player move through standard doors", () => {
    const initial = createTestState({ roomId: "LevelThreeCorridorOne" });

    const next = runCommand(initial, "east");

    expect(next.player.roomId).toBe("LivingQuartersOneEast");
    expect(getLastLogEntry(next)).toContain("You open the door and step through.");
  });

  it("lets the player pick up collectable items", () => {
    const initial = setInventory(
      createTestState({ roomId: "ThreeWestBed" }),
      [],
    );

    const next = runCommand(initial, "take research notes");

    expect(expectInventoryToContain(next, "ResearchNotes")).toBe(true);
  });

  it("lets the player drop carried items and keeps them in the current room", () => {
    const initial = runCommand(
      setInventory(createTestState({ roomId: "ThreeWestBed" }), []),
      "take research notes",
    );

    const next = runCommand(initial, "drop research notes");
    const itemsHere = getItemsInRoom(next, "ThreeWestBed").map((item) => item.id);

    expect(expectInventoryToContain(next, "ResearchNotes")).toBe(false);
    expect(itemsHere).toContain("ResearchNotes");
  });

  it("logs player activity into the transcript", () => {
    const next = runCommand(
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

  it("stores loggable readable text in the player log and removes the original note", () => {
    const start = setInventory(createTestState({ roomId: "ThreeWestBed" }), []);

    const next = runCommands(start, [
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

  it("shows readable text without logging or removing non-loggable items", () => {
    const start = setInventory(createTestState({ roomId: "ThreeWestBath" }), []);

    const next = runCommands(start, ["take ice bag", "read ice bag"]);

    expect(next.player.log).toHaveLength(0);
    expect(expectInventoryToContain(next, "IceBag")).toBe(true);
  });

  it("keeps status effects active for their duration and then removes them", () => {
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

  it("applies radiation intensity to health loss during turn advancement", () => {
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

  it("shows the full room description when a room is lit", () => {
    const state = createTestState({ roomId: "LevelSixCorridorBend" });

    const description = buildRoomDescription(state, state.player.roomId, {
      mode: "panel",
      forceFull: true,
    });

    expect(description).toContain("The corridor has experienced some minor structural damage");
    expect(description).not.toContain("It's pitch black");
  });

  it("shows the dark-room fallback when the player cannot see", () => {
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

  it("inserts scenery descriptions in their configured order", () => {
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

  it("updates score when the player completes a score-bearing task", () => {
    const start = setInventory(createTestState({ roomId: "PowerGrid" }), []);

    const next = runCommand(start, "take key");

    expect(next.worldState.scoresTriggered.obtained_power_key).toBe(true);
    expect(next.score).toBe(5);
  });

  it("updates memory rating when the player completes a memory-bearing task", () => {
    const start = patchRoomDarkness(
      createTestState({ roomId: "ThreeWestBath" }),
      "ThreeWestBath",
      false,
    );

    const next = runCommand(start, "examine mirror");

    expect(next.player.memoriesTriggered.own_image).toBe(true);
    expect(next.rating).toBe(5);
  });

  it("revives the player in a previously visited lit room and leaves behind a husk", () => {
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

  it("drains oxygen underwater and starts damaging health after the air runs out", () => {
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
  });

  it("refills oxygen immediately when the player reaches dry air", () => {
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

    const next = runCommand(start, "south");

    expect(next.player.roomId).toBe("AqStart");
    expect(next.player.vitals.oxygen).toBe(100);
  });

  it("refills oxygen and prevents underwater loss while the breather is worn", () => {
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

    const worn = runCommand(start, "wear breather");
    const afterWait = runCommand(worn, "wait");

    expect(worn.itemState.wornByPlayer.face).toBe(AQUARIUM_BREATHER_ITEM_ID);
    expect(worn.player.vitals.oxygen).toBe(100);
    expect(afterWait.player.vitals.oxygen).toBe(100);
  });
});
