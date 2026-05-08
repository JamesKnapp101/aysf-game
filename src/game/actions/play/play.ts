import { resolveItemByNoun } from "../../rules/scope";
import type { ActionResult } from "../../types/actionsTypes";
import type { GameState } from "../../types/gameTypes";
import type { ParsedCommand } from "../../types/parserTypes";

const EEGLER_GUITAR_PLAY_MESSAGE =
  "Your fingers seem to find the positions on their own, muscle memory, maybe. You're not sure that you were a good guitar player, but you know, or part of you knows, how to play the guitar.";

function stripLeadingArticle(text: string): string {
  return text.replace(/^(?:the|a|an)\s+/i, "").trim();
}

export function doPlay(state: GameState, cmd: ParsedCommand): ActionResult {
  if (cmd.type !== "action" || cmd.verb !== "play") {
    return { state, message: "You can't do that." };
  }

  const direct = cmd.direct?.trim();
  if (!direct) {
    return { state, message: "Play what?" };
  }

  const item =
    resolveItemByNoun(state, direct) ??
    resolveItemByNoun(state, stripLeadingArticle(direct));

  if (!item) {
    return { state, message: "You don't see that here." };
  }

  if (item.id !== "EeglerGuitar") {
    return { state, message: "You can't play that." };
  }

  return {
    state,
    message: EEGLER_GUITAR_PLAY_MESSAGE,
  };
}
