import { tryTakeItem } from "@game/actions/take/tryTakeItem";
import { getItemById } from "@game/helpers/itemHelpers";
import { addToInventory } from "@game/rules/state";
import { getItemsInCurrentRoom } from "../../selectors/roomSelectors";
import type { ActionResult } from "../../types/actionsTypes";
import type { GameState } from "../../types/gameTypes";
import type { ParsedCommand } from "../../types/parserTypes";

export function doTake(state: GameState, cmd: ParsedCommand): ActionResult {
  if (cmd.type !== "action" || cmd.verb !== "take") {
    return { state, message: "You can't do that." };
  }

  const direct = cmd.direct?.trim();
  const indirect = cmd.indirect?.trim() ?? "";
  if (!direct) {
    return { state, message: "Take what?" };
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

  if (direct === "messages") {
    const roomItems = getItemsInCurrentRoom(state);
    const phoneItem = roomItems.filter((i) => i?.meta?.kind === "phone");
    if (phoneItem.length === 0) {
      return { state, message: `You don't see that here.` };
    }
    return {
      state,
      overlay: {
        kind: "message-machine",
        messages: phoneItem?.[0]?.meta?.messages,
        messagesPlayedById: { ...state.itemState.messagesPlayed },
      },
    };
  }

  return tryTakeItem(state, direct, indirect);
}
