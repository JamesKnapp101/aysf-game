import { tryShootItem } from "../rules/items";
import { resolveItemByNoun } from "../rules/scope";
import type { ActionResult } from "../types/actionsTypes";
import type { GameState } from "../types/gameTypes";
import type { ParsedCommand } from "../types/parserTypes";

export function doShoot(state: GameState, cmd: ParsedCommand): ActionResult {
  if (cmd.type !== "action" || cmd.verb !== "shoot") {
    return { state, message: "You can't do that." };
  }

  const direct = cmd.direct?.trim();
  const preposition = cmd.preposition?.trim();
  const indirect = cmd.indirect?.trim();

  if (!direct) {
    return { state, message: "Shoot what?" };
  }
  if (preposition !== "with") {
    return { state, message: "That doesn't make any sense." };
  }
  if (!indirect) {
    return { state, message: `Shoot the ${direct} with what?` };
  }

  const shotAtItem = resolveItemByNoun(state, direct);
  const shotWithItem = resolveItemByNoun(state, indirect);
  if (!shotAtItem || !shotWithItem) {
    return { state, message: "There's nothing to shoot." };
  }

  return tryShootItem(state, shotAtItem, shotWithItem);
}
