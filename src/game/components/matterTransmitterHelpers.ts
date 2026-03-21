import { inventoryHas } from "@game/rules/state";
import type { GameState, PlayerInventory, World } from "@game/types/gameTypes";
import type { Item } from "@game/types/itemTypes";

export type Axis = "x" | "y" | "z";
export type AxisBounds = Record<Axis, { min: number; max: number }>;
export type MatterTransmitterOption = {
  id: string;
  name: string;
};
export type TransmitterCoord = { x: number; y: number; z: number };
export type TransmitterMeta = {
  coordByRoomId: Record<string, TransmitterCoord>;
  roomIdByCoord: Record<string, string>;
};

export const MT_HOST_ID = "MatterTransmitter";
export const EMPTY_COORD_BY_ROOM_ID: Record<string, TransmitterCoord> = {};
export const EMPTY_ROOM_ID_BY_COORD: Record<string, string> = {};

export function coordKey(x: number, y: number, z: number): string {
  return `${x},${y},${z}`;
}

export function clampWrap(next: number, min: number, max: number): number {
  if (min > max) return next;
  if (next > max) return min;
  if (next < min) return max;
  return next;
}

export function getAxisBounds(
  coordByRoomId: Record<string, TransmitterCoord>,
): AxisBounds {
  const coords = Object.values(coordByRoomId);
  const xs = coords.map((coord) => coord.x);
  const ys = coords.map((coord) => coord.y);
  const zs = coords.map((coord) => coord.z);

  return {
    x: {
      min: xs.length ? Math.min(...xs) : 0,
      max: xs.length ? Math.max(...xs) : 0,
    },
    y: {
      min: ys.length ? Math.min(...ys) : 0,
      max: ys.length ? Math.max(...ys) : 0,
    },
    z: {
      min: zs.length ? Math.min(...zs) : 0,
      max: zs.length ? Math.max(...zs) : 0,
    },
  };
}

export function getInitialCoord(
  playerRoomId: string,
  coordByRoomId: Record<string, TransmitterCoord>,
): TransmitterCoord {
  return coordByRoomId[playerRoomId] ?? { x: 0, y: 0, z: 0 };
}

export function getRoomName(world: World, roomId: string | undefined): string {
  if (!roomId) return "NONE";
  return world.rooms.find((room) => room.id === roomId)?.name ?? roomId;
}

export function getItemById(
  world: World,
  itemId: string | undefined,
): Item | undefined {
  if (!itemId) return undefined;
  return world.items.find((item) => item.id === itemId);
}

export function getItemDisplayName(
  world: World,
  state: GameState,
  itemId: string,
): string {
  const item = getItemById(world, itemId);
  return item?.named?.(state) ?? item?.name ?? itemId;
}

export function getPlateItemIds(state: GameState): string[] {
  return state.itemState.surfaceContents?.[MT_HOST_ID] ?? [];
}

export function getTargetRoomCollectableIds(
  state: GameState,
  targetRoomId: string | undefined,
  plateItemIds: string[],
): string[] {
  if (!targetRoomId) return [];

  const ids: string[] = [];

  for (const item of state.world.items) {
    const { id } = item;

    if (plateItemIds.includes(id)) continue;
    if (inventoryHas(state.player.inventory, id)) continue;

    const currentRoomId = getItemCurrentRoomId(id, state);
    if (currentRoomId !== targetRoomId) continue;

    if (!isCollectableItem(item)) continue;

    const inAnySurface = Object.values(state.itemState.surfaceContents ?? {}).some(
      (items) => (items ?? []).includes(id),
    );
    const inAnyContainer = Object.values(
      state.itemState.containerContents ?? {},
    ).some((items) => (items ?? []).includes(id));
    if (inAnySurface || inAnyContainer) continue;

    ids.push(id);
  }

  return ids.sort((a, b) =>
    getItemDisplayName(state.world, state, a).localeCompare(
      getItemDisplayName(state.world, state, b),
    ),
  );
}

export function buildMatterTransmitterOptions(
  state: GameState,
  itemIds: string[],
): MatterTransmitterOption[] {
  return itemIds.map((id) => ({
    id,
    name: getItemDisplayName(state.world, state, id),
  }));
}

export function canTransmitToTarget(
  targetRoomId: string | undefined,
  plateItemId: string | undefined,
  selectedItemId: string,
  targetRoomCollectableIds: string[],
): boolean {
  if (!targetRoomId) return false;
  if (plateItemId) return true;
  if (!selectedItemId) return false;
  if (targetRoomCollectableIds.length === 0) return false;
  return targetRoomCollectableIds.includes(selectedItemId);
}

