import { describe, expect, it } from "vitest";
import { deriveRoomCoordMaps } from "../game/helpers/coordHelpers";
import { createInitialState, mergeWorldChunkIntoState } from "../game/gameInit";
import { STAIRWELL } from "../world/maps/Stairwell";
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

  it("keeps the level two stairwell access door bidirectional", () => {
    const roomIds = new Set(["StairTwo", "LevelTwoStairAccess"]);
    const rooms = STAIRWELL.rooms.filter((room) =>
      roomIds.has(room.id),
    );
    const doors = STAIRWELL.doors.filter((door) => door.id === "StairDoorTwo");

    const maps = deriveRoomCoordMaps(rooms, doors, "StairTwo", {
      allowAnchorFallback: false,
    });

    expect(maps.coordByRoomId.LevelTwoStairAccess).toEqual({
      x: -1,
      y: 0,
      z: 0,
    });
  });
});
