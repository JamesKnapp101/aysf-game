import { resolveItemByNoun } from "../../rules/scope";
import type { ActionResult } from "../../types/actionsTypes";
import type { GameState } from "../../types/gameTypes";
import type { ParsedCommand } from "../../types/parserTypes";
import { tryStandItem } from "./tryStandItem";

export function doStand(state: GameState, cmd: ParsedCommand): ActionResult {
  if (cmd.type !== "action" || cmd.verb !== "stand") {
    return { state, message: "You can't do that." };
  }
  const prep = cmd.preposition?.trim();
  const indirect = cmd.indirect?.trim();
  if (!prep) {
    return { state, message: "Stand what?" };
  }
  if (!indirect) {
    return { state, message: `Stand ${prep} what?` };
  }

  const item = resolveItemByNoun(state, indirect);
  if (!item || !item?.isSurface) {
    return { state, message: `You can't stand ${prep} that.` };
  }

  return tryStandItem(state, prep, item);
}
