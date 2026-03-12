import {
  isRadioTargetItem,
  tellNpc,
  tellRadioDevice,
  tellRadioVoice,
} from "@game/helpers/conversationHelpers";
import { normalizeTopic } from "@game/rules/scope";
import { ActionResult } from "@game/types/actionsTypes";
import { ConversationTarget } from "@game/types/npcTypes";
import "../../../styles/layout.css";
import { GameState } from "../../types/gameTypes";

export async function tryTell(
  state: GameState,
  target: ConversationTarget,
  topicRaw: string,
): Promise<ActionResult> {
  const topic = normalizeTopic(topicRaw);

  if (target.kind === "radioVoice") {
    return await tellRadioVoice(state, target.voice, topic);
  }

  const item = target.item;

  if (isRadioTargetItem(item)) {
    return await tellRadioDevice(state, topic);
  }

  if (item.itemCategory !== "animate") {
    return { state, message: "That isn't going to respond." };
  }

  return tellNpc(state, item, topic);
}
