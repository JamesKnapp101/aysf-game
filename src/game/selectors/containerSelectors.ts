import type { GameState } from "../types/gameTypes";
import type { Item } from "../types/itemTypes";
import { getItemById } from "./itemSelectors";

export function isSerumCartridge(item: Item): boolean {
  return !item.isContainer && item.isSyringeCartridge === true;
}

export function tryPutItemInContainer(
  state: GameState,
  itemId: string,
  containerId: string
): GameState | string {
  const item = getItemById(state, itemId);
  const container = getItemById(state, containerId);

  if (!item || !container) {
    return "You don't see that here.";
  }

  if (!container.isContainer) {
    return "You can't put things in that.";
  }

  // --- special case: syringe -----------------------------------------
  if (container.id === "Syringe") {
    if (!isSerumCartridge(item)) {
      return "The syringe clamp is designed for standardized drug cartridges, not that.";
    }

    if (state.itemState.syringe.loadedCartridgeId) {
      return "The syringe is already loaded.";
    }

    const nextInventory = state.player.inventory.filter((id) => id !== item.id);

    return {
      ...state,
      player: {
        ...state.player,
        inventory: nextInventory,
      },
      itemState: {
        ...state.itemState,
        syringe: {
          ...state.itemState.syringe,
          loadedCartridgeId: item.id,
        },
      },
    };
  }

  // --- normal container path -----------------------------------------
  if (container.capacity != null) {
    const currentContents =
      state.itemState.containerContents[container.id] ??
      container.contains ??
      [];

    if (currentContents.length >= container.capacity) {
      return "There's no more room in that.";
    }

    const updatedContents = [...currentContents, item.id];

    return {
      ...state,
      player: {
        ...state.player,
        inventory: state.player.inventory.filter((id) => id !== item.id),
      },
      itemState: {
        ...state.itemState,
        containerContents: {
          ...state.itemState.containerContents,
          [container.id]: updatedContents,
        },
      },
    };
  }

  return "You can't seem to put that there.";
}

export function getContainerContentsIds(
  state: GameState,
  container: Item
): string[] {
  // 1) If we’ve already got dynamic contents, use that as source of truth
  const fromState = state.itemState.containerContents[container.id];
  if (fromState) {
    return fromState;
  }

  // 2) Otherwise, seed from:
  //    - items whose location === container.id
  //    - static container.contains (if you use it)
  const fromLocation = state.world.items
    .filter((it) => it.location === container.id)
    .map((it) => it.id);

  const fromStatic = container.contains ?? [];

  const merged = Array.from(new Set([...fromLocation, ...fromStatic]));

  return merged;
}

export function getContainerContentsItems(
  state: GameState,
  container: Item
): Item[] {
  const ids = getContainerContentsIds(state, container);
  return ids
    .map((id) => getItemById(state, id))
    .filter((it): it is Item => Boolean(it));
}
