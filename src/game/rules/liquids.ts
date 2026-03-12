import { inventoryHas } from "@game/rules/state";
import type { GameState } from "../types/gameTypes";
import type { Item } from "../types/itemTypes";

export function addLiquidToFillableContainer(
  state: GameState,
  container: Item,
  liquidId: string,
): GameState {
  if (!inventoryHas(state.player.inventory, container.id)) return state;
  return {
    ...state,
    itemState: {
      ...state.itemState,
      containerFilled: {
        ...state.itemState.containerFilled,
        [container.id]: [liquidId],
      },
    },
  };
}

export function removeLiquidFromFillableContainer(
  state: GameState,
  container: Item,
): GameState {
  if (!inventoryHas(state.player.inventory, container.id)) return state;
  const containerFilled = { ...state.itemState.containerFilled };
  delete containerFilled[container.id];

  return {
    ...state,
    itemState: {
      ...state.itemState,
      containerFilled,
    },
  };
}

export function setItemFrozen(state: GameState, item: Item): GameState {
  return {
    ...state,
    itemState: {
      ...state.itemState,
      frozenItems: {
        ...state.itemState.frozenItems,
        [item.name]: true,
      },
    },
  };
}
