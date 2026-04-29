import { moveItemToRoom } from "@game/helpers/itemHelpers";
import { removeItemFromPlacementLists } from "@game/helpers/itemPlacement";
import { updateItemLocation } from "@game/rules/items";
import { addToInventory, removeFromInventory } from "@game/rules/state";
import type { GameState } from "@game/types/gameTypes";
import type { ItemId } from "@game/types/ids";
import {
  clearAnimalStatus,
  getAnimalStatusRemainingTurns,
} from "./animalStatus";
import {
  PRESERVE_ACTOR_IDS,
  type GamePreserveDifficulty,
  type PreserveActorId,
  type PreserveActorRuntime,
  type PreservePlayerRuntime,
  type PreserveRunState,
  type PreserveStructuresState,
} from "./preserveTypes";
import {
  GAME_PRESERVE_ANIMAL_PROFILES,
  GAME_PRESERVE_DIFFICULTY_ANIMAL_MAP,
  GAME_PRESERVE_STAGING_ROOM_ID,
  isGamePreserveRoomId,
} from "src/world/maps/levelFour/gamePreserveRules";

const PRESERVE_RUN_ITEM_IDS = [
  "GameWhistle",
  "BoarTusk",
  "BadgerClaw",
  "BrokenHorn",
  "BearViscera",
  "BarryHair",
] as const;

export function createInitialPreserveActorRuntime(
  actorId: PreserveActorId,
): PreserveActorRuntime {
  const profile = GAME_PRESERVE_ANIMAL_PROFILES[actorId];

  return {
    actorId,
    countdowns: {
      ...(profile.bullCharge ? { chargeCooldown: 3 } : {}),
    },
    flags: {},
    intent: { kind: "idle" },
    memory: {},
  };
}

export function createInitialPreserveRunState(
  difficulty: GamePreserveDifficulty,
): PreserveRunState {
  const actors = Object.fromEntries(
    PRESERVE_ACTOR_IDS.map((actorId) => [
      actorId,
      createInitialPreserveActorRuntime(actorId),
    ]),
  ) as Record<PreserveActorId, PreserveActorRuntime>;

  return {
    activeAnimalId: GAME_PRESERVE_DIFFICULTY_ANIMAL_MAP[difficulty],
    actors,
    difficulty,
    playerRuntime: {
      scentMaskedTurns: 0,
    },
    structures: {
      deadOakState: "standing",
      feedDispenserChargesRemaining: 3,
      ruinedWallState: "intact",
    },
  };
}

export function syncLegacyBullEncounter(state: GameState): GameState {
  const bullRuntime = getPreserveActorRuntime(state, "bull");
  const pendingCharge =
    bullRuntime.intent.kind === "charge"
      ? {
          dir: bullRuntime.intent.direction,
          targetRoomId: bullRuntime.intent.targetRoomId,
        }
      : undefined;

  return {
    ...state,
    worldState: {
      ...state.worldState,
      bullEncounter: {
        chargeCooldown: Math.max(0, bullRuntime.countdowns.chargeCooldown ?? 0),
        pendingCharge,
        stunnedTurns: getAnimalStatusRemainingTurns(state, "bull", "stunned"),
      },
    },
  };
}

function updatePreserveRun(
  state: GameState,
  updater: (run: PreserveRunState) => PreserveRunState,
): GameState {
  const run = state.worldState.gamePreserve.run;
  if (!run) return state;

  return {
    ...state,
    worldState: {
      ...state.worldState,
      gamePreserve: {
        ...state.worldState.gamePreserve,
        run: updater(run),
      },
    },
  };
}

function placePreserveActor(
  state: GameState,
  actorId: PreserveActorId,
  roomId: string,
): GameState {
  const hasTrackedRoomId = Boolean(state.itemState.itemRoomId[actorId]);

  if (hasTrackedRoomId) {
    return moveItemToRoom(state, actorId, roomId);
  }

  return {
    ...state,
    itemState: {
      ...state.itemState,
      itemRoomId: {
        ...state.itemState.itemRoomId,
        [actorId]: roomId,
      },
    },
  };
}

function resetPreserveAnimalState(state: GameState): GameState {
  return {
    ...state,
    itemState: {
      ...state.itemState,
      attachedTo: PRESERVE_ACTOR_IDS.reduce(
        (attachedTo, actorId) => ({
          ...attachedTo,
          [actorId]: undefined,
        }),
        { ...state.itemState.attachedTo },
      ),
      animalDisposition: PRESERVE_ACTOR_IDS.reduce(
        (animalDisposition, actorId) => {
          const current = animalDisposition[actorId] ?? {};
          return {
            ...animalDisposition,
            [actorId]: {
              ...current,
              statusEffects: [],
            },
          };
        },
        { ...state.itemState.animalDisposition },
      ),
    },
  };
}

function grantPreserveWhistle(state: GameState): GameState {
  if (!state.world.items.some((item) => item.id === "GameWhistle")) {
    return state;
  }

  let next = updateItemLocation(state, "GameWhistle", "INVENTORY");
  next = addToInventory(next, "GameWhistle");

  const existingSettings = next.itemState.itemSettings.GameWhistle;
  if (existingSettings) return next;

  return {
    ...next,
    itemState: {
      ...next.itemState,
      itemSettings: {
        ...next.itemState.itemSettings,
        GameWhistle: { kind: "game-whistle", mode: "bull" },
      },
    },
  };
}

