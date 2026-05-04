import { tryTakeItem } from "@game/actions/take/tryTakeItem";
import {
  CAT_ID,
  isCatCollarNoun,
  isCatHeld,
  isCatInRoom,
  isCatNoun,
} from "@game/helpers/catHelpers";
import { moveItemToRoom } from "@game/helpers/itemHelpers";
import { getItemsInCurrentRoom } from "../../selectors/roomSelectors";
import type { ActionResult } from "../../types/actionsTypes";
import type { GameState } from "../../types/gameTypes";
import type { ParsedCommand } from "../../types/parserTypes";

export function doTake(state: GameState, cmd: ParsedCommand): ActionResult {
  if (cmd.type !== "action" || (cmd.verb !== "take" && cmd.verb !== "get")) {
    return { state, message: "You can't do that." };
  }

  const direct = cmd.direct?.trim();
  if (!direct) {
    return { state, message: "Take what?" };
  }

  if (isCatNoun(direct)) {
    if (isCatHeld(state)) {
      return { state, message: "You are already holding the cat." };
    }

    if (!isCatInRoom(state)) {
      return { state, message: `You don't see that here.` };
    }

    const moved = moveItemToRoom(state, CAT_ID, state.player.roomId);
    const next = {
      ...moved,
      itemState: {
        ...moved.itemState,
        attachedTo: {
          ...moved.itemState.attachedTo,
          [CAT_ID]: "PLAYER",
        },
      },
      worldState: {
        ...moved.worldState,
        catState: {
          ...moved.worldState.catState,
          heldTurns: 0,
        },
      },
    };

    return {
      state: next,
      message:
        "The cat watches you for a moment, then allows you to lift him into your arms.",
    };
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

  return tryTakeItem(state, direct);
}
