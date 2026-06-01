import { ensureGamePreserveRunForRoom } from "@game/preserve/preserveState";
import { getGamePreserveMoveGuard } from "@game/preserve/preserveTraversal";
import type { GameState } from "@game/types/gameTypes";
import type { ParsedCommand } from "@game/types/parserTypes";
import {
  AVIARY_RETRY_RESPAWN_ROOM_ID,
  resetAviaryEncounter,
} from "src/world/Items/creatures/aviaryOrganisms";
import {
  BADGER_RETRY_RESPAWN_ROOM_ID,
  resetBadgerEncounter,
} from "src/world/Items/creatures/badger";
import {
  BULL_RETRY_RESPAWN_ROOM_ID,
  resetBullEncounter,
} from "src/world/Items/creatures/bull";
import {
  HYDROPONICS_SPIDER_ITEM_ID,
  HYDROPONICS_SPIDER_REACHABILITY_MESSAGE,
  canReachHydroponicsSpiderFromRoom,
  isHydroponicsSpiderNoun,
  isHydroponicsSpiderRoom,
  isHydroponicsSpiderVisibleFromRoom,
} from "src/world/Items/creatures/giantSpider";
import {
  AQUARIUM_DROWNING_DEATH_CAUSE,
  AQUARIUM_RETRY_RESPAWN_ROOM_ID,
  getAquariumMoveGuard,
  resetAquariumEncounter,
} from "src/world/Items/creatures/octopus";
import {
  getDeepStorageActionGuard,
  getDeepStorageRespawnDockRoomId,
  matchesDeepStorageRetryableDeath,
  resetDeepStorageAfterDeath,
} from "src/world/maps/levelSeven/deepStorage";
import {
  maybeInitializeHydroponicsCocoonPuzzle,
  resetHydroponicsEncounter,
} from "src/world/maps/levelSix/hydroponicsPuzzle";
import { getGreenhouseMoveGuard } from "src/world/maps/levelFour/Greenhouse";

type EncounterMoveGuardResult =
  | {
      kind: "block";
      message: string;
      consumesTurn?: boolean;
    }
  | {
      kind: "death";
      deathMessage: string;
      deathCause: string;
      consumesTurn?: boolean;
    };

type EncounterActionGuardResult = {
  message: string;
  consumesTurn: boolean;
};

type RetryableEncounterDeathOverride = {
  respawnRoomId: string;
  reset: (state: GameState) => GameState;
};

type RetryableEncounterDefinition = {
  id: string;
  initializeOnEnter?: (state: GameState, roomId: string) => GameState;
  beforeMove?: (
    state: GameState,
    ctx: {
      fromRoomId: string;
      direction: string;
      destinationRoomId?: string;
    },
  ) => EncounterMoveGuardResult | undefined;
  beforeAction?: (
    state: GameState,
    cmd: ParsedCommand,
  ) => EncounterActionGuardResult | undefined;
  matchesRetryableDeath?: (
    state: GameState,
    cause: string,
    roomId: string,
  ) => boolean;
  getRetryableDeathOverride?: (
    state: GameState,
    cause: string,
    roomId: string,
  ) => RetryableEncounterDeathOverride;
};

function isRemoteHydroponicsSpiderInteraction(
  state: GameState,
  cmd: ParsedCommand,
): boolean {
  if (cmd.type !== "action") return false;
  if (cmd.verb === "examine" || cmd.verb === "look") return false;
  if (!isHydroponicsSpiderRoom(state.player.roomId)) return false;
  if (!isHydroponicsSpiderVisibleFromRoom(state.player.roomId)) return false;
  if (canReachHydroponicsSpiderFromRoom(state, state.player.roomId))
    return false;

  const spider = state.world.items.find(
    (item) => item.id === HYDROPONICS_SPIDER_ITEM_ID,
  );
  if (!spider) return false;

  const targets = [cmd.direct, cmd.indirect].filter((noun): noun is string =>
    Boolean(noun?.trim()),
  );

  return targets.some((noun) => isHydroponicsSpiderNoun(spider, noun));
}

