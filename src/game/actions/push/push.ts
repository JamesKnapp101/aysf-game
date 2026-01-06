import { tryPushItem } from "@game/actions/push/tryPushItem";
import { resolveItemByNoun } from "../../rules/scope";
import type { ActionResult } from "../../types/actionsTypes";
import type { GameState } from "../../types/gameTypes";
import type { ParsedCommand } from "../../types/parserTypes";

export function doPush(state: GameState, cmd: ParsedCommand): ActionResult {
  if (cmd.type !== "action" || cmd.verb !== "push") {
    return { state, message: "You can't do that." };
  }

  const direct = cmd.direct?.trim();
  if (!direct) {
    return { state, message: "Push what?" };
  }

  const item = resolveItemByNoun(state, direct);
  if (!item || !item?.isPushable) {
    return { state, message: "There's nothing to push." };
  }

  return tryPushItem(state, item);
}
