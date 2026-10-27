import { resolveItemByNoun, resolveItemByVocabulary } from "@game/rules/scope";
import type { GameState } from "@game/types/gameTypes";
import type { Item } from "@game/types/itemTypes";
import type { ParsedCommand } from "@game/types/parserTypes";
import { GYM_SPIN_STAGE_ROOM_ID } from "./gymConstants";

export function resolveGymRemoteTote(state: GameState, noun: string) {
  if (state.player.roomId !== "Gym") return undefined;
  const bag = state.world.items.find(item => item.id === "DuffelBag");
  if (!bag || (state.itemState.itemRoomId[bag.id] ?? bag.location) !== GYM_SPIN_STAGE_ROOM_ID) return undefined;
  return resolveItemByVocabulary([bag], noun.replace(/^(?:the|a|an)\s+/, ""));
}

export function handleGymRemoteToteCommand(state: GameState, cmd: ParsedCommand) {
  if (cmd.type !== "action" || cmd.verb === "examine" ||
      (cmd.verb === "look" && (!cmd.preposition || cmd.preposition === "at"))) return undefined;
  if ([cmd.direct, cmd.indirect].some(noun => noun && resolveGymRemoteTote(state, noun) && resolveItemByNoun(state, noun)?.id === "DuffelBag")) {
    return { state, message: "You can't reach it from here." };
  }
  return undefined;
}

export const gymSpinStageItems: Item[] = [
  {
    id: "DuffelBag", name: "gym tote",
    description: "It's a small black and neon pink duffel bag with a shoulder strap.",
    initialDescription: "Resting on the podium floor next to the woman's body is a black and neon pink duffel bag.",
    location: GYM_SPIN_STAGE_ROOM_ID, vocab: ["duffel", "bag", "tote", "neon", "duffel bag", "gym tote"],
    itemClass: "solid", itemCategory: "collectable", itemWeight: 7, itemSize: 20,
    isContainer: true, isOpenable: true,
  },
  {
    id: "YogaPants", name: "yoga pants", description: "A pair of sheer gray yoga pants.",
    location: "seeded", vocab: ["yoga", "pants", "gray"],
    itemClass: "solid", itemCategory: "collectable", itemWeight: 7, itemSize: 10,
    isWearable: true, clothingSlot: "legs",
    meta: { clothing: { wearMessage: "It takes a little work, but you manage to pull the yoga pants on. They leave absolutely nothing to the imagination." } },
  },
  {
    id: "CropTop", name: "crop top", description: "A pastel pink crop top.",
    location: "seeded", vocab: ["crop", "top", "pastel", "pink"],
    itemClass: "solid", itemCategory: "collectable", itemWeight: 7, itemSize: 10,
    isWearable: true, clothingSlot: "torso",
    meta: { clothing: { wearMessage: "You slip on the crop top, leaving plenty of belly exposed." } },
  },
  {
    id: "TeacherId", name: "teacher's badge",
    description: "A laminated badge with a picture of a smiling young woman and the words 'Myndricks Fondwell, Substitute Teacher' underneath. It's got some kind of embedded chip on the back.",
    location: "seeded", vocab: ["badge", "laminated", "embedded", "chip", "teacher", "teachers badge"],
    itemClass: "solid", itemCategory: "collectable", itemWeight: 7, itemSize: 2,
  },
];
