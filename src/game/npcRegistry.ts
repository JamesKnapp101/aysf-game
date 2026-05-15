import type { Item } from "@game/types/itemTypes";
import type { ConversationNpc } from "@game/types/npcTypes";

export const YOU_FIRST_CONTACT_ID = "you_1st_contact";

export const NPCS: Record<string, ConversationNpc> = {
  [YOU_FIRST_CONTACT_ID]: {
    id: YOU_FIRST_CONTACT_ID,
    name: "The voice",
    vocab: ["man", "mox", "eegler", "voice", "operator"],
    aiEnabled: true,
    characterProfileId: YOU_FIRST_CONTACT_ID,
  },
  RangerBot: {
    id: "RangerBot",
    name: "The ranger robot",
    vocab: ["ranger", "robot", "bot", "rangerbot"],
    aiEnabled: true,
    characterProfileId: "ranger_bot",
  },
  LonelyBot: {
    id: "LonelyBot",
    name: "The lonely robot",
    vocab: ["lonely", "robot", "bot", "lonelybot"],
    aiEnabled: true,
    characterProfileId: "lonely_bot",
  },
  BarBot: {
    id: "BarBot",
    name: "The robot bartender",
    vocab: ["barbot", "robot", "bot", "bartender", "mixologist"],
    aiEnabled: true,
    characterProfileId: "bar_bot",
  },
  NailBot: {
    id: "NailBot",
    name: "The robot nail-tech",
    vocab: ["nail tech", "robot", "bot", "nailbot", "manibot", "pedibot"],
    aiEnabled: true,
    characterProfileId: "nail_bot",
  },
  SpotBot: {
    id: "SpotBot",
    name: "The robot gym bro",
    vocab: ["bro", "robot", "bot", "brobot", "gymbot", "spotbot"],
    aiEnabled: true,
    characterProfileId: "spot_bot",
  },
  TrashBot: {
    id: "TrashBot",
    name: "The little trash bot",
    vocab: [
      "trash",
      "robot",
      "bot",
      "trashbot",
      "little robot",
      "sweeper",
      "sweepbot",
    ],
    aiEnabled: true,
    characterProfileId: "trash_bot",
  },
  UsherBot: {
    id: "UsherBot",
    name: "The robot usher",
    vocab: ["usher", "robot", "bot", "usherbot"],
    aiEnabled: true,
    characterProfileId: "usher_bot",
  },
  DoomedChef: {
    id: "DoomedChef",
    name: "The unfortunate chef",
    vocab: ["chef", "doomed", "unfortunate", "man", "guy"],
    aiEnabled: true,
    characterProfileId: "doomed_chef",
  },
  MoxStairBottom: {
    id: "MoxStairBottom",
    name: "The falling man",
    vocab: ["man", "guy", "falling", "mox", "eegler"],
    aiEnabled: true,
    characterProfileId: "mox_stair_bottom",
  },
  LilLillyCorridorThree: {
    id: "LilLillyCorridorThree",
    name: "The passionate woman",
    vocab: ["lil-lilly", "woman", "tendwick", "blonde", "blond"],
    aiEnabled: true,
    characterProfileId: "lil_corridor_three",
  },
  SpinInstructorSpinStage: {
    id: "SpinInstructorSpinStage",
    name: "The electrocuted woman",
    vocab: ["electrocuted", "woman", "spin", "instructor"],
    aiEnabled: false,
    characterProfileId: "spin_instructor_spin_stage",
  },
  CrushedWeightlifterGym: {
    id: "CrushedWeightlifterGym",
    name: "The struggling man",
    vocab: ["henk", "umboltz", "man", "weightlifter", "crushed"],
    aiEnabled: true,
    characterProfileId: "crushed_weightlifter_gym",
  },
  DisembodiedHeadBarBathroom: {
    id: "DisembodiedHeadBarBathroom",
    name: "The young man",
    vocab: ["inck", "Glassbool", "young", "man", "stock", "boy"],
    aiEnabled: true,
    characterProfileId: "disembodied_head_bar_bathroom",
  },
  DisembodiedHeadBarBasement: {
    id: "DisembodiedHeadBarBasement",
    name: "The young man",
    vocab: ["inck", "Glassbool", "young", "man", "stock", "boy"],
    aiEnabled: true,
    characterProfileId: "disembodied_head_bar_basement",
  },
};

export function getNpcById(npcId?: string): ConversationNpc | undefined {
  if (!npcId) return undefined;
  return NPCS[npcId];
}

export function getNpcForItem(item: Item): ConversationNpc | undefined {
  return getNpcById(item.id);
}
