import { tryTell } from "@game/actions/tell/tryTell";
import {
  getActiveRadioNpc,
  resolveConversationTarget,
} from "../../rules/scope";
import type { ActionResult } from "../../types/actionsTypes";
import type { GameState } from "../../types/gameTypes";
import type { ParsedCommand } from "../../types/parserTypes";

export async function doTell(
  state: GameState,
  cmd: ParsedCommand,
): Promise<ActionResult> {
  if (cmd.type !== "action" || cmd.verb !== "tell") {
    return { state, message: "You can't do that." };
  }

  const targetText = cmd.direct?.trim();
  if (!targetText) {
    return { state, message: "Tell whom?" };
  }

  const topicText =
    cmd.preposition === "about" ? cmd.indirect?.trim() : cmd.raw?.trim();
  if (!topicText) {
    return { state, message: "Tell them about what?" };
  }

  const target = resolveConversationTarget(state, targetText);
  if (!target) {
    if (!getActiveRadioNpc(state))
      return { state, message: "No one answers." };
    return { state, message: "No response." };
  }

  return await tryTell(state, target, topicText);
}
