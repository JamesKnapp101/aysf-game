import type { GameState } from "../types/gameTypes";
import { applyStatusEffectToPlayer } from "./status";

export function addToInventory(state: GameState, itemId: string): GameState {
  if (state.player.inventory.includes(itemId)) return state;
  let next = state;
  const itemToAdd = next.world.items.find((it) => it.id === itemId);
  if (itemToAdd?.isContagious && !next.itemState.pickedUpByPlayer[itemId]) {
    next = applyStatusEffectToPlayer(state, "virus", 1, 2000);
  }
  return {
    ...next,
    player: {
      ...next.player,
      inventory: [...next.player.inventory, itemId],
    },
    itemState: {
      ...next.itemState,
      pickedUpByPlayer: { ...next.itemState.pickedUpByPlayer, [itemId]: true },
    },
  };
}

export function removeFromInventory(
  state: GameState,
  itemId: string
): GameState {
  if (!state.player.inventory.includes(itemId)) return state;

  return {
    ...state,
    player: {
      ...state.player,
      inventory: state.player.inventory.filter((id) => id !== itemId),
    },
  };
}
