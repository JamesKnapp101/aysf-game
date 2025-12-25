import type { GameState } from "../types/gameTypes";
import type { Item } from "../types/itemTypes";
import { getItemsInCurrentRoom } from "./roomSelectors";

export function getItemById(state: GameState, id: string): Item | undefined {
  return state.world.items.find((it: Item) => it.id === id);
}

export function getItemsInInventory(state: GameState): Item[] {
  const invIds = new Set(state.player.inventory);
  return state.world.items.filter((it) => invIds.has(it.id));
}

export function getWaterSourcesInRoom(state: GameState): Item[] {
  const itemsInRoom = getItemsInCurrentRoom(state);
  return itemsInRoom.filter((it) => it.meta?.watersource);
}

export function getPlayerLiquidContainers(state: GameState): Item[] {
  const inventoryItems = getItemsInInventory(state);
  return inventoryItems.filter(
    (ii) => ii.isContainer && ii.meta?.container?.holds?.includes("liquid")
  );
}
