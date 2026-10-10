import { inventoryHas } from "@game/rules/state";
import { getItemsInInventory } from "@game/selectors/itemSelectors";
import { buildRoomDescription } from "@game/text/roomDescription";
import { describe, expect, it } from "vitest";
import { INITIAL_WORLD } from "../world/World";
import {
  createTestState,
  getLastLogEntry,
  runCommand,
} from "./helpers/gameTestHelpers";

describe("level seven stairwell", () => {
  it("owns the starting scene while leaving its scenery examinable", async () => {
    const state = createTestState({ roomId: "StairWellSeven" });
    const description = buildRoomDescription(state, "StairWellSeven", {
      mode: "panel",
      forceFull: true,
    });

    expect(description).not.toContain("[[SCENERY]]");
    expect(description).toContain("stacks of boxes bound with metal bands");
    expect(description).toContain("body of an older man");
    expect(description).toContain("body lies crumpled in a heap");

    const examinedBoxes = await runCommand(state, "examine boxes");
    expect(getLastLogEntry(examinedBoxes)).toContain(
      "bound with metal bands both vertically and horizontally",
    );

    const examinedCorpse = await runCommand(state, "examine fallen corpse");
    expect(getLastLogEntry(examinedCorpse)).toContain("slipped");
  });

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
