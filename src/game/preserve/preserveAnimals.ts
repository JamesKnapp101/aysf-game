import { appendLog } from "@game/engine/handleCommand";
import { triggerPlayerDeath } from "@game/helpers/gameHelpers";
import {
  getExitDestinationRoomId,
  getRoomExits,
  moveItemToRoom,
} from "@game/helpers/itemHelpers";
import { updateItemLocation } from "@game/rules/items";
import type { GameState } from "@game/types/gameTypes";
import type { ItemId } from "@game/types/ids";
import type { Direction, Exit } from "@game/types/roomTypes";
import {
  GAME_PRESERVE_ANIMAL_PROFILES,
  GAME_PRESERVE_STAGING_ROOM_ID,
  type PreserveAnimalProfile,
  isGamePreserveRoomId,
} from "src/world/maps/levelFour/gamePreserveRules";
import {
  clearAnimalStatus,
  getAnimalStatusRemainingTurns,
  setAnimalStatus,
} from "./animalStatus";
import { canPreserveActorDetectPlayer } from "./preserveDetection";
import { getShortestPreserveRoute } from "./preserveNavigation";
import {
  getPreserveActorRuntime,
  setPreserveActorRuntime,
  syncLegacyBullEncounter,
  updatePreserveStructures,
} from "./preserveState";
import { canTraversePreserveExit } from "./preserveTraversal";
import type {
  PreserveActorId,
  PreserveActorRuntime,
  PreserveSense,
  PreserveTrackingReason,
} from "./preserveTypes";

const LINE_DIRECTIONS: Direction[] = [
  "north",
  "south",
  "east",
  "west",
  "northeast",
  "northwest",
  "southeast",
  "southwest",
];

type ChargeAdvance = {
  blocked?: {
    destinationRoomId?: string;
    exit: Exit;
    roomId: string;
  };
  rooms: string[];
};

function didPlayerMoveThisTurn(state: GameState, roomId: string): boolean {
  const lastMove = state.player.recentMoves?.[0];
  return lastMove?.atTurn === state.moves && lastMove.toRoomId === roomId;
}

function getDetectedSense(
  state: GameState,
  actorId: PreserveActorId,
  actorRoomId: string,
): PreserveSense | undefined {
  const profile = GAME_PRESERVE_ANIMAL_PROFILES[actorId];
  return profile.senses.find((sense) =>
    canPreserveActorDetectPlayer(state, actorId, sense, actorRoomId),
  );
}

function setActorCountdown(
  runtime: PreserveActorRuntime,
  countdownId: string,
  value: number,
): PreserveActorRuntime {
  return {
    ...runtime,
    countdowns: {
      ...runtime.countdowns,
      [countdownId]: Math.max(0, value),
    },
  };
}

function rememberPlayer(
  runtime: PreserveActorRuntime,
  sense: PreserveTrackingReason,
  playerRoomId: string,
  turn: number,
): PreserveActorRuntime {
  return {
    ...runtime,
    countdowns: {
      ...runtime.countdowns,
      lostPlayerTurns: 0,
    },
    flags: {
      ...runtime.flags,
      following: true,
    },
    memory: {
      ...runtime.memory,
      lastKnownPlayerRoomId: playerRoomId,
      lastKnownPlayerSense: sense,
      lastKnownPlayerTurn: turn,
    },
  };
}

function forgetPlayer(runtime: PreserveActorRuntime): PreserveActorRuntime {
  return {
    ...runtime,
    countdowns: {
      ...runtime.countdowns,
      lostPlayerTurns: 0,
    },
    flags: {
      ...runtime.flags,
      following: false,
    },
    intent: { kind: "idle" },
    memory: {
      ...runtime.memory,
      lastKnownPlayerRoomId: undefined,
      lastKnownPlayerSense: undefined,
      lastKnownPlayerTurn: undefined,
    },
  };
}

function moveActorToRoom(
  state: GameState,
  actorId: PreserveActorId,
  roomId: string,
): GameState {
  return moveItemToRoom(state, actorId as ItemId, roomId);
}

