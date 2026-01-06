import { DoorDefinition } from "@game/types/doorTypes";
import {
  Coord,
  CoordKey,
  CoordMap,
  Direction,
  Exit,
  ReverseCoordMap,
  Room,
} from "@game/types/roomTypes";

const DIR_DELTAS: Partial<Record<Direction, Coord>> = {
  north: { x: 0, y: 1, z: 0 },
  south: { x: 0, y: -1, z: 0 },
  east: { x: 1, y: 0, z: 0 },
  west: { x: -1, y: 0, z: 0 },
  up: { x: 0, y: 0, z: 1 },
  down: { x: 0, y: 0, z: -1 },
};

const OPPOSITE: Partial<Record<Direction, Direction>> = {
  north: "south",
  south: "north",
  east: "west",
  west: "east",
  up: "down",
  down: "up",
};

function add(a: Coord, b: Coord): Coord {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}
function same(a: Coord, b: Coord): boolean {
  return a.x === b.x && a.y === b.y && a.z === b.z;
}
function key(c: Coord): CoordKey {
  return `${c.x},${c.y},${c.z}`;
}

export function deriveRoomCoordMaps(
  rooms: Room[],
  doors: DoorDefinition[],
  anchorRoomId: string,
  opts?: {
    /** If true, verify that every traversed physical exit has a reverse exit back. */
    enforceBidirectional?: boolean;

    /** If true, only map rooms reachable from the anchor via physical exits. */
    ignoreIslands?: boolean;

    /**
     * Exclude these rooms entirely from coordinate mapping.
     * Exits into/out of excluded rooms are ignored during traversal.
     */
    excludeRoomIds?: string[];

    /**
     * Exclude rooms whose id matches any of these patterns.
     * Useful for whole subsystems like Stairwell / Elevator shafts.
     */
    excludeRoomIdPatterns?: RegExp[];

    /**
     * If the provided anchor is excluded or fails, fall back to a reasonable anchor.
     * Default: true
     */
    allowAnchorFallback?: boolean;
  }
): { coordByRoomId: CoordMap; roomIdByCoord: ReverseCoordMap } {
  const enforceBidirectional = opts?.enforceBidirectional ?? true;
  const ignoreIslands = opts?.ignoreIslands ?? true;
  const allowAnchorFallback = opts?.allowAnchorFallback ?? true;

  const excludedIds = new Set(opts?.excludeRoomIds ?? []);
  const excludedPatterns = opts?.excludeRoomIdPatterns ?? [];

  const isExcluded = (roomId: string): boolean => {
    if (excludedIds.has(roomId)) return true;
    for (const re of excludedPatterns) {
      if (re.test(roomId)) return true;
    }
    return false;
  };

  const roomsByIdAll = new Map(rooms.map((r) => [r.id, r]));
  const doorsById = new Map(doors.map((d) => [d.id, d]));

  const isPhysicalDir = (d: Direction): d is keyof typeof DIR_DELTAS =>
    DIR_DELTAS[d] !== undefined;

  const resolveTargetRoomId = (
    fromRoomId: string,
    ex: Exit
  ): string | undefined => {
    if (ex.toRoomId) return ex.toRoomId;
    if (!ex.doorId) return undefined;

    const doorDef = doorsById.get(ex.doorId);
    if (!doorDef) {
      throw new Error(
        `Room "${fromRoomId}" exit "${ex.direction}" references missing door "${ex.doorId}"`
      );
    }

    const { roomAId, roomBId } = doorDef.connects;
    if (fromRoomId === roomAId) return roomBId;
    if (fromRoomId === roomBId) return roomAId;

    throw new Error(
      `Door "${doorDef.id}" is not connected to room "${fromRoomId}" (connects "${roomAId}" <-> "${roomBId}")`
    );
  };

  // Build a view of rooms excluding the ignored set.
  const roomsById = new Map<string, Room>();
  for (const r of rooms) {
    if (isExcluded(r.id)) continue;
    roomsById.set(r.id, r);
  }

  const pickFallbackAnchor = (): string => {
    const corridor =
      rooms.find(
        (r) =>
          !isExcluded(r.id) &&
          /corridor|hall|hallway|main/i.test(r.id + " " + r.name)
      )?.id ?? rooms.find((r) => !isExcluded(r.id))?.id;

    if (!corridor) {
      throw new Error("deriveRoomCoordMaps: no eligible rooms to map");
    }
    return corridor;
  };

  const hasReverseExit = (
    fromId: string,
    toId: string,
    dir: Direction
  ): boolean => {
    const toRoom = roomsById.get(toId);
    const backDir = OPPOSITE[dir];
    if (!toRoom || !backDir) return false;

    return toRoom.exits.some((ex) => {
      if (ex.direction !== backDir) return false;
      const resolved = resolveTargetRoomId(toId, ex);
      return resolved === fromId;
    });
  };

  const buildFromAnchor = (startId: string) => {
    if (isExcluded(startId) || !roomsById.has(startId)) {
      throw new Error(
        `deriveRoomCoordMaps: anchorRoomId "${startId}" is excluded or not eligible for mapping`
      );
    }

    const coordByRoomIdM = new Map<string, Coord>();
    coordByRoomIdM.set(startId, { x: 0, y: 0, z: 0 });

    const queue: string[] = [startId];

    while (queue.length) {
      const roomId = queue.shift()!;
      const room = roomsById.get(roomId);
      if (!room) continue;
      const here = coordByRoomIdM.get(roomId)!;

      for (const ex of room.exits) {
        if (!isPhysicalDir(ex.direction)) continue;

        const toRoomId = resolveTargetRoomId(roomId, ex);
        if (!toRoomId) continue;

        // Ignore exits into excluded rooms
        if (isExcluded(toRoomId)) continue;

        // If the target room isn't present in the eligible set, either skip (ignoreIslands)
        // or throw (strict).
        if (!roomsById.has(toRoomId)) {
          if (ignoreIslands) continue;
          // It exists in the full list but was excluded, or is truly missing.
          const existsSomewhere = roomsByIdAll.has(toRoomId);
          throw new Error(
            existsSomewhere
              ? `Room "${roomId}" exit "${ex.direction}" points to excluded room "${toRoomId}"`
              : `Room "${roomId}" exit "${ex.direction}" points to missing room "${toRoomId}"`
          );
        }

        if (
          enforceBidirectional &&
          !hasReverseExit(roomId, toRoomId, ex.direction)
        ) {
          throw new Error(
            `Map not bidirectional: "${roomId}" --${ex.direction}--> "${toRoomId}" but reverse exit not found`
          );
        }

        const delta = DIR_DELTAS[ex.direction]!;
        const implied = add(here, delta);

        const existing = coordByRoomIdM.get(toRoomId);
        if (!existing) {
          coordByRoomIdM.set(toRoomId, implied);
          queue.push(toRoomId);
        } else if (!same(existing, implied)) {
          throw new Error(
            [
              `Coordinate contradiction for room "${toRoomId}"`,
              `Existing: (${existing.x},${existing.y},${existing.z})`,
              `Implied via ${roomId} --${ex.direction}--> ${toRoomId}: (${implied.x},${implied.y},${implied.z})`,
            ].join(" | ")
          );
        }
      }
    }

    const roomIdByCoordM = new Map<CoordKey, string>();
    for (const [roomId, c] of coordByRoomIdM.entries()) {
      const k = key(c);
      const prev = roomIdByCoordM.get(k);
      if (prev && prev !== roomId) {
        throw new Error(
          `Two rooms share derived coord (${k}): "${prev}" and "${roomId}"`
        );
      }
      roomIdByCoordM.set(k, roomId);
    }

    return { coordByRoomIdM, roomIdByCoordM };
  };

  // Try provided anchor first; fallback if needed/allowed.
  try {
    const { coordByRoomIdM, roomIdByCoordM } = buildFromAnchor(anchorRoomId);
    return {
      coordByRoomId: Object.fromEntries(coordByRoomIdM.entries()),
      roomIdByCoord: Object.fromEntries(
        roomIdByCoordM.entries()
      ) as ReverseCoordMap,
    };
  } catch (err) {
    if (!allowAnchorFallback) throw err;

    const fallback = pickFallbackAnchor();
    if (fallback === anchorRoomId) throw err;

    console.warn(
      `deriveRoomCoordMaps: anchor "${anchorRoomId}" failed; falling back to "${fallback}".`,
      err
    );

    const { coordByRoomIdM, roomIdByCoordM } = buildFromAnchor(fallback);
    return {
      coordByRoomId: Object.fromEntries(coordByRoomIdM.entries()),
      roomIdByCoord: Object.fromEntries(
        roomIdByCoordM.entries()
      ) as ReverseCoordMap,
    };
  }
}
