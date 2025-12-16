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
  return state.world.items.filter((it) => it.location === roomId);
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
