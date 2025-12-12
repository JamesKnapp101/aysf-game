import type { GameState, StatusEffect } from "../types/gameTypes";
import { appendLog } from "./handleCommand";

export function applyStatusEffectTick(
  state: GameState,
  effect: StatusEffect
): GameState {
  const vitals = state.player.vitals;
  let nextVitals = vitals;

  switch (effect.id) {
    case "trixophine": {
      let brainActivity = 4;
      if (effect.remainingTurns === 1) {
        brainActivity = 1;
      }
      nextVitals = {
        ...vitals,
        brainActivity: brainActivity,
      };
      const n = Math.floor(Math.random() * 1000) + 1;
      const nextState = {
        ...state,
        player: { ...state.player, vitals: nextVitals },
      };
      if (n === 1) {
        return appendLog(
          nextState,
          `A voice whispers in your ear: "Call me at 697442..."\n\nYou turn around, disoriented, but there's no one there.`
        );
      }
      if (n < 200) {
        return appendLog(nextState, "You giggle uncontrollably for a moment.");
      }
      if (n < 350) {
        return appendLog(
          nextState,
          "You feel a sudden wave of paranoia. Are you being watched..?"
        );
      }
      if (n < 500) {
        return appendLog(
          nextState,
          "Colors around you seem to shift and breathe in an unsettling way..."
        );
      }
      break;
    }
    case "bleeding": {
      const damage = effect.intensity; // 1–3, etc.
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
        brainActivity: Math.min(5, vitals.brainActivity + 1),
      };
      break;
    }

    // add other statusIds as needed

    default:
      // Some statuses might just be flags, no per-turn change.
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
    // 1) Apply the per-turn impact
    nextState = applyStatusEffectTick(nextState, effect);

    // 2) Decrement remainingTurns / decide whether to keep it
    if (effect.remainingTurns == null) {
      // indefinite duration
      nextEffects.push(effect);
      continue;
    }

    const newTurns = effect.remainingTurns - 1;
    if (newTurns > 0) {
      nextEffects.push({ ...effect, remainingTurns: newTurns });
    }
    // if <= 0, it expires and is dropped
  }

  return {
    ...nextState,
    player: {
      ...nextState.player,
      statusEffects: nextEffects,
    },
  };
}

export function advanceTurn(state: GameState): GameState {
  let next = state;

  // 1) Tick status effects
  next = tickStatusEffects(next);

  // 2) Tick any threat timers / world countdowns
  // next = tickThreatTimers(next);  // when you implement those

  // 3) Increment move counter
  next = {
    ...next,
    moves: next.moves + 1,
  };

  return next;
}
