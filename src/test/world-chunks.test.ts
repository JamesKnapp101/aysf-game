import { describe, expect, it } from "vitest";
import { createInitialState, mergeWorldChunkIntoState } from "../game/gameInit";
import {
  DEFERRED_WORLD_CHUNK_IDS,
  INITIAL_WORLD,
  loadWorldChunk,
} from "../world/World";

describe("world chunk loading", () => {
  it("merges deferred chunks without broken room or door references", async () => {
    let state = createInitialState(INITIAL_WORLD);

    for (const chunkId of DEFERRED_WORLD_CHUNK_IDS) {
      const chunk = await loadWorldChunk(chunkId);

      expect(() => {
        state = mergeWorldChunkIntoState(state, chunkId, chunk);
      }).not.toThrow();
      expect(state.world.meta?.loadedChunkIds).toContain(chunkId);
    }
  });
});
