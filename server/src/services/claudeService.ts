import Anthropic from "@anthropic-ai/sdk";

export interface CharacterProfile {
  name: string;
  personality: string;
  background: string;
  knowledge: string[];
  ignorance: string[];
  physicalState: string;
  objectives: string[];
  timeContext: string;
  conversationContext?: string;
}

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

export interface JuicyTopic {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  type: "gossip" | "secret";
}

export interface NpcSecretContext {
  text: string;
  requiresGossipCount: number;
  currentCount: number;
}

export interface GossipContext {
  gossipSharedWithNpc: string[]; // IDs of gossip told to this NPC
  playerGossipInventory: JuicyTopic[]; // Gossip the player has collected
  npcSecret?: NpcSecretContext; // Secret this NPC knows (if any)
}

interface GenerateParams {
  npcId: string;
  characterProfile: CharacterProfile;
  conversationHistory: ConversationEntry[];
  playerInput: PlayerInput;
  gossipContext?: GossipContext;
}

export async function generateClaudeResponse(
  params: GenerateParams,
): Promise<string> {
  const { characterProfile, conversationHistory, playerInput, gossipContext } =
    params;

  // Create Anthropic client with API key from environment
  // This ensures the API key is loaded before the client is created
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  // Build system prompt with character context
  const systemPrompt = buildSystemPrompt(characterProfile, gossipContext);

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

function buildSystemPrompt(
  characterProfile: CharacterProfile,
  gossipContext?: GossipContext,
): string {
  const conversationContext =
    characterProfile.conversationContext ??
    "This conversation takes place inside an interactive fiction game.";

  let gossipInstructions = "";
  if (gossipContext?.npcSecret) {
    const { requiresGossipCount, currentCount, text } = gossipContext.npcSecret;
    const remaining = requiresGossipCount - currentCount;

    if (currentCount >= requiresGossipCount) {
      gossipInstructions = `\n\n**GOSSIP REQUIREMENT MET:**
You have received ${currentCount} pieces of gossip from the player, meeting your requirement of ${requiresGossipCount}.
You can now reveal your secret: "${text}"

When appropriate (especially if the player shares more gossip or asks you something), include this secret in your response naturally and in character.`;
    } else {
      gossipInstructions = `\n\n**GOSSIP REQUIREMENT:**
You are a gossip hound and LOVE hearing juicy secrets. You know a secret, but you'll only share it after the player tells you ${requiresGossipCount} different pieces of gossip.
- So far, they've told you ${currentCount} piece(s) of gossip
- You need ${remaining} more before you'll share your secret
- When they share gossip, respond enthusiastically and fish for more
- Be eager and excited about gossip - it's what you live for!`;
    }

    if (gossipContext.gossipSharedWithNpc.length > 0) {
      gossipInstructions += `\n\n**Gossip the player has shared with you:**
${gossipContext.gossipSharedWithNpc.map((id) => `- ${id}`).join("\n")}`;
    }
  }

  return `You are playing the character of ${characterProfile.name} in an interactive fiction game.
${conversationContext}

**Character Profile:**
- Personality: ${characterProfile.personality}
- Background: ${characterProfile.background}
- Physical State: ${characterProfile.physicalState}
- Time Pressure: ${characterProfile.timeContext}

**What you know about:**
${characterProfile.knowledge.map((k) => `- ${k}`).join("\n")}

**What you DON'T know (respond vaguely or express confusion):**
${characterProfile.ignorance.map((k) => `- ${k}`).join("\n")}

**Your objectives (hint at these when relevant):**
${characterProfile.objectives.map((o) => `- ${o}`).join("\n")}${gossipInstructions}

**Critical Instructions:**
1. Stay in character at ALL times - you are ${characterProfile.name}, not an AI
2. Keep responses VERY SHORT (1-3 sentences max)
3. Let the personality, background, physical state, and conversation context shape the wording
4. If asked about something you don't know, express uncertainty naturally and in character
5. Don't break the fourth wall or acknowledge being an AI assistant
6. Reference past conversation when relevant
7. Do not add formatting like "*pop*", speaker labels, or stage directions unless the character would literally say them
8. Keep the response grounded in what the character knows, wants, and is currently capable of saying

**Example Good Responses:**
- "I know what you mean. Keep moving."
- "I'm not sure. Memory's a mess right now."
- "That tracks. Be careful."

**Example Bad Responses:**
- "*pop* I can help you with that information *pop*" (includes formatting the game should add)
- "As this character, I would say..." (breaking character)
- Long explanations (keep it brief!)`;
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
