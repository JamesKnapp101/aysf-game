import { describeSicknessLevel } from "../selectors/statusSelectors";
import type { GameState, StatusEffect } from "../types/gameTypes";
import { appendLog } from "./handleCommand";

function sicknessStage(s: number): number {
  // higher stage = worse (near 0)
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
    case "virus": {
      nextVitals = {
        ...vitals,
        theSickness: !vitals?.theSickness ? 2000 : vitals.theSickness - 1,
      };
      break;
    }
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

function tickSickness(state: GameState): GameState {
  const s0 = state.player.vitals.theSickness ?? 0;
  if (s0 <= 0) return state; // already at terminal stage; nothing to tick

  const s1 = Math.max(0, s0 - 1);

  const stage0 = sicknessStage(s0);
  const stage1 = sicknessStage(s1);

  // Always update the timer
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

  // If we crossed into a worse stage, bump temperature and optionally message
  if (stage1 > stage0) {
    const temp0 = next.player.vitals.temperature ?? 98.6;

    // tune this: per-stage fever bump
    const delta = 0.6; // degrees F
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

    // If you want the player to *notice* stage transitions, log here:
    next = appendLog(next, describeSicknessLevel(next));
  }

  return next;
}

export function advanceTurn(state: GameState): GameState {
  let next = state;

  // 1) Tick status effects
  next = tickStatusEffects(next);

  // 2) Tick sickness progression
  next = tickSickness(next);

  // 3) Increment move counter
  next = {
    ...next,
    moves: next.moves + 1,
  };

  return next;
}
