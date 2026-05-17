import {
  isPlayerUnderwater,
  playerHasBreather,
} from "@game/helpers/environmentHelpers";
import { triggerPlayerDeath } from "@game/helpers/gameHelpers";
import type { GameState } from "@game/types/gameTypes";
import {
  AQUARIUM_DROWNING_DEATH_CAUSE,
  AQUARIUM_DROWNING_DEATH_MESSAGE,
} from "src/world/Items/creatures/octopus";

type EnvironmentHazardRule = (state: GameState) => GameState;

const ENVIRONMENT_HAZARD_RULES: EnvironmentHazardRule[] = [
  (state) => {
    if (
      state.player.vitals.health > 0 ||
      state.player.vitals.oxygen > 0 ||
      !isPlayerUnderwater(state) ||
      playerHasBreather(state)
    ) {
      return state;
    }

    return triggerPlayerDeath(
      state,
      AQUARIUM_DROWNING_DEATH_MESSAGE,
      AQUARIUM_DROWNING_DEATH_CAUSE,
    );
  },
];

export function applyRegisteredEnvironmentHazards(
  state: GameState,
): GameState {
  return ENVIRONMENT_HAZARD_RULES.reduce(
    (next, rule) => rule(next),
    state,
  );
}
