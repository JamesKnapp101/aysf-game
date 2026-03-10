import {
  getExitDestinationRoomId,
  getRoomExits as getRoomExitsForState,
} from "@game/helpers/itemHelpers";
import { setItemDoses } from "@game/rules/items";
import { getPlayerRoomId } from "@game/selectors/roomSelectors";
import type { TickContext } from "@game/types/context";
import type { OctopusArmState, OctopusState } from "@game/types/gameTypes";
import type { Item } from "@game/types/itemTypes";
import type { ParsedCommand } from "@game/types/parserTypes";
import type { Exit } from "@game/types/roomTypes";

export const AQUARIUM_BREATHER_ITEM_ID = "AqBreather";
export const AQUARIUM_BREATHER_CORPSE_ITEM_ID = "AqBreatherCorpse";
export const AQUARIUM_ELECTRIC_PROD_ITEM_ID = "AqElectricProd";
export const AQUARIUM_ELECTRIC_PROD_CORPSE_ITEM_ID = "AqProdCorpse";
export const AQUARIUM_GOAL_ITEM_ID = "AqControlNode";

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

export const AQUARIUM_UNDERWATER_ROOM_IDS = new Set(
  [...AQUARIUM_ROOM_IDS].filter((roomId) => roomId !== "AqStart"),
);

export const AQUARIUM_RETRY_RESPAWN_ROOM_ID = "AqStart";
export const OCTOPUS_ROOT_ROOM_ID = "AqRock7";
const AQUARIUM_RETURN_CHOKE_ARM_INDEX = 0;
const AQUARIUM_RETURN_CHOKE_ROOM_ID = "AqChannel5";
const AQUARIUM_RETURN_CHOKE_PATH = [
  OCTOPUS_ROOT_ROOM_ID,
  "AqRock6",
  "AqRock5",
  "AqRock4",
  "AqCross",
  "AqChannel1",
  "AqChannel2",
  "AqChannel3",
  "AqChannel4",
  AQUARIUM_RETURN_CHOKE_ROOM_ID,
] as const;

const AQUARIUM_ALERT_MESSAGE =
  "Farther out in the habitat, something massive stirs. A dark bulk shifts in the central crevice and long pale tentacles begin to uncoil into the water.";

const AQUARIUM_WARNING_MESSAGES: Record<number, string> = {
  1: "Somewhere nearby, stone rasps softly under a heavy, deliberate movement.",
  2: "A thick tentacle slides somewhere close by, stirring clouds of silt as it feels its way through the rocks.",
  3: "A searching tentacle tip slips into the edge of view nearby, pale suckers flexing as it tests the water around you.",
};

const AQUARIUM_FATAL_MESSAGE =
  "You move through the water and collide headlong with the probing end of a giant tentacle. It snaps around you at once, cinching tight and yanking you helplessly back through a storm of silt and ink-black water. The last thing you see is the creature's vast body unfolding in the dark before a hooked beak closes over you.";

const DROWNING_MESSAGE =
  "Your lungs seize in a blind, full-body panic. There is no air left to steal, only burning pressure and the slow collapse of everything that kept you moving. The water closes over your vision as the aquarium goes dark.";

function createDefaultArms(
  maxArms = 8,
  rootRoomId = OCTOPUS_ROOT_ROOM_ID,
): OctopusArmState[] {
  return Array.from({ length: Math.max(1, maxArms) }, (_, index) => ({
    id: `arm-${index + 1}`,
    path: [rootRoomId],
    stunnedTurns: 0,
  }));
}

function deriveThreatRoomIds(arms: OctopusArmState[], rootRoomId: string) {
  const occupied = new Set<string>([rootRoomId]);
  const tips = new Set<string>();

  for (const arm of arms) {
    for (const roomId of arm.path) {
      if (AQUARIUM_UNDERWATER_ROOM_IDS.has(roomId)) {
        occupied.add(roomId);
      }
    }

    const tipRoomId = arm.path[arm.path.length - 1] ?? rootRoomId;
    if (AQUARIUM_UNDERWATER_ROOM_IDS.has(tipRoomId)) {
      tips.add(tipRoomId);
    }
  }

  if (!tips.size) tips.add(rootRoomId);

  return {
    occupiedRoomIds: Array.from(occupied),
    tipRoomIds: Array.from(tips),
  };
}

const DEFAULT_OCTOPUS_STATE: OctopusState = {
  rootRoomId: OCTOPUS_ROOT_ROOM_ID,
  arms: createDefaultArms(),
  occupiedRoomIds: [OCTOPUS_ROOT_ROOM_ID],
  tipRoomIds: [OCTOPUS_ROOT_ROOM_ID],
  maxSegments: 8,
  movesPerTick: 1,
  moveEveryTurns: 2,
  turnsUntilMove: 0,
  retreatTicks: 0,
  lastSeenPlayerRoomId: undefined,
  trailQueue: [],
  isAware: false,
  returnChokeActive: false,
  lastWarningLevel: 0,
};

