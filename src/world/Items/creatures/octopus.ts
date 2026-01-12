import { getExitDestinationRoomId } from "@game/helpers/itemHelpers";
import { getPlayerRoomId } from "@game/selectors/roomSelectors";
import { TickContext } from "@game/types/context";
import { OctopusState } from "@game/types/gameTypes";
import { Item } from "@game/types/itemTypes";
import { Exit } from "@game/types/roomTypes";

export const AQUARIUM_ROOM_IDS = new Set<string>([
  "AqStart",
  "AqOpen1",
  "AqOpen2",
  "AqOpen3",
  "AqOpen4",
  "AqCross",
  "AqRock1",
  "AqRock2",
  "AqRock3",
  "AqRock4",
  "AqRock5",
  "AqRock6",
  "AqRock7",
  "AqGoal",
  "AqChannel1",
  "AqChannel2",
  "AqChannel3",
  "AqChannel4b",
  "AqChannel4",
  "AqChannel5",
]);

/**
 * IMPORTANT SEMANTICS (for this implementation):
 * - octo.maxSegments is interpreted as MAX TIPS (max tentacles), not "max occupied rooms".
 * - occupiedRoomIds only grows (no FIFO trimming). Retraction only occurs via retreatTicks
 *   if you later implement explicit retract behavior.
 */

const DEFAULT_OCTOPUS_STATE: OctopusState = {
  rootRoomId: "AqCross",
  occupiedRoomIds: ["AqCross"],
  tipRoomIds: ["AqCross"],
  maxSegments: 8, // default "8 tentacles"
  movesPerTick: 1,
  retreatTicks: 0,
  lastSeenPlayerRoomId: undefined,
  trailQueue: [], // no longer used for movement; kept for type compatibility
};

function normalizeOctopusState(maybe: any): OctopusState {
  const merged: OctopusState = {
    ...DEFAULT_OCTOPUS_STATE,
    ...(maybe ?? {}),
  };

  // Ensure arrays are actually arrays
  merged.occupiedRoomIds = Array.isArray(merged.occupiedRoomIds)
    ? merged.occupiedRoomIds
    : [merged.rootRoomId];

  merged.tipRoomIds = Array.isArray(merged.tipRoomIds) ? merged.tipRoomIds : [];
  merged.trailQueue = Array.isArray(merged.trailQueue) ? merged.trailQueue : [];

  // Clamp numeric fields
  // maxSegments = max tips (tentacles). Allow 1+, but realistically 2+ is better.
  const ms = Number(merged.maxSegments);
  merged.maxSegments = Number.isFinite(ms) ? Math.max(1, Math.floor(ms)) : 8;

  const mpt = Number(merged.movesPerTick);
  merged.movesPerTick = Number.isFinite(mpt) ? Math.max(1, Math.floor(mpt)) : 1;

  const rt = Number(merged.retreatTicks);
  merged.retreatTicks = Number.isFinite(rt) ? Math.max(0, Math.floor(rt)) : 0;

  // Invariants
  if (!merged.occupiedRoomIds.includes(merged.rootRoomId)) {
    merged.occupiedRoomIds = [merged.rootRoomId, ...merged.occupiedRoomIds];
  }

  if (merged.occupiedRoomIds.length === 0) {
    merged.occupiedRoomIds = [merged.rootRoomId];
  }

  if (merged.tipRoomIds.length === 0) {
    merged.tipRoomIds = [merged.rootRoomId];
  }

  // De-dupe tips and keep them inside the aquarium
  merged.tipRoomIds = Array.from(
    new Set(merged.tipRoomIds.filter((id) => AQUARIUM_ROOM_IDS.has(id)))
  );

  if (!merged.tipRoomIds.length) merged.tipRoomIds = [merged.rootRoomId];

  // De-dupe occupied and keep them inside the aquarium
  merged.occupiedRoomIds = Array.from(
    new Set(merged.occupiedRoomIds.filter((id) => AQUARIUM_ROOM_IDS.has(id)))
  );
  if (!merged.occupiedRoomIds.includes(merged.rootRoomId)) {
    merged.occupiedRoomIds.unshift(merged.rootRoomId);
  }

  return merged;
}

