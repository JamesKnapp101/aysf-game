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

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
}

function tokenize(text: string): string[] {
  return normalize(text).split(/\s+/).filter(Boolean);
}

export function resolveItemByNoun(
  state: GameState,
  noun: string
): Item | undefined {
  const room = getCurrentRoom(state);
  const tokens = tokenize(noun);

  // Items in scope: in room or in inventory (you can expand this later)
  const itemsInScope = state.world.items.filter((it) => {
    return it.location === room.id || it.location === "INVENTORY";
  });

  // 1) Exact id match (user typed the id directly)
  const exactId = itemsInScope.find(
    (it) => normalize(it.id) === normalize(noun)
  );
  if (exactId) return exactId;

  // 2) Match by name: all tokens appear in item.name
  const byName = itemsInScope.find((it) => {
    const nameTokens = new Set(tokenize(it.name));
    return tokens.every((t) => nameTokens.has(t));
  });
  if (byName) return byName;

  // 3) Match by vocab: all tokens appear in item.vocab
  const byVocab = itemsInScope.find((it) => {
    if (!it.vocab?.length) return false;
    const vocabTokens = new Set(it.vocab.map((v) => normalize(v)));
    return tokens.every((t) => vocabTokens.has(t));
  });
  if (byVocab) return byVocab;

  // No match
  return undefined;
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
