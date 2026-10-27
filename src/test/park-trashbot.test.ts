import { describe, expect, it } from "vitest";
import { stashItemInContainer } from "../game/helpers/itemPlacement";
import { updateItemLocation } from "../game/rules/items";
import type { GameState } from "../game/types/gameTypes";
import { createTestState, runCommand, setInventory } from "./helpers/gameTestHelpers";

function parkState(roomId = "ParkMaintenance", rng = () => 0): GameState {
  const state = createTestState({ roomId, rng });
  return {
    ...state,
    world: {
      ...state.world,
      items: state.world.items.map((item) =>
        item.id === "TrashBot"
          ? item
          : { ...item, overrides: { ...item.overrides, tick: undefined } },
      ),
    },
  };
}

function resizeScalpel(state: GameState, itemSize: number): GameState {
  return {
    ...state,
    world: {
      ...state.world,
      items: state.world.items.map((item) =>
        item.id === "Scalpel" ? { ...item, itemSize } : item,
      ),
    },
  };
}

describe("park TrashBot collection", () => {
  it.each([
    { rng: 0, cooldown: 0 },
    { rng: 0.99, cooldown: 0 },
    { rng: 0, cooldown: 1 },
  ])("sweeps a dropped item immediately with rng=$rng and cooldown=$cooldown", async ({ rng, cooldown }) => {
    const start = setInventory(parkState("ParkMaintenance", () => rng), ["Scalpel"]);
    start.worldState.trashBot.cooldownTurns = cooldown;

    const next = await runCommand(start, "drop scalpel");

    expect(next.moves).toBe(start.moves + 1);
    expect(next.player.inventory.general).not.toContain("Scalpel");
    expect(next.itemState.itemRoomId.Scalpel).toBe("TrashBotBin");
    expect(next.itemState.containerContents.TrashBotBin).toEqual(["Scalpel"]);
    const log = next.log.join("\n");
    expect(log).toContain("The trashbot's brushes whisk sleek silver scalpel into its wire bin.");
    expect(log.indexOf("Dropped.")).toBeLessThan(log.indexOf("brushes whisk"));
    if (rng === 0.99) {
      expect(next.itemState.itemRoomId.TrashBot).toBe("ParkWest");
      expect(log.indexOf("brushes whisk")).toBeLessThan(log.indexOf("putters off"));
    }
  });

  it("leaves a dropped item alone when TrashBot is elsewhere", async () => {
    const start = setInventory(parkState("ParkCenter"), ["Scalpel"]);
    const next = await runCommand(start, "drop scalpel");

    expect(next.itemState.itemRoomId.Scalpel).toBe("ParkCenter");
    expect(next.itemState.containerContents.TrashBotBin ?? []).toEqual([]);
    expect(next.log.join("\n")).not.toContain("brushes whisk");
  });

  it.each([5, 6])("applies the inclusive size limit to a dropped size-%i item", async (size) => {
    const start = setInventory(resizeScalpel(parkState(), size), ["Scalpel"]);
    const next = await runCommand(start, "drop scalpel");

    expect(next.itemState.itemRoomId.Scalpel).toBe(size === 5 ? "TrashBotBin" : "ParkMaintenance");
    expect(next.log.join("\n").includes("brushes whisk")).toBe(size === 5);
  });

  it("leaves a dropped Cooler on the ground", async () => {
    const start = setInventory(parkState(), ["Cooler"]);
    expect(start.world.items.find((item) => item.id === "Cooler")!.itemSize).toBeGreaterThan(5);

    const next = await runCommand(start, "drop cooler");

    expect(next.itemState.itemRoomId.Cooler).toBe("ParkMaintenance");
    expect(next.itemState.containerContents.TrashBotBin ?? []).not.toContain("Cooler");
    expect(next.log.join("\n")).not.toContain("brushes whisk");
  });

  it.each([5, 6])("applies the size limit when entering a room with a size-%i item and a Cooler", async (size) => {
    const rolls = [0.6, 0];
    let start = resizeScalpel(parkState("ParkCenter", () => rolls.shift() ?? 0), size);
    start = updateItemLocation(start, "Scalpel", "ParkCenter");
    start = updateItemLocation(start, "Cooler", "ParkCenter");

    const next = await runCommand(start, "wait");

    expect(next.itemState.itemRoomId.TrashBot).toBe("ParkCenter");
    expect(next.itemState.itemRoomId.Scalpel).toBe(size === 5 ? "TrashBotBin" : "ParkCenter");
    expect(next.itemState.itemRoomId.Cooler).toBe("ParkCenter");
  });

  it("lets dropped items fill the bin, then lets the player follow and recover the dumped key", async () => {
    let state = setInventory(parkState("ParkEast"), ["Scalpel", "ShedCellarKey"]);
    state = await runCommand(state, "take key");
    expect(state.itemState.containerContents.TrashBotBin).toEqual(["PowerStationKey"]);
    state = await runCommand(state, "west");
    state = await runCommand(state, "drop scalpel");
    expect(state.itemState.containerContents.TrashBotBin).toHaveLength(2);
    expect(state.worldState.trashBot.mode).toBe("wandering");

    state = await runCommand(state, "drop shed key");
    expect(state.itemState.containerContents.TrashBotBin).toHaveLength(3);
    expect(state.worldState.trashBot.mode).toBe("door_open_for_entry");
    expect(state.worldState.conditionalTriggers.TrashBotMaintenanceDoorOpen).toBe(true);
    const log = state.log.join("\n");
    expect(log.indexOf("Dropped.")).toBeLessThan(log.lastIndexOf("brushes whisk"));
    expect(log.lastIndexOf("brushes whisk")).toBeLessThan(log.indexOf("bin full"));

    state = await runCommand(state, "west");
    state = await runCommand(state, "in");
    expect(state.player.roomId).toBe("ParkMaintenanceInterior");
    expect(state.itemState.containerContents.TrashBotBin).toEqual([]);
    expect(state.itemState.containerContents.ParkDumpster).toEqual(
      expect.arrayContaining(["PowerStationKey", "Scalpel", "ShedCellarKey"]),
    );
    expect(state.log.join("\n")).toContain("The trashbot tips");
    state = await runCommand(state, "take yellow key");
    expect(state.player.inventory.keys).toContain("PowerStationKey");
  });
});

