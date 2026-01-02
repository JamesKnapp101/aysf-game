import { trySearchItem } from "../rules/items";
import { resolveItemByNoun } from "../rules/scope";
import type { ActionResult } from "../types/actionsTypes";
import type { GameState } from "../types/gameTypes";
import type { ParsedCommand } from "../types/parserTypes";

export function doSearch(state: GameState, cmd: ParsedCommand): ActionResult {
  if (cmd.type !== "action" || cmd.verb !== "search") {
    return { state, message: "You can't do that." };
  }

  const direct = cmd.direct?.trim();
  if (!direct) {
    return { state, message: "Search what?" };
  }

  const item = resolveItemByNoun(state, direct);
  if (!item || !item?.isSearchable) {
    return { state, message: "There's nothing to search." };
  }

  return trySearchItem(state, item);
}
