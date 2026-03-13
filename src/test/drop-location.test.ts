import { tryDropItem } from "@game/actions/drop/tryDropItem";
import { getItemsInRoom } from "@game/selectors/roomSelectors";
import { describe, expect, it } from "vitest";
import {
  createTestState,
  expectInventoryToContain,
  setInventory,
} from "./helpers/gameTestHelpers";

describe("drop item locations", () => {
  it("keeps dropped badges in the current room even if they started in inventory", () => {
    const initial = setInventory(createTestState({ roomId: "ThreeWestBed" }), [
      "bluebadge",
    ]);

    const result = tryDropItem(initial, "blue plastic badge");
    const next = result.state;
    const itemsHere = getItemsInRoom(next, "ThreeWestBed").map((item) => item.id);

    expect(expectInventoryToContain(next, "bluebadge")).toBe(false);
    expect(next.itemState.itemRoomId["bluebadge"]).toBe("ThreeWestBed");
    expect(
      next.world.items.find((item) => item.id === "bluebadge")?.location,
    ).toBe("ThreeWestBed");
    expect(itemsHere).toContain("bluebadge");
  });
});
