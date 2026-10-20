import type { GameState } from "@game/types/gameTypes";
import { tickChefSampleDanger } from "src/world/zoneRegistrations";

type CoolerModeEffect = (state: GameState) => GameState;

const COOLER_MODE_EFFECTS: CoolerModeEffect[] = [
  (state) => tickChefSampleDanger(state).state,
];

/** Free temperature controls can change biological safety without advancing time. */
export function applyRegisteredCoolerModeEffects(state: GameState): GameState {
  return COOLER_MODE_EFFECTS.reduce((next, effect) => effect(next), state);
}
