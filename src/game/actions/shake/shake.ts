import { resolveItemByNoun } from "@game/rules/scope";
import type { ActionResult } from "@game/types/actionsTypes";
import type { GameState } from "@game/types/gameTypes";
import type { ParsedCommand } from "@game/types/parserTypes";

const FALLBACK_SHAKE_MESSAGE = "That doesn't accomplish anything.";

export function doShake(state: GameState, cmd: ParsedCommand): ActionResult {
  if (cmd.type !== "action" || cmd.verb !== "shake") {
    return { state, message: "You can't do that." };
  }

  const target = cmd.direct?.trim();
  if (!target) {
    return { state, message: "Shake what?" };
  }

  const item = resolveItemByNoun(state, target);
  if (!item) {
    return { state, message: "You don't see that here." };
  }

  const override = item.overrides?.shake;
  if (typeof override === "function") {
    const out = override({ state, item, cmd });
    if (typeof out === "string") return { state, message: out };

    return {
      state: out?.state ?? state,
      message: out?.message ?? FALLBACK_SHAKE_MESSAGE,
      consumesTurn: out?.consumesTurn,
      overlay: out?.overlay,
    };
  }

  if (typeof override === "string") {
    return { state, message: override };
  }

  return { state, message: FALLBACK_SHAKE_MESSAGE };
}
