import type { Item } from "@game/types/itemTypes";
import type { ConversationNpc } from "@game/types/npcTypes";

export const KEVIN_FIRST_CONTACT_ID = "kevin_1st_contact";

export const NPCS: Record<string, ConversationNpc> = {
  [KEVIN_FIRST_CONTACT_ID]: {
    id: KEVIN_FIRST_CONTACT_ID,
    name: "The voice",
    vocab: ["man", "kevin", "voice", "operator"],
    aiEnabled: true,
    characterProfileId: KEVIN_FIRST_CONTACT_ID,
  },
  RangerBot: {
    id: "RangerBot",
    name: "Ranger Rick",
    vocab: ["ranger", "robot", "bot", "rangerbot"],
  },
};

export function getNpcById(npcId?: string): ConversationNpc | undefined {
  if (!npcId) return undefined;
  return NPCS[npcId];
}

export function getNpcForItem(item: Item): ConversationNpc | undefined {
  return getNpcById(item.id);
}
