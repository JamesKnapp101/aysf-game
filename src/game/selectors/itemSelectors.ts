import type { GameState } from "../types/gameTypes";
import type { Item } from "../types/itemTypes";
import { getCurrentRoom } from "./roomSelectors";

export function getItemById(state: GameState, id: string): Item | undefined {
  return state.world.items.find((it: Item) => it.id === id);
}

// Inventory derived from player.inventory
export function getItemsInInventory(state: GameState): Item[] {
  const invIds = new Set(state.player.inventory);
  return state.world.items.filter((it) => invIds.has(it.id));
}
