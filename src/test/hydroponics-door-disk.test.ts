import { describe, expect, it } from "vitest";
import {
  createTestState,
  getLastLogEntry,
  runCommand,
} from "./helpers/gameTestHelpers";

const CORRIDOR = "LevelSixCorridorEnd";

describe("Hydroponics disk viewed from the corridor", () => {
  it.each(["disk", "green disk", "glassy green disk", "pad"])(
    "lets the player examine the %s mentioned by the door",
    async (noun) => {
      const start = createTestState({ roomId: CORRIDOR, rng: () => 0.99 });
      const looked = await runCommand(start, "look");
      expect(getLastLogEntry(looked)).toContain("glassy green disk");

      const examined = await runCommand(looked, `examine ${noun}`);

      expect(getLastLogEntry(examined)).toMatch(/green disk.*beyond.*damaged door/);
      expect(getLastLogEntry(examined)).toContain("big enough to stand on");
      expect(examined.player.roomId).toBe(CORRIDOR);
      expect(examined.worldState.visitedRooms).toEqual(start.worldState.visitedRooms);
      expect(examined.worldState.hydroponicsSpider.doorHealth).toBe(
        start.worldState.hydroponicsSpider.doorHealth,
      );
      expect(examined.worldState.hydroponicsSpider.pendingAcidTarget).toBe("none");
      expect(examined.worldState.hydroponicsCocoonPuzzle).toEqual(
        start.worldState.hydroponicsCocoonPuzzle,
      );
    },
  );

  it.each([false, true])("reflects green pad power being %s", async (powered) => {
    const start = createTestState({ roomId: CORRIDOR, rng: () => 0.99 });
    start.worldState.powerRestoredSections["teleport-pads-green"] = powered;

    const examined = await runCommand(start, "examine disk");

    expect(getLastLogEntry(examined).includes("sallow green glow")).toBe(powered);
  });

  it("still describes the disk after the door has melted open", async () => {
    const start = createTestState({ roomId: CORRIDOR, rng: () => 0.99 });
    start.worldState.conditionalTriggers.HydroponicsDoorUnblocked = true;

    const examined = await runCommand(start, "examine disk");

    expect(getLastLogEntry(examined)).toContain("green disk");
    expect(getLastLogEntry(examined)).not.toContain("narrow gap");
  });

  it.each(["take disk", "touch disk", "stand on disk"])(
    "keeps the distant disk inaccessible with %s",
    async (command) => {
      const start = createTestState({ roomId: CORRIDOR, rng: () => 0.99 });
      start.worldState.powerRestoredSections["teleport-pads-green"] = true;

      const next = await runCommand(start, command);

      expect(getLastLogEntry(next)).toMatch(/can't|beyond.*reach/);
      expect(next.player.roomId).toBe(CORRIDOR);
      expect(next.player.inventory).toEqual(start.player.inventory);
      expect(next.itemState.itemRoomId.GreenTPADHydroponicsOne).toBe(
        start.itemState.itemRoomId.GreenTPADHydroponicsOne,
      );
      expect(next.worldState.conditionalTriggers.HydroponicsDoorUnblocked).toBe(false);
    },
  );

  it("does not expose the corridor view in another room", async () => {
    const start = createTestState({ roomId: "LevelSixCorridorBend", rng: () => 0.99 });

    const examined = await runCommand(start, "examine disk");

    expect(getLastLogEntry(examined)).toContain("You don't see that here.");
  });
});
