import type { DoorState } from "../types/doorTypes";
import type { GameState } from "../types/gameTypes";
import type { ItemId } from "../types/ids";
import type { Item } from "../types/itemTypes";
import type { Exit, Room } from "../types/roomTypes";

// ---------- Small internal selectors (arrays -> objects) ----------

export function getRoomById(
  state: GameState,
  roomId: string
): Room | undefined {
  return state.world.rooms.find((r) => r.id === roomId);
}

export function getRandomWanderTarget(
  state: GameState,
  itemId: ItemId,
  rng: () => number
): string | undefined {
  const from = getItemRoomId(state, itemId);
  if (!from) return undefined;

  const options = getRoomExits(state, from)
    .filter((e) => !!e.toRoomId)
    .filter((e) => isExitPassable(state, e))
    .map((e) => e.toRoomId!)
    .filter((to) => canMove(state, itemId, to));

  if (!options.length) return undefined;

  return options[Math.floor(rng() * options.length)];
}

export function getItemById(
  state: GameState,
  itemId: string
): Item | undefined {
  return state.world.items.find((i) => i.id === itemId);
}

export function getDoorState(
  state: GameState,
  doorId: string
): DoorState | undefined {
  return state.worldState.doors[doorId];
}

export function isExitPassable(state: GameState, exit: Exit): boolean {
  if (!exit.doorId) return true;

  const ds = state.worldState.doors[exit.doorId];
  if (!ds) return true; // or false if you prefer "unknown door = blocked"
  console.log(
    "Cat is checking isExitPassable for ",
    exit.doorId,
    ": ",
    ds.isOpen && !ds.isLocked
  );
  return ds.isOpen && !ds.isLocked;
}

export function getRandomMoveTarget(
  state: GameState,
  itemId: ItemId,
  rng: () => number
): string | undefined {
  const fromRoomId = getItemRoomId(state, itemId);
  if (!fromRoomId) return undefined;

  const exits = getRoomExits(state, fromRoomId)
    .filter((e) => e.toRoomId)
    .filter((e) => isExitPassable(state, e));

  const options = exits
    .map((e) => e.toRoomId!)
    .filter((to) => canMove(state, itemId, to));

  if (!options.length) return undefined;

  const idx = Math.floor(rng() * options.length);
  return options[idx];
}

// ---------- Darkness ----------

export function isRoomDark(state: GameState, roomId: string): boolean {
  return state.worldState.darkRooms[roomId] === true;
}

// ---------- Exits ----------

export function getRoomExits(state: GameState, roomId: string): Exit[] {
  const room = state.world.rooms.find((r) => r.id === roomId);
  if (!room) return [];
  return room.exits ?? [];
}

export function getExitDestinationRoomId(
  state: GameState,
  fromRoomId: string,
  exit: Exit
): string | undefined {
  // Direct exits
  if (exit.toRoomId) return exit.toRoomId;

  // Door-based exits
  if (exit.doorId) {
    const def = state.world.doors.find((d) => d.id === exit.doorId);
    if (!def) return undefined;

    const { roomAId, roomBId } = def.connects;
    if (fromRoomId === roomAId) return roomBId;
    if (fromRoomId === roomBId) return roomAId;

    return undefined;
  }

  return undefined;
}

// Optional convenience: get destinations only
// export function getExitTargets(state: GameState, roomId: string): string[] {
//   return getRoomExits(state, roomId).map((e) => e.to);
// }

// ---------- Item location ----------

export function getItemRoomId(
  state: GameState,
  itemId: ItemId
): string | undefined {
  // If it’s in inventory, it’s not “in a room”
  if (state.player.inventory.includes(itemId)) return undefined;

  return state.itemState.itemRoomId[itemId];
}

export function setItemRoomId(
  state: GameState,
  itemId: string,
  roomId: string
): GameState {
  // ADJUST HERE if your ItemState uses a different field name
  const locMap = ((state.itemState as any).itemLocations ?? {}) as Record<
    string,
    string
  >;

  return {
    ...state,
    itemState: {
      ...state.itemState,
      itemLocations: {
        ...locMap,
        [itemId]: roomId,
      },
    } as any, // remove 'as any' once ItemState includes itemLocations
  };
}

// ---------- Movement ----------

