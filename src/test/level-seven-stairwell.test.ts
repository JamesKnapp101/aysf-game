import { inventoryHas } from "@game/rules/state";
import { getItemsInInventory } from "@game/selectors/itemSelectors";
import { describe, expect, it } from "vitest";
import { INITIAL_WORLD } from "../world/World";
import {
  createTestState,
  getLastLogEntry,
  runCommand,
} from "./helpers/gameTestHelpers";

describe("level seven stairwell", () => {
  it("reveals the dead man's timer directly into the player's inventory", async () => {
    const start = createTestState({
      roomId: "StairWellSeven",
      world: INITIAL_WORLD,
    });

    expect(inventoryHas(start.player.inventory, "BombTimer")).toBe(false);
    expect(start.world.items.some((item) => item.id === "BombTimer")).toBe(
      true,
    );

    const discovered = await runCommand(start, "examine dead man");

    expect(inventoryHas(discovered.player.inventory, "BombTimer")).toBe(true);
    expect(discovered.itemState.itemRoomId.BombTimer).toBe("INVENTORY");
    expect(discovered.itemState.pickedUpByPlayer.BombTimer).toBe(true);
    expect(
      getItemsInInventory(discovered).map((item) => item.id),
    ).toContain("BombTimer");
    expect(getLastLogEntry(discovered)).toContain(
      "slip it into your inventory",
    );

    const examinedAgain = await runCommand(discovered, "examine dead man");

    expect(
      examinedAgain.player.inventory.general.filter(
        (itemId) => itemId === "BombTimer",
      ),
    ).toHaveLength(1);
    expect(getLastLogEntry(examinedAgain)).not.toContain(
      "slip it into your inventory",
    );
  });
});
