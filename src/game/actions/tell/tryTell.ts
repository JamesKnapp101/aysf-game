import {
  tellNpc,
  tellRadioDevice,
  isRadioTargetItem,
} from "@game/helpers/conversationHelpers";
import { normalizeTopic } from "@game/rules/scope";
import type { ActionResult } from "@game/types/actionsTypes";
import type { ConversationTarget } from "@game/types/npcTypes";
import { GameState } from "../../types/gameTypes";

export async function tryTell(
  state: GameState,
  target: ConversationTarget,
  topicRaw: string,
): Promise<ActionResult> {
  const topic = normalizeTopic(topicRaw);

  if (target.kind === "npc") {
    return tellNpc(state, target.npc, topic, target.via);
  }

  const item = target.item;

  if (isRadioTargetItem(item)) {
    return tellRadioDevice(state, topic);
  }

  if (item.itemCategory !== "animate") {
    return { state, message: "That isn't going to respond." };
  }

  return { state, message: `${item.name} doesn't seem to care.` };
}
