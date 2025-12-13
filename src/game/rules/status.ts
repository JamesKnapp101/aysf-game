import type { GameState, StatusEffect, StatusId } from "../types/gameTypes";

export function applyStatusEffectToPlayer(
  state: GameState,
  effectId: StatusId,
  turns: number
): GameState {
  const newEffect: StatusEffect = {
    id: effectId,
    intensity: 1,
    remainingTurns: turns,
  };

  return {
    ...state,
    player: {
      ...state.player,
      statusEffects: [...state.player.statusEffects, newEffect],
      vitals: {
        ...state.player.vitals,
        theSickness:
          effectId === "virus"
            ? (state.player.vitals.theSickness ?? 0) + turns
            : state.player.vitals.theSickness,
      },
    },
  };
}

export function removeStatusEffectFromPlayer(
  state: GameState,
  effectId: StatusId
): GameState {
  let changed = false;

  const nextEffects = state.player.statusEffects.map((effect) => {
    if (effect.id !== effectId) return effect;

    changed = true;

    return {
      ...effect,
      remainingTurns: 1,
    };
  });

  // If nothing changed, return original state to avoid pointless churn
  if (!changed) {
    return state;
  }

  return {
    ...state,
    player: {
      ...state.player,
      statusEffects: nextEffects,
    },
  };
}