describe("TrashBot bin access", () => {
  it.each(["put scalpel in bin", "put scalpel into bin", "put cooler in bin"])("blocks direct insertion with %j", async (command) => {
    const start = setInventory(parkState(), ["Scalpel", "Cooler"]);
    const next = await runCommand(start, command);

    expect(next.player.inventory).toEqual(start.player.inventory);
    expect(next.itemState.containerContents.TrashBotBin ?? []).toEqual([]);
    expect(next.log.join("\n")).toContain("You can't put anything directly into the trash bot's wire bin.");
  });

  it.each(["take scalpel", "get scalpel", "take scalpel from bin", "take all", "take bin"])("blocks taking from the bin with %j", async (command) => {
    const start = stashItemInContainer(parkState(), "Scalpel", "TrashBotBin");
    const next = await runCommand(start, command);

    expect(next.player.inventory.general).not.toContain("Scalpel");
    expect(next.itemState.itemRoomId.Scalpel).toBe("TrashBotBin");
    expect(next.itemState.containerContents.TrashBotBin).toEqual(["Scalpel"]);
    expect(next.player.inventory.general).not.toContain("TrashBotBin");
  });

  it("keeps contents visible but inaccessible after trying to open the bin", async () => {
    let state = stashItemInContainer(parkState(), "Scalpel", "TrashBotBin");
    state = await runCommand(state, "open bin");
    expect(state.itemState.openItems.TrashBotBin).not.toBe(true);
    state = await runCommand(state, "look through bin");
    expect(state.log.join("\n")).toContain("Through the wire mesh you can see sleek silver scalpel.");
    state = await runCommand(state, "take scalpel");
    expect(state.itemState.itemRoomId.Scalpel).toBe("TrashBotBin");
    expect(state.log.join("\n")).toContain("You can see through the wire mesh, but you can't get at anything inside the trash bot's bin.");
  });
});
