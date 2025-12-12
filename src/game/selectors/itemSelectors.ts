import type { GameState } from "../types/gameTypes";
import type { Item } from "../types/itemTypes";
import { getCurrentRoom } from "./roomSelectors";

export function getItemById(state: GameState, id: string): Item | undefined {
  return state.world.items.find((it: Item) => it.id === id);
}

// Inventory derived from player.inventory
export function getItemsInInventory(state: GameState): Item[] {
  const invIds = new Set(state.player.inventory);
  return state.world.items.filter((it) => invIds.has(it.id));
}

// Legacy-style lookup using location === "INVENTORY" is *not*
// used anymore – rely on player.inventory instead.

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

  // 1) Exact id match
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
    const vocabTokens = new Set(it.vocab.map((v: string) => normalize(v)));
    return tokens.every((t) => vocabTokens.has(t));
  });
  if (byVocab) return byVocab;

  return undefined;
}

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
