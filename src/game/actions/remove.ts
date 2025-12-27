import { tryRemoveItem, tryWearItem } from "../rules/items";
import { resolveItemByNoun } from "../rules/scope";
import type { ActionResult } from "../types/actionsTypes";
import type { GameState } from "../types/gameTypes";
import type { ParsedCommand } from "../types/parserTypes";

export function doRemove(state: GameState, cmd: ParsedCommand): ActionResult {
  if (cmd.type !== "action" || cmd.verb !== "remove") {
    return { state, message: "You can't do that." };
  }

  const direct = cmd.direct?.trim();
  if (!direct) {
    return { state, message: "Remove what?" };
  }

  const item = resolveItemByNoun(state, direct);
  if (!item || !item?.isWearable) {
    return { state, message: "There's nothing to remove." };
  }

  return tryRemoveItem(state, item);
}