function updateOctopusState(
  state: any,
  updater: (prev: OctopusState) => OctopusState
): OctopusState {
  const prev = normalizeOctopusState(state.worldState.octopusState);
  const next = normalizeOctopusState(updater(prev));
  state.worldState.octopusState = next;
  return next;
}

function buildAdjacency(
  state: any,
  roomId: string,
  getRoomExits: (roomId: string) => Exit[]
): string[] {
  return getRoomExits(roomId)
    .map((e) => {
      const toRoomId = getExitDestinationRoomId(state, roomId, e);
      return { exit: e, toRoomId };
    })
    .filter((x): x is { exit: Exit; toRoomId: string } => !!x.toRoomId)
    .filter(({ exit }) => {
      if (!exit.doorId) return true;
      const doorState = state.worldState.doors[exit.doorId];
      return doorState?.isOpen === true;
    })
    .map(({ toRoomId }) => toRoomId)
    .filter((toRoomId) => AQUARIUM_ROOM_IDS.has(toRoomId));
}

function bfsDistancesFromTarget(
  state: any,
  targetRoomId: string,
  getRoomExits: (roomId: string) => Exit[]
): Map<string, number> {
  const dist = new Map<string, number>();
  const q: string[] = [];

  dist.set(targetRoomId, 0);
  q.push(targetRoomId);

  while (q.length) {
    const cur = q.shift()!;
    const curD = dist.get(cur)!;

    const neighbors = buildAdjacency(state, cur, getRoomExits);
    for (const n of neighbors) {
      if (!dist.has(n)) {
        dist.set(n, curD + 1);
        q.push(n);
      }
    }
  }

  return dist;
}

function chooseNextForTip(
  state: any,
  tipRoomId: string,
  dist: Map<string, number>,
  getRoomExits: (roomId: string) => Exit[],
  occupied: Set<string>
): string[] {
  const neighbors = buildAdjacency(state, tipRoomId, getRoomExits).filter(
    (n) => !occupied.has(n)
  );

  if (!neighbors.length) return [];

  const curD = dist.get(tipRoomId) ?? Number.POSITIVE_INFINITY;

  const decreasing = neighbors.filter((n) => (dist.get(n) ?? 9999) < curD);
  const same = neighbors.filter((n) => (dist.get(n) ?? 9999) === curD);

  const candidates = (
    decreasing.length ? decreasing : same.length ? same : neighbors
  ).sort((a, b) => {
    const da = dist.get(a) ?? 9999;
    const db = dist.get(b) ?? 9999;
    if (da !== db) return da - db;
    return a.localeCompare(b);
  });

  return candidates;
}

/**
 * Advance up to movesPerTick tentacle tips toward the player.
 * - octo.maxSegments is treated as max tips (tentacles).
 * - occupiedRoomIds generally grows (no FIFO trimming).
 * - At forks: can split (add a new tip) if we haven't hit max tips.
 */
function advanceTentaclesTowardPlayer(
  state: any,
  octo: OctopusState,
  playerRoomId: string,
  getRoomExits: (roomId: string) => Exit[]
): OctopusState {
  const dist = bfsDistancesFromTarget(state, playerRoomId, getRoomExits);

  const occupied = new Set(octo.occupiedRoomIds);
  let tips = [...octo.tipRoomIds];

  // Deterministic ordering (closest tips move first)
  tips.sort((a, b) => {
    const da = dist.get(a) ?? 9999;
    const db = dist.get(b) ?? 9999;
    if (da !== db) return da - db;
    return a.localeCompare(b);
  });

  const moves = Math.max(1, octo.movesPerTick | 0);
  const maxTips = Math.max(1, octo.maxSegments | 0);

  let movesDone = 0;

  for (let i = 0; i < tips.length && movesDone < moves; i++) {
    const tip = tips[i];

    const candidates = chooseNextForTip(
      state,
      tip,
      dist,
      getRoomExits,
      occupied
    );
    if (!candidates.length) continue;

    const first = candidates[0];

    // If tentacle would move into player => death (wire game over here later)
    if (first === playerRoomId) {
      console.log("AHHHHH! THE OCTOPUS GOT YOU!!!");
      return { ...octo, lastSeenPlayerRoomId: playerRoomId };
    }

    occupied.add(first);
    tips[i] = first;
    movesDone += 1;

    // Split at a fork if we still have tip budget.
    if (tips.length < maxTips && candidates.length > 1) {
      const second = candidates[1];
      if (second !== playerRoomId && !occupied.has(second)) {
        occupied.add(second);
        tips.push(second);
      }
    }
  }

  tips = Array.from(new Set(tips)).sort((a, b) => a.localeCompare(b));

  return {
    ...octo,
    occupiedRoomIds: Array.from(occupied),
    tipRoomIds: tips,
    lastSeenPlayerRoomId: playerRoomId,
    trailQueue: octo.trailQueue ?? [],
  };
}

