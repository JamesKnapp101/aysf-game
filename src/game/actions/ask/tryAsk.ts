import {
  askNpc,
  askRadioDevice,
  askRadioVoice,
  isRadioTargetItem,
} from "@game/helpers/conversationHelpers";
import { normalizeTopic } from "@game/rules/scope";
import { ActionResult } from "@game/types/actionsTypes";
import { ConversationTarget } from "@game/types/npcTypes";
import "../../../styles/layout.css";
import { GameState } from "../../types/gameTypes";

export function tryAsk(
  state: GameState,
  target: ConversationTarget,
  topicRaw: string
): ActionResult {
  const topic = normalizeTopic(topicRaw, target);

  // Asking the voice directly (ASK DAVE ABOUT ...)
  if (target.kind === "radioVoice") {
    return askRadioVoice(state, target.voice, topic);
  }

  // Asking an in-world item or NPC
  const item = target.item;

  // Asking the radio device (ASK RADIO ABOUT ...)
  if (isRadioTargetItem(item)) {
    return askRadioDevice(state, topic);
  }

  if (item.itemCategory !== "animate") {
    return { state, message: "That isn't going to respond." };
  }

  return askNpc(state, item, topic);
}
