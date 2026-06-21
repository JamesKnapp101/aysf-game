import { audioRegistry } from "@game/audioRegistry";
import { tickFlashlights } from "@game/engine/ticks/flashlightTick";
import { tickNpcIdleActions } from "@game/engine/ticks/npcIdleActionsTick";
import { tickActiveExperience } from "@game/experiences/experienceRegistry";
import { emitAdjacentAudioCues } from "@game/helpers/audioCues";
import {
  CAT_ID,
  clearCatHeldTurns,
  getCatSafeRoomId,
  isCatHeld,
  isRoomInCatHome,
} from "@game/helpers/catHelpers";
import { tickUnderwaterVitals } from "@game/helpers/environmentHelpers";
import { triggerPlayerDeath } from "@game/helpers/gameHelpers";
import { canPlayerSeeInRoom } from "@game/helpers/visibilityHelpers";
import {
  buildMemoryNotification,
  enqueueNotification,
} from "@game/rules/notifications";
import { inventoryHas, removeFromAllBuckets } from "@game/rules/state";
import { TickContext } from "@game/types/context";
import { playerMemoryMap, playerScoreMap } from "../constants";
import {
  canMove,
  getRoomExits,
  isRoomDark,
  moveItemToRoom,
} from "../helpers/itemHelpers";
import { areGogglesOn } from "../helpers/itemSettingsHelpers";
import {
  applyStatusEffectToPlayer,
  removeStatusEffectFromPlayer,
} from "../rules/status";
import { applyRegisteredEnvironmentHazards } from "../registries/environmentHazardRegistry";
import {
  runRegisteredTurnTicks,
  type TurnTickPhase,
} from "../registries/turnTickRegistry";
import { getAnimateItems } from "../selectors/itemSelectors";
import {
  describeSicknessLevel,
  getHairyStatusMessage,
  getHornyStatusMessage,
  getPainStatusMessage,
  getSmarterStatusMessage,
  getStrongerStatusMessage,
} from "../selectors/statusSelectors";
import {
  pickRandomFromMsgArray,
  TRIXOPHINE_MESSAGES,
} from "../text/messageMaps";
import {
  getSyndromeXSignalFragment,
  SYNDROME_X_SIGNAL_FRAGMENT_COUNT,
  SYNDROME_X_SIGNAL_LOG_SOURCE,
  SYNDROME_X_SIGNAL_TRANSCRIPT_NOTE,
} from "../text/secretOrganismMessage";
import type { GameState, StatusEffect } from "../types/gameTypes";
import type { ItemId } from "../types/ids";
import { appendLog } from "./log";

export type TickEvent =
  | { kind: "log"; text: string }
  | { kind: "afterRoomDescription"; text: string };

function sicknessStage(s: number): number {
  if (s > 1900) return 0;
  if (s > 1700) return 1;
  if (s > 1500) return 2;
  if (s > 1200) return 3;
  if (s > 900) return 4;
  if (s > 700) return 5;
  if (s > 500) return 6;
  if (s > 300) return 7;
  if (s > 150) return 8;
  if (s > 100) return 9;
  if (s > 50) return 10;
  if (s > 25) return 11;
  if (s > 0) return 12;
  return 13;
}

const NORMAL_BODY_TEMPERATURE = 98.6;
const SYNDROME_X_MAX_TEMPERATURE = 102;
const SYNDROME_X_STAGE_TEMP_DELTA = 0.6;
const SYNDROME_X_TICK_TEMP_DELTA = 0.003;
const SYNDROME_X_STAGE_TEMP_DROP_DELTA = 3.1;
const SYNDROME_X_TICK_TEMP_DROP_DELTA = 0.08;
const SYNDROME_X_ORGANISM_ATTACK_DEATH_MESSAGE =
  "The darkness gathers in the back of your throat. Something inside you moves toward it, unfolding through your nerves before you can make a sound. For one impossible moment you feel it surround you from within, and then there is no you left for the dark to hold.";

function syndromeXTemperatureTarget(s: number): number {
  if (s <= 0 || s > 1900) return NORMAL_BODY_TEMPERATURE;
  if (s > 1700) return 98.8;
  if (s > 1500) return 99;
  if (s > 1200) return 99.3;
  if (s > 900) return 99.8;
  if (s > 700) return 100.2;
  if (s > 500) return 100.7;
  if (s > 300) return 101.3;
  if (s > 50) return SYNDROME_X_MAX_TEMPERATURE;
  if (s > 25) return 98.9;
  return NORMAL_BODY_TEMPERATURE;
}

