import { inventoryHas } from "@game/rules/state";
import type { GameState } from "../types/gameTypes";
import type { Item } from "../types/itemTypes";

export function addLiquidToFillableContainer(
  state: GameState,
  container: Item,
  liquidId: string,
): GameState {
  if (!inventoryHas(state.player.inventory, container.id)) return state;
  let next = state;
  return {
    ...next,
    itemState: {
      ...next.itemState,
      containerFilled: {
        ...next.itemState.containerFilled,
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
  let next = state;
  const { [container.id]: _, ...rest } = state.itemState.containerFilled;

  return {
    ...next,
    itemState: {
      ...next.itemState,
      containerFilled: rest,
    },
  };
}

export function setItemFrozen(state: GameState, item: Item): GameState {
  let next = state;
  return {
    ...next,
    itemState: {
      ...next.itemState,
      frozenItems: {
        ...next.itemState.frozenItems,
        [item.name]: true,
      },
    },
  };
}
