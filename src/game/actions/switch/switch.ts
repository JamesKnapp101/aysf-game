import { trySwitchItem } from "@game/actions/switch/trySwitchItem";
import { resolveItemByNoun } from "../../rules/scope";
import type { ActionResult } from "../../types/actionsTypes";
import type { GameState } from "../../types/gameTypes";
import type { ParsedCommand } from "../../types/parserTypes";

export function doSwitch(state: GameState, cmd: ParsedCommand): ActionResult {
  if (cmd.type !== "action" || cmd.verb !== "switch") {
    return { state, message: "You can't do that." };
  }

  const direct = cmd.direct?.trim();
  if (!direct) {
    return { state, message: "Switch what?" };
  }

  const item = resolveItemByNoun(state, direct);
  if (!item || !item?.isSwitchable) {
    return { state, message: "There's nothing to switch." };
  }

  return trySwitchItem(state, item);
}
