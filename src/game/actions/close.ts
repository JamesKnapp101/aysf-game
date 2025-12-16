import { tryCloseDoor } from "../rules/doors";
import { tryCloseItem } from "../rules/items";
import { resolveDoorByNoun, resolveItemByNoun } from "../rules/scope";
import type { ActionResult } from "../types/actionsTypes";
import type { GameState } from "../types/gameTypes";
import type { ParsedCommand } from "../types/parserTypes";

export function doClose(state: GameState, cmd: ParsedCommand): ActionResult {
  if (cmd.type !== "action" || cmd.verb !== "close") {
    return { state, message: "You can't do that." };
  }

  const direct = cmd.direct?.trim();
  if (!direct) {
    return { state, message: "Close what?" };
  }

  const doorResult = resolveDoorByNoun(state, direct);
  if (doorResult) {
    const { def, doorState } = doorResult;
    return tryCloseDoor(state, def, doorState);
  }

  const item = resolveItemByNoun(state, direct);
  if (!item) {
    return { state, message: "You don't see that here." };
  }

  return tryCloseItem(state, item);
}
