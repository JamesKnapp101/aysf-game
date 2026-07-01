import type { GameState } from "@game/types/gameTypes";
import {
  tickHydroponicsCocoonPuzzle,
  tickHydroponicsSpiderThreat,
} from "src/world/zoneRegistrations";

export function tickRegisteredHydroponicsSpiderThreat(state: GameState): {
  deathCause?: string;
  deathMessage?: string;
  state: GameState;
} {
  return tickHydroponicsSpiderThreat(state);
}

export function tickRegisteredHydroponicsCocoonPuzzle(state: GameState): {
  deathCause?: string;
  deathMessage?: string;
  state: GameState;
} {
  return tickHydroponicsCocoonPuzzle(state);
}
