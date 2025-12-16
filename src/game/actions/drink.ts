import { tryDrinkItem } from "../rules/items";
import { resolveItemByNoun } from "../rules/scope";
import type { ActionResult } from "../types/actionsTypes";
import type { GameState } from "../types/gameTypes";
import type { ParsedCommand } from "../types/parserTypes";

export function doDrink(state: GameState, cmd: ParsedCommand): ActionResult {
  if (cmd.type !== "action" || cmd.verb !== "drink") {
    return { state, message: "You can't do that." };
  }

  const direct = cmd.direct?.trim();
  if (!direct) {
    return { state, message: "Drink what?" };
  }

  const item = resolveItemByNoun(state, direct);
  if (!item || !item?.meta?.consumable) {
    return { state, message: "There's nothing to drink." };
  }

  return tryDrinkItem(state, item);
}