function pruneDisconnectedFromRoot(
  state: any,
  octo: OctopusState,
  getRoomExits: (roomId: string) => Exit[]
) {
  const occupied = new Set(octo.occupiedRoomIds);

  const seen = new Set<string>();
  const q: string[] = [octo.rootRoomId];
  seen.add(octo.rootRoomId);

  while (q.length) {
    const cur = q.shift()!;
    const neighbors = buildAdjacency(state, cur, getRoomExits);
    for (const n of neighbors) {
      if (!occupied.has(n)) continue;
      if (seen.has(n)) continue;
      seen.add(n);
      q.push(n);
    }
  }

  octo.occupiedRoomIds = octo.occupiedRoomIds.filter((r) => seen.has(r));
  // trailQueue not used for movement; keep it consistent anyway
  octo.trailQueue = octo.trailQueue.filter((r) => seen.has(r));
  // Also ensure tips remain occupied (defensive)
  octo.tipRoomIds = octo.tipRoomIds.filter((t) => seen.has(t));
  if (!octo.tipRoomIds.length) octo.tipRoomIds = [octo.rootRoomId];
}

export const octopusItems: Item[] = [
  {
    id: "octopus",
    name: "massive octopus",
    itemCategory: "animate",
    meta: {
      isAlive: true,
      canMove: false,
      vision: "normal",
      hostility: "hostile",
      homeRegion: [],
      memories: [],
    },
    description:
      "It's a huge octopus, nestled near one corner of the aquarium.",
    location: "AqCross",
    vocab: ["octopus", "kraken"],
    itemClass: "solid",
    itemWeight: 8,
    itemSize: 2,
    overrides: {
      tick: ({ state, getRoomExits }: TickContext) => {
        const playerRoomId = getPlayerRoomId(state);
        if (!AQUARIUM_ROOM_IDS.has(playerRoomId)) return;

        const returned = updateOctopusState(state, (octo) => {
          console.log(
            "[octopus.tick] BEGIN playerRoomId:",
            playerRoomId,
            "occupiedLen:",
            octo.occupiedRoomIds.length,
            "tipsLen:",
            octo.tipRoomIds.length,
            "maxTips(maxSegments):",
            octo.maxSegments,
            "movesPerTick:",
            octo.movesPerTick,
            "retreatTicks:",
            octo.retreatTicks
          );

          if (octo.retreatTicks > 0) {
            const next = { ...octo, retreatTicks: octo.retreatTicks - 1 };
            console.log(
              "[octopus.tick] retreat tick; NEXT retreatTicks:",
              next.retreatTicks
            );
            return next;
          }

          // Core behavior: advance tips (no FIFO trimming)
          const next = advanceTentaclesTowardPlayer(
            state,
            octo,
            playerRoomId,
            getRoomExits
          );

          // Defensive: keep everything connected (optional, but helps if your map has one-way links later)
          const tmp = { ...next };
          pruneDisconnectedFromRoot(state, tmp, getRoomExits);

          console.log(
            "[octopus.tick] NEXT occupiedLen:",
            tmp.occupiedRoomIds.length,
            "tipsLen:",
            tmp.tipRoomIds.length,
            "tips:",
            tmp.tipRoomIds
          );

          return tmp;
        });

        console.log(
          "[octopus.tick] COMMITTED occupiedLen:",
          state.worldState.octopusState?.occupiedRoomIds?.length,
          "tipsLen:",
          state.worldState.octopusState?.tipRoomIds?.length
        );
        console.log(
          "[octopus.tick] RETURNED occupiedLen:",
          returned.occupiedRoomIds.length
        );
      },
    },
  } as const,
];
