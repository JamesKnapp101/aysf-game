import { tryTurnItem } from "@game/actions/turn/tryTurnItem";
import { resolveItemByNoun } from "../../rules/scope";
import type { ActionResult } from "../../types/actionsTypes";
import type { GameState } from "../../types/gameTypes";
import type { ParsedCommand } from "../../types/parserTypes";

export function doTurn(state: GameState, cmd: ParsedCommand): ActionResult {
  if (cmd.type !== "action" || cmd.verb !== "turn") {
    return { state, message: "You can't do that." };
  }

  const direct = cmd.direct?.trim();
  const prep = cmd.preposition?.trim() ?? "";
  if (!direct) {
    return { state, message: "Turn what?" };
  }

  const item = resolveItemByNoun(state, direct);
  if (!item || !item?.isTurnable) {
    return { state, message: "There's nothing to turn." };
  }

  return tryTurnItem(state, prep, item);
}