function approachTemperatureTarget(
  current: number | undefined,
  target: number,
  stageTransitioned: boolean,
): number {
  const currentTemp = Math.min(
    current ?? NORMAL_BODY_TEMPERATURE,
    SYNDROME_X_MAX_TEMPERATURE,
  );
  const delta = target - currentTemp;
  if (delta === 0) return target;

  let maxDelta: number;
  if (delta > 0) {
    maxDelta = stageTransitioned
      ? SYNDROME_X_STAGE_TEMP_DELTA
      : SYNDROME_X_TICK_TEMP_DELTA;
  } else {
    maxDelta = stageTransitioned
      ? SYNDROME_X_STAGE_TEMP_DROP_DELTA
      : SYNDROME_X_TICK_TEMP_DROP_DELTA;
  }

  if (Math.abs(delta) <= maxDelta) return target;
  return currentTemp + Math.sign(delta) * maxDelta;
}

function nextSyndromeXTemperature(
  current: number | undefined,
  nextSickness: number,
  stageTransitioned: boolean,
): number {
  return approachTemperatureTarget(
    current,
    syndromeXTemperatureTarget(nextSickness),
    stageTransitioned,
  );
}

function markSyndromeXOrganismAwakened(state: GameState): GameState {
  const previous = state.worldState.syndromeX ?? { organismAwakened: false };

  if (previous.organismAwakened) return state;

  return {
    ...state,
    worldState: {
      ...state.worldState,
      syndromeX: {
        ...previous,
        organismAwakened: true,
        organismAwakenedAtMove: state.moves,
      },
    },
  };
}

function appendSyndromeXStageLog(state: GameState): GameState {
  let next = appendLog(state, describeSicknessLevel(state));
  const fragmentIndex = next.player.log.filter(
    (entry) => entry.source === SYNDROME_X_SIGNAL_LOG_SOURCE,
  ).length;
  const fragment = getSyndromeXSignalFragment(fragmentIndex);

  if (!fragment) {
    if (
      next.player.vitals.theSickness === 0 &&
      fragmentIndex >= SYNDROME_X_SIGNAL_FRAGMENT_COUNT
    ) {
      return markSyndromeXOrganismAwakened(next);
    }

    return next;
  }

  next = appendLog(next, SYNDROME_X_SIGNAL_TRANSCRIPT_NOTE);

  const withFragment: GameState = {
    ...next,
    player: {
      ...next.player,
      log: [
        ...next.player.log,
        {
          body: fragment,
          loggedAtTurn: next.moves,
          source: SYNDROME_X_SIGNAL_LOG_SOURCE,
          title: `Unidentified Signal Fragment ${String(fragmentIndex + 1).padStart(
            2,
            "0",
          )}`,
        },
      ],
    },
  };

  if (
    withFragment.player.vitals.theSickness === 0 &&
    fragmentIndex + 1 >= SYNDROME_X_SIGNAL_FRAGMENT_COUNT
  ) {
    return markSyndromeXOrganismAwakened(withFragment);
  }

  return withFragment;
}

