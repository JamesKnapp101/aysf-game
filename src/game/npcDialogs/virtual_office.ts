import type { NpcDialogEntry } from "@game/types/npcTypes";
import { COMMON_ASK, COMMON_TELL } from "./common";

export const lemsterDialog = {
  ask: {
    ...COMMON_ASK,
    self: "Lemster. Sorry, I really cannot stop. If I miss today's target I'll be here until midnight.",
    work: "All of it. Every form in every stack, then the reconciliation queue. Please, I have to keep moving.",
    manager: "We're a team. Everybody is feeling the pain. I've heard the speech.",
  },
  tell: { ...COMMON_TELL },
} satisfies NpcDialogEntry;

export const virtualManagerDialog = {
  ask: {
    ...COMMON_ASK,
    self: "I am a performance enablement manager. I unlock employee potential by refusing to recognize limits.",
    lemster: "Lemster is a vital member of the team who can absolutely absorb another twelve percent workload.",
    workload:
      "The burden-allocation controls are available for optimization, but their final balancing logic is still awaiting implementation.",
    employees:
      "Nineteen billion contributors, one team. Imagine the synergies. Then increase them.",
    happiness:
      "Happiness is an important output-adjacent sentiment. A future control revision may permit redistributing work while preserving reactor output.",
  },
  tell: { ...COMMON_TELL },
} satisfies NpcDialogEntry;
