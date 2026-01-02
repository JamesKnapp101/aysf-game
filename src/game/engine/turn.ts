import {
  canMove,
  getRoomExits,
  isRoomDark,
  moveItemToRoom,
} from "../helpers/itemHelpers";
import {
  applyStatusEffectToPlayer,
  removeStatusEffectFromPlayer,
} from "../rules/status";
import { getAnimateItems } from "../selectors/itemSelectors";
import {
  describeSicknessLevel,
  getPainStatusMessage,
} from "../selectors/statusSelectors";
import {
  pickRandomFromMsgArray,
  TRIXOPHINE_MESSAGES,
} from "../text/messageMaps";
import type { GameState, StatusEffect } from "../types/gameTypes";
import type { ItemId } from "../types/ids";
import { appendLog } from "./handleCommand";

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

export function applyStatusEffectTick(
  state: GameState,
  effect: StatusEffect
): GameState {
  const vitals = state.player.vitals;
  let nextVitals = vitals;

  switch (effect.id) {
    case "regenerationWoozies": {
      const effect = state.player.statusEffects.find(
        (se) => se.id === "regenerationWoozies"
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
    case "virus": {
      const prevSickness = vitals.theSickness ?? 0;
      const prevStage = sicknessStage(prevSickness);
      const nextSickness =
        prevSickness === 0 ? 2000 : Math.max(0, prevSickness - 1);

      const nextStage = sicknessStage(nextSickness);
      const stageTransitioned = nextStage > prevStage;

      let nextHealth = vitals.health;
      let nextTemp = vitals.temperature ?? 98.6;

      if (nextSickness <= 500 && nextSickness > 0) {
        if (nextSickness % 5 === 0) {
          nextHealth = Math.max(0, nextHealth - 1);
        }
      }

      if (stageTransitioned) {
        nextTemp = Math.min(105, nextTemp + 0.6);
      }

      if (!stageTransitioned && nextStage >= 2 && nextTemp < 105) {
        nextTemp = Math.min(105, nextTemp + 0.003);
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
        return appendLog(nextState, describeSicknessLevel(nextState));
      }

      break;
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

      let nextState: GameState = {
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
        drunkenness: Math.max(0, vitals?.drunkenness ?? 1 - 1),
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
    const temp0 = next.player.vitals.temperature ?? 98.6;
    const delta = 0.6;
    const temp1 = Math.min(106, temp0 + delta);

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
    next = appendLog(next, describeSicknessLevel(next));
  }

  return next;
}

function applyEffects(state: GameState): GameState {
  let next = state;

  const gogglesOn = !!(next.itemState.itemSettings["NVGoggles"] as any)?.isOn;
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
    const tick = item.overrides?.tick;
    if (!tick) continue;

    const updated = tick({
      state: next,
      item,
      turn: next.moves,
      rng: next.rng,
      emit: (_ev: any) => {
        // optional: next = { ...next, log: [...next.log, ...] }
      },
      moveItemToRoom: (itemId: string, roomId: string) => {
        next = moveItemToRoom(next, itemId as ItemId, roomId);
      },
      getRoomExits: (roomId: string) => getRoomExits(next, roomId),
      canEnter: (it: { id: string }, roomId: any) =>
        canMove(next, it.id as ItemId, roomId),
      getPlayerRoomId: () => next.player.roomId,
      isRoomDark: (roomId: string) => isRoomDark(next, roomId),
    });

    if (updated) next = updated;
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
        : next.itemState.itemRoomId[hostId] ??
          (hostId === "PLAYER" ? next.player.roomId : undefined);

    if (!hostRoomId) continue;

    if (next.player.inventory.includes(childId)) {
      next = {
        ...next,
        player: {
          ...next.player,
          inventory: next.player.inventory.filter((id) => id !== childId),
        },
      };
    }
    next = moveItemToRoom(next, childId as ItemId, hostRoomId);
  }

  return next;
}

export function advanceTurn(state: GameState): GameState {
  let next = state;
  next = tickAttachedItems(next);
  next = applyEffects(next);
  next = tickStatusEffects(next);
  next = tickSickness(next);
  next = tickAnimateActivities(next);
  next = {
    ...next,
    moves: next.moves + 1,
  };
  return next;
}
