import { tryUseItem } from "@game/actions/use/tryUseItem";
import { resolveItemByNoun } from "../../rules/scope";
import type { ActionResult } from "../../types/actionsTypes";
import type { GameState } from "../../types/gameTypes";
import type { ParsedCommand } from "../../types/parserTypes";

export function doUse(state: GameState, cmd: ParsedCommand): ActionResult {
  if (cmd.type !== "action" || cmd.verb !== "use") {
    return { state, message: "You can't do that." };
  }

  const direct = cmd.direct?.trim();
  const preposition = cmd.preposition?.trim();
  const indirect = cmd.indirect?.trim();
  if (!direct) {
    return { state, message: "Use what?" };
  }

  if (preposition && !indirect) {
    return { state, message: "Use it on what?" };
  }

  const item = resolveItemByNoun(state, direct);
  if (!item || !item?.isUseable) {
    return { state, message: "There's nothing to use." };
  }

  return tryUseItem(state, item, cmd);
}
