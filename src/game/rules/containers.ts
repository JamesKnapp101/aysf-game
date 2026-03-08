import { updateItemLocation } from "@game/rules/items";
import { removeFromAllBuckets } from "@game/rules/state";
import { isSerumCartridge } from "../selectors/containerSelectors";
import { getItemById } from "../selectors/itemSelectors";
import type { GameState } from "../types/gameTypes";

export function isItemOpen(state: GameState, itemId: string): boolean {
  const item = getItemById(state, itemId);
  if (item?.isContainer && item.isOpenable === false) {
    return true;
  }

  return !!state.itemState.openItems[itemId];
}

export function setItemOpen(
  state: GameState,
  itemId: string,
  open: boolean
): GameState {
  return {
    ...state,
    itemState: {
      ...state.itemState,
      openItems: {
        ...state.itemState.openItems,
        [itemId]: open,
      },
    },
  };
}

export function setItemClosed(
  state: GameState,
  itemId: string,
  open: boolean
): GameState {
  return {
    ...state,
    itemState: {
      ...state.itemState,
      openItems: {
        ...state.itemState.openItems,
        [itemId]: !open,
      },
    },
  };
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

    return {
      ...state,
      player: {
        ...state.player,
        inventory: removeFromAllBuckets(state.player.inventory, item.id),
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
  const currentContents = state.itemState.containerContents[container.id] ?? [];

  if (
    container.capacity != null &&
    currentContents.length >= container.capacity
  ) {
    return "There's no more room in that.";
  }

  const updatedContents = [...currentContents, item.id];
  let next = state;
  next = updateItemLocation(next, item.id, container.id);
  return {
    ...next,
    player: {
      ...next.player,
      inventory: removeFromAllBuckets(next.player.inventory, item.id),
    },
    itemState: {
      ...next.itemState,
      containerContents: {
        ...next.itemState.containerContents,
        [container.id]: updatedContents,
      },
    },
  };
}
