import { resolveItemByNoun } from "@game/rules/scope";
import type { ActionResult } from "@game/types/actionsTypes";
import type { GameState } from "@game/types/gameTypes";
import type { ItemOverrideVerb } from "@game/types/itemTypes";
import type { ParsedCommand } from "@game/types/parserTypes";

type ManipulateVerb = Extract<ItemOverrideVerb, "lift" | "move">;

function doManipulate(
  state: GameState,
  cmd: ParsedCommand,
  verb: ManipulateVerb,
): ActionResult {
  if (cmd.type !== "action" || cmd.verb !== verb) {
    return { state, message: "You can't do that." };
  }

  const direct = cmd.direct?.trim();
  if (!direct) {
    return {
      state,
      message: verb === "lift" ? "Lift what?" : "Move what?",
    };
  }

  const item = resolveItemByNoun(state, direct);
  if (!item) {
    return { state, message: "You don't see that here." };
  }

  const override = item.overrides?.[verb];
  if (typeof override === "function") {
    const out = override({ state, item, cmd });

    if (typeof out === "string") {
      return { state, message: out };
    }

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
    message: verb === "lift" ? "You can't lift that." : "You can't move that.",
  };
}

export function doLift(state: GameState, cmd: ParsedCommand): ActionResult {
  return doManipulate(state, cmd, "lift");
}

export function doMoveItem(
  state: GameState,
  cmd: ParsedCommand,
): ActionResult {
  return doManipulate(state, cmd, "move");
}
