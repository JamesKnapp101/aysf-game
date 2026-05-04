import {
  isCatHeld,
  isCatInRoom,
  isCatNoun,
} from "@game/helpers/catHelpers";
import type { ActionResult } from "../../types/actionsTypes";
import type { GameState } from "../../types/gameTypes";
import type { ParsedCommand } from "../../types/parserTypes";

export function doPet(state: GameState, cmd: ParsedCommand): ActionResult {
  if (cmd.type !== "action" || cmd.verb !== "pet") {
    return { state, message: "You can't do that." };
  }

  const direct = cmd.direct?.trim();
  if (!direct) {
    return { state, message: "Pet what?" };
  }

  if (!isCatNoun(direct)) {
    return { state, message: "That doesn't seem especially pettable." };
  }

  if (!isCatHeld(state) && !isCatInRoom(state)) {
    return { state, message: `You don't see that here.` };
  }

  return {
    state,
    message:
      "You gently pet the cat. He leans into your hand and starts to purr.",
  };
}
