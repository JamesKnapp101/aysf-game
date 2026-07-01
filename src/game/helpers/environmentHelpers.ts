import { applyPlayerDamage } from "@game/rules/damage";
import {
  isPlayerInRegisteredOxygenHazard,
  playerHasRegisteredBreathingSupport,
} from "@game/registries/environmentStateRegistry";
import type { GameState } from "@game/types/gameTypes";

export const AQUARIUM_OXYGEN_LOSS_PER_TURN = 15;
export const AQUARIUM_DROWNING_DAMAGE_PER_TURN = 20;

export function playerHasBreather(state: GameState): boolean {
  return playerHasRegisteredBreathingSupport(state);
}

export function isPlayerUnderwater(state: GameState): boolean {
  return isPlayerInRegisteredOxygenHazard(state);
}

export function isPlayerInVacuum(state: GameState): boolean {
  return state.worldState.roomAirQuality[state.player.roomId] === "vacuum";
}

export function refreshPlayerOxygenForEnvironment(state: GameState): GameState {
  const shouldRefillOxygen =
    (!isPlayerUnderwater(state) && !isPlayerInVacuum(state)) ||
    playerHasBreather(state);
  if (!shouldRefillOxygen || state.player.vitals.oxygen === 100) {
    return state;
  }

  return {
    ...state,
    player: {
      ...state.player,
      vitals: {
        ...state.player.vitals,
        oxygen: 100,
      },
    },
  };
}

export function tickUnderwaterVitals(state: GameState): GameState {
  if (!isPlayerUnderwater(state) || playerHasBreather(state)) {
    return state;
  }

  const oxygen = state.player.vitals.oxygen;
  if (oxygen > 0) {
    return {
      ...state,
      player: {
        ...state.player,
        vitals: {
          ...state.player.vitals,
          oxygen: Math.max(0, oxygen - AQUARIUM_OXYGEN_LOSS_PER_TURN),
        },
      },
    };
  }

  return applyPlayerDamage(state, AQUARIUM_DROWNING_DAMAGE_PER_TURN);
}
