import {
  askNpc,
  askRadioDevice,
  isRadioTargetItem,
} from "@game/helpers/conversationHelpers";
import { normalizeTopic } from "@game/rules/scope";
import { handleRegisteredAskAction } from "@game/registries/actionInteractionRegistry";
import type { ActionResult } from "@game/types/actionsTypes";
import type { ConversationTarget } from "@game/types/npcTypes";
import { GameState } from "../../types/gameTypes";

export async function tryAsk(
  state: GameState,
  target: ConversationTarget,
  topicRaw: string,
): Promise<ActionResult> {
  const topic = normalizeTopic(topicRaw, target);
  const registered = handleRegisteredAskAction(state, target, topic);
  if (registered) return registered;

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

  if (typeof item.meta?.unresponsiveInteractionMessage === "string") {
    return { state, message: item.meta.unresponsiveInteractionMessage };
  }

  return { state, message: `${item.name} has nothing to say about that.` };
}
