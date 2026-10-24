import type { GameState } from "@game/types/gameTypes";
import { operateReactorTerminal, reactorTerminalView, REACTOR_TERMINAL_INITIAL_MESSAGE, synchronizeWalkInFreezer } from "src/world/zoneRegistrations";

const POWER_STATE_EFFECTS: ((state: GameState) => GameState)[] = [
  synchronizeWalkInFreezer,
];

export function synchronizeRegisteredPowerEffects(state: GameState): GameState {
  return POWER_STATE_EFFECTS.reduce((next, effect) => effect(next), state);
}

/** Zone-specific terminal rules stay registered at the world integration boundary. */
export const reactorTerminalRules = {
  operate: operateReactorTerminal,
  view: reactorTerminalView,
  initialMessage: REACTOR_TERMINAL_INITIAL_MESSAGE,
};
