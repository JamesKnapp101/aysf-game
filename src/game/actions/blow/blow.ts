import { tryBlowItem } from "@game/actions/blow/tryBlowItem";
import { resolveItemByNoun } from "../../rules/scope";
import type { ActionResult } from "../../types/actionsTypes";
import type { GameState } from "../../types/gameTypes";
import type { ParsedCommand } from "../../types/parserTypes";

export function doBlow(state: GameState, cmd: ParsedCommand): ActionResult {
  if (cmd.type !== "action" || cmd.verb !== "blow") {
    return { state, message: "You can't do that." };
  }

  const direct = cmd.direct?.trim();
  if (!direct) {
    return { state, message: "Blow what?" };
  }

  const item = resolveItemByNoun(state, direct);
  if (!item) {
    return { state, message: "There's nothing to blow." };
  }

  return tryBlowItem(state, item);
}
