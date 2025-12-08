import type {
  Direction,
  DoorDefinition,
  DoorState,
  GameState,
  Item,
  Room,
} from "../world/types";

export function getCurrentRoom(state: GameState): Room {
  const room = state.world.rooms.find((r: Room) => r.id === state.playerRoomId);
  if (!room) {
    throw new Error(`Unknown room id: ${state.playerRoomId}`);
  }
  return room;
}

export function getCurrentRoomExits(state: GameState): Direction[] {
  const room = state.world.rooms.find((r: Room) => r.id === state.playerRoomId);
  const exitList = room?.exits?.map((exit) => {
    return exit.direction;
  });
  return exitList || [];
}

export function getDoorById(
  state: GameState,
  id: string
): DoorDefinition | undefined {
  return state.world.doors.find((d) => d.id === id);
}

export function getDoorState(
  state: GameState,
  id: string
): DoorState | undefined {
  return state.doorStates.find((s) => s.id === id);
}

export function getItemsInInventory(state: GameState): Item[] {
  return state.world.items.filter((it) => it.location === "INVENTORY");
}

export function getItemsInCurrentRoom(
  state: GameState,
  roomId: string
): Item[] {
  return state.world.items.filter((it) => it.location === state.playerRoomId);
}

export function getItemById(state: GameState, id: string): Item | undefined {
  return state.world.items.find((it: Item) => it.id === id);
}

export function resolveItemByNoun(
  state: GameState,
  roomId: string,
  noun: string,
  includeInventory = true
): Item | undefined {
  const lower = noun.toLowerCase();

  const roomItems = getItemsInCurrentRoom(state, roomId);
  const invItems = includeInventory
    ? state.world.items.filter((it: Item) => state.inventory.includes(it.id))
    : [];

  const candidates = [...roomItems, ...invItems];

  return candidates.find((it) =>
    [
      it.name.toLowerCase(),
      ...it.vocab.map((v: string) => v.toLowerCase()),
    ].includes(lower)
  );
}

export function resolveDoorByNoun(
  state: GameState,
  noun: string
): { def: DoorDefinition; state: DoorState } | null {
  const room = getCurrentRoom(state);
  const lower = noun.toLowerCase();

  // Which doors are attached to exits from THIS room?
  const doorIds = room.exits
    .map((e) => e.doorId)
    .filter((id): id is string => Boolean(id));

  for (const doorId of doorIds) {
    const def = state.world.doors.find((d) => d.id === doorId);
    const doorState = state.doorStates.find((s) => s.id === doorId);

    if (!def || !doorState) continue;

    const matches =
      def.name.toLowerCase() === lower ||
      (Array.isArray(def.vocab) &&
        def.vocab.some((v: string) => v.toLowerCase() === lower));

    if (matches) {
      return { def, state: doorState };
    }
  }

  return null;
}

export function describeRoomWithItems(state: GameState): string {
  const room = getCurrentRoom(state);
  const itemsHere = getItemsInCurrentRoom(state, "");

  const itemNames = itemsHere.map((i) => i.name);
  const itemsText = itemNames.length
    ? `\n\nYou can see ${itemNames.join(", ")} here.`
    : "";

  return room.description + itemsText;
}
