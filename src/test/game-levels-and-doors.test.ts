import { tickHydroponics } from "@game/engine/ticks/hydroponicsTick";
import { advanceTurn } from "@game/engine/turn";
import { buildRoomItemsDescription } from "@game/helpers/descriptionHelpers";
import {
  PARK_EAST_POWER_KEY_DELAYED_SNATCH_MESSAGE,
  PARK_EAST_POWER_KEY_TAKE_SNATCH_MESSAGE,
} from "@game/helpers/parkKeyHijack";
import { startGamePreserveRun } from "@game/preserve/preserveState";
import { useUIEffectsStore } from "@game/store/store";
import { buildRoomDescription } from "@game/text/roomDescription";
import { describe, expect, it } from "vitest";
import {
  AQUARIUM_BREATHER_ITEM_ID,
  AQUARIUM_ELECTRIC_PROD_ITEM_ID,
  createInitialOctopusState,
} from "../world/Items/creatures/octopus";
import { LEVEL_FIVE } from "../world/maps/levelFive/LevelFive";
import { GAME_PRESERVE_SPAWN_ROOM_ID } from "../world/maps/levelFour/gamePreserveRules";
import { hydroponicsItems } from "../world/maps/levelSix/Hydroponics";
import {
  buildHydroponicsTerminalMenu,
  describeHydroponicsSignIn,
  HYDROPONICS_EMPLOYEE_PROFILES,
} from "../world/maps/levelSix/hydroponicsPuzzle";
import { LEVEL_TWO_BOMB_DETONATED_TRIGGER_ID } from "../world/maps/levelTwo/levelTwoBomb";
import {
  createTestState,
  expectInventoryToContain,
  getLastLogEntry,
  runCommand,
  runCommands,
  setInventory,
} from "./helpers/gameTestHelpers";

function setItemRoom(
  state: ReturnType<typeof createTestState>,
  itemId: string,
  roomId: string,
) {
  return {
    ...state,
    world: {
      ...state.world,
      items: state.world.items.map((item) =>
        item.id === itemId ? { ...item, location: roomId } : item,
      ),
    },
    itemState: {
      ...state.itemState,
      itemRoomId: {
        ...state.itemState.itemRoomId,
        [itemId]: roomId,
      },
    },
  };
}

function removeIdsFromPlacementList(
  lists: Record<string, string[]>,
  itemIds: string[],
) {
  const blockedIds = new Set(itemIds);

  return Object.fromEntries(
    Object.entries(lists).map(([hostId, ids]) => [
      hostId,
      (ids ?? []).filter((id) => !blockedIds.has(id)),
    ]),
  );
}

function setContainerContents(
  state: ReturnType<typeof createTestState>,
  containerId: string,
  itemIds: string[],
) {
  const itemSet = new Set(itemIds);

  return {
    ...state,
    world: {
      ...state.world,
      items: state.world.items.map((item) =>
        itemSet.has(item.id) ? { ...item, location: containerId } : item,
      ),
    },
    itemState: {
      ...state.itemState,
      itemRoomId: {
        ...state.itemState.itemRoomId,
        ...Object.fromEntries(itemIds.map((itemId) => [itemId, containerId])),
      },
      containerContents: {
        ...removeIdsFromPlacementList(
          state.itemState.containerContents,
          itemIds,
        ),
        [containerId]: [...itemIds],
      },
      surfaceContents: removeIdsFromPlacementList(
        state.itemState.surfaceContents,
        itemIds,
      ),
      underContents: removeIdsFromPlacementList(
        state.itemState.underContents,
        itemIds,
      ),
      searchableContents: removeIdsFromPlacementList(
        state.itemState.searchableContents,
        itemIds,
      ),
    },
  };
}

function freezeTickingItemsExcept(
  state: ReturnType<typeof createTestState>,
  keepIds: string[],
) {
  const keep = new Set(keepIds);
  const frozenItems = state.world.items.reduce<Record<string, boolean>>(
    (acc, item) => {
      if (keep.has(item.id)) return acc;
      if (item.meta?.isAlive !== true) return acc;
      if (!item.overrides?.tick) return acc;
      acc[item.id] = true;
      return acc;
    },
    {},
  );

  return {
    ...state,
    itemState: {
      ...state.itemState,
      frozenItems: {
        ...state.itemState.frozenItems,
        ...frozenItems,
      },
    },
  };
}

function setLevelTwoBomb(
  state: ReturnType<typeof createTestState>,
  options: {
    detonated?: boolean;
    isActive?: boolean;
    remainingTurns?: number;
  },
) {
  const detonated =
    options.detonated ?? state.worldState.levelTwoBomb.detonated;

  return {
    ...state,
    worldState: {
      ...state.worldState,
      conditionalTriggers: {
        ...state.worldState.conditionalTriggers,
        [LEVEL_TWO_BOMB_DETONATED_TRIGGER_ID]: detonated,
      },
      levelTwoBomb: {
        ...state.worldState.levelTwoBomb,
        ...options,
        detonated,
      },
    },
  };
}

function sequenceRng(values: number[]) {
  let index = 0;
  const fallback = values[values.length - 1] ?? 0;
  return () => {
    const next = values[index] ?? fallback;
    index += 1;
    return next;
  };
}

