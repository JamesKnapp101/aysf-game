import { tryPourItem } from "../rules/items";
import { resolveItemByNoun } from "../rules/scope";
import { getItemById } from "../selectors/itemSelectors";
import type { ActionResult } from "../types/actionsTypes";
import type { GameState } from "../types/gameTypes";
import type { ParsedCommand } from "../types/parserTypes";

export function doPour(state: GameState, cmd: ParsedCommand): ActionResult {
  if (cmd.type !== "action" || cmd.verb !== "pour") {
    return { state, message: "You can't do that." };
  }

  const direct = cmd.direct?.trim();
  if (!direct) {
    return { state, message: "Pour what?" };
  }

  const item =
    direct === "water"
      ? getItemById(state, "water")
      : resolveItemByNoun(state, direct);
  if (!item) {
    return { state, message: "There's nothing to pour." };
  }

  return tryPourItem(state, item, cmd);
}
