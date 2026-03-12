import {
  askNpc,
  askRadioDevice,
  isRadioTargetItem,
} from "@game/helpers/conversationHelpers";
import { normalizeTopic } from "@game/rules/scope";
import type { ActionResult } from "@game/types/actionsTypes";
import type { ConversationTarget } from "@game/types/npcTypes";
import "../../../styles/layout.css";
import { GameState } from "../../types/gameTypes";

export async function tryAsk(
  state: GameState,
  target: ConversationTarget,
  topicRaw: string,
): Promise<ActionResult> {
  const topic = normalizeTopic(topicRaw, target);

  if (target.kind === "npc") {
    return askNpc(state, target.npc, topic, target.via);
  }

  const item = target.item;

  if (isRadioTargetItem(item)) {
    return askRadioDevice(state, topic);
  }

  if (item.itemCategory !== "animate") {
    return { state, message: "That isn't going to respond." };
  }

  return { state, message: `${item.name} has nothing to say about that.` };
}
