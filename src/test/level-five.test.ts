import { describe, expect, it } from "vitest";
import { getRoomVisualLightLevel } from "@game/helpers/visibilityHelpers";
import {
  createTestState,
  getLastLogEntry,
  patchRoomDarkness,
  runCommand,
  setInventory,
  setPlayerRoom,
} from "./helpers/gameTestHelpers";
import { LEVEL_FIVE } from "../world/maps/levelFive/LevelFive";
import { ENGINEERING_CORRIDOR_FIRST_ENTRY_MESSAGE } from "../world/maps/levelFive/levelFiveEvents";
import {
  getPlatformValvePosition,
  getSmartbellWeight,
  getTiltingPlatformOrientation,
  LEFT_SMARTBELL_ID,
  MAINTENANCE_LADDER_ASCENT_MESSAGE,
  MAINTENANCE_LADDER_TOP_BLOCK_MESSAGE,
  NORTH_CARGO_CAGE_ID,
  PLATFORM_PERCH_ROOM_ID,
  RAFTER_TEST_ITEM_ID,
  RIGHT_SMARTBELL_ID,
  setPlatformValvePosition,
  SOUTH_CARGO_CAGE_ID,
} from "../world/maps/levelFive/reactorPlatform";

describe("Level Five reactor platforms", () => {
  it("uses the revised two-level map without the retired maintenance ducts", () => {
    const roomIds = new Set(LEVEL_FIVE.rooms.map((room) => room.id));

    expect(roomIds).toContain("ReactorPlatform");
    expect(roomIds).toContain("SupplyPlatform");
    expect(roomIds).toContain("ObservationPlatform");
    expect(roomIds).toContain("WasteProcessingPlatform");
    expect(roomIds).toContain("HeatCoolantExchangePlatform");
    expect(roomIds).not.toContain("MaintenanceDuct");
    expect(roomIds).not.toContain("MaintenanceDuctTwo");
    expect(roomIds).not.toContain("MaintenanceDuctThree");
  });

  it("lets the player pass the damaged violet stairwell door without a badge", async () => {
    const next = await runCommand(createTestState({ roomId: "StairFive" }), "west");

    expect(next.player.roomId).toBe("LevelFiveStairAccess");
    expect(next.worldState.doors.EngineeringDoors?.isOpen).toBe(true);
  });

  it("uses dim stairwell spill and warns once about movement in the dark", async () => {
    const start = createTestState({ roomId: "LevelFiveStairAccess" });
    const lobby = start.world.rooms.find(
      (room) => room.id === "LevelFiveStairAccess",
    );
    const corridor = start.world.rooms.find(
      (room) => room.id === "EngCorridorOne",
    );

    expect(start.worldState.darkRooms.LevelFiveStairAccess).toBe(false);
    expect(start.worldState.darkRooms.EngCorridorOne).toBe(false);
    expect(lobby?.ambientLightLevel).toBe("dim");
    expect(corridor?.ambientLightLevel).toBe("very-dim");
    expect(getRoomVisualLightLevel(start, "LevelFiveStairAccess")).toBe(
      "dim",
    );
    expect(getRoomVisualLightLevel(start, "EngCorridorOne")).toBe(
      "very-dim",
    );

    const entered = await runCommand(start, "west");
    expect(entered.log.join("\n\n")).toContain(
      ENGINEERING_CORRIDOR_FIRST_ENTRY_MESSAGE,
    );

    const returned = await runCommand(
      await runCommand(entered, "east"),
      "west",
    );
    expect(
      returned.log.filter((entry) =>
        entry.includes(ENGINEERING_CORRIDOR_FIRST_ENTRY_MESSAGE),
      ),
    ).toHaveLength(1);
  });

  it("removes the stairwell spill effects when lights or a flashlight are on", async () => {
    const base = createTestState({ roomId: "LevelFiveStairAccess" });
    const powered = {
      ...base,
      worldState: {
        ...base.worldState,
        powerRestoredSections: {
          ...base.worldState.powerRestoredSections,
          ["lights-level-five"]: true,
        },
      },
    };

    expect(getRoomVisualLightLevel(powered, "LevelFiveStairAccess")).toBe(
      "normal",
    );
    expect(getRoomVisualLightLevel(powered, "EngCorridorOne")).toBe(
      "normal",
    );

    const carryingFlashlight = setInventory(base, ["flashlight"]);
    const flashlightOn = await runCommand(
      carryingFlashlight,
      "turn on flashlight",
    );

    expect(
      getRoomVisualLightLevel(flashlightOn, "LevelFiveStairAccess"),
    ).toBe("normal");
    expect(getRoomVisualLightLevel(flashlightOn, "EngCorridorOne")).toBe(
      "normal",
    );
  });

  it("reveals the broken hydraulics and initializes the valve at C", async () => {
    const start = createTestState({ roomId: "MaintenancePlatform" });

    expect(getPlatformValvePosition(start)).toBe("C");

    const hidden = await runCommand(start, "set valve to a");
    expect(getLastLogEntry(hidden)).toContain("nothing to set");

    const opened = await runCommand(hidden, "open panel");
    expect(getLastLogEntry(opened)).toContain("pressure gauge");

    const setToA = await runCommand(opened, "set valve to a");
    expect(getPlatformValvePosition(setToA)).toBe("A");
    expect(getLastLogEntry(setToA)).toContain("clunks and hisses");

    const looked = await runCommand(
      patchRoomDarkness(setToA, "MaintenancePlatform", false),
      "look",
    );
    expect(getLastLogEntry(looked)).toContain("currently set to A");
  });

  it("keeps the platform level at C and permits an upper crossing", async () => {
    const crossed = await runCommand(
      createTestState({ roomId: "SupplyPlatform" }),
      "south",
    );

    expect(crossed.player.roomId).toBe("ObservationPlatform");
    expect(getTiltingPlatformOrientation(crossed)).toBe("level");
    expect(getLastLogEntry(crossed)).toContain("remains level");
  });

  it("blocks maintenance ladders from the top and describes the sealed lids", async () => {
    const blockedSupply = await runCommand(
      createTestState({ roomId: "SupplyPlatform" }),
      "down",
    );
    expect(blockedSupply.player.roomId).toBe("SupplyPlatform");
    expect(getLastLogEntry(blockedSupply)).toContain(
      MAINTENANCE_LADDER_TOP_BLOCK_MESSAGE,
    );

    const examinedSupplyLid = await runCommand(
      createTestState({ roomId: "SupplyPlatform" }),
      "examine lid",
    );
    expect(getLastLogEntry(examinedSupplyLid)).toContain(
      "requires some kind of tool",
    );

    const blockedObservation = await runCommand(
      createTestState({ roomId: "ObservationPlatform" }),
      "down",
    );
    expect(blockedObservation.player.roomId).toBe("ObservationPlatform");
    expect(getLastLogEntry(blockedObservation)).toContain(
      MAINTENANCE_LADDER_TOP_BLOCK_MESSAGE,
    );

    const examinedObservationLid = await runCommand(
      createTestState({ roomId: "ObservationPlatform" }),
      "examine maintenance ladder",
    );
    expect(getLastLogEntry(examinedObservationLid)).toContain(
      "requires some kind of tool",
    );
  });

  it("lets lower maintenance ladders return to the upper platforms", async () => {
    const fromWaste = await runCommand(
      createTestState({
        roomId: "WasteProcessingPlatform",
        visitedRooms: ["WasteProcessingPlatform", "SupplyPlatform"],
      }),
      "up",
    );
    expect(fromWaste.player.roomId).toBe("SupplyPlatform");
    expect(getLastLogEntry(fromWaste)).toContain(
      MAINTENANCE_LADDER_ASCENT_MESSAGE,
    );

    const fromHeatCoolant = await runCommand(
      createTestState({
        roomId: "HeatCoolantExchangePlatform",
        visitedRooms: [
          "HeatCoolantExchangePlatform",
          "ObservationPlatform",
        ],
      }),
      "up",
    );
    expect(fromHeatCoolant.player.roomId).toBe("ObservationPlatform");
    expect(getLastLogEntry(fromHeatCoolant)).toContain(
      "opens like a sphincter",
    );
    expect(getLastLogEntry(fromHeatCoolant)).toContain(
      "constricts tightly closed",
    );

    const usedLadder = await runCommand(
      createTestState({
        roomId: "WasteProcessingPlatform",
        visitedRooms: ["WasteProcessingPlatform", "SupplyPlatform"],
      }),
      "use ladder",
    );
    expect(usedLadder.player.roomId).toBe("SupplyPlatform");
    expect(getLastLogEntry(usedLadder)).toContain(
      MAINTENANCE_LADDER_ASCENT_MESSAGE,
    );
  });

  it("uses A and B for directional player dumps, then springs level", async () => {
    const fromSupply = await runCommand(
      setPlatformValvePosition(
        createTestState({ roomId: "SupplyPlatform" }),
        "A",
      ),
      "south",
    );

    expect(fromSupply.player.roomId).toBe("WasteProcessingPlatform");
    expect(getTiltingPlatformOrientation(fromSupply)).toBe("level");
    expect(getLastLogEntry(fromSupply)).toContain("tumble onto the Waste");
    expect(getLastLogEntry(fromSupply)).toContain("settles level again");

    const fromObservation = await runCommand(
      setPlatformValvePosition(
        setPlayerRoom(fromSupply, "ObservationPlatform"),
        "B",
      ),
      "north",
    );

    expect(fromObservation.player.roomId).toBe(
      "HeatCoolantExchangePlatform",
    );
    expect(getTiltingPlatformOrientation(fromObservation)).toBe("level");
    expect(getLastLogEntry(fromObservation)).toContain(
      "Heat/Coolant Exchange Platform",
    );
  });

  it("warns that light cargo in the opposite cage is not enough", async () => {
    let state = setPlatformValvePosition(
      createTestState({ roomId: "ObservationPlatform" }),
      "A",
    );
    state = await runCommand(state, "put left dumbbell in south cage");
    state = setPlayerRoom(state, "SupplyPlatform");

    const fallen = await runCommand(state, "south");

    expect(fallen.player.roomId).toBe("WasteProcessingPlatform");
    expect(getLastLogEntry(fallen)).toContain(
      "items you put in the opposite cargo cage might slow the descent",
    );
  });

  it("drops a heavy held Smartbell first and resets it before pickup", async () => {
    const start = createTestState({ roomId: "MaintenancePlatform" });
    expect(start.player.inventory.general).toEqual(
      expect.arrayContaining([RIGHT_SMARTBELL_ID, LEFT_SMARTBELL_ID]),
    );
    const madeHeavy = await runCommand(start, "set right dumbbell to 86");

    expect(madeHeavy.player.inventory.general).not.toContain(
      RIGHT_SMARTBELL_ID,
    );
    expect(madeHeavy.itemState.itemRoomId[RIGHT_SMARTBELL_ID]).toBe(
      "MaintenancePlatform",
    );
    expect(getSmartbellWeight(madeHeavy, RIGHT_SMARTBELL_ID)).toBe(86);
    expect(getLastLogEntry(madeHeavy)).toContain("put the right Smartbell");

    const pickedUp = await runCommand(madeHeavy, "take right dumbbell");
    expect(pickedUp.player.inventory.general).toContain(RIGHT_SMARTBELL_ID);
    expect(getSmartbellWeight(pickedUp, RIGHT_SMARTBELL_ID)).toBe(1);
    expect(getLastLogEntry(pickedUp)).toContain(
      "dial the weight down to 1 before picking it up",
    );
  });

  it("lets 45 kilograms tilt the platform and blocks both upper approaches", async () => {
    let state = setPlatformValvePosition(
      createTestState({ roomId: "SupplyPlatform" }),
      "A",
    );
    state = await runCommand(state, "put right dumbbell in north cage");
    state = await runCommand(state, "set right dumbbell to 45");

    expect(getTiltingPlatformOrientation(state)).toBe("north");
    expect(state.itemState.itemRoomId[NORTH_CARGO_CAGE_ID]).toBe(
      "WasteProcessingPlatform",
    );

    const adjustedFromBelow = await runCommand(
      setPlayerRoom(state, "WasteProcessingPlatform"),
      "set right dumbbell to 44",
    );
    expect(getSmartbellWeight(adjustedFromBelow, RIGHT_SMARTBELL_ID)).toBe(44);
    expect(getTiltingPlatformOrientation(adjustedFromBelow)).toBe("level");

    const blockedNorth = await runCommand(state, "south");
    expect(blockedNorth.player.roomId).toBe("SupplyPlatform");
    expect(getLastLogEntry(blockedNorth)).toContain("twenty feet below");

    const blockedSouth = await runCommand(
      setPlayerRoom(state, "ObservationPlatform"),
      "north",
    );
    expect(blockedSouth.player.roomId).toBe("ObservationPlatform");
    expect(getLastLogEntry(blockedSouth)).toContain("too high");
  });

  it("keeps equal heavy cages level but tips when one reaches twice the other", async () => {
    let state = createTestState({ roomId: "ObservationPlatform" });
    state = await runCommand(state, "put left dumbbell in south cage");
    state = await runCommand(state, "set left dumbbell to 86");
    state = setPlayerRoom(state, "SupplyPlatform");
    state = await runCommand(state, "put right dumbbell in north cage");
    state = await runCommand(state, "set right dumbbell to 86");
    state = setPlatformValvePosition(state, "A");

    expect(getTiltingPlatformOrientation(state)).toBe("level");

    state = await runCommand(state, "set right dumbbell to 172");
    expect(getTiltingPlatformOrientation(state)).toBe("north");
  });

  it("puts the lowered cargo cage in scope when the platform tilts toward a lower landing", async () => {
    let state = setPlatformValvePosition(
      createTestState({ roomId: "ObservationPlatform" }),
      "B",
    );
    state = await runCommand(state, "put left dumbbell in south cage");
    state = await runCommand(state, "set left dumbbell to 45");

    expect(getTiltingPlatformOrientation(state)).toBe("south");
    expect(state.itemState.itemRoomId[SOUTH_CARGO_CAGE_ID]).toBe(
      "HeatCoolantExchangePlatform",
    );

    const describedFromBelow = await runCommand(
      patchRoomDarkness(
        setPlayerRoom(state, "HeatCoolantExchangePlatform"),
        "HeatCoolantExchangePlatform",
        false,
      ),
      "look",
    );
    expect(getLastLogEntry(describedFromBelow)).toContain("south cargo cage");

    const adjustedFromBelow = await runCommand(
      setPlayerRoom(state, "HeatCoolantExchangePlatform"),
      "set left dumbbell to 44",
    );
    expect(getSmartbellWeight(adjustedFromBelow, LEFT_SMARTBELL_ID)).toBe(44);
    expect(getTiltingPlatformOrientation(adjustedFromBelow)).toBe("level");
  });

  it("supports the staged counterweight solution and reaches the rafters", async () => {
    let state = setPlatformValvePosition(
      createTestState({ roomId: "ObservationPlatform" }),
      "A",
    );
    const unreachable = await runCommand(state, "take reactor lobe");
    expect(unreachable.player.inventory.general).not.toContain(
      RAFTER_TEST_ITEM_ID,
    );
    expect(getLastLogEntry(unreachable)).toContain("far too high");

    state = await runCommand(state, "put left dumbbell in south cage");
    state = await runCommand(state, "set left dumbbell to 86");
    state = setPlayerRoom(state, "SupplyPlatform");
    state = await runCommand(state, "put right dumbbell in north cage");
    state = await runCommand(state, "set right dumbbell to 86");

    expect(getTiltingPlatformOrientation(state)).toBe("level");

    state = setPlayerRoom(state, "ObservationPlatform");
    const elevated = await runCommand(state, "set left dumbbell to 1");
    const litElevated = patchRoomDarkness(
      elevated,
      PLATFORM_PERCH_ROOM_ID,
      false,
    );

    expect(elevated.player.roomId).toBe(PLATFORM_PERCH_ROOM_ID);
    expect(getTiltingPlatformOrientation(elevated)).toBe("north");
    expect(getLastLogEntry(elevated)).toContain("ride it upward");
    expect(
      getLastLogEntry(await runCommand(litElevated, "look")),
    ).toContain("south cargo cage");

    const withTestItem = await runCommand(elevated, "take intact lobe");
    expect(withTestItem.player.inventory.general).toContain(
      RAFTER_TEST_ITEM_ID,
    );

    const descended = await runCommand(withTestItem, "down");
    expect(descended.player.roomId).toBe("WasteProcessingPlatform");
    expect(getLastLogEntry(descended)).toContain("slide down");
  });

  it("keeps the lower shaft blocked while the platform is level", async () => {
    const raised = await runCommand(
      createTestState({ roomId: "WasteProcessingPlatform" }),
      "south",
    );
    expect(raised.player.roomId).toBe("WasteProcessingPlatform");
    expect(getLastLogEntry(raised)).toContain("still raised");
  });
});