export function applyStatusEffectTick(
  state: GameState,
  effect: StatusEffect,
): GameState {
  const vitals = state.player.vitals;
  let nextVitals = vitals;

  switch (effect.id) {
    case "regenerationWoozies": {
      const effect = state.player.statusEffects.find(
        (se) => se.id === "regenerationWoozies",
      );
      if (!effect) return state;
      if (effect.remainingTurns == null) break;

      const msg = getPainStatusMessage(effect.remainingTurns);

      if (msg) {
        const nextState: GameState = {
          ...state,
          player: { ...state.player },
        };
        return appendLog(nextState, msg);
      }

      break;
    }
    case "hyperaroused": {
      const effect = state.player.statusEffects.find(
        (se) => se.id === "hyperaroused",
      );
      if (!effect) return state;
      if (effect.remainingTurns == null) break;

      const msg = getHornyStatusMessage(effect.remainingTurns);
      let tempIncrease = 0;
      if (effect.remainingTurns === 68 || effect.remainingTurns === 49) {
        tempIncrease = 1;
      }
      if (effect.remainingTurns === 29 || effect.remainingTurns === 19) {
        tempIncrease = -1;
      }
      if (msg) {
        const nextState: GameState = {
          ...state,
          player: {
            ...state.player,
            vitals: {
              ...state.player.vitals,
              temperature: state.player.vitals.temperature + tempIncrease,
            },
          },
        };
        return appendLog(nextState, msg);
      }

      break;
    }
    case "explosive follicle growth": {
      const effect = state.player.statusEffects.find(
        (se) => se.id === "explosive follicle growth",
      );
      if (!effect) return state;
      if (effect.remainingTurns == null) break;

      const msg = getHairyStatusMessage(effect.remainingTurns);

      if (effect.remainingTurns === 1) {
        const nextState: GameState = {
          ...state,
          player: {
            ...state.player,
            mirror: {
              ...state.player.mirror,
              hasHair: true,
            },
          },
        };
        return msg ? appendLog(nextState, msg) : nextState;
      }

      if (msg) {
        return appendLog(state, msg);
      }
      break;
    }
    case "syndrome x": {
      const prevSickness = vitals.theSickness ?? 0;
      const prevStage = sicknessStage(prevSickness);
      const nextSickness =
        prevSickness === 0 ? 2000 : Math.max(0, prevSickness - 1);

      const nextStage = sicknessStage(nextSickness);
      const stageTransitioned = nextStage > prevStage;

      let nextHealth = vitals.health;
      const nextTemp = nextSyndromeXTemperature(
        vitals.temperature,
        nextSickness,
        stageTransitioned,
      );

      if (nextSickness <= 500 && nextSickness > 0) {
        if (nextSickness % 5 === 0) {
          nextHealth = Math.max(0, nextHealth - 1);
        }
      }

      nextVitals = {
        ...vitals,
        theSickness: nextSickness,
        temperature: nextTemp,
        health: nextHealth,
      };

      if (stageTransitioned) {
        const nextState: GameState = {
          ...state,
          player: { ...state.player, vitals: nextVitals },
        };
        return appendSyndromeXStageLog(nextState);
      }

      break;
    }

    case "smarter": {
      const msg = getSmarterStatusMessage(effect, state.moves);
      return msg ? appendLog(state, msg) : state;
    }

    case "stronger": {
      const msg = getStrongerStatusMessage(effect, state.moves);
      return msg ? appendLog(state, msg) : state;
    }

    case "radiation": {
      const damage = effect.intensity * 0.05;
      nextVitals = {
        ...vitals,
        health: Math.max(0, vitals.health - damage),
      };
      break;
    }
    case "trixophine": {
      const brainActivity = effect.remainingTurns === 1 ? 1 : 4;

      nextVitals = {
        ...vitals,
        brainActivity,
      };

      const nextState: GameState = {
        ...state,
        player: { ...state.player, vitals: nextVitals },
      };

      const n = Math.floor(Math.random() * 500) + 1;

      if (n <= 120) {
        const msg = pickRandomFromMsgArray(TRIXOPHINE_MESSAGES);
        return appendLog(nextState, msg);
      }
      return nextState;
    }
    case "bleeding": {
      const damage = effect.intensity;
      nextVitals = {
        ...vitals,
        health: Math.max(0, vitals.health - damage),
      };
      break;
    }

    case "smokeInhalation": {
      nextVitals = {
        ...vitals,
        oxygen: Math.max(0, vitals.oxygen - effect.intensity),
      };
      break;
    }

    case "drunk": {
      nextVitals = {
        ...vitals,
        drunkenness: Math.max(0, (vitals.drunkenness ?? 1) - 1),
      };
      break;
    }
    default:
      break;
  }

  if (nextVitals === vitals) return state;

  return {
    ...state,
    player: {
      ...state.player,
      vitals: nextVitals,
    },
  };
}

export function tickStatusEffects(state: GameState): GameState {
  const effects = state.player.statusEffects;
  if (!effects || effects.length === 0) return state;

  let nextState = state;
  const nextEffects: StatusEffect[] = [];

  for (const effect of effects) {
    nextState = applyStatusEffectTick(nextState, effect);

    if (effect.remainingTurns == null) {
      // indefinite duration
      nextEffects.push(effect);
      continue;
    }

    const newTurns = effect.remainingTurns - 1;
    if (newTurns > 0) {
      nextEffects.push({ ...effect, remainingTurns: newTurns });
    }
  }

  return {
    ...nextState,
    player: {
      ...nextState.player,
      statusEffects: nextEffects,
    },
  };
}

