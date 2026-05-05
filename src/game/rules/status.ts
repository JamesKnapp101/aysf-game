import type { GameState, StatusEffect, StatusId } from "../types/gameTypes";

function getBrainActivityEffect(effectId: StatusId): number {
  switch (effectId) {
    case "drunk":
    case "vanitrax":
      return 3;
    case "possessed":
      return 5;
    case "trixophine":
      return 4;
    default:
      return 1;
  }
}

export function applyStatusEffectToPlayer(
  state: GameState,
  effectId: StatusId,
  intensity: number,
  turns: number,
): GameState {
  const effects = state.player.statusEffects;
  const idx = effects.findIndex((se) => se.id === effectId);

  let nextEffects: StatusEffect[];

  if (idx >= 0) {
    const existing = effects[idx];
    const newIntensity = existing.intensity + intensity;
    const addedTurns = turns; // * (newIntensity * 0.05);

    const updated: StatusEffect = {
      ...existing,
      intensity: newIntensity,
      remainingTurns: (existing.remainingTurns ?? 0) + addedTurns,
    };

    nextEffects = effects.map((se, i) => (i === idx ? updated : se));
  } else {
    const addedTurns = turns; // * (intensity * 0.05);

    const newEffect: StatusEffect = {
      id: effectId,
      intensity,
      remainingTurns: addedTurns,
    };

    nextEffects = [...effects, newEffect];
  }

  return {
    ...state,
    player: {
      ...state.player,
      statusEffects: nextEffects,
      vitals: {
        ...state.player.vitals,
        theSickness:
          effectId === "syndrome x"
            ? (state.player.vitals.theSickness ?? 0) + turns
            : state.player.vitals.theSickness,
        brainActivity: getBrainActivityEffect(effectId),
      },
    },
  };
}

export function removeStatusEffectFromPlayer(
  state: GameState,
  effectId: StatusId,
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
