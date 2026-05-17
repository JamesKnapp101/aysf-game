import type { GameState } from "@game/types/gameTypes";
import { tickHydroponics } from "@game/engine/ticks/hydroponicsTick";
import { tickRadioConversation } from "@game/helpers/conversationHelpers";
import { tickGamePreserveAnimals } from "@game/preserve/preserveAnimals";
import { tickGamePreserveFeedback } from "@game/preserve/preserveFeedback";
import { tickGamePreserveRun } from "@game/preserve/preserveState";
import { tickBarJukebox } from "src/world/maps/levelThree/Park/Bar/barJukebox";

export type TurnTickPhase =
  | "conversation"
  | "environment"
  | "simulation"
  | "late";

type TurnTickResult = {
  messages?: string[];
  state: GameState;
};

type TurnTickHandler = (state: GameState) => TurnTickResult;

type RegisteredTurnTickHandler = {
  phase: TurnTickPhase;
  tick: TurnTickHandler;
};

function tickRadioConversationTurn(state: GameState): TurnTickResult {
  const ticked = tickRadioConversation(state);

  return {
    state: ticked.state,
    messages: ticked.ended
      ? ["The radio channel collapses into a steady hiss, then goes quiet."]
      : [],
  };
}

function tickHydroponicsTurn(state: GameState): TurnTickResult {
  return { state: tickHydroponics(state) };
}

function tickGamePreserveTurn(state: GameState): TurnTickResult {
  let next = tickGamePreserveAnimals(state);
  next = tickGamePreserveFeedback(next);
  next = tickGamePreserveRun(next);

  return { state: next };
}

const TURN_TICK_HANDLERS: RegisteredTurnTickHandler[] = [
  { phase: "conversation", tick: tickRadioConversationTurn },
  { phase: "environment", tick: tickHydroponicsTurn },
  { phase: "simulation", tick: tickGamePreserveTurn },
  { phase: "late", tick: tickBarJukebox },
];

export function runRegisteredTurnTicks(
  state: GameState,
  phase: TurnTickPhase = "late",
): {
  messages: string[];
  state: GameState;
} {
  let next = state;
  const messages: string[] = [];

  for (const handler of TURN_TICK_HANDLERS) {
    if (handler.phase !== phase) continue;

    const result = handler.tick(next);
    next = result.state;
    messages.push(...(result.messages ?? []));
  }

  return { state: next, messages };
}
