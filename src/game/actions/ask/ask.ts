import { tryAsk } from "@game/actions/ask/tryAsk";
import {
  getActiveRadioNpc,
  resolveConversationTarget,
} from "../../rules/scope";
import type { ActionResult } from "../../types/actionsTypes";
import type { GameState } from "../../types/gameTypes";
import type { ParsedCommand } from "../../types/parserTypes";

export async function doAsk(
  state: GameState,
  cmd: ParsedCommand,
): Promise<ActionResult> {
  if (cmd.type !== "action" || cmd.verb !== "ask") {
    return { state, message: "You can't do that." };
  }

  const targetText = cmd.direct?.trim();
  if (!targetText) {
    return { state, message: "Ask whom?" };
  }

  const topicText =
    cmd.preposition === "about" ? cmd.indirect?.trim() : cmd.raw;
  if (!topicText) {
    return { state, message: "Ask about what?" };
  }

  const target = resolveConversationTarget(state, targetText);
  if (!target) {
    // Better radio-ish feedback if there's no active call and they tried a person
    if (!getActiveRadioNpc(state))
      return { state, message: "No one answers." };
    return { state, message: "No response." };
  }

  return await tryAsk(state, target, topicText);
}