export function isAquariumRoom(roomId: string): boolean {
  return AQUARIUM_ROOM_IDS.has(roomId);
}

export function isAquariumUnderwaterRoom(roomId: string): boolean {
  return AQUARIUM_UNDERWATER_ROOM_IDS.has(roomId);
}

export function createInitialOctopusState(): OctopusState {
  const arms = createDefaultArms();
  const threatRooms = deriveThreatRoomIds(arms, OCTOPUS_ROOT_ROOM_ID);

  return {
    ...DEFAULT_OCTOPUS_STATE,
    arms,
    ...threatRooms,
  };
}

function normalizeOctopusState(
  maybe: Partial<OctopusState> | undefined,
): OctopusState {
  const merged: OctopusState = {
    ...DEFAULT_OCTOPUS_STATE,
    ...(maybe ?? {}),
    arms: [],
    occupiedRoomIds: [],
    tipRoomIds: [],
  };

  const maxSegments = Number(merged.maxSegments);
  merged.maxSegments = Number.isFinite(maxSegments)
    ? Math.max(1, Math.floor(maxSegments))
    : 8;

  const movesPerTick = Number(merged.movesPerTick);
  merged.movesPerTick = Number.isFinite(movesPerTick)
    ? Math.max(1, Math.floor(movesPerTick))
    : 1;

  const moveEveryTurns = Number(merged.moveEveryTurns);
  merged.moveEveryTurns = Number.isFinite(moveEveryTurns)
    ? Math.max(1, Math.floor(moveEveryTurns))
    : 2;

  const turnsUntilMove = Number(merged.turnsUntilMove);
  merged.turnsUntilMove = Number.isFinite(turnsUntilMove)
    ? Math.max(0, Math.floor(turnsUntilMove))
    : 0;

  const retreatTicks = Number(merged.retreatTicks);
  merged.retreatTicks = Number.isFinite(retreatTicks)
    ? Math.max(0, Math.floor(retreatTicks))
    : 0;

  const rawArms = Array.isArray(maybe?.arms)
    ? maybe?.arms
    : createDefaultArms(merged.maxSegments, merged.rootRoomId);

  const normalizedArms = rawArms
    .map((arm, index) => {
      const rawPath = Array.isArray(arm?.path) ? arm.path : [merged.rootRoomId];
      const filteredPath = rawPath.filter((roomId) =>
        AQUARIUM_UNDERWATER_ROOM_IDS.has(roomId),
      );
      const path =
        filteredPath.length > 0 && filteredPath[0] === merged.rootRoomId
          ? filteredPath
          : [
              merged.rootRoomId,
              ...filteredPath.filter((roomId) => roomId !== merged.rootRoomId),
            ];

      return {
        id: arm?.id ?? `arm-${index + 1}`,
        path: path.length > 0 ? path : [merged.rootRoomId],
        stunnedTurns: Math.max(0, Math.floor(Number(arm?.stunnedTurns) || 0)),
      };
    })
    .slice(0, merged.maxSegments);

  while (normalizedArms.length < merged.maxSegments) {
    normalizedArms.push({
      id: `arm-${normalizedArms.length + 1}`,
      path: [merged.rootRoomId],
      stunnedTurns: 0,
    });
  }

  const threatRooms = deriveThreatRoomIds(normalizedArms, merged.rootRoomId);

  return {
    ...merged,
    arms: normalizedArms,
    occupiedRoomIds: threatRooms.occupiedRoomIds,
    tipRoomIds: threatRooms.tipRoomIds,
    trailQueue: Array.isArray(maybe?.trailQueue) ? [...maybe!.trailQueue] : [],
    isAware: maybe?.isAware === true,
    returnChokeActive: maybe?.returnChokeActive === true,
    lastWarningLevel: Math.max(
      0,
      Math.floor(Number(maybe?.lastWarningLevel) || 0),
    ),
  };
}

function withDerivedThreatRooms(octo: OctopusState): OctopusState {
  const normalized = normalizeOctopusState(octo);
  const threatRooms = deriveThreatRoomIds(
    normalized.arms,
    normalized.rootRoomId,
  );

  return {
    ...normalized,
    occupiedRoomIds: threatRooms.occupiedRoomIds,
    tipRoomIds: threatRooms.tipRoomIds,
  };
}

export function resetAquariumEncounter(state: any): any {
  const nextItemRoomId = { ...state.itemState.itemRoomId };
  if ("octopus" in nextItemRoomId) {
    nextItemRoomId.octopus = OCTOPUS_ROOT_ROOM_ID;
  }

  return {
    ...state,
    player: {
      ...state.player,
      vitals: {
        ...state.player.vitals,
        health: 100,
        oxygen: 100,
      },
    },
    worldState: {
      ...state.worldState,
      octopusState: createInitialOctopusState(),
    },
    itemState: {
      ...state.itemState,
      itemRoomId: nextItemRoomId,
    },
  };
}

