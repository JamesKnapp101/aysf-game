import { resolveItemByNoun } from "../../rules/scope";
import type { ActionResult } from "../../types/actionsTypes";
import type { GameState } from "../../types/gameTypes";
import type { ParsedCommand } from "../../types/parserTypes";

export function doSet(state: GameState, cmd: ParsedCommand): ActionResult {
  if (cmd.type !== "action" || cmd.verb !== "set") {
    return { state, message: "You can't do that." };
  }

  const direct = cmd.direct?.trim();
  if (!direct) {
    return { state, message: "Set what?" };
  }

  const item = resolveItemByNoun(state, direct);
  if (!item || !item.isSettable) {
    return { state, message: "There's nothing to set." };
  }

  const setOverride = item.overrides?.set;
  if (typeof setOverride === "function") {
    const out = setOverride({ state, item, cmd });

    if (typeof out === "string") {
      return { state, message: out };
    }

    return {
      state: out?.state ?? state,
      message: out?.message ?? "Nothing happens.",
      overlay: out?.overlay,
      consumesTurn: out?.consumesTurn,
    };
  }

  if (typeof setOverride === "string") {
    return { state, message: setOverride };
  }

  return { state };
}