function getAttachedChildren(state: GameState, hostId: ItemId): ItemId[] {
  const attachedTo = state.itemState.attachedTo ?? {};
  return Object.entries(attachedTo)
    .filter(([, h]) => h === hostId)
    .map(([childId]) => childId as ItemId);
}

export function moveItemToRoom(
  state: GameState,
  itemId: ItemId,
  roomId: string
): GameState {
  if (state.player.inventory.includes(itemId)) return state;
  if (!state.world.rooms.some((r) => r.id === roomId)) return state;

  const cur = state.itemState.itemRoomId[itemId];
  if (cur === roomId) return state;

  let next: GameState = {
    ...state,
    itemState: {
      ...state.itemState,
      itemRoomId: {
        ...state.itemState.itemRoomId,
        [itemId]: roomId,
      },
    },
  };

  // Move any attached items with the host
  const children = getAttachedChildren(next, itemId);
  for (const childId of children) {
    // Skip if child is carried/contained, etc. (optional, but safe)
    if (next.player.inventory.includes(childId)) continue;
    next = {
      ...next,
      itemState: {
        ...next.itemState,
        itemRoomId: {
          ...next.itemState.itemRoomId,
          [childId]: roomId,
        },
      },
    };
  }

  return next;
}

// ---------- Door checks (optional but worth having now) ----------

export function isExitBlockedByDoor(state: GameState, exit: Exit): boolean {
  const doorId = (exit as any).doorId as string | undefined; // ADJUST HERE if Exit has doorId typed
  if (!doorId) return false;

  const doorState = state.worldState.doors?.[doorId];
  if (!doorState) return false;

  // ADJUST HERE based on your DoorState shape
  // Common patterns: { isOpen: boolean, isLocked: boolean }
  if ((doorState as any).isLocked === true) return true;
  if ((doorState as any).isOpen === false) return true;

  return false;
}

// ---------- Can move ----------

export function canMove(
  state: GameState,
  itemId: ItemId,
  targetRoomId: string
): boolean {
  const fromRoomId = getItemRoomId(state, itemId);
  if (!fromRoomId) return false;

  // target must exist
  const targetExists = state.world.rooms.some((r) => r.id === targetRoomId);
  if (!targetExists) return false;

  // must have a valid exit and it must be passable
  const exits = getRoomExits(state, fromRoomId);
  const exit = exits.find((e) => e.toRoomId === targetRoomId);
  if (!exit) return false;

  if (!isExitPassable(state, exit)) return false;

  return true;
}

type ContentsMap = Record<ItemId, ItemId[]>;

export function flattenContents(map: ContentsMap | undefined): Set<ItemId> {
  const out = new Set<ItemId>();
  if (!map) return out;
  for (const ids of Object.values(map)) {
    for (const id of ids) out.add(id);
  }
  return out;
}

export function seedItemRoomLocations(state: GameState): GameState {
  const contained = new Set<ItemId>();

  // Anything already seeded as inside/on/under something should NOT get a room location.
  for (const s of [
    flattenContents(state.itemState.containerContents),
    flattenContents(state.itemState.surfaceContents),
    flattenContents(state.itemState.underContents),
    flattenContents(state.itemState.searchableContents),
  ]) {
    for (const id of s) contained.add(id);
  }

  const nextRoomId: Record<ItemId, string> = { ...state.itemState.itemRoomId };

  for (const item of state.world.items) {
    const id = item.id as ItemId;

    // carried items are not in rooms
    if (state.player.inventory.includes(item.id)) continue;

    // items inside other items are not in rooms
    if (contained.has(id)) continue;

    // "INVENTORY" is seed-only; player.inventory is the truth
    if (item.location === "INVENTORY") continue;

    // If item.location looks like a room id, place it
    const roomExists = state.world.rooms.some((r) => r.id === item.location);
    if (!roomExists) continue;

    // Don’t stomp an explicit existing placement
    if (!nextRoomId[id]) {
      nextRoomId[id] = item.location;
    }
  }

  return {
    ...state,
    itemState: {
      ...state.itemState,
      itemRoomId: nextRoomId,
    },
  };
}

export function setPlayerBrainActivityValue(state: GameState, value: number) {
  let next = state;
  next = {
    ...next,
    player: {
      ...next.player,
      vitals: {
        ...next.player.vitals,
        brainActivity: value,
      },
    },
  };
  return { state: next, message: `Your mind reels...` };
}