export function getAquariumMoveGuard(
  state: any,
  destinationRoomId: string | undefined,
):
  | {
      kind: "block";
      message: string;
    }
  | {
      kind: "death";
      deathMessage: string;
      deathCause: string;
    }
  | undefined {
  if (!destinationRoomId) return undefined;
  if (!isAquariumRoom(getPlayerRoomId(state))) return undefined;

  const octo = normalizeOctopusState(state.worldState.octopusState);
  if (!octo.occupiedRoomIds.includes(destinationRoomId)) return undefined;

  if (
    octo.returnChokeActive &&
    destinationRoomId === AQUARIUM_RETURN_CHOKE_ROOM_ID
  ) {
    return {
      kind: "block",
      message:
        "A tentacle has knotted itself across the return run, suckers braced hard against both walls. You'd need to drive it back before you can get through.",
    };
  }

  if (octo.tipRoomIds.includes(destinationRoomId)) {
    return {
      kind: "death",
      deathMessage: AQUARIUM_FATAL_MESSAGE,
      deathCause: "aquarium octopus",
    };
  }

  return {
    kind: "block",
    message:
      "A giant tentacle fills that passage, its pale suckers gripping the stone as it slowly flexes in the water. You're not getting past it.",
  };
}

function buildAdjacency(
  state: any,
  roomId: string,
  getRoomExits: (roomId: string) => Exit[],
): string[] {
  return getRoomExits(roomId)
    .map((exit) => {
      const toRoomId = getExitDestinationRoomId(state, roomId, exit);
      return { exit, toRoomId };
    })
    .filter((entry): entry is { exit: Exit; toRoomId: string } =>
      Boolean(entry.toRoomId),
    )
    .filter(({ exit }) => {
      if (!exit.doorId) return true;
      const doorState = state.worldState.doors[exit.doorId];
      return doorState?.isOpen === true;
    })
    .map(({ toRoomId }) => toRoomId)
    .filter((toRoomId) => AQUARIUM_UNDERWATER_ROOM_IDS.has(toRoomId));
}

function bfsDistancesFromTarget(
  state: any,
  targetRoomId: string,
  getRoomExits: (roomId: string) => Exit[],
): Map<string, number> {
  const dist = new Map<string, number>();
  const queue: string[] = [targetRoomId];
  dist.set(targetRoomId, 0);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentDistance = dist.get(current)!;

    for (const neighbor of buildAdjacency(state, current, getRoomExits)) {
      if (dist.has(neighbor)) continue;
      dist.set(neighbor, currentDistance + 1);
      queue.push(neighbor);
    }
  }

  return dist;
}

function sortCandidateRooms(
  candidates: string[],
  dist: Map<string, number>,
): string[] {
  return [...candidates].sort((a, b) => {
    const aDistance = dist.get(a) ?? Number.POSITIVE_INFINITY;
    const bDistance = dist.get(b) ?? Number.POSITIVE_INFINITY;
    if (aDistance !== bDistance) return aDistance - bDistance;
    return a.localeCompare(b);
  });
}

function allocateTentaclesAcrossCandidates(
  armCount: number,
  candidateCount: number,
): number[] {
  if (candidateCount <= 0) return [];

  const base = Math.floor(armCount / candidateCount);
  const remainder = armCount % candidateCount;

  return Array.from(
    { length: candidateCount },
    (_, index) => base + (index < remainder ? 1 : 0),
  );
}

