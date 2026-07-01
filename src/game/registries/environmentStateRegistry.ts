import type { GameState } from "@game/types/gameTypes";
import {
  AQUARIUM_BREATHER_ITEM_ID,
  isAquariumUnderwaterRoom,
} from "src/world/zoneRegistrations";

type OxygenEnvironmentRule = {
  hasBreathingSupport: (state: GameState) => boolean;
  isActive: (state: GameState) => boolean;
};

const OXYGEN_ENVIRONMENT_RULES: OxygenEnvironmentRule[] = [
  {
    isActive: (state) => isAquariumUnderwaterRoom(state.player.roomId),
    hasBreathingSupport: (state) =>
      state.itemState.wornByPlayer.face === AQUARIUM_BREATHER_ITEM_ID ||
      state.itemState.wornByPlayer.head === AQUARIUM_BREATHER_ITEM_ID,
  },
];

export function isPlayerInRegisteredOxygenHazard(
  state: GameState,
): boolean {
  return OXYGEN_ENVIRONMENT_RULES.some((rule) => rule.isActive(state));
}

export function playerHasRegisteredBreathingSupport(
  state: GameState,
): boolean {
  return OXYGEN_ENVIRONMENT_RULES.some((rule) =>
    rule.hasBreathingSupport(state),
  );
}
