import { tryEmptyItem } from "@game/actions/empty/tryEmptyItem";
import { resolveItemByNoun } from "../../rules/scope";
import type { ActionResult } from "../../types/actionsTypes";
import type { GameState } from "../../types/gameTypes";
import type { ParsedCommand } from "../../types/parserTypes";

export function doEmpty(state: GameState, cmd: ParsedCommand): ActionResult {
  if (cmd.type !== "action" || cmd.verb !== "empty") {
    return { state, message: "You can't do that." };
  }

  const direct = cmd.direct?.trim();
  if (!direct) {
    return { state, message: "Empty what?" };
  }

  const item = resolveItemByNoun(state, direct);
  if (!item) {
    return { state, message: "There's nothing to empty." };
  }

  return tryEmptyItem(state, item, cmd);
}
