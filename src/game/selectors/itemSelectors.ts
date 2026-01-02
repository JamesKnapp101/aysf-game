import type { GameState } from "../types/gameTypes";
import type { Item } from "../types/itemTypes";
import type { Room } from "../types/roomTypes";
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

export function getRoomForItemId(
  state: GameState,
  itemId: string
): Room | undefined {
  const item = state.world.items.find((it: Item) => it.id === itemId);
  if (!item) return undefined;

  const roomId = item.location;
  if (typeof roomId !== "string" || roomId.length === 0) return undefined;

  return state.world.rooms.find((r: Room) => r.id === roomId);
}

export function getAnimateItems(state: GameState): Item[] {
  const inventory = new Set(state.player.inventory);

  return state.world.items.filter((item) => {
    if (item.meta?.isAlive !== true) return false;

    if (!item.overrides?.tick) return false;

    if (inventory.has(item.id)) return false;

    if (state.itemState.frozenItems[item.id]) return false;

    const roomId = state.itemState.itemRoomId[item.id];
    if (!roomId) return false;

    return true;
  });
}