describe("Doors and level mechanics", () => {
  it("authors the hydroponics cocoons as distinct scenery items", async () => {
    const employeeIds = new Set(
      HYDROPONICS_EMPLOYEE_PROFILES.map((profile) => profile.id),
    );
    const cocoonItems = hydroponicsItems.filter((item) =>
      employeeIds.has(item.id),
    );

    expect(cocoonItems).toHaveLength(HYDROPONICS_EMPLOYEE_PROFILES.length);
    expect(new Set(cocoonItems.map((item) => item.name)).size).toBe(
      cocoonItems.length,
    );

    for (const item of cocoonItems) {
      expect(item.itemCategory).toBe("scenery");
      expect(item.name).not.toBe("cocooned body");

      const profile = HYDROPONICS_EMPLOYEE_PROFILES.find(
        (candidate) => candidate.id === item.id,
      );
      expect(profile).toBeDefined();
      expect(item.vocab).not.toContain(profile!.name.toLowerCase());
    }
  });

  it("uses visible employee traits in cocoon descriptions", async () => {
    const sillith = hydroponicsItems.find(
      (item) => item.id === "SillithLeSconce",
    );
    const ernwith = hydroponicsItems.find((item) => item.id === "ErnwithGob");

    expect(sillith?.description).toContain("long, straight red hair");
    expect(sillith?.description).toContain("bionic replacement knee");
    expect(ernwith?.description).toContain("spectacles");
    expect(ernwith?.description).toContain("webbed toes");
  });

  it("keeps the sign-in tablet focused on identity and badge, not physical description", async () => {
    const state = createHydroponicsPuzzleState("SillithLeSconce");

    const signInText = describeHydroponicsSignIn(state);

    expect(signInText).toContain("Sillith LeSconce, Zoology Department");
    expect(signInText).toContain("orange plastic security badge");
    expect(signInText).not.toContain("thumbnail photo");
    expect(signInText).not.toContain("long, straight red hair");
    expect(signInText).not.toContain("bionic replacement knee");
  });

  it("omits the power worker from the hydroponics terminal employee list", async () => {
    const state = createHydroponicsPuzzleState("SillithLeSconce");

    const menu = buildHydroponicsTerminalMenu(state);
    const recordsNode = menu.children[0];

    expect(recordsNode?.kind).toBe("menu");

    if (!recordsNode || recordsNode.kind !== "menu") {
      throw new Error("Expected employee records menu");
    }

    expect(
      recordsNode.children.some((child) => child.title === "Sillith LeSconce"),
    ).toBe(false);
    expect(recordsNode.children).toHaveLength(
      HYDROPONICS_EMPLOYEE_PROFILES.length - 1,
    );
  });

  it("sets the orange-badge escape timer based on the current cocoon room", async () => {
    const openedUnderWeb = await runCommand(
      createHydroponicsEscapeState("UnderWebOne"),
      "open statuesque cocoon",
    );
    const openedBottom = await runCommand(
      createHydroponicsEscapeState("HydroponicsPlatformBottom"),
      "open statuesque cocoon",
    );

    expect(expectInventoryToContain(openedUnderWeb, "orangebadge")).toBe(true);
    expect(expectInventoryToContain(openedBottom, "orangebadge")).toBe(true);
    expect(openedUnderWeb.itemState.itemRoomId.orangebadge).toBe("INVENTORY");
    expect(openedBottom.itemState.itemRoomId.orangebadge).toBe("INVENTORY");
    expect(
      openedUnderWeb.worldState.hydroponicsCocoonPuzzle.graceTurnsRemaining,
    ).toBe(3);
    expect(
      openedBottom.worldState.hydroponicsCocoonPuzzle.graceTurnsRemaining,
    ).toBe(2);
  });

  it("lets the player escape with the orange badge if they reach the top platform in time", async () => {
    const escaped = await runCommands(
      createHydroponicsEscapeState("UnderWebOne"),
      ["open statuesque cocoon", "southeast", "up", "up"],
    );

    expect(escaped.player.roomId).toBe("HydroponicsPlatform");
    expect(expectInventoryToContain(escaped, "orangebadge")).toBe(true);
    expect(escaped.worldState.conditionalTriggers.EscapedWithOrangeBadge).toBe(
      true,
    );
    expect(escaped.worldState.hydroponicsSpider.isAlive).toBe(false);
    expect(escaped.worldState.hydroponicsCocoonPuzzle.graceTurnsRemaining).toBe(
      0,
    );
    expect(escaped.worldState.playerDeaths.HydroponicsPlatform).toBeUndefined();
  });

  it("adds escalating warnings during the escape and plays the finale on reaching the top platform", async () => {
    const start = createHydroponicsEscapeState("UnderWebOne");

    const opened = await runCommand(start, "open statuesque cocoon");
    expect(opened.log.join("\n")).toContain(
      "Somewhere overhead, taut strands of web begin snapping one by one.",
    );

    const toBottom = await runCommand(opened, "southeast");
    expect(toBottom.log.join("\n")).toContain(
      "The web canopy convulses above you. Silk lashes through the air",
    );

    const toMid = await runCommand(toBottom, "up");
    expect(toMid.log.join("\n")).toContain(
      "A violent series of cracks tears through the chamber.",
    );

    const toTop = await runCommand(toMid, "up");
    expect(toTop.log.join("\n")).toContain(
      "Just as you reach the top platform, thick strands of silk give way with a series of loud snaps.",
    );
  });

  it("kills the player if the orange-badge timer expires before they reach the top platform", async () => {
    const doomed = await runCommands(
      createHydroponicsEscapeState("UnderWebOne"),
      ["open statuesque cocoon", "southeast", "up", "north"],
    );

    expect(doomed.player.roomId).toBe("LevelSixCorridorEnd");
    expect(doomed.worldState.conditionalTriggers.EscapedWithOrangeBadge).toBe(
      false,
    );
    expect(doomed.worldState.playerDeaths.HydroponicsPlatformMid?.cause).toBe(
      "hydroponics cocoon trap",
    );
  });

  it("resets the hydroponics encounter and respawns the player nearby on death", async () => {
    const start = createHydroponicsPuzzleState("SillithLeSconce", {
      ...createTestState({
        roomId: "UnderWebOne",
        visitedRooms: ["UnderWebOne", "LevelSixCorridorEnd"],
      }),
      itemState: {
        ...createTestState({
          roomId: "UnderWebOne",
          visitedRooms: ["UnderWebOne", "LevelSixCorridorEnd"],
        }).itemState,
      },
    });
    const withWrongCocoon = {
      ...start,
      itemState: {
        ...start.itemState,
        itemRoomId: {
          ...start.itemState.itemRoomId,
          DizzyTsoukann: "UnderWebOne",
        },
      },
    };

    const next = await runCommand(withWrongCocoon, "open wispy cocoon");

    expect(next.player.roomId).toBe("LevelSixCorridorEnd");
    expect(next.worldState.hydroponicsSpider.isAlive).toBe(true);
    expect(next.worldState.conditionalTriggers.EscapedWithOrangeBadge).toBe(
      false,
    );
    expect(next.worldState.hydroponicsCocoonPuzzle.resolved).toBe(false);
    expect(next.worldState.hydroponicsCocoonPuzzle.graceTurnsRemaining).toBe(0);
  });

  it("describes the dead spider aftermath and blocks descending back into the nest after a successful escape", async () => {
    const escaped = await runCommands(
      createHydroponicsEscapeState("UnderWebOne"),
      ["open statuesque cocoon", "southeast", "up", "up"],
    );

    const description = buildRoomDescription(escaped, "HydroponicsPlatform", {
      mode: "panel",
      forceFull: true,
    });
    const blocked = await runCommand(escaped, "down");

    expect(description).toContain(
      "the spider's carcass sags deep into its own torn webbing",
    );
    expect(description).toContain("millions of hand-sized spiders");
    expect(blocked.player.roomId).toBe("HydroponicsPlatform");
    expect(getLastLogEntry(blocked)).toContain(
      "There is no chance you're going back down there.",
    );
  });

  it("starts the visible hydroponics spider on a new paragraph after cocoon scenery", async () => {
    const baseState = createTestState({ roomId: "HydroponicsPlatformBottom" });
    const state = {
      ...baseState,
      itemState: {
        ...baseState.itemState,
        itemRoomId: {
          ...baseState.itemState.itemRoomId,
          SillithLeSconce: "HydroponicsPlatformBottom",
        },
      },
    };

    const description = buildRoomDescription(
      state,
      "HydroponicsPlatformBottom",
      {
        mode: "panel",
        forceFull: true,
      },
    );
    const spiderText =
      "Above you, the web canopy bows under the weight of a massive spider suspended near the center, its silhouette shifting whenever the whole structure creaks.";
    const spiderIndex = description.indexOf(spiderText);
    const lastCocoonIndex = description.lastIndexOf("cocoon");

    expect(lastCocoonIndex).toBeGreaterThan(-1);
    expect(spiderIndex).toBeGreaterThan(lastCocoonIndex);
    expect(description).toContain(`\n\n${spiderText}`);
  });

  it("blocks the park entrance without a park pass", async () => {
    const start = setInventory(createTestState({ roomId: "ParkEntrance" }), []);

    const next = await runCommand(start, "west");

    expect(next.player.roomId).toBe("ParkEntrance");
    expect(getLastLogEntry(next)).toContain("park pass");
  });

  it("allows the player into the park when they have a park pass", async () => {
    const start = setInventory(createTestState({ roomId: "ParkEntrance" }), [
      "ParkPass",
    ]);

    const next = await runCommand(start, "west");

    expect(next.player.roomId).toBe("ParkEast");
  });

  it("arms the park key snatch on first entry and triggers it on the next action", async () => {
    const start = setInventory(createTestState({ roomId: "ParkEntrance" }), [
      "ParkPass",
    ]);

    const entered = await runCommand(start, "west");
    const next = await runCommand(entered, "look");

    expect(entered.itemState.itemRoomId.PowerStationKey).toBe("ParkEast");
    expect(next.itemState.containerContents.TrashBotBin).toContain(
      "PowerStationKey",
    );
    expect(next.itemState.itemRoomId.PowerStationKey).toBe("TrashBotBin");
    expect(next.itemState.itemRoomId.TrashBot).toBe("ParkCenter");
    expect(next.itemState.itemRoomId.TrashBotBin).toBe("ParkCenter");
    expect(getLastLogEntry(next)).toContain(
      PARK_EAST_POWER_KEY_DELAYED_SNATCH_MESSAGE,
    );
  });

  it("triggers the park key snatch when the player leaves ParkEast after first entering it", async () => {
    const start = setInventory(createTestState({ roomId: "ParkEntrance" }), [
      "ParkPass",
    ]);

    const entered = await runCommand(start, "west");
    const next = await runCommand(entered, "west");

    expect(next.player.roomId).toBe("ParkCenter");
    expect(next.itemState.containerContents.TrashBotBin).toContain(
      "PowerStationKey",
    );
    expect(next.itemState.itemRoomId.PowerStationKey).toBe("TrashBotBin");
    expect(next.itemState.itemRoomId.TrashBot).toBe("ParkCenter");
    expect(next.itemState.itemRoomId.TrashBotBin).toBe("ParkCenter");
    expect(getLastLogEntry(next)).toContain(
      PARK_EAST_POWER_KEY_DELAYED_SNATCH_MESSAGE,
    );
  });

  it("has the trash bot steal the park key into its bin and flee to Park Center without awarding the key score", async () => {
    const start = createTestState({ roomId: "ParkEast" });

    const next = await runCommand(start, "take key");

    expect(expectInventoryToContain(next, "PowerStationKey")).toBe(false);
    expect(next.itemState.containerContents.TrashBotBin).toContain(
      "PowerStationKey",
    );
    expect(next.itemState.itemRoomId.PowerStationKey).toBe("TrashBotBin");
    expect(
      next.world.items.find((item) => item.id === "PowerStationKey")?.location,
    ).toBe("TrashBotBin");
    expect(next.itemState.itemRoomId.TrashBot).toBe("ParkCenter");
    expect(next.itemState.itemRoomId.TrashBotBin).toBe("ParkCenter");
    expect(next.itemState.attachedTo.TrashBotBin).toBe("TrashBot");
    expect(next.worldState.scoresTriggered.obtained_power_key).toBe(false);
    expect(next.score).toBe(0);
    expect(getLastLogEntry(next)).toContain(
      PARK_EAST_POWER_KEY_TAKE_SNATCH_MESSAGE,
    );
    expect(getLastLogEntry(next)).not.toContain("Taken.");
  });

  it("suppresses the generic take failure text when the trash bot key-steal event fires", async () => {
    const start = createTestState({ roomId: "ParkEast" });

    const next = await runCommand(start, "get large key");

    expect(getLastLogEntry(next)).toContain(
      PARK_EAST_POWER_KEY_TAKE_SNATCH_MESSAGE,
    );
    expect(getLastLogEntry(next)).not.toContain("You don't see that here.");
  });

  it("lets the player examine the key in the trash bot bin without taking it", async () => {
    const start = createTestState({ roomId: "ParkEast" });

    const intercepted = await runCommand(start, "take key");
    const pausedBot = {
      ...intercepted,
      worldState: {
        ...intercepted.worldState,
        trashBot: {
          ...intercepted.worldState.trashBot,
          cooldownTurns: 1,
        },
      },
    };
    const atCenter = await runCommand(pausedBot, "west");
    const examined = await runCommand(atCenter, "examine yellow key");
    const blockedTake = await runCommand(atCenter, "take yellow key");

    expect(examined.log.join("\n\n")).toContain(
      "A large, heavy key with a rectangular grip striped with black and yellow.",
    );
    expect(expectInventoryToContain(blockedTake, "PowerStationKey")).toBe(
      false,
    );
    expect(blockedTake.worldState.scoresTriggered.obtained_power_key).toBe(
      false,
    );
    expect(blockedTake.log.join("\n\n")).toContain(
      "You can see through the wire mesh, but you can't get at anything inside the trash bot's bin.",
    );
  });

  it("mentions the trash bot before listing what is inside its bin", async () => {
    const start = createTestState({ roomId: "ParkEast" });

    const intercepted = await runCommand(start, "take key");
    const atCenter = await runCommand(intercepted, "west");

    const panelDescription = buildRoomDescription(atCenter, "ParkCenter", {
      mode: "panel",
      forceFull: true,
    });
    const itemOnlyDescription = buildRoomItemsDescription(
      atCenter,
      "ParkCenter",
    );
    const robotText = "A little robot with treads putters around nearby.";
    const binText =
      "Inside the trash bot bin you can see large yellow and black key.";

    expect(panelDescription).toContain(robotText);
    expect(panelDescription).toContain(binText);
    expect(panelDescription.indexOf(robotText)).toBeLessThan(
      panelDescription.indexOf(binText),
    );

    expect(itemOnlyDescription).toContain(robotText);
    expect(itemOnlyDescription).toContain(binText);
    expect(itemOnlyDescription.indexOf(robotText)).toBeLessThan(
      itemOnlyDescription.indexOf(binText),
    );
  });

  it("has the trash bot putter into the player's room when it arrives there", async () => {
    const start = freezeTickingItemsExcept(
      setItemRoom(
        createTestState({ roomId: "ParkEast", rng: sequenceRng([0.6, 0.6]) }),
        "TrashBot",
        "ParkCenter",
      ),
      ["TrashBot"],
    );
    const withBin = setItemRoom(start, "TrashBotBin", "ParkCenter");

    const next = await runCommand(withBin, "wait");

    expect(next.itemState.itemRoomId.TrashBot).toBe("ParkEast");
    expect(next.itemState.itemRoomId.TrashBotBin).toBe("ParkEast");
    expect(getLastLogEntry(next)).toContain(
      "The trashbot putters in from the west.",
    );
  });

  it("reports when the player and the trash bot pass each other", async () => {
    const start = freezeTickingItemsExcept(
      setItemRoom(
        createTestState({ roomId: "ParkEast", rng: sequenceRng([0.6, 0.6]) }),
        "TrashBot",
        "ParkCenter",
      ),
      ["TrashBot"],
    );
    const withBin = setItemRoom(start, "TrashBotBin", "ParkCenter");

    const next = await runCommand(withBin, "west");

    expect(next.player.roomId).toBe("ParkCenter");
    expect(next.itemState.itemRoomId.TrashBot).toBe("ParkEast");
    expect(getLastLogEntry(next)).toContain(
      "You pass the trashbot as it putters by, its wire bin rattling softly.",
    );
  });

  it("reports the trash bot nearby when it ends one room away in the park", async () => {
    const start = freezeTickingItemsExcept(
      setItemRoom(
        createTestState({ roomId: "ParkEast", rng: sequenceRng([0.6, 0]) }),
        "TrashBot",
        "ParkMaintenance",
      ),
      ["TrashBot"],
    );
    const withBin = setItemRoom(start, "TrashBotBin", "ParkMaintenance");

    const next = await runCommand(withBin, "wait");

    expect(next.itemState.itemRoomId.TrashBot).toBe("ParkCenter");
    expect(getLastLogEntry(next)).toContain(
      "The trashbot putters around off to the west.",
    );
  });

  it("has the trash bot scoop up ground items into its bin", async () => {
    const start = freezeTickingItemsExcept(
      setItemRoom(
        createTestState({ roomId: "ParkEast", rng: sequenceRng([0.6, 0]) }),
        "TrashBot",
        "ParkMaintenance",
      ),
      ["TrashBot"],
    );
    const withBin = setItemRoom(start, "TrashBotBin", "ParkMaintenance");
    const withTrash = setItemRoom(withBin, "Scalpel", "ParkCenter");

    const next = await runCommand(withTrash, "wait");

    expect(next.itemState.itemRoomId.TrashBot).toBe("ParkCenter");
    expect(next.itemState.itemRoomId.Scalpel).toBe("TrashBotBin");
    expect(next.itemState.containerContents.TrashBotBin).toContain("Scalpel");
  });

  it("sometimes lingers in place instead of moving", async () => {
    const start = freezeTickingItemsExcept(
      setItemRoom(
        createTestState({ roomId: "ParkEast", rng: sequenceRng([0.2]) }),
        "TrashBot",
        "ParkCenter",
      ),
      ["TrashBot"],
    );
    const withBin = setItemRoom(start, "TrashBotBin", "ParkCenter");

    const next = await runCommand(withBin, "wait");

    expect(next.itemState.itemRoomId.TrashBot).toBe("ParkCenter");
    expect(next.itemState.itemRoomId.TrashBotBin).toBe("ParkCenter");
  });

  it("does not report a pass-by when the player stands still", async () => {
    const start = freezeTickingItemsExcept(
      setItemRoom(
        createTestState({
          roomId: "ParkCenter",
          rng: sequenceRng([0.6, 0]),
        }),
        "TrashBot",
        "ParkCenter",
      ),
      ["TrashBot"],
    );
    const withBin = setItemRoom(start, "TrashBotBin", "ParkCenter");

    const next = await runCommand(withBin, "examine robot");

    expect(next.log.join("\n\n")).not.toContain(
      "You pass the trashbot as it putters by, its wire bin rattling softly.",
    );
    expect(next.log.join("\n\n")).toContain(
      "The trashbot putters off to the north.",
    );
  });

  it("keeps the maintenance opening hidden until the trash bot starts emptying", async () => {
    const start = freezeTickingItemsExcept(
      setItemRoom(
        createTestState({ roomId: "ParkMaintenance", rng: sequenceRng([0.2]) }),
        "TrashBot",
        "ParkMaintenance",
      ),
      ["TrashBot"],
    );
    const withBin = setItemRoom(start, "TrashBotBin", "ParkMaintenance");

    const blocked = await runCommand(withBin, "in");

    expect(blocked.player.roomId).toBe("ParkMaintenance");
    expect(getLastLogEntry(blocked)).toContain(
      "You don't see an opening there.",
    );
  });

  it("has the trash bot head straight to maintenance once its bin is full", async () => {
    const start = freezeTickingItemsExcept(
      setItemRoom(
        createTestState({ roomId: "ParkCenter" }),
        "TrashBot",
        "ParkCenter",
      ),
      ["TrashBot"],
    );
    const withBin = setItemRoom(start, "TrashBotBin", "ParkCenter");
    const primed = setContainerContents(withBin, "TrashBotBin", [
      "PowerStationKey",
      "Scalpel",
      "ShedCellarKey",
    ]);

    const next = await runCommand(primed, "wait");

    expect(next.itemState.itemRoomId.TrashBot).toBe("ParkMaintenance");
    expect(next.itemState.itemRoomId.TrashBotBin).toBe("ParkMaintenance");
    expect(next.worldState.trashBot.mode).toBe("door_open_for_entry");
    expect(
      next.worldState.conditionalTriggers.TrashBotMaintenanceDoorOpen,
    ).toBe(true);
    expect(next.log.join("\n\n")).toContain(
      '"Trash collection bin full. Initiating bin emptying sequence."',
    );
  });

  it("lets the player follow the trash bot inside and witness it dump the bin into the dumpster", async () => {
    const start = freezeTickingItemsExcept(
      setItemRoom(
        createTestState({ roomId: "ParkMaintenance" }),
        "TrashBot",
        "ParkMaintenance",
      ),
      ["TrashBot"],
    );
    const withBin = setItemRoom(start, "TrashBotBin", "ParkMaintenance");
    const primed = setContainerContents(withBin, "TrashBotBin", [
      "PowerStationKey",
      "Scalpel",
      "ShedCellarKey",
    ]);

    const opened = await runCommand(primed, "wait");
    const entered = await runCommand(opened, "in");
    const dumped = await runCommand(entered, "wait");

    expect(
      opened.worldState.conditionalTriggers.TrashBotMaintenanceDoorOpen,
    ).toBe(true);
    expect(opened.log.join("\n\n")).toContain(
      '"Trash collection bin full. Initiating bin emptying sequence."',
    );
    expect(opened.log.join("\n\n")).toContain("hidden panel slides open");

    expect(entered.player.roomId).toBe("ParkMaintenanceInterior");
    expect(entered.itemState.itemRoomId.TrashBot).toBe(
      "ParkMaintenanceInterior",
    );
    expect(
      entered.worldState.conditionalTriggers.TrashBotMaintenanceDoorOpen,
    ).toBe(true);
    expect(entered.log.join("\n\n")).toContain(
      "The trashbot putters in through the opening and rolls toward the dumpster.",
    );

    expect(dumped.itemState.itemRoomId.PowerStationKey).toBe("ParkDumpster");
    expect(dumped.itemState.itemRoomId.Scalpel).toBe("ParkDumpster");
    expect(dumped.itemState.itemRoomId.ShedCellarKey).toBe("ParkDumpster");
    expect(dumped.itemState.containerContents.ParkDumpster).toEqual(
      expect.arrayContaining(["PowerStationKey", "Scalpel", "ShedCellarKey"]),
    );
    expect(dumped.itemState.containerContents.TrashBotBin ?? []).toEqual([]);
    expect(
      dumped.worldState.conditionalTriggers.TrashBotMaintenanceDoorOpen,
    ).toBe(false);
    expect(dumped.log.join("\n\n")).toContain("The trashbot tips");
    expect(dumped.log.join("\n\n")).toContain("into the dumpster.");
    expect(dumped.log.join("\n\n")).toContain(
      "The hidden panel slides shut again.",
    );
  });

  it("can repeat the maintenance-emptying cycle after the bin fills again", async () => {
    const start = freezeTickingItemsExcept(
      setItemRoom(
        createTestState({ roomId: "ParkMaintenance" }),
        "TrashBot",
        "ParkMaintenance",
      ),
      ["TrashBot"],
    );
    const withBin = setItemRoom(start, "TrashBotBin", "ParkMaintenance");
    const primed = setContainerContents(withBin, "TrashBotBin", [
      "PowerStationKey",
      "Scalpel",
      "ShedCellarKey",
    ]);

    const opened = await runCommand(primed, "wait");
    const entered = await runCommand(opened, "in");
    const dumped = await runCommand(entered, "wait");
    const reopened = await runCommand(dumped, "wait");
    const exited = await runCommand(reopened, "wait");
    const closed = await runCommand(exited, "wait");
    const refilled = setContainerContents(closed, "TrashBotBin", [
      "PowerStationKey",
      "Scalpel",
      "ShedCellarKey",
    ]);
    const triggeredAgain = await runCommand(refilled, "wait");

    expect(
      reopened.worldState.conditionalTriggers.TrashBotMaintenanceDoorOpen,
    ).toBe(true);
    expect(reopened.log.join("\n\n")).toContain("hidden panel slides open");

    expect(exited.itemState.itemRoomId.TrashBot).toBe("ParkMaintenance");
    expect(
      exited.worldState.conditionalTriggers.TrashBotMaintenanceDoorOpen,
    ).toBe(true);
    expect(exited.log.join("\n\n")).toContain(
      "The trashbot putters back out through the opening.",
    );

    expect(
      closed.worldState.conditionalTriggers.TrashBotMaintenanceDoorOpen,
    ).toBe(false);
    expect(closed.worldState.trashBot.mode).toBe("wandering");

    expect(
      triggeredAgain.worldState.conditionalTriggers.TrashBotMaintenanceDoorOpen,
    ).toBe(true);
    expect(triggeredAgain.worldState.trashBot.mode).toBe("door_open_for_entry");
    expect(triggeredAgain.log.join("\n\n")).toContain(
      "hidden panel slides open",
    );
  });

  it("unlocks keyed doors with the correct key", async () => {
    const start = setInventory(createTestState({ roomId: "InsideTheShed" }), [
      "ShedCellarKey",
    ]);

    const opened = await runCommand(start, "open hatch");
    const entered = await runCommand(opened, "down");

    expect(opened.worldState.doors.ShedCellarDoor?.isOpen).toBe(true);
    expect(opened.worldState.doors.ShedCellarDoor?.isLocked).toBe(false);
    expect(entered.player.roomId).toBe("UnderTheShed");
  });

  it("requires the correct badge for badge-scanner doors", async () => {
    const wrongBadgeState = setInventory(
      createTestState({ roomId: "LevelFourCorridorTwo" }),
      ["bluebadge"],
    );
    const blocked = await runCommand(wrongBadgeState, "south");

    const correctBadgeState = setInventory(
      createTestState({ roomId: "LevelFourCorridorTwo" }),
      ["yellowbadge"],
    );
    const allowed = await runCommand(correctBadgeState, "south");

    expect(blocked.player.roomId).toBe("LevelFourCorridorTwo");
    expect(getLastLogEntry(blocked)).toContain(
      "badge scanner emits a flat buzz",
    );
    expect(allowed.player.roomId).toBe("PowerGrid");
  });

  it("examines badge-scanner doors from the player's side", async () => {
    const scannerSide = await runCommand(
      createTestState({ roomId: "LevelFourCorridorTwo" }),
      "examine power grid door",
    );
    const interiorSide = await runCommand(
      createTestState({ roomId: "PowerGrid" }),
      "examine power grid door",
    );

    expect(getLastLogEntry(scannerSide)).toContain(
      "badge reader mounted next to it",
    );
    expect(getLastLogEntry(scannerSide)).toContain("MAIN POWER GRID");
    expect(getLastLogEntry(interiorSide)).toContain(
      "no badge reader on this side",
    );
  });

  it.todo("treats the gray superadmin badge as valid for every badge scanner");

  it("records DNA samples when the player touches a body with the DNA sampler", async () => {
    const start = setInventory(createTestState({ roomId: "StairSix" }), [
      "DNAReader",
    ]);

    const next = await runCommand(start, "touch dead soldier with dna sampler");

    expect(next.player.dnaBank).toHaveLength(1);
    expect(next.player.dnaBank[0]?.name).toBe("Joelson Dend");
  });

  it("shows the Sanyi organisms as a glassy sculpture when the room is lit", async () => {
    const start = setInventory(
      createTestState({ roomId: "LivingQuartersThreeWest" }),
      ["flashlight"],
    );
    const litState = {
      ...start,
      itemState: {
        ...start.itemState,
        itemSettings: {
          ...start.itemState.itemSettings,
          flashlight: {
            kind: "flashlight" as const,
            isOn: true,
            currentCharge: 100,
            maxCharge: 100,
            drainRate: 0.05,
            rechargeRate: 10,
          },
        },
      },
    };

    const description = buildRoomDescription(
      litState,
      "LivingQuartersThreeWest",
      {
        mode: "panel",
        forceFull: true,
      },
    );

    expect(description).toContain("strange, glassy black sculpture");
  });

  it("lets the dark Sanyi organisms kill the player", async () => {
    const start = setInventory(
      createTestState({
        roomId: "LivingQuartersThreeWest",
        visitedRooms: ["LivingQuartersThreeWest", "LevelThreeCorridorThree"],
      }),
      [],
    );

    const next = await runCommand(start, "close front door");

    expect(next.player.roomId).not.toBe("LivingQuartersThreeWest");
    expect(next.worldState.playerDeaths.LivingQuartersThreeWest?.cause).toBe(
      "organism",
    );
  });

  it("keeps the level five organism at the edge of the lit engineering corridor", async () => {
    const start = setInventory(
      createTestState({
        roomId: "EngCorridorOne",
        visitedRooms: ["EngCorridorOne", "PowerGrid"],
      }),
      [],
    );

    const afterStalk = advanceTurn(start);

    expect(["ShuttleBay", "InsideShuttle"]).toContain(
      afterStalk.itemState.itemRoomId.organism6,
    );
    expect(afterStalk.worldState.playerDeaths.EngCorridorOne).toBeUndefined();

    const afterAttack = advanceTurn(afterStalk);

    expect(afterAttack.player.roomId).toBe("EngCorridorOne");
    expect(["ShuttleBay", "InsideShuttle"]).toContain(
      afterAttack.itemState.itemRoomId.organism6,
    );
    expect(afterAttack.worldState.playerDeaths.EngCorridorOne).toBeUndefined();
  });

  it("opens the warehouse secret door after the robot whistle is blown", async () => {
    const start = setInventory(createTestState({ roomId: "L3Warehouse" }), [
      "RobotWhistle",
    ]);

    const blocked = await runCommand(start, "east");
    const revealed = await runCommand(start, "blow whistle");
    const entered = await runCommand(revealed, "east");

    expect(blocked.player.roomId).toBe("L3Warehouse");
    expect(revealed.worldState.conditionalTriggers.RobotRefugeAccess).toBe(
      true,
    );
    expect(getLastLogEntry(revealed)).toContain("hidden panel slides up");
    expect(entered.player.roomId).toBe("RobotRefuge");
  });

  it("blocks the Robot Refuge conveyor until the level two bomb detonates", async () => {
    const blocked = await runCommand(
      createTestState({ roomId: "RobotRefuge" }),
      "ride conveyor belt",
    );

    expect(blocked.player.roomId).toBe("RobotRefuge");
    expect(getLastLogEntry(blocked)).toContain("scrap is jammed");

    const ready = setLevelTwoBomb(blocked, {
      detonated: true,
      isActive: false,
      remainingTurns: 0,
    });
    const enteredLevelTwo = await runCommand(ready, "ride conveyor belt");

    expect(enteredLevelTwo.player.roomId).toBe("Storage");
  });

  it("detonates the level two bomb when the countdown reaches zero", async () => {
    const start = setLevelTwoBomb(createTestState({ roomId: "RobotRefuge" }), {
      detonated: false,
      isActive: true,
      remainingTurns: 1,
    });

    const next = await runCommand(start, "wait");

    expect(next.worldState.levelTwoBomb.detonated).toBe(true);
    expect(
      next.worldState.conditionalTriggers[LEVEL_TWO_BOMB_DETONATED_TRIGGER_ID],
    ).toBe(true);
    expect(useUIEffectsStore.getState().screenShakeNonce).toBe(1);
    expect(getLastLogEntry(next)).toContain("loud, low BOOM");
    expect(getLastLogEntry(next)).toContain(
      "conveyor's jammed scrap tears loose",
    );
  });

  it("blocks the level two stairwell door until the bomb detonates", async () => {
    const start = createTestState({ roomId: "StairTwo" });
    const blocked = await runCommand(start, "west");

    expect(blocked.player.roomId).toBe("StairTwo");
    expect(getLastLogEntry(blocked)).toContain("ACTIVE INVESTIGATION AREA");

    const ready = setLevelTwoBomb(blocked, {
      detonated: true,
      isActive: false,
      remainingTurns: 0,
    });
    const enteredLobby = await runCommand(ready, "west");

    expect(enteredLobby.player.roomId).toBe("LevelTwoStairAccess");
  });

  it("routes the level two medical lab door through the door system", async () => {
    const start = createTestState({ roomId: "MedicalCorridorOne" });
    const blocked = await runCommand(start, "south");

    expect(blocked.player.roomId).toBe("MedicalCorridorOne");
    expect(getLastLogEntry(blocked)).toContain("badge scanner");

    const withBadge = setInventory(start, ["bluebadge"]);
    const enteredLab = await runCommand(withBadge, "south");

    expect(enteredLab.player.roomId).toBe("Lab");

    const returned = await runCommand(enteredLab, "north");

    expect(returned.player.roomId).toBe("MedicalCorridorOne");
  });

  it("activates the Power Grid by inserting the key, turning it, and pushing the button", async () => {
    const start = setInventory(createTestState({ roomId: "PowerGrid" }), [
      "PowerStationKey",
    ]);

    const next = await runCommands(start, [
      "put key in keyhole",
      "turn key",
      "push button",
    ]);

    expect(next.worldState.powerRestoredSections["power-key-turned"]).toBe(
      true,
    );
    expect(next.worldState.powerRestoredSections["power-initialized"]).toBe(
      true,
    );
    expect(next.worldState.roomAudioLevel.PowerGrid).toBe(3);
  });

  it("defaults level five to dark except for stairwell light spill", async () => {
    const state = createTestState();

    for (const room of LEVEL_FIVE.rooms) {
      expect(state.worldState.darkRooms[room.id]).toBe(
        room.id !== "EngCorridorOne",
      );
    }
  });

  it("emits the spider moan message at the correct turn in range", async () => {
    const baseState = createTestState({ roomId: "LevelSixCorridorEnd" });
    const start = {
      ...baseState,
      worldState: {
        ...baseState.worldState,
        hydroponicsSpider: {
          ...baseState.worldState.hydroponicsSpider,
          turnsSinceLastBreath: 3,
        },
      },
    };

    const next = tickHydroponics(start);

    expect(getLastLogEntry(next)).toContain(
      "A loud, hollow moan begins to sound from through the gap in the damaged door.",
    );
  });

  it("lets the spider acid puzzle melt the hydroponics door open", async () => {
    const start = createTestState({ roomId: "LevelSixCorridorEnd" });

    const opened = await runCommands(start, [
      "look through gap",
      "look through gap",
      "look through gap",
      "wait",
      "look through gap",
      "wait",
      "look through gap",
      "wait",
    ]);
    const entered = await runCommand(opened, "south");

    expect(opened.worldState.conditionalTriggers.HydroponicsDoorUnblocked).toBe(
      true,
    );
    expect(entered.player.roomId).toBe("HydroponicsPlatform");
  });

  it("respawns the player at the aquarium start and resets the octopus encounter on death", async () => {
    const baseState = createTestState({
      roomId: "AqOpen1",
      visitedRooms: ["AqOpen1", "AqStart"],
    });
    const baseOcto = createInitialOctopusState();
    const start = {
      ...baseState,
      worldState: {
        ...baseState.worldState,
        octopusState: {
          ...baseOcto,
          isAware: true,
          arms: baseOcto.arms.map((arm, index) =>
            index === 0 ? { ...arm, path: ["AqCross", "AqOpen2"] } : arm,
          ),
        },
      },
    };

    const next = await runCommand(start, "north");

    expect(next.player.roomId).toBe("AqStart");
    expect(next.worldState.octopusState.occupiedRoomIds).toEqual(["AqRock7"]);
    expect(next.worldState.octopusState.tipRoomIds).toEqual(["AqRock7"]);
    expect(next.itemState.itemRoomId.octopus).toBe("AqRock7");
  });

  it("lets the player use the local aqua pad without a badge", async () => {
    const start = setInventory(
      createTestState({ roomId: "VeterinaryCenter" }),
      [],
    );

    const next = await runCommand(start, "stand on aqua disk");

    expect(next.player.roomId).toBe("AqStart");
    expect(getLastLogEntry(next)).toContain("Transfer Lock");
  });

  it("lets the electric prod retreat one nearby tentacle and spends a charge", async () => {
    const baseState = setInventory(createTestState({ roomId: "AqRock2" }), [
      AQUARIUM_ELECTRIC_PROD_ITEM_ID,
    ]);
    const baseOcto = createInitialOctopusState();
    const start = {
      ...baseState,
      worldState: {
        ...baseState.worldState,
        octopusState: {
          ...baseOcto,
          isAware: true,
          arms: baseOcto.arms.map((arm, index) =>
            index === 0 ? { ...arm, path: ["AqCross", "AqRock3"] } : arm,
          ),
        },
      },
    };

    const next = await runCommand(start, "use prod on tentacle");
    const prod = next.world.items.find(
      (item) => item.id === AQUARIUM_ELECTRIC_PROD_ITEM_ID,
    );

    expect(prod?.doses).toBe(1);
    expect(next.worldState.octopusState.arms[0]?.path).toEqual(["AqRock7"]);
    expect(getLastLogEntry(next)).toContain("recoils all the way back");
  });

  it("finds the breather by searching the dead diver", async () => {
    const next = await runCommand(
      createTestState({ roomId: "AqRock2" }),
      "search dead diver",
    );

    expect(expectInventoryToContain(next, AQUARIUM_BREATHER_ITEM_ID)).toBe(
      true,
    );
  });

  it("gives the player enough time to reach and secure the breather", async () => {
    const next = await runCommands(createTestState({ roomId: "AqStart" }), [
      "north",
      "west",
      "north",
      "search dead diver",
      "wear breather",
    ]);

    expect(next.player.roomId).toBe("AqRock2");
    expect(next.itemState.wornByPlayer.face).toBe(AQUARIUM_BREATHER_ITEM_ID);
  });

  it("respawns the player near the preserve and resets the bull encounter on death", async () => {
    const baseState = startGamePreserveRun(
      createTestState({
        roomId: "RockyRidge",
        visitedRooms: ["RockyRidge", "GamePreservePortal"],
      }),
    );
    const start = {
      ...baseState,
      itemState: {
        ...baseState.itemState,
        itemRoomId: {
          ...baseState.itemState.itemRoomId,
          bull: "OpenSavanna",
        },
      },
      worldState: {
        ...baseState.worldState,
        gamePreserve: {
          ...baseState.worldState.gamePreserve,
          run: baseState.worldState.gamePreserve.run
            ? {
                ...baseState.worldState.gamePreserve.run,
                actors: {
                  ...baseState.worldState.gamePreserve.run.actors,
                  bull: {
                    ...baseState.worldState.gamePreserve.run.actors.bull,
                    countdowns: {
                      ...baseState.worldState.gamePreserve.run.actors.bull
                        .countdowns,
                      chargeCooldown: 0,
                    },
                    intent: {
                      kind: "charge" as const,
                      direction: "east" as const,
                      targetRoomId: "RockyRidge",
                    },
                  },
                },
              }
            : null,
        },
      },
    };

    const next = await runCommand(start, "wait");

    expect(expectInventoryToContain(start, "GameWhistle")).toBe(true);
    expect(next.player.roomId).toBe("GamePreservePortal");
    expect(expectInventoryToContain(next, "GameWhistle")).toBe(false);
    expect(next.itemState.itemRoomId.GameWhistle).toBe("GamePreserveEntrance");
    expect(next.worldState.bullEncounter.chargeCooldown).toBe(3);
    expect(next.worldState.bullEncounter.stunnedTurns).toBe(0);
    expect(next.worldState.bullEncounter.pendingCharge).toBeUndefined();
    expect(next.itemState.itemRoomId.bull).toBe(GAME_PRESERVE_SPAWN_ROOM_ID);
  });

  it("respawns the player outside the aviary and resets the encounter on death", async () => {
    const baseState = createTestState({
      roomId: "OuterRingNorth",
      visitedRooms: ["OuterRingNorth", "ZooOne"],
    });
    const start = {
      ...baseState,
      itemState: {
        ...baseState.itemState,
        itemRoomId: {
          ...baseState.itemState.itemRoomId,
          organism1: "OuterRingNorth",
        },
      },
      worldState: {
        ...baseState.worldState,
        aviarySpotlight: {
          ...baseState.worldState.aviarySpotlight,
          index: 5,
          turnsLeftHere: 2 as const,
          hintCooldown: 2,
        },
      },
    };

    const next = await runCommand(start, "wait");

    expect(next.player.roomId).toBe("ZooOne");
    expect(next.worldState.aviarySpotlight.index).toBe(0);
    expect(next.worldState.aviarySpotlight.turnsLeftHere).toBe(1);
    expect(next.worldState.aviarySpotlight.hintCooldown).toBe(0);
    expect(next.itemState.itemRoomId.organism1).toBe("OuterRingNorth");
  });
});

