import { tryFillItem } from "@game/actions/fill/tryFillItem";
import { resolveItemByNoun } from "../../rules/scope";
import type { ActionResult } from "../../types/actionsTypes";
import type { GameState } from "../../types/gameTypes";
import type { ParsedCommand } from "../../types/parserTypes";

export function doFill(state: GameState, cmd: ParsedCommand): ActionResult {
  if (cmd.type !== "action" || cmd.verb !== "fill") {
    return { state, message: "You can't do that." };
  }

  const direct = cmd.direct?.trim();
  if (!direct) {
    return { state, message: "Fill what?" };
  }

  const item = resolveItemByNoun(state, direct);
  if (!item || !item?.isContainer) {
    return { state, message: "There's nothing to fill." };
  }

  return tryFillItem(state, item, cmd);
}
