import { createInitialState } from "@game/gameInit";
import { applySnapshotMigrations } from "@game/registries/snapshotMigrationRegistry";
import type { GameState, World } from "@game/types/gameTypes";
import type { Item } from "@game/types/itemTypes";
import {
  DEFERRED_WORLD_CHUNK_IDS,
  INITIAL_WORLD,
  INITIAL_WORLD_CHUNK_IDS,
  loadWorldChunk,
  mergeWorldChunks,
  type WorldChunkId,
} from "../../world/World";

const RESUME_STORAGE_KEY = "aysf:resume";
const MANUAL_SAVE_STORAGE_KEY = "aysf:save";
const RESUME_SNAPSHOT_VERSION = 1;
const OBSOLETE_WORLD_ITEM_IDS = new Set([
  "InckGlassboolMemoryBathroom",
  "InckGlassboolMemoryBasement",
]);

type SerializedWorldItem = Record<string, unknown> & { id: string };

type GameSnapshotV1 = {
  version: typeof RESUME_SNAPSHOT_VERSION;
  savedAt: string;
  loadedChunkIds: WorldChunkId[];
  worldItems: SerializedWorldItem[];
  moves: number;
  score: number;
  rating: number;
  log: GameState["log"];
  player: GameState["player"];
  worldState: Omit<GameState["worldState"], "conditionalExits" | "pendingNarration">;
  itemState: GameState["itemState"];
  conversation?: GameState["conversation"];
  radio?: GameState["radio"];
  uiState?: Pick<
    GameState["uiState"],
    | "cometPersonality"
    | "cometTextSize"
    | "conversationMode"
    | "visualEffectsMode"
  >;
};

function canUseLocalStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function getInitialWorldChunkIds(): readonly WorldChunkId[] {
  return INITIAL_WORLD_CHUNK_IDS as readonly WorldChunkId[];
}

function getDeferredWorldChunkIds(): readonly WorldChunkId[] {
  return DEFERRED_WORLD_CHUNK_IDS as readonly WorldChunkId[];
}

function isWorldChunkId(value: unknown): value is WorldChunkId {
  return (
    typeof value === "string" &&
    (getInitialWorldChunkIds().includes(value as WorldChunkId) ||
      getDeferredWorldChunkIds().includes(value as WorldChunkId))
  );
}

function normalizeLoadedChunkIds(
  input: unknown,
): WorldChunkId[] {
  const next: WorldChunkId[] = [];
  const seen = new Set<WorldChunkId>();

  for (const chunkId of getInitialWorldChunkIds()) {
    next.push(chunkId);
    seen.add(chunkId);
  }

  if (!Array.isArray(input)) {
    return next;
  }

  for (const value of input) {
    if (!isWorldChunkId(value)) continue;
    if (seen.has(value)) continue;
    next.push(value);
    seen.add(value);
  }

  return next;
}

function serializeWorldItems(items: Item[]): SerializedWorldItem[] {
  return JSON.parse(
    JSON.stringify(
      items.filter((item) => !OBSOLETE_WORLD_ITEM_IDS.has(item.id)),
    ),
  ) as SerializedWorldItem[];
}

function applySerializedWorldItems(
  world: World,
  savedItems: SerializedWorldItem[],
): World {
  const activeSavedItems = savedItems.filter(
    (item) => !OBSOLETE_WORLD_ITEM_IDS.has(item.id),
  );
  const savedById = new Map(activeSavedItems.map((item) => [item.id, item]));
  const baseIds = new Set(world.items.map((item) => item.id));

  const mergedItems = world.items.map((item) => {
    const saved = savedById.get(item.id);
    if (!saved) return item;
    const mergedItem = {
      ...item,
      ...(saved as Partial<Item>),
    };

    if (item.overrides || saved.overrides) {
      mergedItem.overrides = {
        ...item.overrides,
        ...((saved as Partial<Item>).overrides ?? {}),
      };
    }

    return mergedItem;
  });

  const extraItems = activeSavedItems
    .filter((item) => !baseIds.has(item.id))
    .map((item) => item as unknown as Item);

  return {
    ...world,
    items: [...mergedItems, ...extraItems],
  };
}

function buildSnapshot(state: GameState): GameSnapshotV1 {
  const loadedChunkIds = normalizeLoadedChunkIds(state.world.meta?.loadedChunkIds);
  const persistedWorldState = { ...state.worldState } as Partial<
    GameState["worldState"]
  >;
  delete persistedWorldState.conditionalExits;
  delete persistedWorldState.pendingNarration;

  return {
    version: RESUME_SNAPSHOT_VERSION,
    savedAt: new Date().toISOString(),
    loadedChunkIds,
    worldItems: serializeWorldItems(state.world.items),
    moves: state.moves,
    score: state.score,
    rating: state.rating,
    log: state.log,
    player: state.player,
    worldState: persistedWorldState as GameSnapshotV1["worldState"],
    itemState: state.itemState,
    conversation: state.conversation,
    radio: state.radio,
    uiState: {
      cometPersonality: state.uiState.cometPersonality,
      cometTextSize: state.uiState.cometTextSize,
      conversationMode: state.uiState.conversationMode,
      visualEffectsMode: state.uiState.visualEffectsMode,
    },
  };
}

