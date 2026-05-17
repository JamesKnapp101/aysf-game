import type { GameState } from "@game/types/gameTypes";
import { tickHydroponicsSpiderThreat } from "src/world/Items/creatures/giantSpider";
import { tickHydroponicsCocoonPuzzle } from "src/world/maps/levelSix/hydroponicsPuzzle";

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