function createHydroponicsEscapeState(
  roomId: "HydroponicsPlatformBottom" | "UnderWebOne",
) {
  const baseState = createTestState({
    roomId,
    visitedRooms: [
      roomId,
      "HydroponicsPlatformBottom",
      "HydroponicsPlatformMid",
      "HydroponicsPlatform",
      "LevelSixCorridorEnd",
    ],
  });

  return createHydroponicsPuzzleState("SillithLeSconce", {
    ...baseState,
    player: {
      ...baseState.player,
      roomId,
    },
  });
}

function createHydroponicsPuzzleState(
  bodyId: string,
  baseState = createTestState({ roomId: "HydroponicsPlatformBottom" }),
) {
  const bodyRoomId = baseState.player.roomId;

  return {
    ...baseState,
    itemState: {
      ...baseState.itemState,
      itemRoomId: {
        ...baseState.itemState.itemRoomId,
        [bodyId]: bodyRoomId,
      },
    },
    worldState: {
      ...baseState.worldState,
      hydroponicsCocoonPuzzle: {
        initialized: true,
        powerWorkerBodyId: bodyId,
        graceTurnsRemaining: 0,
        resolved: false,
        openedBodyIds: {},
      },
      conditionalTriggers: {
        ...baseState.worldState.conditionalTriggers,
        EscapedWithOrangeBadge: false,
      },
    },
  };
}
