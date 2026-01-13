import { GameState } from "@game/types/gameTypes";
import type { Direction, Exit, Room } from "../types/roomTypes";

export type AdjacentContact = { itemId: string; dirFromPlayer: Direction };

function getRoomById(state: GameState, roomId: string): Room | undefined {
  const anyState = state as any;
  if (anyState.world?.roomsById?.[roomId])
    return anyState.world.roomsById[roomId];
  const rooms: Room[] | undefined = anyState.world?.rooms;
  return rooms?.find((r) => r.id === roomId);
}

function getItemRoomId(state: GameState, itemId: string): string | undefined {
  const anyState = state as any;
  const fromMap = anyState.itemState?.itemRoomId?.[itemId];
  if (fromMap) return fromMap;

  const it = anyState.world?.items?.find((x: any) => x.id === itemId);
  return it?.location;
}

export function getAdjacentItemContacts(
  state: GameState,
  includeItem?: (item: any) => boolean
): AdjacentContact[] {
  const playerRoomId = state.player.roomId;
  const playerRoom = getRoomById(state, playerRoomId);
  if (!playerRoom) return [];

  const dirByRoomId = new Map<string, Direction>();
  for (const ex of (playerRoom.exits ?? []) as Exit[]) {
    if (!ex?.toRoomId) continue;
    dirByRoomId.set(ex.toRoomId, ex.direction as Direction);
  }

  const out: AdjacentContact[] = [];
  for (const item of state.world.items as any[]) {
    if (!item) continue;
    if (includeItem && !includeItem(item)) continue;

    const roomId = getItemRoomId(state, item.id);
    if (!roomId) continue;

    const dir = dirByRoomId.get(roomId);
    if (!dir) continue;

    out.push({ itemId: item.id, dirFromPlayer: dir });
  }

  return out;
}
