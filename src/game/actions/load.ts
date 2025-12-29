import { tryLoadItem, tryWearItem } from "../rules/items";
import { resolveItemByNoun } from "../rules/scope";
import type { ActionResult } from "../types/actionsTypes";
import type { GameState } from "../types/gameTypes";
import type { ParsedCommand } from "../types/parserTypes";

export function doLoad(state: GameState, cmd: ParsedCommand): ActionResult {
  if (cmd.type !== "action" || cmd.verb !== "load") {
    return { state, message: "You can't do that." };
  }

  const direct = cmd.direct?.trim();
  const preposition = cmd.preposition?.trim();
  const indirect = cmd.indirect?.trim();

  if (!direct) {
    return { state, message: "Load what?" };
  }
  if (!preposition) {
    return { state, message: `Load the ${direct} with what?` };
  }
  if (preposition !== "with") {
    return { state, message: "You can't do that." };
  }
  if (!indirect) {
    return { state, message: `Load the ${direct} with what?` };
  }

  const itemToLoad = resolveItemByNoun(state, direct);
  const itemLoadWith = resolveItemByNoun(state, indirect);
  if (!itemToLoad || !itemLoadWith) {
    return { state, message: "There's nothing to load." };
  }

  return tryLoadItem(state, itemToLoad, itemLoadWith);
}
