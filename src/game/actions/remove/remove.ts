import { tryRemoveItem } from "@game/actions/remove/tryRemoveItem";
import { getItemById } from "@game/helpers/itemHelpers";
import { addToInventory } from "@game/rules/state";
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

  if (["collar", "pendant"].includes(direct)) {
    if (state.worldState.catState.isWearingCollar === true) {
      const cat = getItemById(state, "cat");
      if (cat?.location !== state.player.roomId) {
        return { state, message: `You don't see that here.` };
      } else {
        let next = state;
        next = addToInventory(state, "IggyCollar");
        next = {
          ...next,
          worldState: {
            ...next.worldState,
            catState: {
              isWearingCollar: false,
            },
          },
        };
        return {
          state: next,
          message: `You carefully remove the collar from the cat.`,
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