function advanceTentaclesTowardPlayer(
  state: any,
  octo: OctopusState,
  playerRoomId: string,
  getRoomExits: (roomId: string) => Exit[],
): OctopusState {
  const dist = bfsDistancesFromTarget(state, playerRoomId, getRoomExits);
  let arms = octo.arms.map((arm) => ({
    ...arm,
    path: [...arm.path],
  }));

  for (let step = 0; step < octo.movesPerTick; step += 1) {
    const groupedArmIndexes = new Map<string, number[]>();

    arms.forEach((arm, index) => {
      const key = `${arm.path.join(">")}#${arm.stunnedTurns}`;
      const group = groupedArmIndexes.get(key) ?? [];
      group.push(index);
      groupedArmIndexes.set(key, group);
    });

    const nextArms = arms.map((arm) => ({
      ...arm,
      path: [...arm.path],
    }));

    for (const indexes of groupedArmIndexes.values()) {
      const representative = arms[indexes[0]];
      if (representative.stunnedTurns > 0) {
        for (const index of indexes) {
          nextArms[index] = {
            ...nextArms[index],
            stunnedTurns: Math.max(0, arms[index].stunnedTurns - 1),
          };
        }
        continue;
      }

      const tipRoomId = representative.path[representative.path.length - 1];
      const allCandidates = sortCandidateRooms(
        buildAdjacency(state, tipRoomId, getRoomExits).filter(
          (neighbor) => !representative.path.includes(neighbor),
        ),
        dist,
      );

      const currentDistance = dist.get(tipRoomId) ?? Number.POSITIVE_INFINITY;
      const decreasingCandidates = allCandidates.filter(
        (candidateRoomId) =>
          (dist.get(candidateRoomId) ?? Number.POSITIVE_INFINITY) <
          currentDistance,
      );
      const sameDistanceCandidates = allCandidates.filter(
        (candidateRoomId) =>
          (dist.get(candidateRoomId) ?? Number.POSITIVE_INFINITY) ===
          currentDistance,
      );

      const candidates =
        decreasingCandidates.length > 0
          ? decreasingCandidates
          : sameDistanceCandidates.length > 0
            ? sameDistanceCandidates
            : allCandidates;

      if (candidates.length === 0) continue;

      const allocations = allocateTentaclesAcrossCandidates(
        indexes.length,
        candidates.length,
      );

      let cursor = 0;
      for (
        let candidateIndex = 0;
        candidateIndex < candidates.length;
        candidateIndex += 1
      ) {
        const nextRoomId = candidates[candidateIndex];
        const tentaclesForRoom = allocations[candidateIndex] ?? 0;

        for (let count = 0; count < tentaclesForRoom; count += 1) {
          const armIndex = indexes[cursor];
          cursor += 1;
          nextArms[armIndex] = {
            ...nextArms[armIndex],
            path: [...arms[armIndex].path, nextRoomId],
            stunnedTurns: 0,
          };
        }
      }
    }

    arms = nextArms;
  }

  return withDerivedThreatRooms({
    ...octo,
    arms,
    lastSeenPlayerRoomId: playerRoomId,
  });
}

function getNearestTipDistance(
  state: any,
  octo: OctopusState,
  roomId: string,
  getRoomExits: (roomId: string) => Exit[],
): number {
  const dist = bfsDistancesFromTarget(state, roomId, getRoomExits);
  let nearest = Number.POSITIVE_INFINITY;

  for (const tipRoomId of octo.tipRoomIds) {
    const distance = dist.get(tipRoomId);
    if (distance == null) continue;
    nearest = Math.min(nearest, distance);
  }

  return nearest;
}

function getWarningLevel(
  state: any,
  octo: OctopusState,
  roomId: string,
  getRoomExits: (roomId: string) => Exit[],
): number {
  if (!isAquariumRoom(roomId)) return 0;

  const nearestTipDistance = getNearestTipDistance(
    state,
    octo,
    roomId,
    getRoomExits,
  );

  if (nearestTipDistance <= 1) return 3;
  if (nearestTipDistance <= 2) return 2;
  if (nearestTipDistance <= 4) return 1;
  return 0;
}

function getAdjacentThreatRoomIds(state: any, roomId: string): string[] {
  return getRoomExitsForState(state, roomId)
    .map((exit) => getExitDestinationRoomId(state, roomId, exit))
    .filter((candidate): candidate is string => Boolean(candidate))
    .filter((candidateRoomId) => isAquariumUnderwaterRoom(candidateRoomId));
}

function formatDirectionList(directions: string[]): string {
  if (directions.length <= 1) return directions[0] ?? "nearby water";
  if (directions.length === 2) return `${directions[0]} and ${directions[1]}`;
  return `${directions.slice(0, -1).join(", ")}, and ${
    directions[directions.length - 1]
  }`;
}

function getSourceDirectionIntoRoom(
  state: any,
  roomId: string,
  sourceRoomId: string | undefined,
): string | undefined {
  if (!sourceRoomId) return undefined;

  const matchingExit = getRoomExitsForState(state, roomId).find((exit) => {
    const toRoomId = getExitDestinationRoomId(state, roomId, exit);
    return toRoomId === sourceRoomId;
  });

  return matchingExit?.direction;
}

function getIncomingTipWarning(
  state: any,
  octo: OctopusState,
  roomId: string,
): string | undefined {
  const incomingDirections = Array.from(
    new Set(
      octo.arms
        .filter((arm) => arm.path[arm.path.length - 1] === roomId)
        .map((arm) =>
          getSourceDirectionIntoRoom(state, roomId, arm.path[arm.path.length - 2]),
        )
        .filter((direction): direction is string => Boolean(direction)),
    ),
  ).sort();

  if (incomingDirections.length === 0) {
    return "The water convulses without warning as a tentacle tip lunges straight into your space.";
  }

  if (incomingDirections.length === 1) {
    return `A searching tentacle tip lashes in from the ${incomingDirections[0]}, pale suckers spreading as it finds you.`;
  }

  return `Searching tentacle tips surge in from the ${formatDirectionList(
    incomingDirections,
  )}, hemming you in before you can get clear.`;
}