export function getModeLabel(
  plateItemId: string | undefined,
  selectedItemId: string,
): string {
  if (plateItemId) return "SENDING";
  if (selectedItemId) return "RECEIVING";
  return "IDLE";
}

export function getTransferHint(
  targetRoomId: string | undefined,
  targetRoomCollectableCount: number,
  plateItemId: string | undefined,
): string {
  if (!targetRoomId) return "No room at these coordinates.";
  if (targetRoomCollectableCount === 0) {
    return "No transmittable items detected.";
  }
  if (plateItemId) return "Plate occupied. Transmission will send.";
  return "Highlight an item to receive.";
}

export function removeItemFromLists(
  lists: Record<string, string[]> | undefined,
  itemId: string,
): Record<string, string[]> | undefined {
  if (!lists) return lists;

  const next: Record<string, string[]> = {};
  for (const [hostId, ids] of Object.entries(lists)) {
    next[hostId] = (ids ?? []).filter((id) => id !== itemId);
  }
  return next;
}

export function applyMatterTransmission(
  prev: GameState,
  targetRoomId: string,
  selectedItemId: string,
): { didMove: boolean; nextState: GameState } {
  const prevPlate = getPlateItemIds(prev);
  const prevPlateItemId = prevPlate[0];

  if (prevPlateItemId) {
    const nextSurfaceContents = { ...(prev.itemState.surfaceContents ?? {}) };
    nextSurfaceContents[MT_HOST_ID] = prevPlate.slice(1);

    const nextItemRoomId = { ...(prev.itemState.itemRoomId ?? {}) };
    nextItemRoomId[prevPlateItemId] = targetRoomId;

    return {
      didMove: true,
      nextState: {
        ...prev,
        player: {
          ...prev.player,
          inventory: removeItemFromInventory(
            prev.player.inventory,
            prevPlateItemId,
          ),
        },
        itemState: {
          ...prev.itemState,
          surfaceContents: nextSurfaceContents,
          itemRoomId: nextItemRoomId,
          containerContents:
            removeItemFromLists(
              prev.itemState.containerContents,
              prevPlateItemId,
            ) ?? {},
          underContents:
            removeItemFromLists(prev.itemState.underContents, prevPlateItemId) ??
            {},
          searchableContents:
            removeItemFromLists(
              prev.itemState.searchableContents,
              prevPlateItemId,
            ) ?? {},
        },
      },
    };
  }

  if (!selectedItemId) {
    return { didMove: false, nextState: prev };
  }

  if (getItemCurrentRoomId(selectedItemId, prev) !== targetRoomId) {
    return { didMove: false, nextState: prev };
  }

  const nextSurfaceContents = { ...(prev.itemState.surfaceContents ?? {}) };
  nextSurfaceContents[MT_HOST_ID] = [selectedItemId];

  const nextItemRoomId = { ...(prev.itemState.itemRoomId ?? {}) };
  nextItemRoomId[selectedItemId] = prev.player.roomId;

  return {
    didMove: true,
    nextState: {
      ...prev,
      itemState: {
        ...prev.itemState,
        surfaceContents: nextSurfaceContents,
        itemRoomId: nextItemRoomId,
        containerContents:
          removeItemFromLists(prev.itemState.containerContents, selectedItemId) ??
          {},
        underContents:
          removeItemFromLists(prev.itemState.underContents, selectedItemId) ??
          {},
        searchableContents:
          removeItemFromLists(
            prev.itemState.searchableContents,
            selectedItemId,
          ) ?? {},
      },
    },
  };
}

function getItemCurrentRoomId(
  itemId: string,
  state: GameState,
): string | undefined {
  const overriddenRoomId = state.itemState.itemRoomId?.[itemId];
  if (overriddenRoomId) return overriddenRoomId;

  const location = getItemById(state.world, itemId)?.location;
  return typeof location === "string" ? location : undefined;
}

function isCollectableItem(item: Item | undefined): boolean {
  if (!item) return false;
  if ((item as { scenery?: boolean }).scenery === true) return false;
  if ((item as { isFixture?: boolean }).isFixture === true) return false;
  if ((item as { fixed?: boolean }).fixed === true) return false;
  return item.itemCategory === "collectable";
}

function removeItemFromInventory(
  inventory: PlayerInventory,
  itemId: string,
): PlayerInventory {
  if (!inventoryHas(inventory, itemId)) return inventory;

  return {
    general: inventory.general.filter((id) => id !== itemId),
    badges: inventory.badges.filter((id) => id !== itemId),
    keys: inventory.keys.filter((id) => id !== itemId),
  };
}
