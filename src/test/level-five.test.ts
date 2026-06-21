import { describe, expect, it } from "vitest";
import {
  createTestState,
  getLastLogEntry,
  runCommand,
  setPlayerRoom,
} from "./helpers/gameTestHelpers";
import { LEVEL_FIVE } from "../world/maps/levelFive/LevelFive";
import { ENGINEERING_CORRIDOR_FIRST_ENTRY_MESSAGE } from "../world/maps/levelFive/levelFiveEvents";
import { getTiltingPlatformOrientation } from "../world/maps/levelFive/reactorPlatform";

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

  it("drops each upper approach onto its corresponding lower platform", async () => {
    const fromSupply = await runCommand(
      createTestState({ roomId: "SupplyPlatform" }),
      "south",
    );

    expect(fromSupply.player.roomId).toBe("WasteProcessingPlatform");
    expect(getTiltingPlatformOrientation(fromSupply)).toBe("supply-side");
    expect(getLastLogEntry(fromSupply)).toContain("tumble onto the Waste");

    const fromObservation = await runCommand(
      setPlayerRoom(fromSupply, "ObservationPlatform"),
      "north",
    );

    expect(fromObservation.player.roomId).toBe(
      "HeatCoolantExchangePlatform",
    );
    expect(getTiltingPlatformOrientation(fromObservation)).toBe(
      "observation-side",
    );
    expect(getLastLogEntry(fromObservation)).toContain(
      "Heat/Coolant Exchange Platform",
    );
  });

  it("blocks the raised or near-tilted lower edge and permits the downhill crossing", async () => {
    const raised = await runCommand(
      createTestState({ roomId: "WasteProcessingPlatform" }),
      "south",
    );
    expect(raised.player.roomId).toBe("WasteProcessingPlatform");
    expect(getLastLogEntry(raised)).toContain("still raised");

    const tippedToSupply = await runCommand(
      createTestState({ roomId: "SupplyPlatform" }),
      "south",
    );
    const tooSteep = await runCommand(tippedToSupply, "south");
    expect(tooSteep.player.roomId).toBe("WasteProcessingPlatform");
    expect(getLastLogEntry(tooSteep)).toContain("too steep to climb");

    const tippedToObservation = await runCommand(
      setPlayerRoom(tippedToSupply, "ObservationPlatform"),
      "north",
    );
    const crossed = await runCommand(
      setPlayerRoom(tippedToObservation, "WasteProcessingPlatform"),
      "south",
    );
    expect(crossed.player.roomId).toBe("HeatCoolantExchangePlatform");

    const blockedReturn = await runCommand(crossed, "north");
    expect(blockedReturn.player.roomId).toBe(
      "HeatCoolantExchangePlatform",
    );
    expect(getLastLogEntry(blockedReturn)).toContain("too steep to climb");
  });
});