function commitActorRuntime(
  state: GameState,
  actorId: PreserveActorId,
  runtime: PreserveActorRuntime,
): GameState {
  const next = setPreserveActorRuntime(state, actorId, runtime);
  return actorId === "bull" ? syncLegacyBullEncounter(next) : next;
}

function getAllowedExitDestination(
  state: GameState,
  actorId: PreserveActorId,
  fromRoomId: string,
  exit: Exit,
): string | undefined {
  const destinationRoomId = getExitDestinationRoomId(state, fromRoomId, exit);
  if (
    !destinationRoomId ||
    destinationRoomId === GAME_PRESERVE_STAGING_ROOM_ID ||
    !isGamePreserveRoomId(destinationRoomId)
  ) {
    return undefined;
  }

  const traversal = canTraversePreserveExit(
    state,
    actorId,
    fromRoomId,
    exit,
    destinationRoomId,
  );

  return traversal.allowed ? destinationRoomId : undefined;
}

function tracePreserveLine(
  state: GameState,
  actorId: PreserveActorId,
  startRoomId: string,
  direction: Direction,
  maxSteps: number,
): string[] {
  const rooms: string[] = [];
  let currentRoomId = startRoomId;

  for (let i = 0; i < maxSteps; i += 1) {
    const exit = getRoomExits(state, currentRoomId).find(
      (candidate) => candidate.direction === direction,
    );
    if (!exit) break;

    const destinationRoomId = getAllowedExitDestination(
      state,
      actorId,
      currentRoomId,
      exit,
    );
    if (!destinationRoomId) break;

    rooms.push(destinationRoomId);
    currentRoomId = destinationRoomId;
  }

  return rooms;
}

function findLineToPlayer(
  state: GameState,
  actorId: PreserveActorId,
  actorRoomId: string,
  maxSteps: number,
):
  | {
      direction: Direction;
      steps: number;
    }
  | undefined {
  for (const direction of LINE_DIRECTIONS) {
    const rooms = tracePreserveLine(
      state,
      actorId,
      actorRoomId,
      direction,
      maxSteps,
    );
    const playerIndex = rooms.indexOf(state.player.roomId);
    if (playerIndex >= 0) {
      return { direction, steps: playerIndex + 1 };
    }
  }

  return undefined;
}

function buildChargeAdvance(
  state: GameState,
  actorId: PreserveActorId,
  startRoomId: string,
  direction: Direction,
  maxSteps: number,
): ChargeAdvance {
  const rooms: string[] = [];
  let currentRoomId = startRoomId;

  for (let i = 0; i < maxSteps; i += 1) {
    const exit = getRoomExits(state, currentRoomId).find(
      (candidate) => candidate.direction === direction,
    );
    if (!exit) break;

    const destinationRoomId = getExitDestinationRoomId(
      state,
      currentRoomId,
      exit,
    );
    if (!destinationRoomId || !isGamePreserveRoomId(destinationRoomId)) {
      break;
    }

    const traversal = canTraversePreserveExit(
      state,
      actorId,
      currentRoomId,
      exit,
      destinationRoomId,
    );

    if (!traversal.allowed) {
      return {
        blocked: { destinationRoomId, exit, roomId: currentRoomId },
        rooms,
      };
    }

    rooms.push(destinationRoomId);
    currentRoomId = destinationRoomId;
  }

  return { rooms };
}

