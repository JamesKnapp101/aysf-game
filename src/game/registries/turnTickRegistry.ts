import type { GameState } from "@game/types/gameTypes";
import { tickAviarySpotlight } from "@game/engine/ticks/aviaryTick";
import { tickHydroponics } from "@game/engine/ticks/hydroponicsTick";
import { tickRadioConversation } from "@game/helpers/conversationHelpers";
import { tickGamePreserveAnimals } from "@game/preserve/preserveAnimals";
import { tickGamePreserveFeedback } from "@game/preserve/preserveFeedback";
import { tickGamePreserveRun } from "@game/preserve/preserveState";
import {
  tickBarJukebox,
  tickDeepStorageExposure,
  tickLevelSixStorageVacuum,
  tickLevelTwoBomb,
  tickMovieTheaterProjectionLighting,
  tickMovieTheaterUsher,
  tickReactorConsensus,
  tickReactorSystems,
} from "src/world/zoneRegistrations";

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

function tickAviarySpotlightTurn(state: GameState): TurnTickResult {
  return { state: tickAviarySpotlight(state) };
}

function tickGamePreserveTurn(state: GameState): TurnTickResult {
  let next = tickGamePreserveAnimals(state);
  next = tickGamePreserveFeedback(next);
  next = tickGamePreserveRun(next);

  return { state: next };
}

const TURN_TICK_HANDLERS: RegisteredTurnTickHandler[] = [
  { phase: "conversation", tick: tickRadioConversationTurn },
  { phase: "environment", tick: tickAviarySpotlightTurn },
  { phase: "environment", tick: tickHydroponicsTurn },
  { phase: "environment", tick: tickLevelTwoBomb },
  { phase: "environment", tick: tickReactorConsensus },
  { phase: "environment", tick: tickLevelSixStorageVacuum },
  { phase: "environment", tick: tickDeepStorageExposure },
  { phase: "environment", tick: tickMovieTheaterProjectionLighting },
  { phase: "simulation", tick: tickGamePreserveTurn },
  { phase: "late", tick: tickBarJukebox },
  { phase: "late", tick: tickMovieTheaterUsher },
  { phase: "late", tick: tickReactorSystems },
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
