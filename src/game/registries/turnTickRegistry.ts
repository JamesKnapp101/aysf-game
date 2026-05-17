import type { GameState } from "@game/types/gameTypes";
import { tickBarJukebox } from "src/world/maps/levelThree/Park/Bar/barJukebox";

type TurnTickResult = {
  messages?: string[];
  state: GameState;
};

type TurnTickHandler = (state: GameState) => TurnTickResult;

const TURN_TICK_HANDLERS: TurnTickHandler[] = [tickBarJukebox];

export function runRegisteredTurnTicks(state: GameState): {
  messages: string[];
  state: GameState;
} {
  let next = state;
  const messages: string[] = [];

  for (const handler of TURN_TICK_HANDLERS) {
    const result = handler(next);
    next = result.state;
    messages.push(...(result.messages ?? []));
  }

  return { state: next, messages };
}
