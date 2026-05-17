import {
  isRadioTargetItem,
  tellNpc,
  tellRadioDevice,
} from "@game/helpers/conversationHelpers";
import { applyRegisteredTellRewards } from "@game/registries/actionInteractionRegistry";
import { normalizeTopic } from "@game/rules/scope";
import type { ActionResult } from "@game/types/actionsTypes";
import type { ConversationTarget } from "@game/types/npcTypes";
import { GameState } from "../../types/gameTypes";

export async function tryTell(
  state: GameState,
  target: ConversationTarget,
  topicRaw: string,
): Promise<ActionResult> {
  const topic = normalizeTopic(topicRaw, target);

  if (target.kind === "npc") {
    const result = await tellNpc(state, target.npc, topic, target.via);
    return applyRegisteredTellRewards(result, target, topic);
  }

  const item = target.item;

  if (isRadioTargetItem(item)) {
    return tellRadioDevice(state, topic);
  }

  if (item.itemCategory !== "animate") {
    return { state, message: "That isn't going to respond." };
  }

  if (typeof item.meta?.unresponsiveInteractionMessage === "string") {
    return { state, message: item.meta.unresponsiveInteractionMessage };
  }

  return { state, message: `${item.name} doesn't seem to care.` };
}
