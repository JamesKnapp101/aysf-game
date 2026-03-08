import { advanceTurn } from "@game/engine/turn";
import { tickHydroponics } from "@game/engine/ticks/hydroponicsTick";
import { buildRoomDescription } from "@game/text/roomDescription";
import { describe, expect, it } from "vitest";
import { LEVEL_FIVE } from "../world/maps/levelFive/LevelFive";
import {
  createTestState,
  getLastLogEntry,
  runCommand,
  runCommands,
  setInventory,
} from "./helpers/gameTestHelpers";

describe("Doors and level mechanics", () => {
  it("blocks the park entrance without a park pass", () => {
    const start = setInventory(createTestState({ roomId: "ParkEntrance" }), []);

    const next = runCommand(start, "west");

    expect(next.player.roomId).toBe("ParkEntrance");
    expect(getLastLogEntry(next)).toContain("park pass");
  });

  it("allows the player into the park when they have a park pass", () => {
    const start = setInventory(
      createTestState({ roomId: "ParkEntrance" }),
      ["ParkPass"],
    );

    const next = runCommand(start, "west");

    expect(next.player.roomId).toBe("ParkEast");
  });

  it("unlocks keyed doors with the correct key", () => {
    const start = setInventory(
      createTestState({ roomId: "InsideTheShed" }),
      ["ShedCellarKey"],
    );

    const opened = runCommand(start, "open hatch");
    const entered = runCommand(opened, "down");

    expect(opened.worldState.doors.ShedCellarDoor?.isOpen).toBe(true);
    expect(opened.worldState.doors.ShedCellarDoor?.isLocked).toBe(false);
    expect(entered.player.roomId).toBe("UnderTheShed");
  });

  it("requires the correct badge for badge-scanner doors", () => {
    const wrongBadgeState = setInventory(
      createTestState({ roomId: "LevelFourCorridorTwo" }),
      ["bluebadge"],
    );
    const blocked = runCommand(wrongBadgeState, "south");

    const correctBadgeState = setInventory(
      createTestState({ roomId: "LevelFourCorridorTwo" }),
      ["yellowbadge"],
    );
    const allowed = runCommand(correctBadgeState, "south");

    expect(blocked.player.roomId).toBe("LevelFourCorridorTwo");
    expect(getLastLogEntry(blocked)).toContain("badge scanner emits a flat buzz");
    expect(allowed.player.roomId).toBe("PowerGrid");
  });

  it.todo("treats the gray superadmin badge as valid for every badge scanner");

  it("records DNA samples when the player touches a body with the DNA sampler", () => {
    const start = setInventory(createTestState({ roomId: "StairSix" }), [
      "DNAReader",
    ]);

    const next = runCommand(start, "touch dead soldier with dna sampler");

    expect(next.player.dnaBank).toHaveLength(1);
    expect(next.player.dnaBank[0]?.name).toBe("Joelson Dend");
  });

  it("shows the Sanyi organisms as statues when the room is lit", () => {
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
          flashlight: { kind: "flashlight" as const, isOn: true },
        },
      },
    };

    const description = buildRoomDescription(litState, "LivingQuartersThreeWest", {
      mode: "panel",
      forceFull: true,
    });

    expect(description).toContain("large, ornate wreath");
  });

  it("lets the dark Sanyi organisms kill the player", () => {
    const start = setInventory(
      createTestState({
        roomId: "LivingQuartersThreeWest",
        visitedRooms: ["LivingQuartersThreeWest", "LevelThreeCorridorThree"],
        rng: () => 1,
      }),
      [],
    );

    const next = advanceTurn(start);

    expect(next.player.roomId).not.toBe("LivingQuartersThreeWest");
    expect(next.worldState.playerDeaths.LivingQuartersThreeWest?.cause).toBe(
      "organism",
    );
  });

  it("opens the warehouse secret door after the robot whistle is blown", () => {
    const start = setInventory(createTestState({ roomId: "L3Warehouse" }), [
      "RobotWhistle",
    ]);

    const blocked = runCommand(start, "east");
    const revealed = runCommand(start, "blow whistle");
    const entered = runCommand(revealed, "east");

    expect(blocked.player.roomId).toBe("L3Warehouse");
    expect(revealed.worldState.conditionalTriggers.RobotRefugeAccess).toBe(true);
    expect(getLastLogEntry(revealed)).toContain("hidden panel slides up");
    expect(entered.player.roomId).toBe("RobotRefuge");
  });

  it("activates the Power Grid by inserting the key, turning it, and pushing the button", () => {
    const start = setInventory(createTestState({ roomId: "PowerGrid" }), [
      "PowerStationKey",
    ]);

    const next = runCommands(start, [
      "put key in keyhole",
      "turn key",
      "push button",
    ]);

    expect(next.worldState.powerRestoredSections["power-key-turned"]).toBe(true);
    expect(next.worldState.powerRestoredSections["power-initialized"]).toBe(true);
    expect(next.worldState.roomAudioLevel.PowerGrid).toBe(3);
  });

  it("defaults every level five room to dark", () => {
    const state = createTestState();

    for (const room of LEVEL_FIVE.rooms) {
      expect(state.worldState.darkRooms[room.id]).toBe(true);
    }
  });

  it("emits the spider moan message at the correct turn in range", () => {
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

  it("lets the spider acid puzzle melt the hydroponics door open", () => {
    const start = createTestState({ roomId: "LevelSixCorridorEnd" });

    const opened = runCommands(start, [
      "look through gap",
      "look through gap",
      "look through gap",
      "wait",
      "look through gap",
      "wait",
      "look through gap",
      "wait",
    ]);
    const entered = runCommand(opened, "south");

    expect(opened.worldState.conditionalTriggers.HydroponicsDoorUnblocked).toBe(
      true,
    );
    expect(entered.player.roomId).toBe("HydroponicsPlatform");
  });
});