function tickSickness(state: GameState): GameState {
  const s0 = state.player.vitals.theSickness ?? 0;
  if (s0 <= 0) return state;

  const s1 = Math.max(0, s0 - 1);

  const stage0 = sicknessStage(s0);
  const stage1 = sicknessStage(s1);

  let next: GameState = {
    ...state,
    player: {
      ...state.player,
      vitals: {
        ...state.player.vitals,
        theSickness: s1,
      },
    },
  };

  if (stage1 > stage0) {
    const temp1 = nextSyndromeXTemperature(
      next.player.vitals.temperature,
      s1,
      true,
    );

    next = {
      ...next,
      player: {
        ...next.player,
        vitals: {
          ...next.player.vitals,
          temperature: temp1,
        },
      },
    };
    next = appendSyndromeXStageLog(next);
  }

  return next;
}

function tickSyndromeXOrganism(state: GameState): GameState {
  const syndromeX = state.worldState.syndromeX;

  if (!syndromeX?.organismAwakened) return state;
  if (syndromeX.organismAwakenedAtMove === state.moves) return state;
  if (canPlayerSeeInRoom(state, state.player.roomId)) return state;

  return triggerPlayerDeath(
    state,
    SYNDROME_X_ORGANISM_ATTACK_DEATH_MESSAGE,
    "organismAttack",
  );
}

function applyEffects(state: GameState): GameState {
  let next = state;

  // Import areGogglesOn from itemSettingsHelpers to use here
  const gogglesOn = areGogglesOn(next);
  const gogglesWorn = next.itemState.wornByPlayer.face === "NVGoggles";
  const shouldHaveNV = gogglesOn && gogglesWorn;

  const hasNV =
    next.player.statusEffects.filter((se) => se.id === "nightvision-active")
      ?.length > 0;

  if (shouldHaveNV && !hasNV) {
    next = applyStatusEffectToPlayer(next, "nightvision-active", 1, 1000);
    // TODO: addNonTickingStatusEffect(next, "nightvision-active")
  } else if (!shouldHaveNV && hasNV) {
    next = removeStatusEffectFromPlayer(next, "nightvision-active");
  }

  return next;
}

function tickAnimateActivities(state: GameState): GameState {
  let next = state;

  for (const item of getAnimateItems(next)) {
    const tick = item.overrides?.tick as
      | ((
          ctx: TickContext & {
            triggerPlayerDeath?: (msg: string, cause: string) => void;
          },
        ) => GameState | void)
      | undefined;
    if (!tick) continue;

    const ctxMoveItemToRoom = (itemId: string, toRoomId: string): GameState => {
      next = moveItemToRoom(next, itemId as ItemId, toRoomId);
      return next;
    };

    const ctxTriggerPlayerDeath = (
      deathMessage: string,
      cause: string,
    ): void => {
      next = triggerPlayerDeath(next, deathMessage, cause);
    };

    const result = tick({
      state: next,
      item,
      turn: next.moves,
      rng: next.rng,
      emit: (ev: TickEvent) => {
        if (!ev) return;
        if (ev.kind === "log") {
          next = appendLog(next, ev.text);
        }
      },

      moveItemToRoom: ctxMoveItemToRoom,
      triggerPlayerDeath: ctxTriggerPlayerDeath,
      getRoomExits: (roomId: string) => getRoomExits(next, roomId),
      canEnter: (it: { id: string }, roomId: any) =>
        canMove(next, it.id as ItemId, roomId),
      getPlayerRoomId: () => next.player.roomId,
      isRoomDark: (roomId: string) => isRoomDark(next, roomId),
    } as any);

    if (result) next = result;
  }

  return next;
}

function tickAttachedItems(state: GameState): GameState {
  let next = state;
  const entries = Object.entries(next.itemState.attachedTo ?? {});

  for (const [childId, hostId] of entries) {
    if (!hostId) continue;

    const hostRoomId =
      hostId === "INVENTORY"
        ? next.player.roomId
        : (next.itemState.itemRoomId[hostId] ??
          (hostId === "PLAYER" ? next.player.roomId : undefined));

    if (!hostRoomId) continue;

    if (inventoryHas(next.player.inventory, childId)) {
      next = {
        ...next,
        player: {
          ...next.player,
          inventory: removeFromAllBuckets(next.player.inventory, childId),
        },
      };
    }

    next = moveItemToRoom(next, childId as ItemId, hostRoomId);
  }

  return next;
}

