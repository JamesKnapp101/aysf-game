import { tryRemoveItem } from "@game/actions/remove/tryRemoveItem";
import { isCatCollarNoun, isCatInRoom } from "@game/helpers/catHelpers";
import { resolveItemByNoun } from "../../rules/scope";
import type { ActionResult } from "../../types/actionsTypes";
import type { GameState } from "../../types/gameTypes";
import type { ParsedCommand } from "../../types/parserTypes";

export function doRemove(state: GameState, cmd: ParsedCommand): ActionResult {
  if (cmd.type !== "action" || cmd.verb !== "remove") {
    return { state, message: "You can't do that." };
  }

  const direct = cmd.direct?.trim();
  if (!direct) {
    return { state, message: "Remove what?" };
  }

  if (isCatCollarNoun(direct)) {
    if (state.worldState.catState.isWearingCollar === true) {
      if (!isCatInRoom(state)) {
        return { state, message: `You don't see that here.` };
      } else {
        return {
          state,
          message:
            "As you reach for the collar, the cat squirms away from your hand.",
        };
      }
    }
  }

  const item = resolveItemByNoun(state, direct);
  if (!item || !item?.isWearable) {
    return { state, message: "There's nothing to remove." };
  }

  return tryRemoveItem(state, item);
}
