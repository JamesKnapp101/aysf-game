import { getCurrentRoom } from "../selectors/roomSelectors";
import { getTeleportPadsInCurrentRoom } from "../selectors/teleportationSelectors";
import type { DoorDefinition, DoorState } from "../types/doorTypes";
import type { GameState } from "../types/gameTypes";
import type { Item } from "../types/itemTypes";
import type { Exit } from "../types/roomTypes";
import type { TeleportPadDefinition } from "../types/tpadTypes";

/**
 * Simpler resolver used by inject logic, etc.
 * Scope: inventory + room surface items.
 */
export function resolveItemInScopeByNoun(
  state: GameState,
  noun: string
): Item | null {
  const lower = noun.toLowerCase();
  const room = getCurrentRoom(state);

  const invItems = state.world.items.filter((i) =>
    state.player.inventory.includes(i.id)
  );

  const roomItems = state.world.items.filter((i) => i.location === room.id);

  const candidates = [...invItems, ...roomItems];

  for (const item of candidates) {
    if (
      item.name.toLowerCase() === lower ||
      item.vocab.some((v: string) => v.toLowerCase() === lower)
    ) {
      return item;
    }
  }

  return null;
}

/**
 * Normalization helpers for noun matching
 */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
}

function tokenize(text: string): string[] {
  return normalize(text).split(/\s+/).filter(Boolean);
}

/**
 * Resolve an item by noun, scoped to:
 *   - items in current room
 *   - items in inventory
 */
export function resolveItemByNoun(
  state: GameState,
  noun: string
): Item | undefined {
  const room = getCurrentRoom(state);
  const tokens = tokenize(noun);

  const itemsInScope = state.world.items.filter((it) => {
    return it.location === room.id || state.player.inventory.includes(it.id);
  });

  const exactId = itemsInScope.find(
    (it) => normalize(it.id) === normalize(noun)
  );
  if (exactId) return exactId;

  const byName = itemsInScope.find((it) => {
    const nameTokens = new Set(tokenize(it.name));
    return tokens.every((t) => nameTokens.has(t));
  });
  if (byName) return byName;

  const byVocab = itemsInScope.find((it) => {
    if (!it.vocab?.length) return false;
    const vocabTokens = new Set(it.vocab.map((v: string) => normalize(v)));
    return tokens.every((t) => vocabTokens.has(t));
  });
  if (byVocab) return byVocab;

  return undefined;
}

/**
 * Resolve a door from a noun like "door" / "hatch" / "airlock"
 * scoped to the exits of the *current* room.
 */
export function resolveDoorByNoun(
  state: GameState,
  noun: string
): { def: DoorDefinition; doorState: DoorState } | null {
  const room = getCurrentRoom(state);
  const lower = noun.toLowerCase();

  const doorIds = room.exits
    .map((e: Exit) => e.doorId)
    .filter((id): id is string => Boolean(id));

  for (const doorId of doorIds) {
    const def = state.world.doors.find((d) => d.id === doorId);
    const doorState = state.worldState.doors[doorId];

    if (!def || !doorState) continue;

    const matches =
      def.name.toLowerCase() === lower ||
      (Array.isArray(def.vocab) &&
        def.vocab.some((v: string) => v.toLowerCase() === lower));

    if (matches) {
      return { def, doorState };
    }
  }

  return null;
}

export function resolveTeleportPadByNoun(
  state: GameState,
  noun: string | null
): TeleportPadDefinition | null {
  const padsHere = getTeleportPadsInCurrentRoom(state);
  if (!padsHere.length) return null;

  if (!noun) {
    return padsHere.length === 1 ? padsHere[0] : null;
  }

  const lower = noun.toLowerCase();

  return (
    padsHere.find((p) => p.label.toLowerCase() === lower) ??
    padsHere.find((p) => p.label.toLowerCase().includes(lower)) ??
    null
  );
}