function getTentacleAdvanceCadence(octo: OctopusState): {
  octo: OctopusState;
  shouldAdvanceTentacles: boolean;
} {
  if (octo.moveEveryTurns <= 1) {
    return {
      octo: {
        ...octo,
        turnsUntilMove: 0,
      },
      shouldAdvanceTentacles: true,
    };
  }

  if (octo.turnsUntilMove > 0) {
    return {
      octo: {
        ...octo,
        turnsUntilMove: octo.turnsUntilMove - 1,
      },
      shouldAdvanceTentacles: false,
    };
  }

  return {
    octo: {
      ...octo,
      turnsUntilMove: octo.moveEveryTurns - 1,
    },
    shouldAdvanceTentacles: true,
  };
}

export function matchesAquariumThreatNoun(noun: string): boolean {
  const normalized = noun.trim().toLowerCase();
  return [
    "octopus",
    "giant octopus",
    "massive octopus",
    "tentacle",
    "tentacles",
    "arm",
    "arms",
  ].includes(normalized);
}

function getAquariumExamineText(state: any, roomId: string): string {
  const octo = normalizeOctopusState(state.worldState.octopusState);
  const adjacentRoomIds = getAdjacentThreatRoomIds(state, roomId);
  const adjacentTipCount = adjacentRoomIds.filter((id) =>
    octo.tipRoomIds.includes(id),
  ).length;
  const adjacentBodyCount = adjacentRoomIds.filter(
    (id) => octo.occupiedRoomIds.includes(id) && !octo.tipRoomIds.includes(id),
  ).length;

  if (roomId === OCTOPUS_ROOT_ROOM_ID) {
    return "The creature is wedged deep into the crossover crevice, its mantle swelling and relaxing with grotesque calm while eight long arms feed out through the surrounding passages. Up close, the beak tucked beneath it looks less like anatomy and more like a machine built to remove you from the story.";
  }

  if (adjacentTipCount > 0) {
    return adjacentTipCount === 1
      ? "The visible tip of the tentacle moves with unnerving precision, as if tasting the water for you. Pale suckers flex in waves along the underside while the arm behind it disappears into the murk."
      : "Several tentacle tips move through the adjoining passages, their suckers opening and closing in patient, synchronized pulses. They are not thrashing blindly; they are searching.";
  }

  if (adjacentBodyCount > 0) {
    return adjacentBodyCount === 1
      ? "A thick length of the octopus's arm fills the nearby passage, every few seconds tightening and releasing against the stone as it inches onward."
      : "The nearby passages are threaded with thick octopus arms, their skin sliding over the rock in slow, muscular ripples that make the whole habitat feel too small.";
  }

  return "You cannot see the whole creature from here, only the evidence of it: drifting silt, shifting shadows, and the occasional impossible movement somewhere beyond the next stone bend.";
}

export function getAquariumThreatDescription(
  state: any,
  roomId: string,
): string {
  if (!isAquariumRoom(roomId)) return "";

  const octo = normalizeOctopusState(state.worldState.octopusState);
  const adjacentRoomIds = getAdjacentThreatRoomIds(state, roomId);
  const adjacentTipCount = adjacentRoomIds.filter((id) =>
    octo.tipRoomIds.includes(id),
  ).length;
  const adjacentBodyCount = adjacentRoomIds.filter(
    (id) => octo.occupiedRoomIds.includes(id) && !octo.tipRoomIds.includes(id),
  ).length;

  if (roomId === "AqStart" && octo.isAware) {
    if (adjacentTipCount > 0) {
      return "Beyond the flooded threshold, a tentacle tip drifts in and out of view, tracing slow circles through the water just outside the lock.";
    }

    if (adjacentBodyCount > 0) {
      return "Something thick moves just beyond the threshold, briefly blotting out the water before sliding away again.";
    }

    return "Through the viewing panel and open threshold, the water beyond keeps betraying slow, deliberate movement deeper in the habitat.";
  }

  if (roomId === OCTOPUS_ROOT_ROOM_ID) {
    return "Jammed into the crevice beside you is the octopus itself, a massive dark body pulsing patiently while its arms feed outward through every passage the habitat offers.";
  }

  if (octo.returnChokeActive && roomId === "AqGoal") {
    return "To the east, a tentacle has jammed itself across the return run, pale suckers clamped to both walls as it seals the fastest way back to the lock.";
  }

  if (adjacentRoomIds.includes(OCTOPUS_ROOT_ROOM_ID)) {
    return "Through the nearby crevice you can glimpse the octopus's main body wedged among the rocks, a dark mound of flesh from which the surrounding tentacles keep unspooling.";
  }

  if (adjacentTipCount > 0) {
    return adjacentTipCount === 1
      ? "A searching tentacle tip slips in and out of the adjoining water, the pale suckers on its underside flexing as it feels along the stone."
      : "Searching tentacle tips prowl the adjoining passages, sliding through the murk in patient, synchronized arcs.";
  }

  if (adjacentBodyCount > 0) {
    return adjacentBodyCount === 1
      ? "One nearby passage is clogged by the thick length of an octopus arm, its suckers gripping and releasing against the rock in slow sequence."
      : "Several nearby passages are threaded with the thick lengths of octopus arms, their pale undersides shifting over the stone like living machinery.";
  }

  if (octo.isAware) {
    const warningLevel = getWarningLevel(
      state,
      octo,
      roomId,
      (candidateRoomId) => getRoomExitsForState(state, candidateRoomId),
    );

    if (warningLevel >= 2) {
      return "Nearby, drifting silt keeps pulsing around a slow search pattern, as if a tentacle is feeling along the stone just beyond the next bend.";
    }

    return "Farther out in the habitat, the water keeps betraying slow, purposeful movement.";
  }

  return "";
}