function tickHeldCat(state: GameState): GameState {
  if (!isCatHeld(state)) {
    return clearCatHeldTurns(state);
  }

  const heldTurns = (state.worldState.catState.heldTurns ?? 0) + 1;
  let next: GameState = {
    ...state,
    worldState: {
      ...state.worldState,
      catState: {
        ...state.worldState.catState,
        heldTurns,
      },
    },
  };

  if (heldTurns === 2) {
    return appendLog(
      next,
      "The cat begins to fidget in your arms, shifting his paws against you.",
    );
  }

  if (heldTurns === 4) {
    return appendLog(
      next,
      "The cat squirms more urgently, clearly deciding he has tolerated this long enough.",
    );
  }

  if (heldTurns < 5) {
    return next;
  }

  const landingRoomId = isRoomInCatHome(next, next.player.roomId)
    ? next.player.roomId
    : (getCatSafeRoomId(next) ?? next.player.roomId);
  const jumpsAway = landingRoomId !== next.player.roomId;

  next = moveItemToRoom(next, CAT_ID, landingRoomId);
  next = clearCatHeldTurns({
    ...next,
    itemState: {
      ...next.itemState,
      attachedTo: {
        ...next.itemState.attachedTo,
        [CAT_ID]: undefined,
      },
      itemRoomId: {
        ...next.itemState.itemRoomId,
        [CAT_ID]: landingRoomId,
      },
    },
  });

  return appendLog(
    next,
    jumpsAway
      ? "The cat twists out of your arms, lands neatly, and darts away toward more familiar territory."
      : "The cat twists out of your arms and jumps lightly down to the floor.",
  );
}

function updateCurrentScore(state: GameState): GameState {
  let calculatedScore = 0;

  for (const key of Object.keys(
    playerScoreMap,
  ) as (keyof typeof playerScoreMap)[]) {
    if (state.worldState.scoresTriggered?.[key]) {
      calculatedScore += playerScoreMap[key].value;
    }
  }

  return calculatedScore === state.score
    ? state
    : { ...state, score: calculatedScore };
}

function updateCurrentMemory(state: GameState): GameState {
  let calculatedMemory = 0;

  for (const key of Object.keys(
    playerMemoryMap,
  ) as (keyof typeof playerMemoryMap)[]) {
    if (state.player.memoriesTriggered?.[key]) {
      calculatedMemory += playerMemoryMap[key].value;
    }
  }

  if (calculatedMemory === state.rating) return state;

  const next = { ...state, rating: calculatedMemory };
  if (calculatedMemory < state.rating) return next;

  return enqueueNotification(
    next,
    buildMemoryNotification(calculatedMemory - state.rating),
  );
}

function tickScoreAndMemory(state: GameState): GameState {
  let next: GameState = state;
  next = updateCurrentScore(next);
  next = updateCurrentMemory(next);
  return next;
}

function applyRegisteredTurnTickPhase(
  state: GameState,
  phase: TurnTickPhase,
): GameState {
  const registeredTicks = runRegisteredTurnTicks(state, phase);
  let next = registeredTicks.state;

  for (const message of registeredTicks.messages) {
    next = appendLog(next, message);
  }

  return next;
}

export function advanceTurn(state: GameState): GameState {
  let next = state;

  if (next.worldState.activeExperience) {
    const tickedExperience = tickActiveExperience(next);
    next = tickedExperience.state;

    if (tickedExperience.message) {
      next = appendLog(next, tickedExperience.message);
    }

    if (next.worldState.activeExperience) {
      next = tickNpcIdleActions(next);
    }

    return {
      ...next,
      moves: next.moves + 1,
    };
  }

  next = applyRegisteredTurnTickPhase(next, "conversation");
  next = tickFlashlights(next);
  next = applyRegisteredTurnTickPhase(next, "environment");
  next = tickAttachedItems(next);
  next = applyEffects(next);
  next = tickUnderwaterVitals(next);
  next = applyRegisteredEnvironmentHazards(next);

  next = tickStatusEffects(next);
  next = tickSickness(next);
  next = tickSyndromeXOrganism(next);
  next = tickAnimateActivities(next);
  next = tickHeldCat(next);
  next = applyRegisteredTurnTickPhase(next, "simulation");
  next = applyRegisteredTurnTickPhase(next, "late");
  next = tickNpcIdleActions(next);

  next = emitAdjacentAudioCues(next, {
    registry: audioRegistry,
    maxLinesPerTick: 1,
    chance: 0.7,
  });
  next = tickScoreAndMemory(next);
  next = {
    ...next,
    moves: next.moves + 1,
  };
  return next;
}
