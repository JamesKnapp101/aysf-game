import { flattenContents } from "../helpers/itemHelpers";
import type { GameState } from "../types/gameTypes";
import type { Item } from "../types/itemTypes";
import type { Direction, Room } from "../types/roomTypes";

export function getCurrentRoom(state: GameState): Room {
  const room = state.world.rooms.find(
    (r: Room) => r.id === state.player.roomId
  );
  if (!room) {
    throw new Error(`Unknown room id: ${state.player.roomId}`);
  }
  return room;
}

export function getCurrentRoomExits(state: GameState): Direction[] {
  const room = getCurrentRoom(state);
  return room.exits?.map((exit) => exit.direction) ?? [];
}

export function getItemsInRoom(state: GameState, roomId: string): Item[] {
  const inv = new Set(state.player.inventory);

  const contained = new Set<string>();
  for (const s of [
    flattenContents(state.itemState.containerContents),
    flattenContents(state.itemState.surfaceContents),
    flattenContents(state.itemState.underContents),
    flattenContents(state.itemState.searchableContents),
  ]) {
    for (const id of s) contained.add(id);
  }

  return state.world.items.filter((item) => {
    if (inv.has(item.id)) return false;
    if (contained.has(item.id)) return false;

    const dynRoomId = state.itemState.itemRoomId[item.id];
    if (dynRoomId) return dynRoomId === roomId;
    return item.location === roomId;
  });
}

export function getItemsInCurrentRoom(state: GameState): Item[] {
  const room = getCurrentRoom(state);
  return getItemsInRoom(state, room.id);
}

export function describeRoomWithItems(state: GameState): string {
  const room = getCurrentRoom(state);
  const itemsHere = getItemsInCurrentRoom(state);

  const itemNames = itemsHere.map((i) => i.name);
  const itemsText = itemNames.length
    ? `\n\nYou can see ${itemNames.join(", ")} here.`
    : "";

  return room.description + itemsText;
}

export function getPlayerRoomId(state: any): string {
  return state.player.roomId;
}
