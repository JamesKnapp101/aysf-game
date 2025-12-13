import { isSerumCartridge } from "../selectors/containerSelectors";
import { getItemById } from "../selectors/itemSelectors";
import type { GameState } from "../types/gameTypes";

export function isItemOpen(state: GameState, itemId: string): boolean {
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
        inventory: state.player.inventory.filter((id) => id !== item.id),
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
