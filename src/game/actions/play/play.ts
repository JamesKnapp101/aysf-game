import { resolveItemByNoun } from "../../rules/scope";
import type { ActionResult } from "../../types/actionsTypes";
import type { GameState } from "../../types/gameTypes";
import type { ParsedCommand } from "../../types/parserTypes";

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

  const override = item.overrides?.play;
  if (typeof override === "function") {
    const out = override({ state, item, cmd });
    if (typeof out === "string") return { state, message: out };

    return {
      state: out?.state ?? state,
      message: out?.message ?? "You can't play that.",
      consumesTurn: out?.consumesTurn,
      overlay: out?.overlay,
    };
  }

  if (typeof override === "string") {
    return { state, message: override };
  }

  return { state, message: "You can't play that." };
}
