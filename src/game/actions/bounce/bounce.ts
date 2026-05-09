import { resolveItemByNoun } from "@game/rules/scope";
import type { ActionResult } from "@game/types/actionsTypes";
import type { GameState } from "@game/types/gameTypes";
import type { ParsedCommand } from "@game/types/parserTypes";

export function doBounce(state: GameState, cmd: ParsedCommand): ActionResult {
  if (cmd.type !== "action" || cmd.verb !== "bounce") {
    return { state, message: "You can't do that." };
  }

  const target = cmd.direct?.trim() ?? cmd.indirect?.trim();
  if (!target) {
    return { state, message: "Bounce what?" };
  }

  const item = resolveItemByNoun(state, target);
  if (!item) {
    return { state, message: "You don't see that here." };
  }

  const override = item.overrides?.bounce;
  if (typeof override === "function") {
    const out = override({ state, item, cmd });
    if (typeof out === "string") return { state, message: out };

    return {
      state: out?.state ?? state,
      message: out?.message ?? "Nothing happens.",
      consumesTurn: out?.consumesTurn,
    };
  }

  if (typeof override === "string") {
    return { state, message: override };
  }

  return {
    state,
    message: `You bounce the ${item.name}, but it doesn't do much.`,
  };
}
