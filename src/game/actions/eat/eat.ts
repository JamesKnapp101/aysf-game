import { tryEatItem } from "@game/actions/eat/tryEatItem";
import { resolveItemByNoun } from "../../rules/scope";
import type { ActionResult } from "../../types/actionsTypes";
import type { GameState } from "../../types/gameTypes";
import type { ParsedCommand } from "../../types/parserTypes";

export function doEat(state: GameState, cmd: ParsedCommand): ActionResult {
  if (cmd.type !== "action" || cmd.verb !== "eat") {
    return { state, message: "You can't do that." };
  }

  const direct = cmd.direct?.trim();
  if (!direct) {
    return { state, message: "Eat what?" };
  }

  const item = resolveItemByNoun(state, direct);
  if (!item || !item?.meta?.consumable) {
    return { state, message: "There's nothing to eat." };
  }

  return tryEatItem(state, item);
}