function getRetreatableArmIndex(
  state: any,
  octo: OctopusState,
  roomId: string,
) {
  const adjacentRoomIds = new Set(getAdjacentThreatRoomIds(state, roomId));
  const returnChokeArm = octo.arms[AQUARIUM_RETURN_CHOKE_ARM_INDEX];

  if (
    octo.returnChokeActive &&
    returnChokeArm?.path.some((pathRoomId) => adjacentRoomIds.has(pathRoomId))
  ) {
    return AQUARIUM_RETURN_CHOKE_ARM_INDEX;
  }

  const tipCandidates = octo.arms
    .map((arm, index) => ({ arm, index }))
    .filter(({ arm }) => adjacentRoomIds.has(arm.path[arm.path.length - 1]))
    .sort((a, b) => {
      const aTip = a.arm.path[a.arm.path.length - 1] ?? "";
      const bTip = b.arm.path[b.arm.path.length - 1] ?? "";
      if (aTip !== bTip) return aTip.localeCompare(bTip);
      return a.arm.id.localeCompare(b.arm.id);
    });

  if (tipCandidates.length > 0) {
    return tipCandidates[0].index;
  }

  const bodyCandidates = octo.arms
    .map((arm, index) => ({ arm, index }))
    .filter(({ arm }) =>
      arm.path.some(
        (pathRoomId) =>
          adjacentRoomIds.has(pathRoomId) &&
          pathRoomId !== OCTOPUS_ROOT_ROOM_ID,
      ),
    )
    .sort((a, b) => {
      const aTip = a.arm.path[a.arm.path.length - 1] ?? "";
      const bTip = b.arm.path[b.arm.path.length - 1] ?? "";
      if (aTip !== bTip) return aTip.localeCompare(bTip);
      return a.arm.id.localeCompare(b.arm.id);
    });

  return bodyCandidates[0]?.index;
}

function retreatArm(octo: OctopusState, armIndex: number): OctopusState {
  const wasReturnChokeArm =
    octo.returnChokeActive &&
    octo.arms[armIndex]?.path.includes(AQUARIUM_RETURN_CHOKE_ROOM_ID);
  const arms = octo.arms.map((arm, index) =>
    index === armIndex
      ? {
          ...arm,
          path: [octo.rootRoomId],
          stunnedTurns: 1,
        }
      : arm,
  );

  return withDerivedThreatRooms({
    ...octo,
    arms,
    returnChokeActive: wasReturnChokeArm ? false : octo.returnChokeActive,
  });
}

export function triggerAquariumReturnChoke(state: any): any {
  const octo = normalizeOctopusState(state.worldState.octopusState);
  if (octo.returnChokeActive) return state;

  const nextArms = octo.arms.map((arm, index) =>
    index === AQUARIUM_RETURN_CHOKE_ARM_INDEX
      ? {
          ...arm,
          path: [...AQUARIUM_RETURN_CHOKE_PATH],
          stunnedTurns: 0,
        }
      : arm,
  );

  return {
    ...state,
    worldState: {
      ...state.worldState,
      octopusState: withDerivedThreatRooms({
        ...octo,
        arms: nextArms,
        isAware: true,
        returnChokeActive: true,
      }),
    },
  };
}