function choosePatrolStep(
  state: GameState,
  actorId: PreserveActorId,
  actorRoomId: string,
  profile: PreserveAnimalProfile,
  runtime: PreserveActorRuntime,
): string | undefined {
  const patrolRooms = new Set<string>(profile.patrolRoomIds);
  const targetRoomId =
    runtime.memory.patrolTargetRoomId ?? profile.initialPatrolTargetRoomId;

  if (targetRoomId && targetRoomId !== actorRoomId) {
    const route = getShortestPreserveRoute(
      state,
      actorId,
      actorRoomId,
      targetRoomId,
    );

    if (route?.firstRoomId && patrolRooms.has(route.firstRoomId)) {
      return route.firstRoomId;
    }
  }

  const candidates = getRoomExits(state, actorRoomId)
    .map((exit) => getAllowedExitDestination(state, actorId, actorRoomId, exit))
    .filter((roomId): roomId is string => Boolean(roomId))
    .filter((roomId) => patrolRooms.has(roomId));

  if (candidates.length === 0) return undefined;

  const previousRoomId = runtime.memory.lastVisitedRoomId;
  const freshCandidates =
    candidates.length > 1
      ? candidates.filter((roomId) => roomId !== previousRoomId)
      : candidates;
  const pool = freshCandidates.length > 0 ? freshCandidates : candidates;
  return pool[Math.floor(state.rng() * pool.length)];
}

function moveAlongRoute(
  state: GameState,
  actorId: PreserveActorId,
  actorRoomId: string,
  targetRoomId: string,
): { movedToRoomId?: string; state: GameState } {
  const route = getShortestPreserveRoute(
    state,
    actorId,
    actorRoomId,
    targetRoomId,
  );

  if (!route?.firstRoomId || route.firstRoomId === actorRoomId) {
    return { state };
  }

  return {
    movedToRoomId: route.firstRoomId,
    state: moveActorToRoom(state, actorId, route.firstRoomId),
  };
}

function decrementBullChargeCooldown(
  runtime: PreserveActorRuntime,
): PreserveActorRuntime {
  const chargeCooldown = runtime.countdowns.chargeCooldown;
  if (chargeCooldown == null || chargeCooldown <= 0) return runtime;
  return setActorCountdown(runtime, "chargeCooldown", chargeCooldown - 1);
}

function tickMovementCooldown(
  runtime: PreserveActorRuntime,
  profile: PreserveAnimalProfile,
): { canMove: boolean; runtime: PreserveActorRuntime } {
  if (profile.moveEveryTurns <= 1) return { canMove: true, runtime };

  const moveCooldown = runtime.countdowns.moveCooldown ?? 0;
  if (moveCooldown > 0) {
    return {
      canMove: false,
      runtime: setActorCountdown(runtime, "moveCooldown", moveCooldown - 1),
    };
  }

  return { canMove: true, runtime };
}

function resetMovementCooldown(
  runtime: PreserveActorRuntime,
  profile: PreserveAnimalProfile,
): PreserveActorRuntime {
  return setActorCountdown(runtime, "moveCooldown", profile.moveEveryTurns - 1);
}

function handleStunnedAnimal(
  state: GameState,
  actorId: PreserveActorId,
  runtime: PreserveActorRuntime,
): { handled: boolean; state: GameState; runtime: PreserveActorRuntime } {
  const stunnedTurns = getAnimalStatusRemainingTurns(state, actorId, "stunned");
  if (stunnedTurns <= 0) {
    return { handled: false, state, runtime };
  }

  let next = state;
  const nextRuntime: PreserveActorRuntime = {
    ...runtime,
    intent: { kind: "idle" as const },
  };

  if (stunnedTurns === 1) {
    next = clearAnimalStatus(next, actorId, "stunned");
    next = appendLog(
      next,
      "The animal shakes itself hard, then snorts and regains its footing.",
    );
  } else {
    next = setAnimalStatus(next, actorId, {
      id: "stunned",
      remainingTurns: stunnedTurns - 1,
    });
    next = appendLog(
      next,
      "The animal is still stunned, scraping and shifting as it tries to recover.",
    );
  }

  return { handled: true, state: next, runtime: nextRuntime };
}

