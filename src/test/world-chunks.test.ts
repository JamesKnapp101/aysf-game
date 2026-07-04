import { describe, expect, it } from "vitest";
import { deriveRoomCoordMaps } from "../game/helpers/coordHelpers";
import { createInitialState, mergeWorldChunkIntoState } from "../game/gameInit";
import { STAIRWELL } from "../world/maps/Stairwell";
import { LEVEL_TWO } from "../world/maps/levelTwo/LevelTwo";
import {
  DEFERRED_WORLD_CHUNK_IDS,
  INITIAL_WORLD_CHUNK_IDS,
  INITIAL_WORLD,
  loadWorldChunk,
} from "../world/World";

describe("world chunk loading", () => {
  it("does not define duplicate item ids within a raw chunk", async () => {
    for (const chunkId of [
      ...INITIAL_WORLD_CHUNK_IDS,
      ...DEFERRED_WORLD_CHUNK_IDS,
    ]) {
      const chunk = await loadWorldChunk(chunkId);
      const seenItemIds = new Set<string>();
      const duplicates: string[] = [];

      for (const item of chunk.items) {
        if (seenItemIds.has(item.id)) {
          duplicates.push(item.id);
          continue;
        }

        seenItemIds.add(item.id);
      }

      expect(duplicates, `${chunkId} has duplicate item ids`).toEqual([]);
    }
  });

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

  it("keeps the level two medical lab connected through LabDoors", () => {
    const roomIds = new Set(["MedicalCorridorOne", "Lab"]);
    const rooms = LEVEL_TWO.rooms.filter((room) => roomIds.has(room.id));
    const doors = STAIRWELL.doors.filter((door) => door.id === "LabDoors");

    const maps = deriveRoomCoordMaps(rooms, doors, "MedicalCorridorOne", {
      allowAnchorFallback: false,
    });

    expect(maps.coordByRoomId.Lab).toEqual({ x: 0, y: -1, z: 0 });
    expect(maps.coordByRoomId.LabDoors).toBeUndefined();
  });
});
