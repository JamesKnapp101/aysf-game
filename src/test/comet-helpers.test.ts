import { describe, expect, it } from "vitest";
import { getConversationCacheKey } from "../../server/src/routes/conversation";
import {
  classifyCometIntent,
  findRelevantCometEntries,
  shouldUseCometRoomContext,
} from "../game/components/cometHelpers";
import type { CometEntry } from "../game/components/comet-index";

const sampleEntries: CometEntry[] = [
  {
    id: "nexicorp",
    terms: ["nexicorp"],
    body: "NexiCorp is a medical technology company.",
  },
  {
    id: "dna",
    terms: ["DNA"],
    body: "DNA is the building block of life.",
  },
  {
    id: "dna_reader_wand",
    terms: ["DNA", "reader", "wand"],
    body: "DNA readers can analyze biological traces.",
  },
];

describe("Comet helpers", () => {
  it("classifies asks, tells, and edit requests for Comet", () => {
    expect(classifyCometIntent("How do I open the airlock door?")).toBe("ask");
    expect(classifyCometIntent("Please add this as a library entry")).toBe(
      "edit_request",
    );
    expect(classifyCometIntent("The airlock door is open")).toBe("tell");
  });

  it("finds relevant Comet entries from natural-language prompts", () => {
    const companyMatches = findRelevantCometEntries(sampleEntries, [
      "Tell me about the company NexiCorp",
    ]);
    expect(companyMatches.map((match) => match.entry.id)).toEqual(["nexicorp"]);

    const dnaMatches = findRelevantCometEntries(sampleEntries, [
      "Comet, what can I do with a DNA sampler?",
    ]);
    expect(dnaMatches.map((match) => match.entry.id)).toContain("dna");
    expect(dnaMatches.map((match) => match.entry.id)).toContain(
      "dna_reader_wand",
    );
  });

  it("only uses room-context mode for open-ended guidance prompts", () => {
    expect(shouldUseCometRoomContext("What should I do here?", 0)).toBe(true);
    expect(
      shouldUseCometRoomContext("How do I get past the ranger bot?", 0),
    ).toBe(true);
    expect(shouldUseCometRoomContext("Tell me about NexiCorp", 1)).toBe(false);
  });

  it("changes the conversation cache key when Comet context changes", () => {
    const baseRequest = {
      npcId: "comet",
      characterProfile: {
        directives: ["Be wise and pragmatic."],
        goals: ["Help with library queries."],
        identity: "A library assistant.",
        knownFacts: [],
        name: "Comet",
        scene: "Inside a handheld library terminal.",
        unknownFacts: [],
        voice: ["wise", "pragmatic"],
      },
      conversationHistory: [],
      playerInput: {
        type: "ask" as const,
        topic: "What should I do here?",
      },
    };

    const withoutContext = getConversationCacheKey(baseRequest);
    const withContext = getConversationCacheKey({
      ...baseRequest,
      assistantContext: "- Current room: Power Grid",
    });

    expect(withContext).not.toBe(withoutContext);
    expect(withContext).toMatch(/^v2:[a-f0-9]{64}$/);
  });
});