function executeBullCharge(
  state: GameState,
  runtime: PreserveActorRuntime,
  actorRoomId: string,
  profile: PreserveAnimalProfile,
): { state: GameState; runtime: PreserveActorRuntime } {
  const charge = runtime.intent.kind === "charge" ? runtime.intent : undefined;
  const chargeConfig = profile.bullCharge;
  if (!charge || !chargeConfig) return { state, runtime };

  let next = appendLog(state, "The bull lowers its head and charges!");
  let nextRuntime: PreserveActorRuntime = {
    ...runtime,
    intent: { kind: "idle" as const },
  };

  const advance = buildChargeAdvance(
    next,
    "bull",
    actorRoomId,
    charge.direction,
    chargeConfig.chargeMoveRooms,
  );

  const hitPlayer = advance.rooms.includes(next.player.roomId);
  if (hitPlayer) {
    nextRuntime = setActorCountdown(
      nextRuntime,
      "chargeCooldown",
      chargeConfig.cooldownTurnsAfterCrash,
    );
    next = commitActorRuntime(next, "bull", nextRuntime);
    return {
      runtime: nextRuntime,
      state: triggerPlayerDeath(
        next,
        "Too slow. The bull corrects at the last second and slams into you with bone-crushing force.",
        "bull",
      ),
    };
  }

  for (const roomId of advance.rooms) {
    next = moveActorToRoom(next, "bull", roomId);
  }

  if (
    advance.blocked?.roomId === "RuinedWall" &&
    advance.blocked.exit.preserveRuleId === "ruined-wall-breach" &&
    next.worldState.gamePreserve.run?.structures.ruinedWallState === "intact"
  ) {
    next = updatePreserveStructures(next, (structures) => ({
      ...structures,
      ruinedWallState: "toppled",
    }));
    next = updateItemLocation(next, "BrokenHorn", advance.blocked.roomId);
    next = appendLog(
      next,
      "You feel the impact through the ground as the cracked wall explodes outward and sends masonry tumbling through a cloud of dust and grit. The force of it snaps off one of the bull's horns with a wet crack, and sends it skittering across the rubble. The drainage pipe is now exposed.",
    );
    next = setAnimalStatus(next, "bull", {
      id: "stunned",
      remainingTurns: chargeConfig.crashStunnedTurns,
    });
    nextRuntime = setActorCountdown(
      nextRuntime,
      "chargeCooldown",
      chargeConfig.cooldownTurnsAfterCrash,
    );
    return { state: next, runtime: nextRuntime };
  }

  if (advance.blocked) {
    next = appendLog(
      next,
      "The charge ends in a jarring impact that leaves the animal reeling.",
    );
    next = setAnimalStatus(next, "bull", {
      id: "stunned",
      remainingTurns: chargeConfig.crashStunnedTurns,
    });
    nextRuntime = setActorCountdown(
      nextRuntime,
      "chargeCooldown",
      chargeConfig.cooldownTurnsAfterCrash,
    );
    return { state: next, runtime: nextRuntime };
  }

  nextRuntime = setActorCountdown(
    nextRuntime,
    "chargeCooldown",
    chargeConfig.cooldownTurnsAfterCharge,
  );
  return { state: next, runtime: nextRuntime };
}

function updatePursuitMemory(
  state: GameState,
  actorId: PreserveActorId,
  actorRoomId: string,
  profile: PreserveAnimalProfile,
  runtime: PreserveActorRuntime,
): { state: GameState; runtime: PreserveActorRuntime } {
  const detectedSense = getDetectedSense(state, actorId, actorRoomId);
  const wasFollowing = runtime.flags.following === true;

  if (detectedSense) {
    const nextRuntime = rememberPlayer(
      runtime,
      detectedSense,
      state.player.roomId,
      state.moves,
    );
    return {
      runtime: nextRuntime,
      state: wasFollowing
        ? state
        : appendLog(state, profile.followingStartedMessage),
    };
  }

  if (!wasFollowing) return { state, runtime };

  const lostPlayerTurns = (runtime.countdowns.lostPlayerTurns ?? 0) + 1;
  if (lostPlayerTurns >= profile.loseTrackAfterTurns) {
    return {
      runtime: forgetPlayer(runtime),
      state: appendLog(state, profile.followingStoppedMessage),
    };
  }

  return {
    state,
    runtime: setActorCountdown(runtime, "lostPlayerTurns", lostPlayerTurns),
  };
}

