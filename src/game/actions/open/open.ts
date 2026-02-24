import { tryOpenItem } from "@game/actions/open/tryOpenItem";
import { tryOpenDoor } from "../../rules/doors";
import { resolveDoorByNoun, resolveItemByNoun } from "../../rules/scope";
import type { ActionResult } from "../../types/actionsTypes";
import type { GameState } from "../../types/gameTypes";
import type { ParsedCommand } from "../../types/parserTypes";

export function doOpen(state: GameState, cmd: ParsedCommand): ActionResult {
  if (cmd.type !== "action" || cmd.verb !== "open") {
    return { state, message: "You can't do that." };
  }

  const direct = cmd.direct?.trim();
  if (!direct) {
    return { state, message: "Open what?" };
  }

  const doorResult = resolveDoorByNoun(state, direct);
  if (doorResult) {
    const { def, doorState } = doorResult;
    return tryOpenDoor(state, def, doorState);
  }

  const item = resolveItemByNoun(state, direct);
  if (!item) {
    return { state, message: "You don't see that here." };
  }

  return tryOpenItem(state, item);
}
