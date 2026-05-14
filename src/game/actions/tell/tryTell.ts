import {
  tellNpc,
  tellRadioDevice,
  isRadioTargetItem,
} from "@game/helpers/conversationHelpers";
import { normalizeTopic } from "@game/rules/scope";
import type { ActionResult } from "@game/types/actionsTypes";
import type { ConversationTarget } from "@game/types/npcTypes";
import { maybeAwardBarMemoryBox } from "src/world/maps/levelThree/Park/Bar";
import { GameState } from "../../types/gameTypes";

export async function tryTell(
  state: GameState,
  target: ConversationTarget,
  topicRaw: string,
): Promise<ActionResult> {
  const topic = normalizeTopic(topicRaw, target);

  if (target.kind === "npc") {
    const result = await tellNpc(state, target.npc, topic, target.via);
    if (target.via !== "direct") return result;

    const reward = maybeAwardBarMemoryBox(result.state, target.npc.id, topic);
    if (!reward.message) return result;

    const noCareMessage = `${target.npc.name} doesn't seem to care.`;
    const baseMessage =
      result.message?.trim() === noCareMessage ? "" : result.message?.trim();

    return {
      ...result,
      state: reward.state,
      message: [baseMessage, reward.message].filter(Boolean).join("\n\n"),
    };
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