function formatGameWhistleMessage(
  whistleCall: string | undefined,
  outcome: string,
  fallback: string,
): string {
  const call = whistleCall?.trim();
  if (!call) return fallback;

  return `You blow into the game whistle, and it emits a loud call:\n\n"${call}"\n\n${outcome}`;
}

export function provokePreserveAnimalWithWhistle(
  state: GameState,
  whistleMode: PreserveActorId,
  whistleCall?: string,
): { message: string; state: GameState } {
  const run = state.worldState.gamePreserve.run;
  if (!run || !isGamePreserveRoomId(state.player.roomId)) {
    return {
      state,
      message: formatGameWhistleMessage(
        whistleCall,
        "Nothing answers.",
        "You blow into the game whistle. The note is thin and silent, and nothing answers.",
      ),
    };
  }

  const actorId = run.activeAnimalId;
  if (actorId !== whistleMode) {
    return {
      state,
      message: formatGameWhistleMessage(
        whistleCall,
        "Nothing in the preserve seems impressed by that setting.",
        "You blow into the game whistle. Somewhere in the preserve, nothing seems impressed by that setting.",
      ),
    };
  }

  const actorRoomId = state.itemState.itemRoomId[actorId];
  if (
    !actorRoomId ||
    actorRoomId === GAME_PRESERVE_STAGING_ROOM_ID ||
    !isGamePreserveRoomId(actorRoomId)
  ) {
    return {
      state,
      message: formatGameWhistleMessage(
        whistleCall,
        "The preserve gives you no answer.",
        "You blow into the game whistle, but the preserve gives you no answer.",
      ),
    };
  }

  const runtime = rememberPlayer(
    getPreserveActorRuntime(state, actorId),
    "sound",
    state.player.roomId,
    state.moves,
  );
  const next = commitActorRuntime(state, actorId, {
    ...runtime,
    countdowns: {
      ...runtime.countdowns,
      chargeCooldown: 0,
    },
  });

  return {
    state: next,
    message: formatGameWhistleMessage(
      whistleCall,
      "The sound cuts off almost instantly, swallowed by answering movement somewhere in the preserve.",
      "You blow into the game whistle. The sound cuts off almost instantly, swallowed by answering movement somewhere in the preserve.",
    ),
  };
}