function useElectricProdOnTentacle({
  state,
  item,
  cmd,
}: {
  state: any;
  item: Item;
  cmd?: ParsedCommand;
}): { state: any; message: string } {
  const target =
    cmd?.type === "action" ? cmd.indirect?.trim().toLowerCase() : "";
  if (target && !matchesAquariumThreatNoun(target)) {
    return {
      state,
      message: "The prod doesn't seem especially useful for that.",
    };
  }

  const remainingCharges = item.doses ?? 0;
  if (remainingCharges <= 0) {
    return {
      state,
      message:
        "You thumb the prod's switch, but the charge indicator stays dark. Whatever punch it once had is gone.",
    };
  }

  if (!isAquariumRoom(state.player.roomId)) {
    return {
      state,
      message:
        "You crackle the prod experimentally, but there isn't anything nearby worth zapping.",
    };
  }

  const octo = normalizeOctopusState(state.worldState.octopusState);
  const retreatArmIndex = getRetreatableArmIndex(
    state,
    octo,
    state.player.roomId,
  );
  if (retreatArmIndex == null) {
    return {
      state,
      message:
        "You wave the prod through the water, but there isn't a tentacle close enough to catch with it.",
    };
  }

  const nextOcto = retreatArm(octo, retreatArmIndex);
  let nextState = {
    ...state,
    worldState: {
      ...state.worldState,
      octopusState: nextOcto,
    },
  };

  nextState = setItemDoses(
    nextState,
    item.id,
    Math.max(0, remainingCharges - 1),
  );

  const chargesLeft = Math.max(0, remainingCharges - 1);
  const chargeTail =
    chargesLeft === 0
      ? " The prod's indicator gutters out; that was its last charge."
      : ` The indicator drops to ${chargesLeft} charge${chargesLeft === 1 ? "" : "s"}.`;

  return {
    state: nextState,
    message:
      "You jab the prod into the tentacle and dump a violent burst of current into it. The shocked limb convulses hard enough to shake silt loose from the stone, then recoils all the way back toward the central crevice." +
      chargeTail,
  };
}

