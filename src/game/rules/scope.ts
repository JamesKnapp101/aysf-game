import { inventoryHas } from "@game/rules/state";
import { getNpcById, getNpcForItem } from "@game/npcRegistry";
import type { ConversationNpc, ConversationTarget } from "@game/types/npcTypes";
import {
  HYDROPONICS_SPIDER_ITEM_ID,
  isHydroponicsSpiderNoun,
  isHydroponicsSpiderRoom,
  isHydroponicsSpiderVisibleFromRoom,
} from "src/world/Items/creatures/giantSpider";
import {
  isAquariumRoom,
  matchesAquariumThreatNoun,
} from "src/world/Items/creatures/octopus";
import { getCurrentRoom } from "../selectors/roomSelectors";
import { getTeleportPadsInCurrentRoom } from "../selectors/teleportationSelectors";
import type { DoorDefinition, DoorState } from "../types/doorTypes";
import type { GameState } from "../types/gameTypes";
import type { Item } from "../types/itemTypes";
import type { Exit } from "../types/roomTypes";
import type { TeleportPadDefinition } from "../types/tpadTypes";

/**
 * Authoritative "where is this item right now?"
 * item.location is treated as a fallback / seed location only.
 */
function getLiveItemLocation(state: GameState, item: Item): string | undefined {
  return state.itemState.itemRoomId?.[item.id] ?? item.location ?? undefined;
}

/**
 * Simpler resolver used by inject logic, etc.
 * Scope: inventory + room surface items.
 */
export function resolveItemInScopeByNoun(
  state: GameState,
  noun: string,
): Item | null {
  const lower = noun.toLowerCase();
  const room = getCurrentRoom(state);

  const invItems = state.world.items.filter((i) =>
    inventoryHas(state.player.inventory, i.id),
  );

  const roomItems = state.world.items.filter(
    (i) => getLiveItemLocation(state, i) === room.id,
  );

  const candidates = [...invItems, ...roomItems];

  for (const item of candidates) {
    if (
      (item.named?.(state).toLowerCase() === lower ||
        item.name.toLowerCase()) === lower ||
      item.vocab.some((v: string) => v.toLowerCase() === lower)
    ) {
      return item;
    }
  }

  return null;
}

export function normalizeTopic(
  text: string,
  target?: ConversationTarget,
): string {
  const ignoreWords = ["the", "a", "an", "ask", "tell"];
  if (target?.kind === "npc") {
    ignoreWords.push(target.npc.name.toLowerCase());
    for (const v of target.npc.vocab ?? []) {
      ignoreWords.push(v);
    }
  }
  const toks = tokenize(text).filter((t) => !ignoreWords.includes(t));
  return toks.join(" ");
}

/**
 * Normalization helpers for noun matching
 */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
}

export function tokenize(text: string): string[] {
  return normalize(text).split(/\s+/).filter(Boolean);
}

/**
 * Resolve an item by noun, scoped to:
 *   - items in current room
 *   - items in inventory
 *   - items inside open containers that are in the current room (recurses)
 *
 * Container open state:
 *   non-openable containers                      -> implicitly open
 *   state.itemState.openItems[item.id] === true  -> open
 *   false/undefined                              -> closed
 */
