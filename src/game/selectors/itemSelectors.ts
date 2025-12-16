import type { GameState } from "../types/gameTypes";
import type { Item } from "../types/itemTypes";

export function getItemById(state: GameState, id: string): Item | undefined {
  return state.world.items.find((it: Item) => it.id === id);
}

export function getItemsInInventory(state: GameState): Item[] {
  const invIds = new Set(state.player.inventory);
  return state.world.items.filter((it) => invIds.has(it.id));
}