export const octopusItems: Item[] = [
  {
    id: "octopus",
    name: "massive octopus",
    itemCategory: "scenery",
    meta: {
      isAlive: true,
      canMove: false,
      vision: "normal",
      hostility: "aggressive",
      homeRegion: [...AQUARIUM_UNDERWATER_ROOM_IDS],
      memories: [],
      sceneryDescriptionOrder: 99,
    },
    description:
      "Whatever is moving through the aquarium is much, much too large to belong in a decorative habitat.",
    location: OCTOPUS_ROOT_ROOM_ID,
    vocab: ["octopus", "tentacle", "tentacles", "arm", "arms"],
    itemClass: "solid",
    itemWeight: 800,
    itemSize: 200,
    describe: (state) => getAquariumExamineText(state, state.player.roomId),
    overrides: {
      tick: ({
        state,
        emit,
        getRoomExits,
        triggerPlayerDeath,
      }: TickContext & {
        triggerPlayerDeath?: (deathMessage: string, cause: string) => void;
      }) => {
        const playerRoomId = getPlayerRoomId(state);
        if (!isAquariumRoom(playerRoomId)) return;
        if (!isAquariumUnderwaterRoom(playerRoomId)) return;

        const previous = normalizeOctopusState(state.worldState.octopusState);
        const warningLines: string[] = [];
        let nextOcto = previous;
        let shouldAdvanceTentacles = false;

        if (!previous.isAware) {
          nextOcto = {
            ...nextOcto,
            isAware: true,
          };
          warningLines.push(AQUARIUM_ALERT_MESSAGE);
        } else {
          const cadence = getTentacleAdvanceCadence(nextOcto);
          nextOcto = cadence.octo;
          shouldAdvanceTentacles = cadence.shouldAdvanceTentacles;
        }

        if (shouldAdvanceTentacles) {
          nextOcto = advanceTentaclesTowardPlayer(
            state,
            nextOcto,
            playerRoomId,
            getRoomExits,
          );
        }

        const nextWarningLevel = getWarningLevel(
          state,
          nextOcto,
          playerRoomId,
          getRoomExits,
        );

        const caughtByTipThisTurn =
          nextOcto.tipRoomIds.includes(playerRoomId) &&
          isAquariumUnderwaterRoom(playerRoomId);

        if (
          nextWarningLevel > nextOcto.lastWarningLevel &&
          !(caughtByTipThisTurn && nextWarningLevel === 3)
        ) {
          warningLines.push(AQUARIUM_WARNING_MESSAGES[nextWarningLevel]);
        }

        if (caughtByTipThisTurn) {
          warningLines.push(getIncomingTipWarning(state, nextOcto, playerRoomId) ?? "");
        }

        nextOcto = {
          ...nextOcto,
          lastWarningLevel: nextWarningLevel,
        };

        const nextState = {
          ...state,
          worldState: {
            ...state.worldState,
            octopusState: nextOcto,
          },
        };

        for (const line of warningLines.filter(Boolean)) {
          emit({ kind: "log", text: line });
        }

        if (
          triggerPlayerDeath &&
          caughtByTipThisTurn
        ) {
          triggerPlayerDeath(AQUARIUM_FATAL_MESSAGE, "aquarium octopus");
          return;
        }

        return nextState;
      },
    },
  },
  {
    id: AQUARIUM_BREATHER_CORPSE_ITEM_ID,
    name: "dead diver",
    description:
      "The corpse floating here is you, or near enough to count. The face is swollen and pale from long immersion but still unmistakably yours, and the body is strapped into a maintenance harness with a compact breather still secured over the mouth and nose.",
    sceneryDescription:
      "Pinned against the rocks is a dead diver whose face looks disturbingly like your own. A compact breather is still strapped to the corpse's face.",
    location: "AqRock2",
    vocab: ["dead diver", "corpse", "body", "self", "other self", "diver"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 70,
    itemSize: 7,
    isSearchable: true,
    overrides: {
      take: "You're not carrying your own corpse around.",
    },
  },
  {
    id: AQUARIUM_ELECTRIC_PROD_CORPSE_ITEM_ID,
    name: "dead technician",
    description:
      "Another dead version of you is wedged in the stone here, one arm still looped through a snapped tool lanyard. Clutched in the corpse's stiff hand is the handle of an electric prod built for discouraging large aquatic animals.",
    sceneryDescription:
      "A second corpse with your face is jammed into the dead-end here, one hand locked around what looks like an electric prod.",
    location: "AqChannel4b",
    vocab: [
      "dead technician",
      "corpse",
      "body",
      "self",
      "other self",
      "technician",
    ],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 70,
    itemSize: 7,
    isSearchable: true,
    overrides: {
      take: "That would be unpleasant, impractical, and still not helpful.",
    },
  },
  {
    id: AQUARIUM_BREATHER_ITEM_ID,
    name: "breather",
    description:
      "A compact emergency breather with a clear mouth-and-nose seal, short regulator body, and elastic strap designed to lock it tight against the face.",
    location: AQUARIUM_BREATHER_CORPSE_ITEM_ID,
    vocab: ["breather", "mask", "rebreather"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isWearable: true,
    clothingSlot: "face",
    overrides: {
      wear: "You cinch the breather over your face. It seals with a soft tug and immediately begins feeding you clean air.",
      remove:
        "You peel the breather away from your face. The water suddenly feels much less forgiving.",
    },
    meta: {
      clothing: {
        wearMessage:
          "You cinch the breather over your face. It seals with a soft tug and immediately begins feeding you clean air.",
        removeMessage:
          "You peel the breather away from your face. The water suddenly feels much less forgiving.",
      },
    },
  },
  {
    id: AQUARIUM_ELECTRIC_PROD_ITEM_ID,
    name: "electric prod",
    description:
      "A compact shock prod with a thick insulated grip, a short forked head, and a charge indicator set into the handle.",
    location: "AqChannel4b",
    vocab: ["electric prod", "prod", "shock prod"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 2,
    isUseable: true,
    doses: 2,
    overrides: {
      use: useElectricProdOnTentacle,
    },
  },
  {
    id: AQUARIUM_GOAL_ITEM_ID,
    name: "control node",
    description:
      "A sealed aquarium control node, the sort of hardened module built to survive water, pressure, and apparently the collapse of everything around it.",
    initialDescription:
      "Set into the corroded pedestal is a sealed control node, still stubbornly intact after everything else in the grotto has rotted around it.",
    location: "AqGoal",
    vocab: ["control node", "node", "module"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 2,
    itemSize: 2,
  },
  {
    id: "VetAquaPad",
    name: "aqua disk",
    description:
      "A slightly raised disk of glassy material set into the floor and ringed with polished metal. Its surface glows with a soft aqua sheen.",
    sceneryDescription:
      "Set into the floor near the center of the room is a slightly raised aqua disk, its glossy surface emitting a low, watery glow.",
    location: "VeterinaryCenter",
    vocab: ["aqua disk", "disk", "pad", "teleport pad"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 20,
    itemSize: 5,
    isSurface: true,
    meta: {
      sceneryDescriptionOrder: 10,
      teleport: {
        ring: "aquarium-local",
        order: 1,
        alwaysOn: true,
      },
    },
  },
  {
    id: "AquariumAquaPad",
    name: "aqua disk",
    description:
      "A glossy aqua disk is set into the floor of the transfer lock, its surface smooth and faintly luminous beneath a thin skin of condensation.",
    sceneryDescription:
      "In the center of the lock sits another aqua disk, matching the one in the veterinary center and glowing softly against the dry floor.",
    location: "AqStart",
    vocab: ["aqua disk", "disk", "pad", "teleport pad"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 20,
    itemSize: 5,
    isSurface: true,
    meta: {
      sceneryDescriptionOrder: 10,
      teleport: {
        ring: "aquarium-local",
        order: 2,
        alwaysOn: true,
      },
    },
  },
];

export const AQUARIUM_DROWNING_DEATH_CAUSE = "aquarium drowning";
export const AQUARIUM_DROWNING_DEATH_MESSAGE = DROWNING_MESSAGE;
