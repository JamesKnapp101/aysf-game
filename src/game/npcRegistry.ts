import type { Item } from "@game/types/itemTypes";
import type { ConversationNpc } from "@game/types/npcTypes";
import { nailBotExchange } from "src/world/maps/levelThree/Park/NailSalon/nailBotExchange";

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
    informationExchange: nailBotExchange,
    id: "NailBot",
    name: "The robot nail-tech",
    nickname: "Cuticle Bot",
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
  OldManStairBottom: {
    id: "OldManStairBottom",
    name: "The hiding man",
    vocab: ["man", "old", "hiding", "swinth", "brimb"],
    aiEnabled: true,
    characterProfileId: "old_man_stair_bottom",
  },
  OldWomanPark: {
    id: "OldWomanPark",
    name: "The old woman",
    vocab: ["woman", "old", "small"],
    aiEnabled: true,
    characterProfileId: "old_woman_park",
  },
  StairSixBody: {
    id: "StairSixBody",
    name: "The old woman",
    vocab: ["woman", "old", "small"],
    aiEnabled: true,
    characterProfileId: "joelson_dend_stairwell",
  },
  StairOneBody: {
    id: "StairOneBody",
    name: "The dead woman",
    vocab: ["man", "guy", "worker", "technician"],
    aiEnabled: true,
    characterProfileId: "technician_stair_one",
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
  MasterOfDrink: {
    id: "MasterOfDrink",
    name: "The Master of Drink",
    vocab: ["master", "drink", "master of drink", "the master"],
    aiEnabled: true,
    characterProfileId: "master_of_drink",
  },
  MoxTheater: {
    id: "MoxTheater",
    name: "The moviegoer",
    vocab: ["man", "guy", "falling", "mox", "eegler"],
    aiEnabled: true,
    characterProfileId: "mox_movie_theater",
  },
  Corey: {
    id: "Corey",
    name: "Corey",
    vocab: ["corey", "core", "robot", "engineering robot"],
    aiEnabled: false,
  },
  LemsterKrolmborg: {
    id: "LemsterKrolmborg",
    name: "Lemster Krolmborg",
    vocab: ["lemster", "krolmborg", "employee", "man"],
    aiEnabled: false,
  },
  VirtualManager: {
    id: "VirtualManager",
    name: "The robot manager",
    vocab: ["manager", "robot manager", "robot", "boss"],
    aiEnabled: false,
  },
  hydroponics_worker: {
    id: "hydroponics_worker",
    name: "The terrified hydroponics worker",
    vocab: ["wim", "timbly", "hydroponics", "worker"],
    aiEnabled: true,
    characterProfileId: "hydroponics_worker",
  },
  Operator: {
    id: "Operator",
    name: "The robot Operator",
    vocab: ["operator", "robot operator", "robot"],
    aiEnabled: true,
    characterProfileId: "Operator",
  },
  poisonControlBot: {
    id: "poisonControlBot",
    name: "The poison control robot",
    vocab: ["poison", "control", "robot"],
    aiEnabled: true,
    characterProfileId: "poisonControlBot",
  },
  vlab_horngratch: {
    id: "vlab_horngratch",
    name: "Vlab Horngratch",
    vocab: ["vlab", "horngratch"],
    aiEnabled: true,
    characterProfileId: "vlab_horngratch",
  },
  chatni_gorbankcellio: {
    id: "chatni_gorbankcellio",
    name: "Chatni Gorbankcellio",
    vocab: ["Chatni", "Gorbankcellio"],
    aiEnabled: true,
    characterProfileId: "chatni_gorbankcellio",
  },
  dispatch_bot: {
    id: "dispatch_bot",
    name: "The robot dispatcher",
    vocab: ["dispatcher", "robot"],
    aiEnabled: true,
    characterProfileId: "dispatch_bot",
  },
};

export function getNpcById(npcId?: string): ConversationNpc | undefined {
  if (!npcId) return undefined;
  return NPCS[npcId];
}

export function getNpcForItem(item: Item): ConversationNpc | undefined {
  return getNpcById(item.id);
}
