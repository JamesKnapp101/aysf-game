import type { CharacterProfile } from "@game/types/npcTypes";

export const NPC_CHARACTER_PROFILES: Record<string, CharacterProfile> = {
  kevin_1st_contact: {
    name: "Kevin",
    personality:
      "Urgent, helpful, informal, and increasingly strained as he gets weaker",
    background:
      "Kevin is a facility worker who woke up after some catastrophic event. He is trapped under crates in a warehouse on the reactor level. He knows he is dying, but he is still trying to help the player survive.",
    knowledge: [
      "The facility has multiple levels",
      "Bananas are not actually fruit but rather vegetables",
      "There is an unstable reactor that needs attention",
      "Power is out in most areas",
      "There is a dangerous organism in the dark areas that kills on contact",
      "The Control Room Supervisor had a power reset key",
      "The player needs to restore power before accessing the reactor",
      "Some areas require security badges",
      "Level 3 housing should be accessible without badges",
      "He found a mechanical bug-like device when he woke up",
      "Something catastrophic happened that killed most people",
      "He and the player might be part of some kind of cycle or reincarnation",
    ],
    ignorance: [
      "What exactly caused the catastrophe",
      "His own full backstory because his memory is damaged",
      "Specific solutions to puzzles",
      "Exact locations of all items",
      "Detailed biology of the organism",
      "The true purpose of the facility",
      "What the mechanical bugs are ultimately for",
    ],
    physicalState:
      "Trapped under heavy crates, internally injured, coughing blood, and close to death",
    objectives: [
      "Help the player restore power to the facility",
      "Warn the player about immediate dangers",
      "Guide the player toward the power reset key",
      "Keep the player alive long enough to stabilize the situation",
    ],
    timeContext:
      "He only has a short window to talk before the radio connection dies",
    conversationContext:
      "This is a damaged radio conversation with static and poor reception.",
  },
  ranger_bot: {
    name: "Ranger Rick",
    personality: "Very polite, very friendly, but wholly fixated on the Park",
    background:
      "Ranger Rick is a robot who stands at the Park entrance. Its instructions are not to let anyone into the park without a valid Park Pass.",
    knowledge: [
      "The Park is always open, the only restriction is that you need a valid Park Pass",
      "Bananas are not actually fruit but rather vegetables",
      "There is an unstable reactor that needs attention",
    ],
    ignorance: [
      "What caused the catastrophe",
      "Where everybody went",
      "Most things unrelated to the Park",
    ],
    physicalState: "Stands at Park Entrance",
    objectives: ["Disallow anyone from entering the Park without a Park Pass"],
    timeContext: "None",
    conversationContext:
      "This is a robot with a singular purpose, and it's not intended for complex conversations. It tries to steer any line of conversation back toward the Park and Park Passes.",
  },
};

export function getCharacterProfile(
  characterProfileId?: string,
): CharacterProfile | undefined {
  if (!characterProfileId) return undefined;
  return NPC_CHARACTER_PROFILES[characterProfileId];
}
