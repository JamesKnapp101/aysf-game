import { resolveItemByNoun } from "@game/rules/scope";
import type { ActionResult } from "@game/types/actionsTypes";
import type { GameState } from "@game/types/gameTypes";
import type { ParsedCommand } from "@game/types/parserTypes";

const FALLBACK_SMELL_MESSAGE = "You don't smell anything unusual.";

export function doSmell(state: GameState, cmd: ParsedCommand): ActionResult {
  if (cmd.type !== "action" || cmd.verb !== "smell") {
    return { state, message: "You can't do that." };
  }

  const target = cmd.direct?.trim() ?? cmd.indirect?.trim();
  if (!target) {
    return { state, message: "Smell what?" };
  }

  const item = resolveItemByNoun(state, target);
  if (!item) {
    return { state, message: "You don't smell that here." };
  }

  const override = item.overrides?.smell;
  if (typeof override === "function") {
    const out = override({ state, item, cmd });
    if (typeof out === "string") return { state, message: out };

    return {
      state: out?.state ?? state,
      message: out?.message ?? FALLBACK_SMELL_MESSAGE,
      consumesTurn: out?.consumesTurn,
      overlay: out?.overlay,
    };
  }

  if (typeof override === "string") {
    return { state, message: override };
  }

  return { state, message: FALLBACK_SMELL_MESSAGE };
}