const RETRYABLE_ENCOUNTERS: RetryableEncounterDefinition[] = [
  {
    id: "hydroponics",
    initializeOnEnter: (state, roomId) =>
      maybeInitializeHydroponicsCocoonPuzzle(state, roomId),
    beforeMove: (state, ctx) => {
      if (
        ctx.fromRoomId === "HydroponicsPlatform" &&
        ctx.direction === "down" &&
        state.worldState.conditionalTriggers.EscapedWithOrangeBadge &&
        !state.worldState.hydroponicsSpider.isAlive
      ) {
        return {
          kind: "block",
          message:
            "Below the grating, the collapsed nest is boiling with millions of hand-sized spiders swarming over the dead mother's burst abdomen. There is no chance you're going back down there.",
          consumesTurn: false,
        };
      }

      return undefined;
    },
    beforeAction: (state, cmd) =>
      isRemoteHydroponicsSpiderInteraction(state, cmd)
        ? {
            message: HYDROPONICS_SPIDER_REACHABILITY_MESSAGE,
            consumesTurn: false,
          }
        : undefined,
    matchesRetryableDeath: (_state, cause) =>
      cause === "hydroponics spider acid" ||
      cause === "hydroponics cocoon trap",
    getRetryableDeathOverride: () => ({
      respawnRoomId: "LevelSixCorridorEnd",
      reset: resetHydroponicsEncounter,
    }),
  },
  {
    id: "aquarium",
    beforeMove: (state, ctx) =>
      getAquariumMoveGuard(state, ctx.destinationRoomId),
    matchesRetryableDeath: (_state, cause) =>
      cause === "aquarium octopus" || cause === AQUARIUM_DROWNING_DEATH_CAUSE,
    getRetryableDeathOverride: () => ({
      respawnRoomId: AQUARIUM_RETRY_RESPAWN_ROOM_ID,
      reset: resetAquariumEncounter,
    }),
  },
  {
    id: "game-preserve",
    initializeOnEnter: (state, roomId) =>
      ensureGamePreserveRunForRoom(state, roomId),
    beforeMove: (state, ctx) => getGamePreserveMoveGuard(state, ctx),
  },
  {
    id: "greenhouse",
    beforeMove: (state, ctx) => getGreenhouseMoveGuard(state, ctx),
  },
  {
    id: "bull",
    matchesRetryableDeath: (_state, cause) => cause === "bull",
    getRetryableDeathOverride: () => ({
      respawnRoomId: BULL_RETRY_RESPAWN_ROOM_ID,
      reset: resetBullEncounter,
    }),
  },
  {
    id: "badger",
    matchesRetryableDeath: (_state, cause) => cause === "badger",
    getRetryableDeathOverride: () => ({
      respawnRoomId: BADGER_RETRY_RESPAWN_ROOM_ID,
      reset: resetBadgerEncounter,
    }),
  },
  {
    id: "aviary",
    matchesRetryableDeath: (_state, cause) => cause === "organismAttack",
    getRetryableDeathOverride: () => ({
      respawnRoomId: AVIARY_RETRY_RESPAWN_ROOM_ID,
      reset: resetAviaryEncounter,
    }),
  },
  {
    id: "deep-storage",
    beforeAction: (state, cmd) => getDeepStorageActionGuard(state, cmd),
    matchesRetryableDeath: (state, cause, roomId) =>
      matchesDeepStorageRetryableDeath(state, cause, roomId),
    getRetryableDeathOverride: (state, _cause, roomId) => ({
      respawnRoomId: getDeepStorageRespawnDockRoomId(state, roomId),
      reset: resetDeepStorageAfterDeath,
    }),
  },
];

export function initializeEncounterStateOnEnter(
  state: GameState,
  roomId: string,
): GameState {
  let next = state;
  for (const encounter of RETRYABLE_ENCOUNTERS) {
    if (!encounter.initializeOnEnter) continue;
    next = encounter.initializeOnEnter(next, roomId);
  }
  return next;
}

export function getEncounterMoveGuard(
  state: GameState,
  ctx: {
    fromRoomId: string;
    direction: string;
    destinationRoomId?: string;
  },
): EncounterMoveGuardResult | undefined {
  for (const encounter of RETRYABLE_ENCOUNTERS) {
    const guard = encounter.beforeMove?.(state, ctx);
    if (guard) return guard;
  }

  return undefined;
}

export function getEncounterActionGuard(
  state: GameState,
  cmd: ParsedCommand,
): EncounterActionGuardResult | undefined {
  for (const encounter of RETRYABLE_ENCOUNTERS) {
    const guard = encounter.beforeAction?.(state, cmd);
    if (guard) return guard;
  }

  return undefined;
}

export function getRetryableEncounterDeathOverride(
  state: GameState,
  cause: string,
  roomId: string,
): RetryableEncounterDeathOverride | undefined {
  for (const encounter of RETRYABLE_ENCOUNTERS) {
    if (!encounter.matchesRetryableDeath?.(state, cause, roomId)) continue;
    if (!encounter.getRetryableDeathOverride) continue;
    return encounter.getRetryableDeathOverride(state, cause, roomId);
  }

  return undefined;
}
