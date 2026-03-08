import type { World, WorldChunk } from "../game/types/gameTypes";
import { LEVEL_SIX } from "./maps/levelSix/LevelSix";
import { STAIRWELL } from "./maps/Stairwell";

export type WorldChunkId =
  | "level-one"
  | "level-two"
  | "level-three"
  | "level-four"
  | "level-five"
  | "level-six"
  | "level-seven"
  | "stairwell";

function dedupeById<T extends { id: string }>(items: T[]): T[] {
  return Array.from(new Map(items.map((item) => [item.id, item])).values());
}

export function mergeWorldChunks(...chunks: Array<WorldChunk | World>): World {
  return {
    rooms: dedupeById(chunks.flatMap((c) => c.rooms)),
    items: dedupeById(chunks.flatMap((c) => c.items)),
    doors: dedupeById(chunks.flatMap((c) => c.doors)),
    teleportPads: dedupeById(chunks.flatMap((c) => c.teleportPads)),
  };
}

export const INITIAL_WORLD_CHUNK_IDS = [
  "level-six",
  "stairwell",
] as const satisfies readonly WorldChunkId[];

export const DEFERRED_WORLD_CHUNK_IDS = [
  "level-five",
  "level-seven",
  "level-four",
  "level-three",
  "level-two",
  "level-one",
] as const satisfies readonly WorldChunkId[];

const DEFERRED_ENTRY_ROOM_CHUNK_IDS: Partial<Record<string, WorldChunkId>> = {
  LevelOneCorridorOne: "level-one",
  LevelTwoBurnedArea: "level-two",
  LevelThreeCorridorSeven: "level-three",
  LevelFourCorridorTwo: "level-four",
  EngCorridorOne: "level-five",
  LevelSevenCorridorBend: "level-seven",
};

const PRIORITY_PRELOAD_ROOMS: Partial<Record<string, readonly WorldChunkId[]>> = {
  StairOne: ["level-one"],
  LevelOneStairAccess: ["level-one"],
  StairTwo: ["level-two"],
  LevelTwoStairAccess: ["level-two"],
  StairThree: ["level-three"],
  LevelThreeStairAccess: ["level-three"],
  StairFour: ["level-four"],
  LevelFourStairAccess: ["level-four"],
  StairFive: ["level-five"],
  LevelFiveStairAccess: ["level-five"],
  StairSeven: ["level-seven"],
  LevelSevenStairAccess: ["level-seven"],
};

const INITIAL_WORLD_CHUNKS: Record<
  (typeof INITIAL_WORLD_CHUNK_IDS)[number],
  WorldChunk
> = {
  "level-six": LEVEL_SIX,
  stairwell: STAIRWELL,
};

const WORLD_CHUNK_LOADERS: Record<WorldChunkId, () => Promise<WorldChunk>> = {
  "level-one": () => import("./maps/LevelOne").then((mod) => mod.LEVEL_ONE),
  "level-two": () =>
    import("./maps/levelTwo/LevelTwo").then((mod) => mod.LEVEL_TWO),
  "level-three": () =>
    import("./maps/levelThree/LevelThree").then((mod) => mod.LEVEL_THREE),
  "level-four": () =>
    import("./maps/levelFour/LevelFour").then((mod) => mod.LEVEL_FOUR),
  "level-five": () =>
    import("./maps/levelFive/LevelFive").then((mod) => mod.LEVEL_FIVE),
  "level-six": async () => LEVEL_SIX,
  "level-seven": () =>
    import("./maps/LevelSeven").then((mod) => mod.LEVEL_SEVEN),
  stairwell: async () => STAIRWELL,
};

export const INITIAL_WORLD: World = {
  ...mergeWorldChunks(
    ...INITIAL_WORLD_CHUNK_IDS.map((chunkId) => INITIAL_WORLD_CHUNKS[chunkId]),
  ),
  meta: {
    loadedChunkIds: [...INITIAL_WORLD_CHUNK_IDS],
  },
};

export async function loadWorldChunk(chunkId: WorldChunkId): Promise<WorldChunk> {
  return WORLD_CHUNK_LOADERS[chunkId]();
}

export function getDeferredWorldChunkForEntryRoom(
  roomId: string,
): WorldChunkId | undefined {
  return DEFERRED_ENTRY_ROOM_CHUNK_IDS[roomId];
}

export function getPriorityWorldChunkIdsForRoom(
  roomId: string,
): readonly WorldChunkId[] {
  return PRIORITY_PRELOAD_ROOMS[roomId] ?? [];
}

export function isWorldChunkLoaded(world: World, chunkId: WorldChunkId): boolean {
  const loadedChunkIds = Array.isArray(world.meta?.loadedChunkIds)
    ? world.meta.loadedChunkIds
    : [];

  return loadedChunkIds.includes(chunkId);
}