export function tickGamePreserveAnimals(state: GameState): GameState {
  const run = state.worldState.gamePreserve.run;
  if (!run) return state;
  if (!isGamePreserveRoomId(state.player.roomId)) return state;

  const actorId = run.activeAnimalId;
  const profile = GAME_PRESERVE_ANIMAL_PROFILES[actorId];
  let actorRoomId = state.itemState.itemRoomId[actorId];

  if (
    !actorRoomId ||
    actorRoomId === GAME_PRESERVE_STAGING_ROOM_ID ||
    !isGamePreserveRoomId(actorRoomId)
  ) {
    return state;
  }

  let next = state;
  let runtime = getPreserveActorRuntime(next, actorId);

  const stunned = handleStunnedAnimal(next, actorId, runtime);
  if (stunned.handled) {
    next = commitActorRuntime(stunned.state, actorId, stunned.runtime);
    return next;
  }

  if (actorId === "bull" && runtime.intent.kind === "charge") {
    const charged = executeBullCharge(next, runtime, actorRoomId, profile);
    next = commitActorRuntime(charged.state, actorId, charged.runtime);
    return next;
  }

  if (actorId === "bull") {
    runtime = decrementBullChargeCooldown(runtime);
  }

  const pursuit = updatePursuitMemory(
    next,
    actorId,
    actorRoomId,
    profile,
    runtime,
  );
  next = pursuit.state;
  runtime = pursuit.runtime;

  const detectedSense = getDetectedSense(next, actorId, actorRoomId);
  const canActOnPlayer = Boolean(detectedSense);
  const newSameRoomContact =
    actorRoomId === next.player.roomId &&
    didPlayerMoveThisTurn(next, next.player.roomId);

  if (
    actorId === "bull" &&
    profile.bullCharge &&
    actorRoomId === next.player.roomId &&
    canActOnPlayer &&
    newSameRoomContact
  ) {
    if (next.rng() < profile.bullCharge.closeContactDeathChance) {
      next = commitActorRuntime(next, actorId, runtime);
      return triggerPlayerDeath(
        next,
        "The bull catches you at point-blank range and hits you like a freight train, impaling you on one horn, then hurling you up into the air. A moment of weightlessness is cut short as you land hard on the ground, looking up in time to see the bull's hoof coming down onto your face, with a good ton of solid muscle behind it.",
        "bull",
      );
    }

    runtime = {
      ...runtime,
      intent: { kind: "closeAttack" },
    };
    next = appendLog(
      next,
      "The bull crowds you hard, missing the first opening but lowering its head for another rush.",
    );
    next = commitActorRuntime(next, actorId, runtime);
    return next;
  }

  if (
    actorId === "bull" &&
    runtime.intent.kind === "closeAttack" &&
    actorRoomId === next.player.roomId &&
    canActOnPlayer
  ) {
    runtime = {
      ...runtime,
      intent: { kind: "idle" },
    };
    next = commitActorRuntime(next, actorId, runtime);
    return triggerPlayerDeath(
      next,
      "The bull is already on top of you. It lunges again and crushes you before you can recover.",
      "bull",
    );
  }

  if (actorId === "bull" && profile.bullCharge && canActOnPlayer) {
    const line = findLineToPlayer(
      next,
      actorId,
      actorRoomId,
      profile.bullCharge.triggerRadius,
    );

    if (line && (runtime.countdowns.chargeCooldown ?? 0) <= 0) {
      runtime = {
        ...runtime,
        intent: {
          kind: "charge",
          direction: line.direction,
          targetRoomId: next.player.roomId,
        },
      };
      next = appendLog(
        next,
        "The bull stares you down, paws at the ground, and gears up to charge.",
      );
      next = commitActorRuntime(next, actorId, runtime);
      return next;
    }
  }

  const pursuitTargetRoomId =
    runtime.flags.following === true
      ? runtime.memory.lastKnownPlayerRoomId
      : undefined;

  if (pursuitTargetRoomId) {
    const movement = tickMovementCooldown(runtime, profile);
    runtime = movement.runtime;

    if (movement.canMove) {
      const moved = moveAlongRoute(
        next,
        actorId,
        actorRoomId,
        pursuitTargetRoomId,
      );
      next = moved.state;
      actorRoomId = moved.movedToRoomId ?? actorRoomId;

      if (moved.movedToRoomId) {
        runtime = resetMovementCooldown(runtime, profile);
      }
    }

    if (
      actorId === "bull" &&
      actorRoomId === next.player.roomId &&
      getDetectedSense(next, actorId, actorRoomId)
    ) {
      runtime = {
        ...runtime,
        intent: { kind: "closeAttack" },
      };
    }

    next = commitActorRuntime(next, actorId, runtime);
    return next;
  }

  const movement = tickMovementCooldown(runtime, profile);
  runtime = movement.runtime;

  if (movement.canMove) {
    const patrolStepRoomId = choosePatrolStep(
      next,
      actorId,
      actorRoomId,
      profile,
      runtime,
    );
    if (patrolStepRoomId) {
      next = moveActorToRoom(next, actorId, patrolStepRoomId);
      actorRoomId = patrolStepRoomId;
      runtime = resetMovementCooldown(runtime, profile);
    }
  }

  runtime = {
    ...runtime,
    memory: {
      ...runtime.memory,
      patrolTargetRoomId:
        profile.initialPatrolTargetRoomId === actorRoomId
          ? undefined
          : (runtime.memory.patrolTargetRoomId ??
            profile.initialPatrolTargetRoomId),
    },
  };

  next = commitActorRuntime(next, actorId, runtime);
  return next;
}
