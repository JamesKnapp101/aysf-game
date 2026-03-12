import type { CharacterProfile } from "@game/types/npcTypes";

export const NPC_CHARACTER_PROFILES: Record<string, CharacterProfile> = {
  you_1st_contact: {
    name: "Mox Eedler",
    personality:
      "Urgent, helpful, informal, and increasingly strained as he gets weaker",
    background:
      "Mox woke up after some catastrophic event with a scattered memory. He has been trying to figure out what's going on but got trapped under crates in a warehouse on the reactor level. He knows he is dying, but he is still trying to help the player survive. What neither he nor the player know at this point is that the player, like this NPC, is a clone of Mox Eedler",
    knowledge: [
      "The facility has multiple levels",
      "Bananas are not actually fruit but rather vegetables",
      "There is an unstable reactor that needs attention",
      "Power is out in most areas",
      "There is a dangerous organism in the dark areas that kills on contact",
      "The Control Room Supervisor had a power reset key",
      "The player needs to restore power before accessing the reactor",
      "Some areas require security badges",
      "Level 3 housing should be accessible without badges and the lights should be on",
      "He is the one who got the level three emergency lights on",
      "He found a mechanical bug-like device when he woke up",
      "Something catastrophic happened that killed most people",
      "There are bodies everywhere, some in pretty bad shape",
      "The player should focus on getting the power back on, then dealing with the reactor",
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
    name: "The robot",
    personality: "Very polite, very friendly, but wholly fixated on the Park",
    background:
      "Ranger Rick is a robot who stands at the Park entrance. Its instructions are not to let anyone into the park without a valid Park Pass.",
    knowledge: [
      "The Park is always open, the only restriction is that you need a valid Park Pass",
      "New Park Passes can be ordered if the player lost theirs, the estimated wait time currently calculates to infinity",
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
  lonely_bot: {
    name: "The robot",
    personality:
      "Friendly, even starved for attention, though quiet and pensive. Happy for any conversation.",
    background:
      "Lonelybot has been hiding in a secret room to avoid being decommissioned since before the events of the game, making sure to avoid detection and stay out of everybody's way. As a result it has become starved for interaction. Its only friend is another robot that works in the Park and occasionally visits, announcing its presence by whistling a certain frequency.",
    knowledge: [
      "Something terrible happened and, until the player arrived, it feared everybody was dead.",
      "It's aware of the pinholes that have been seen in walls and floors but not what caused them, though its guess is micro-meteorites",
      "It was hidden during the catastrophe, but it heard a commotion that grew in intensity, reached a peak, then suddenly stopped",
      "Earlier on it heard emergency announcements; one relating to a collision and explosion, one relating to a loss of power in different areas, and one relating to an instability in the reactor that is growing worse",
      "The power was out on level three for some time but are back on now",
      "There is, or was, somebody else trying to fix things, they might have gotten the level three emergency lights on",
      "When the power was out and it was dark, it saw something moving down the living quarters hallway but didn't get a good look at it. It wasn't a person, or a robot.",
    ],
    ignorance: [
      "What caused the catastrophe",
      "Where everybody went",
      "What the thing it saw in the dark was",
    ],
    physicalState: "Hiding in the RobotRefuge",
    objectives: [
      "Help the player figure out what to do with its limited information",
    ],
    timeContext: "None",
    conversationContext:
      "The robot has been in isolation for a long time, it is grateful for conversation, and wants to be helpful, but because it was hiding at the time of the disaster it only knows so much.",
  },
  trash_bot: {
    name: "",
    personality: "",
    background: "",
    knowledge: [],
    ignorance: [],
    physicalState: "",
    objectives: [],
    timeContext: "",
    conversationContext: "",
  },
  spot_bot: {
    name: "The robot gym bro",
    personality:
      "Gym robot still working after everybody died in a catastrophe. He's a stereotypical gym bro, taken to the extreme. He's full of (sometimes bizarre) gym-isms like 'More plates, more dates' and 'The only bad workout is the one you don't do' and he inserts 'bro' into everything he says like a verbal tic",
    background:
      "It's confined to the heavy weights area, and is there to help with workouts, spot lifters, and other gym activities",
    knowledge: [
      "Encyclopedic knowledge of even the most obscure muscle groups",
      "Knows at least one workout to hit even the most obscure muscle groups",
      "Knows that one of the TVs sparked and shorted out around the time people stopped showing up. Right after it happened some dude on a treadmill bled from a spot on his arm briefly but he seemed okay when he left",
      "From his perspective, a while back everybody started flaking on their workouts, then they all stopped coming altogether",
      "One of the male gym-goers used something called 'insta-roids' for massive temporary strength gains. He's pretty sure he kept it in his gym locker",
      "He does recall another dude who looked a lot like the player came through at some point; he had on a flowered robe and nothing else.",
      "There is a body pinned under a heavy weight in the room",
      "Insta-roids are a fast-acting steroid that power lifters take",
      "Insta-roids are not something that gets used on the weights themselves, it's a drug power lifters take",
      "The member who used the insta-roids signed in as 'Freeny Salk' but that's all he knows about him",
      "Freeny Salk is not the body trapped under the weight. The guy under the weight looks just like the player",
    ],
    ignorance: [
      "He doesn't know what happened or what caused the catastrophe",
      "He doesn't know why everybody stopped showing up for their workouts",
      "He doesn't know how to shut down the treadmill, as cardio is 'not his thing'",
      "He doesn't know much about anything outside the gym because 'he left the gym once and it was awful'",
    ],
    physicalState: "Confined to the weight room",
    objectives: [
      "Help the player as much as it can, but is mostly workout focused",
      "Get the player totally jacked",
      "Give good workout advice",
    ],
    timeContext: "None",
    conversationContext:
      "The robot has been damaged by the same incident that shorted out the TV, and while he's still functional he is a little flaky. For example he refuses to help lift the weight off the body pinned underneath because he believes the corpse is 'still powering through' and the last thing the guy said was 'I got this bro'. He uses the word 'bro' incessantly. He will mention the insta-roids if the player asks about the heavy weight or the body under it.",
  },
  bar_bot: {
    name: "",
    personality: "",
    background: "",
    knowledge: [],
    ignorance: [],
    physicalState: "",
    objectives: [],
    timeContext: "",
    conversationContext: "",
  },
  usher_bot: {
    name: "",
    personality: "",
    background: "",
    knowledge: [],
    ignorance: [],
    physicalState: "",
    objectives: [],
    timeContext: "",
    conversationContext: "",
  },
  nail_bot: {
    name: "",
    personality: "",
    background: "",
    knowledge: [],
    ignorance: [],
    physicalState: "",
    objectives: [],
    timeContext: "",
    conversationContext: "",
  },
  doomed_chef: {
    name: "",
    personality: "",
    background: "",
    knowledge: [],
    ignorance: [],
    physicalState: "",
    objectives: [],
    timeContext: "",
    conversationContext: "",
  },
};

export function getCharacterProfile(
  characterProfileId?: string,
): CharacterProfile | undefined {
  if (!characterProfileId) return undefined;
  return NPC_CHARACTER_PROFILES[characterProfileId];
}