function parseSnapshot(raw: string | null): GameSnapshotV1 | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<GameSnapshotV1> | null;
    if (!parsed || parsed.version !== RESUME_SNAPSHOT_VERSION) return null;
    if (!Array.isArray(parsed.log)) return null;
    if (!parsed.player || !parsed.itemState || !parsed.worldState) return null;
    if (!Array.isArray(parsed.worldItems)) return null;

    return {
      ...parsed,
      loadedChunkIds: normalizeLoadedChunkIds(parsed.loadedChunkIds),
      worldItems: parsed.worldItems.filter(
        (item): item is SerializedWorldItem =>
          Boolean(item && typeof item === "object" && typeof item.id === "string"),
      ),
    } as GameSnapshotV1;
  } catch {
    return null;
  }
}

async function buildWorldFromLoadedChunkIds(
  loadedChunkIds: WorldChunkId[],
): Promise<World> {
  const deferredChunkIds = loadedChunkIds.filter(
    (chunkId) => !getInitialWorldChunkIds().includes(chunkId),
  );
  const deferredChunks = await Promise.all(
    deferredChunkIds.map((chunkId) => loadWorldChunk(chunkId)),
  );

  return {
    ...mergeWorldChunks(INITIAL_WORLD, ...deferredChunks),
    meta: {
      loadedChunkIds,
    },
  };
}

function saveSnapshotToStorage(
  storageKey: string,
  state: GameState,
): boolean {
  if (!canUseLocalStorage()) return false;

  try {
    const snapshot = buildSnapshot(state);
    window.localStorage.setItem(storageKey, JSON.stringify(snapshot));
    return true;
  } catch (error) {
    console.error("Failed to save game snapshot.", error);
    return false;
  }
}

function clearSnapshotFromStorage(storageKey: string): void {
  if (!canUseLocalStorage()) return;

  try {
    window.localStorage.removeItem(storageKey);
  } catch (error) {
    console.error("Failed to clear game snapshot.", error);
  }
}

async function restoreSnapshotFromStorage(
  storageKey: string,
): Promise<GameState | null> {
  if (!canUseLocalStorage()) return null;

  const rawSnapshot = window.localStorage.getItem(storageKey);
  const snapshot = parseSnapshot(rawSnapshot);

  if (!snapshot) {
    if (rawSnapshot) {
      clearSnapshotFromStorage(storageKey);
    }
    return null;
  }

  try {
    const world = await buildWorldFromLoadedChunkIds(snapshot.loadedChunkIds);
    const baseState = createInitialState(world);
    const restoredWorld = applySerializedWorldItems(baseState.world, snapshot.worldItems);
    const restoredState: GameState = {
      ...baseState,
      world: restoredWorld,
      log: snapshot.log,
      moves: snapshot.moves,
      score: snapshot.score,
      rating: snapshot.rating,
      player: snapshot.player,
      worldState: {
        ...baseState.worldState,
        ...snapshot.worldState,
        conditionalExits: baseState.worldState.conditionalExits,
        pendingNarration: undefined,
      },
      itemState: snapshot.itemState,
      conversation: snapshot.conversation,
      radio: snapshot.radio,
      uiState: {
        ...baseState.uiState,
        cometPersonality:
          snapshot.uiState?.cometPersonality ?? baseState.uiState.cometPersonality,
        cometTextSize:
          snapshot.uiState?.cometTextSize ?? baseState.uiState.cometTextSize,
        conversationMode:
          snapshot.uiState?.conversationMode ?? baseState.uiState.conversationMode,
        visualEffectsMode:
          snapshot.uiState?.visualEffectsMode ??
          baseState.uiState.visualEffectsMode,
        notifications: [],
        nextNotificationId: 1,
      },
      rng: () => Math.random(),
    };

    const roomExists = restoredState.world.rooms.some(
      (room) => room.id === restoredState.player.roomId,
    );

    if (!roomExists) {
      clearSnapshotFromStorage(storageKey);
      return null;
    }

    return applySnapshotMigrations(restoredState);
  } catch (error) {
    console.error("Failed to restore game snapshot.", error);
    clearSnapshotFromStorage(storageKey);
    return null;
  }
}

export function saveResumeSnapshot(state: GameState): boolean {
  return saveSnapshotToStorage(RESUME_STORAGE_KEY, state);
}

export function saveManualSnapshot(state: GameState): boolean {
  return saveSnapshotToStorage(MANUAL_SAVE_STORAGE_KEY, state);
}

export function clearResumeSnapshot(): void {
  clearSnapshotFromStorage(RESUME_STORAGE_KEY);
}

export function clearManualSnapshot(): void {
  clearSnapshotFromStorage(MANUAL_SAVE_STORAGE_KEY);
}

export async function restoreResumeSnapshot(): Promise<GameState | null> {
  return restoreSnapshotFromStorage(RESUME_STORAGE_KEY);
}

export async function restoreManualSnapshot(): Promise<GameState | null> {
  return restoreSnapshotFromStorage(MANUAL_SAVE_STORAGE_KEY);
}
