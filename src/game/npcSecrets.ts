export type NpcSecret = {
  id: string;
  npcId: string;
  text: string;
  requiredGossipCount: number;
  // Optional: require specific gossip IDs (not just any X gossips)
  requiredGossipIds?: string[];
};

export const NPC_SECRETS: Record<string, NpcSecret> = {
  nailbot_secret: {
    id: "nailbot_secret",
    npcId: "nail_bot",
    text: "Okay, this is supposed to be a secret, but I can tell you... The Head of Security has been running an illegal cloning operation in the lower levels. I've seen clone bodies with the same faces walking around at different times.",
    requiredGossipCount: 6,
  },
  // Add BarBot and other NPC secrets here in the future
};

export function getSecretForNpc(npcId: string): NpcSecret | undefined {
  return Object.values(NPC_SECRETS).find((secret) => secret.npcId === npcId);
}
