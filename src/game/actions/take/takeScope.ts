import { isItemOpen } from "@game/rules/containers";
import { inventoryHas } from "@game/rules/state";
import type { GameState } from "@game/types/gameTypes";
import type { Item } from "@game/types/itemTypes";

export function getTakeHolders(
  state: GameState,
  kind: "isSurface" | "isContainer",
): Item[] {
  return state.world.items.filter(
    (item) =>
      item[kind] &&
      ((state.itemState.itemRoomId[item.id] ?? item.location) ===
        state.player.roomId ||
        inventoryHas(state.player.inventory, item.id)),
  );
}

export function canReachContainerContents(
  state: GameState,
  container: Item,
): boolean {
  return (
    !(
      container.meta?.contentsAccessibleWhenClosed === false &&
      state.itemState.openItems[container.id] !== true
    ) &&
    isItemOpen(state, container.id)
  );
}
