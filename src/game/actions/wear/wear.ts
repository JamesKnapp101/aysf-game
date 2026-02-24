import { tryWearItem } from "@game/actions/wear/tryWearItem";
import { resolveItemByNoun } from "../../rules/scope";
import type { ActionResult } from "../../types/actionsTypes";
import type { GameState } from "../../types/gameTypes";
import type { ParsedCommand } from "../../types/parserTypes";

export function doWear(state: GameState, cmd: ParsedCommand): ActionResult {
  if (cmd.type !== "action" || cmd.verb !== "wear") {
    return { state, message: "You can't do that." };
  }

  const direct = cmd.direct?.trim();
  if (!direct) {
    return { state, message: "Wear what?" };
  }

  const item = resolveItemByNoun(state, direct);
  if (!item || !item?.isWearable) {
    return { state, message: "There's nothing to wear." };
  }

  return tryWearItem(state, item);
}
