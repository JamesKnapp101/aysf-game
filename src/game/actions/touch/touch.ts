import { tryTouchItem } from "@game/actions/touch/tryTouchItem";
import { resolveItemByNoun } from "@game/rules/scope";
import { ActionResult } from "@game/types/actionsTypes";
import { GameState } from "@game/types/gameTypes";
import { ParsedCommand } from "@game/types/parserTypes";

export function doTouch(state: GameState, cmd: ParsedCommand): ActionResult {
  if (cmd.type !== "action" || cmd.verb !== "touch") {
    return { state, message: "You can't do that." };
  }

  const direct = cmd.direct?.trim();
  if (!direct) {
    return { state, message: "Touch what?" };
  }

  const item = resolveItemByNoun(state, direct);
  if (!item) {
    return { state, message: "There's nothing to touch." };
  }

  return tryTouchItem(state, item, cmd);
}
