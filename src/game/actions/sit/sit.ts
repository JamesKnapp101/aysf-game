import { resolveItemByNoun } from "@game/rules/scope";
import type { ActionResult } from "@game/types/actionsTypes";
import type { GameState } from "@game/types/gameTypes";
import type { ParsedCommand } from "@game/types/parserTypes";

export function doSit(state: GameState, cmd: ParsedCommand): ActionResult {
  if (cmd.type !== "action" || cmd.verb !== "sit") {
    return { state, message: "You can't do that." };
  }

  if (cmd.preposition && cmd.preposition !== "on") {
    return { state, message: `Sit ${cmd.preposition} what?` };
  }

  const target = cmd.indirect?.trim() ?? cmd.direct?.trim();
  if (!target) {
    return { state, message: "Sit on what?" };
  }

  const item = resolveItemByNoun(state, target);
  if (!item) {
    return { state, message: "You don't see that here." };
  }

  const override = item.overrides?.siton;
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
    message: `You can't sit on that.`,
  };
}
