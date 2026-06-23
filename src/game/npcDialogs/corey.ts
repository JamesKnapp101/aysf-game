import type { NpcDialogEntry } from "@game/types/npcTypes";
import { COMMON_ASK, COMMON_TELL } from "./common";

const POPULATION_EXPLANATION =
  "Almost half a million people are frozen in Deep Storage. That still left nearly nineteen billion who could not come aboard physically. Their consciousnesses were digitized and placed in calm virtual workplaces. Each person experiences one satisfactory hour of light work, then the day resets and they remember none of the repetition. Officially, many will receive robot bodies at our destination. Just between us, I doubt most will. Having nineteen billion people is part of why Earth had to be left in the first place.";

export const coreyDialog = {
  ask: {
    ...COMMON_ASK,
    self: "I'm Corey, the core operations unit. The name predates me and was apparently considered very funny.",
    reactor:
      "Replace corrupted lobe 13, let the consensus settle, authorize the terminal with the Engine Room Key, and restart the core. Simple, provided one ignores the radiation and heat.",
    lobes:
      "Each Reactor Lobe is an AI module participating in the containment consensus. One corrupted voice can persuade the others if given enough time.",
    people: POPULATION_EXPLANATION,
    population: POPULATION_EXPLANATION,
    "deep storage": POPULATION_EXPLANATION,
    digitized: POPULATION_EXPLANATION,
    consciousness: POPULATION_EXPLANATION,
    "virtual employees": POPULATION_EXPLANATION,
    "19 billion": POPULATION_EXPLANATION,
    goggles:
      "The goggles provide maintenance access to one of the virtual employee environments. They are diagnostic equipment, though diagnosis sometimes becomes anthropology.",
  },
  tell: { ...COMMON_TELL },
} satisfies NpcDialogEntry;
