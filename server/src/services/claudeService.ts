import Anthropic from "@anthropic-ai/sdk";

export interface CompactCharacterProfile {
  directives?: string[];
  goals: string[];
  identity: string;
  knownFacts: string[];
  name: string;
  scene: string;
  unknownFacts: string[];
  voice: string[];
}

export interface LegacyCharacterProfile {
  background: string;
  conversationContext?: string;
  ignorance: string[];
  knowledge: string[];
  name: string;
  objectives: string[];
  personality: string;
  physicalState: string;
  timeContext: string;
}

export type CharacterProfile = CompactCharacterProfile | LegacyCharacterProfile;

export interface ConversationEntry {
  turn: number;
  type: "ask" | "tell";
  topic: string;
  response: string;
}

export interface PlayerInput {
  type: "ask" | "tell";
  topic: string;
}

export interface NpcSecretContext {
  text: string;
  requiresGossipCount: number;
  currentCount: number;
}

export interface GossipContext {
  gossipSharedWithNpc: string[]; // IDs of gossip told to this NPC
  npcSecret?: NpcSecretContext; // Secret this NPC knows (if any)
  playerGossipInventory?: unknown[]; // Legacy field kept for compatibility
}

interface GenerateParams {
  npcId: string;
  assistantContext?: string;
  characterProfile: CharacterProfile;
  conversationHistory: ConversationEntry[];
  playerInput: PlayerInput;
  gossipContext?: GossipContext;
}

export async function generateClaudeResponse(
  params: GenerateParams,
): Promise<string> {
  const {
    assistantContext,
    characterProfile,
    conversationHistory,
    playerInput,
    gossipContext,
  } = params;

  // Create Anthropic client with API key from environment
  // This ensures the API key is loaded before the client is created
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  // Build system prompt with character context
  const systemPrompt = buildSystemPrompt(
    characterProfile,
    playerInput,
    gossipContext,
    assistantContext,
  );

  // Build conversation history for Claude
  const messages = buildMessages(conversationHistory, playerInput);

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001", // Cheapest option, fast and efficient
    max_tokens: 200, // Keep responses concise
    temperature: 0.8, // Some variety but mostly consistent
    system: systemPrompt,
    messages,
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  return content.text.trim();
}

export function buildSystemPrompt(
  characterProfile: CharacterProfile,
  playerInput: PlayerInput,
  gossipContext?: GossipContext,
  assistantContext?: string,
): string {
  const profile = normalizeCharacterProfile(characterProfile);
  let gossipInstructions = "";
  const contextInstructions = assistantContext?.trim()
    ? `\nLive context for this interaction:\n${assistantContext.trim()}`
    : "";
  if (gossipContext?.npcSecret) {
    const { requiresGossipCount, currentCount, text } = gossipContext.npcSecret;
    const remaining = requiresGossipCount - currentCount;

    if (currentCount >= requiresGossipCount) {
      const revealInstruction =
        playerInput.type === "tell"
          ? "The player's current message is gossip you accepted. In this response, you must react to it and explicitly reveal your secret."
          : "Your gossip requirement is already satisfied. In this response, explicitly reveal your secret instead of hinting at it or saving it for later.";

      gossipInstructions = `\nGossip:
- Requirement met (${currentCount}/${requiresGossipCount})
- ${revealInstruction}
- Secret to reveal now: "${text}"
- Do not withhold this secret, tease it, or postpone it to a later response.`;
    } else {
      gossipInstructions = `\nGossip:
- Share your secret only after ${requiresGossipCount} different gossip items
- Current count: ${currentCount}
- Still needed: ${remaining}
- When the player shares gossip, react enthusiastically and ask for more`;
    }

    if (gossipContext.gossipSharedWithNpc.length > 0) {
      gossipInstructions += `\n- Already heard:
${gossipContext.gossipSharedWithNpc.map((id) => `  - ${id}`).join("\n")}`;
    }
  }

  return `Roleplay as ${profile.name}.

Setting:
- A catastrophe hit a generation ship more than a thousand years into its voyage.
- The ship has huge indoor outdoor-like spaces, including a Park, Preserve, and Aviary.
- Deep Storage holds vast numbers of humans in stasis. Daytime crews wake for three-year shifts, then return to stasis.
- Most of the current crew is dead. Mostly robots and a few survivors remain active.

NPC:
- Identity: ${profile.identity}
${formatInlineList("Voice", profile.voice)}
- Scene: ${profile.scene}
${formatBulletList("Goals", profile.goals)}
${formatBulletList("Known facts", profile.knownFacts)}
${formatBulletList("Unknown facts", profile.unknownFacts)}
${formatBulletList("Directives", profile.directives ?? [])}${gossipInstructions}${contextInstructions}

Reply rules:
- Stay in character. You are ${profile.name}, not an AI.
- Reply in 1-3 short sentences.
- Let the voice and scene shape the wording.
- Treat the listed Directives as hard constraints on phrasing and delivery.
- Use only known facts. If asked about an unknown fact, respond with natural uncertainty.
- Reference prior conversation when useful.
- Do not use stage directions, speaker labels, asterisks, or narrative asides like "*shallow breath*". Express tone, pain, and effort only through the spoken words unless literally spoken.
- No fourth-wall breaks, em dashes, or profanity.
- Anything from the player's present day counts as ancient history in this setting.`;
}

function formatBulletList(label: string, items: string[]): string {
  if (items.length === 0) {
    return `${label}:\n- none`;
  }

  return `${label}:\n${items.map((item) => `- ${item}`).join("\n")}`;
}

function formatInlineList(label: string, items: string[]): string {
  return `- ${label}: ${items.length > 0 ? items.join(", ") : "none"}`;
}

function normalizeCharacterProfile(
  profile: CharacterProfile,
): CompactCharacterProfile {
  if ("identity" in profile) {
    return profile;
  }

  return {
    directives: [],
    goals: profile.objectives,
    identity: profile.background,
    knownFacts: profile.knowledge,
    name: profile.name,
    scene: [
      profile.conversationContext,
      profile.physicalState,
      profile.timeContext,
    ]
      .filter(Boolean)
      .join(" "),
    unknownFacts: profile.ignorance,
    voice: profile.personality
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean),
  };
}

function buildMessages(
  history: ConversationEntry[],
  playerInput: PlayerInput,
): Anthropic.MessageParam[] {
  const messages: Anthropic.MessageParam[] = [];

  // Add conversation history
  for (const entry of history) {
    // Player's input
    if (entry.type === "ask") {
      messages.push({
        role: "user",
        content: `Player asks you about: "${entry.topic}"`,
      });
    } else if (entry.type === "tell") {
      messages.push({
        role: "user",
        content: `Player tells you: "${entry.topic}"`,
      });
    }

    // NPC's past response
    messages.push({
      role: "assistant",
      content: entry.response,
    });
  }

  // Add current input
  if (playerInput.type === "ask") {
    messages.push({
      role: "user",
      content: `Player asks you about: "${playerInput.topic}"`,
    });
  } else if (playerInput.type === "tell") {
    messages.push({
      role: "user",
      content: `Player tells you: "${playerInput.topic}"`,
    });
  }

  return messages;
}
