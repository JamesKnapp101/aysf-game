import {
  CAT_ID,
  clearCatHeldTurns,
  getCatRoomId,
  isCatHeld,
  isCatNoun,
  isRoomInCatHome,
} from "@game/helpers/catHelpers";
import { moveItemToRoom } from "@game/helpers/itemHelpers";
import type { ActionResult } from "../../types/actionsTypes";
import type { GameState } from "../../types/gameTypes";
import type { ParsedCommand } from "../../types/parserTypes";

export function doCall(state: GameState, cmd: ParsedCommand): ActionResult {
  if (cmd.type !== "action" || cmd.verb !== "call") {
    return { state, message: "You can't do that." };
  }

  const direct = cmd.direct?.trim();
  if (!direct) {
    return { state, message: "Call what?" };
  }

  if (!isCatNoun(direct)) {
    return { state, message: "You call out, but nothing answers." };
  }

  const callMessage =
    "You make a soft clicking cat-call noise with your tongue.";

  if (!isRoomInCatHome(state, state.player.roomId)) {
    return { state, message: `${callMessage} Nothing happens.` };
  }

  if (isCatHeld(state)) {
    return {
      state,
      message: `${callMessage} The cat is already in your arms.`,
    };
  }

  if (getCatRoomId(state) === state.player.roomId) {
    return {
      state,
      message: `${callMessage} The cat looks up at you expectantly.`,
    };
  }

  const moved = moveItemToRoom(state, CAT_ID, state.player.roomId);
  const cleared = clearCatHeldTurns(moved);
  const next = {
    ...cleared,
    worldState: {
      ...cleared.worldState,
      catState: {
        ...cleared.worldState.catState,
        settleTurns: 1,
      },
    },
  };

  return {
    state: next,
    message: `${callMessage} After a few moments, the cat pads into view.`,
  };
}