export function resolveItemByNoun(
  state: GameState,
  noun: string,
): Item | undefined {
  const room = getCurrentRoom(state);
  const tokens = tokenize(noun);

  const itemsById = new Map(state.world.items.map((it) => [it.id, it]));

  const isOpen = (itemId: string): boolean =>
    state.itemState.openItems?.[itemId] === true;

  const liveLocById = (itemId: string): string | undefined => {
    const it = itemsById.get(itemId);
    if (!it) return undefined;
    return getLiveItemLocation(state, it);
  };

  // Build a set of item ids that are in scope.
  const inScopeIds = new Set<string>();

  // 1) Base scope: room + inventory
  for (const it of state.world.items) {
    const loc = getLiveItemLocation(state, it);

    if (loc === room.id) inScopeIds.add(it.id);
    if (inventoryHas(state.player.inventory, it.id)) inScopeIds.add(it.id);
  }

  // 2) Add contents of open containers in the room (recursively)
  const queue: string[] = [];
  const visitedContainers = new Set<string>();

  // Seed with open items that are physically in the room
  for (const id of inScopeIds) {
    const loc = liveLocById(id);
    if (loc === room.id && isOpen(id)) {
      queue.push(id);
      visitedContainers.add(id);
    }
  }

  // BFS: include children, and if a child is an open container, include its children too
  while (queue.length) {
    const containerId = queue.shift()!;

    for (const child of state.world.items) {
      const childLoc = getLiveItemLocation(state, child);
      if (childLoc !== containerId) continue;

      if (!inScopeIds.has(child.id)) inScopeIds.add(child.id);

      if (isOpen(child.id) && !visitedContainers.has(child.id)) {
        visitedContainers.add(child.id);
        queue.push(child.id);
      }
    }
  }

  const itemsInScope = [...inScopeIds]
    .map((id) => itemsById.get(id))
    .filter((x): x is Item => Boolean(x));

  const exactId = itemsInScope.find(
    (it) => normalize(it.id) === normalize(noun),
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

  if (
    isHydroponicsSpiderRoom(room.id) &&
    isHydroponicsSpiderVisibleFromRoom(room.id)
  ) {
    const spider = state.world.items.find(
      (it) => it.id === HYDROPONICS_SPIDER_ITEM_ID,
    );
    if (spider && isHydroponicsSpiderNoun(spider, noun)) {
      return spider;
    }
  }

  if (isAquariumRoom(room.id) && matchesAquariumThreatNoun(noun)) {
    return state.world.items.find((it) => it.id === "octopus");
  }

  return undefined;
}

/**
 * Resolve a door from a noun like "door" / "hatch" / "airlock"
 * scoped to the exits of the *current* room.
 */
export function resolveDoorByNoun(
  state: GameState,
  noun: string,
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
  noun: string | null,
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

export function getActiveRadioNpc(
  state: GameState,
): ConversationNpc | undefined {
  return getNpcById(state.radio?.activeNpcId);
}

function normalizeForConversation(t: string): string {
  // keep it simple: lowercase + trim + basic punctuation handling
  // (leave your existing normalize() alone if it’s used elsewhere)
  return t.trim().toLowerCase();
}

function tokenizeConv(s: string): string[] {
  return tokenize(s)
    .map(normalizeForConversation)
    .filter((t) => t.length > 0); // NOTE: no "drop short words" rule here
}

function containsTokenSequence(haystack: string[], needle: string[]): boolean {
  if (needle.length === 0) return false;
  if (needle.length === 1) return haystack.includes(needle[0]);

  for (let i = 0; i <= haystack.length - needle.length; i++) {
    let ok = true;
    for (let j = 0; j < needle.length; j++) {
      if (haystack[i + j] !== needle[j]) {
        ok = false;
        break;
      }
    }
    if (ok) return true;
  }
  return false;
}

export function resolveConversationTarget(
  state: GameState,
  targetText: string,
): ConversationTarget | undefined {
  const item = resolveItemByNoun(state, targetText);
  if (item) {
    const npc = getNpcForItem(item);
    if (npc) {
      return { kind: "npc", npc, via: "direct", item };
    }

    return { kind: "item", item };
  }

  const npc = getActiveRadioNpc(state);
  if (!npc) return undefined;

  const inputTokens = tokenizeConv(targetText);

  const nameNeedle = tokenizeConv(npc.name);
  const matchesName = containsTokenSequence(inputTokens, nameNeedle);
  const matchesVocab = (npc.vocab ?? []).some((term) =>
    containsTokenSequence(inputTokens, tokenizeConv(term)),
  );

  return matchesName || matchesVocab
    ? { kind: "npc", npc, via: "radio" }
    : undefined;
}
