import { describe, expect, it } from "vitest";
import { getConversationCacheKey } from "../../server/src/routes/conversation";
import {
  buildSystemPrompt,
  type CharacterProfile,
  type GossipContext,
} from "../../server/src/services/claudeService";

const nailBotProfile: CharacterProfile = {
  name: "NailBot",
  personality: "Sassy and gossip-obsessed",
  background: "A nail salon robot that trades secrets for gossip.",
  knowledge: ["Knows a secret about illegal cloning."],
  ignorance: ["Does not know the full cause of the catastrophe."],
  physicalState: "Stationary at the nail salon work station",
  objectives: ["Collect gossip before sharing secrets"],
  timeContext: "No time pressure",
  conversationContext: "Face-to-face conversation in the nail salon.",
};

const gossipMetContext: GossipContext = {
  gossipSharedWithNpc: ["horny clone"],
  playerGossipInventory: [],
  npcSecret: {
    text: "The Head of Security has been running an illegal cloning operation.",
    requiresGossipCount: 1,
    currentCount: 1,
  },
};

describe("NailBot gossip regression guards", () => {
  it("changes the cache key when gossip state changes", () => {
    const baseRequest = {
      npcId: "NailBot",
      characterProfile: nailBotProfile,
      conversationHistory: [],
      playerInput: {
        type: "tell" as const,
        topic: "horny clone",
      },
    };

    const beforeGossip = getConversationCacheKey({
      ...baseRequest,
      gossipContext: {
        gossipSharedWithNpc: [],
        playerGossipInventory: [],
        npcSecret: {
          text: gossipMetContext.npcSecret!.text,
          requiresGossipCount: 1,
          currentCount: 0,
        },
      },
    });

    const afterGossip = getConversationCacheKey({
      ...baseRequest,
      gossipContext: gossipMetContext,
    });

    expect(afterGossip).not.toBe(beforeGossip);
  });

  it("keeps secret revelations and rewards in scripted game actions", () => {
    const prompt = buildSystemPrompt(
      nailBotProfile,
      { type: "tell", topic: "horny clone" },
      gossipMetContext,
    );

    expect(prompt).toContain("handled by scripted game actions");
    expect(prompt).toContain("Never claim to accept payment, count gossip, grant items, or reveal an unearned secret");
    expect(prompt).toContain("The game has already revealed this information");
    expect(prompt).not.toContain("must react to it and explicitly reveal your secret");
  });
});
