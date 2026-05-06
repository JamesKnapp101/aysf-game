import { abortActiveExperience } from "@game/experiences/experienceRegistry";
import type { ActionResult } from "../../types/actionsTypes";
import type { GameState } from "../../types/gameTypes";
import type { ParsedCommand } from "../../types/parserTypes";

export function doAbort(state: GameState, cmd: ParsedCommand): ActionResult {
  if (cmd.type !== "action" || cmd.verb !== "abort") {
    return { state, message: "You can't do that." };
  }

  const result = abortActiveExperience(state);

  return {
    state: result.state,
    message: result.message,
    consumesTurn: false,
  };
}
