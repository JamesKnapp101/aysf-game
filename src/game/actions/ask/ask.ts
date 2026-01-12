import { tryAsk } from "@game/actions/ask/tryAsk";
import { resolveItemByNoun } from "../../rules/scope";
import type { ActionResult } from "../../types/actionsTypes";
import type { GameState } from "../../types/gameTypes";
import type { ParsedCommand } from "../../types/parserTypes";

export function doAsk(state: GameState, cmd: ParsedCommand): ActionResult {
  if (cmd.type !== "action" || cmd.verb !== "ask") {
    return { state, message: "You can't do that." };
  }

  const direct = cmd.direct?.trim();
  if (!direct) {
    return { state, message: "Ask what?" };
  }

  const item = resolveItemByNoun(state, direct);
  if (!item || item?.itemCategory !== "animate") {
    return { state, message: "That isn't going to respond." };
  }

  return tryAsk(state, item);
}