export function removePreserveRunItems(state: GameState): GameState {
  let next: GameState = {
    ...state,
    itemState: {
      ...state.itemState,
      attachedTo: PRESERVE_ACTOR_IDS.reduce(
        (attachedTo, actorId) => ({
          ...attachedTo,
          [actorId]: undefined,
        }),
        { ...state.itemState.attachedTo },
      ),
      containerContents: state.itemState.containerContents,
      surfaceContents: state.itemState.surfaceContents,
      underContents: state.itemState.underContents,
      searchableContents: state.itemState.searchableContents,
    },
  };

  for (const actorId of PRESERVE_ACTOR_IDS) {
    next = clearAnimalStatus(next, actorId, "attached");
  }

  for (const itemId of PRESERVE_RUN_ITEM_IDS) {
    if (!next.world.items.some((item) => item.id === itemId)) continue;

    next = {
      ...next,
      itemState: {
        ...next.itemState,
        containerContents: removeItemFromPlacementLists(
          next.itemState.containerContents,
          itemId,
        ),
        surfaceContents: removeItemFromPlacementLists(
          next.itemState.surfaceContents,
          itemId,
        ),
        underContents: removeItemFromPlacementLists(
          next.itemState.underContents,
          itemId,
        ),
        searchableContents: removeItemFromPlacementLists(
          next.itemState.searchableContents,
          itemId,
        ),
      },
    };

    next = updateItemLocation(
      next,
      itemId,
      itemId === "GameWhistle"
        ? "GamePreserveEntrance"
        : GAME_PRESERVE_STAGING_ROOM_ID,
    );
    next = removeFromInventory(next, itemId);
  }

  return next;
}

export function removePreserveWhistle(state: GameState): GameState {
  return removePreserveRunItems(state);
}

export function startGamePreserveRun(state: GameState): GameState {
  const difficulty = state.worldState.gamePreserve.selectedDifficulty;
  const run = createInitialPreserveRunState(difficulty);

  let next: GameState = {
    ...state,
    worldState: {
      ...state.worldState,
      gamePreserve: {
        ...state.worldState.gamePreserve,
        run,
      },
    },
  };

  next = resetPreserveAnimalState(next);
  next = grantPreserveWhistle(next);

  for (const actorId of PRESERVE_ACTOR_IDS) {
    const profile = GAME_PRESERVE_ANIMAL_PROFILES[actorId];
    next = placePreserveActor(
      next,
      actorId,
      actorId === run.activeAnimalId
        ? profile.initialRoomId
        : GAME_PRESERVE_STAGING_ROOM_ID,
    );
  }

  return syncLegacyBullEncounter(next);
}

export function ensureGamePreserveRunForRoom(
  state: GameState,
  roomId: string,
): GameState {
  if (!isGamePreserveRoomId(roomId)) return state;
  if (state.worldState.gamePreserve.run) return state;
  return startGamePreserveRun(state);
}

export function getPreserveActorRuntime(
  state: GameState,
  actorId: PreserveActorId,
): PreserveActorRuntime {
  return (
    state.worldState.gamePreserve.run?.actors[actorId] ??
    createInitialPreserveActorRuntime(actorId)
  );
}

export function setPreserveActorRuntime(
  state: GameState,
  actorId: PreserveActorId,
  runtime: PreserveActorRuntime,
): GameState {
  return updatePreserveRun(state, (run) => ({
    ...run,
    actors: {
      ...run.actors,
      [actorId]: runtime,
    },
  }));
}

export function updatePreserveActorRuntime(
  state: GameState,
  actorId: PreserveActorId,
  updater: (runtime: PreserveActorRuntime) => PreserveActorRuntime,
): GameState {
  return setPreserveActorRuntime(
    state,
    actorId,
    updater(getPreserveActorRuntime(state, actorId)),
  );
}

export function updatePreservePlayerRuntime(
  state: GameState,
  updater: (runtime: PreservePlayerRuntime) => PreservePlayerRuntime,
): GameState {
  return updatePreserveRun(state, (run) => ({
    ...run,
    playerRuntime: updater(run.playerRuntime),
  }));
}

export function updatePreserveStructures(
  state: GameState,
  updater: (structures: PreserveStructuresState) => PreserveStructuresState,
): GameState {
  return updatePreserveRun(state, (run) => ({
    ...run,
    structures: updater(run.structures),
  }));
}

export function tickGamePreserveRun(state: GameState): GameState {
  const run = state.worldState.gamePreserve.run;
  if (!run) return state;
  if (run.playerRuntime.scentMaskedTurns <= 0) return state;

  return updatePreservePlayerRuntime(state, (playerRuntime) => ({
    ...playerRuntime,
    scentMaskedTurns: Math.max(0, playerRuntime.scentMaskedTurns - 1),
  }));
}

export function getPreserveActiveAnimalId(
  state: GameState,
): PreserveActorId | undefined {
  return state.worldState.gamePreserve.run?.activeAnimalId;
}

export function getPreserveItemHost(
  state: GameState,
  itemId: ItemId,
): string | undefined {
  return state.itemState.attachedTo[itemId];
}
