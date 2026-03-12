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

interface GenerateParams {
  voiceId: string;
  characterProfile: CharacterProfile;
  conversationHistory: ConversationEntry[];
  playerInput: PlayerInput;
}

export async function generateClaudeResponse(
  params: GenerateParams,
): Promise<string> {
  const { characterProfile, conversationHistory, playerInput } = params;

  // Create Anthropic client with API key from environment
  // This ensures the API key is loaded before the client is created
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  // Build system prompt with character context
  const systemPrompt = buildSystemPrompt(characterProfile);

  // Build conversation history for Claude
  const messages = buildMessages(conversationHistory, playerInput);

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001", // Cheapest option, fast and efficient
    max_tokens: 200, // Keep radio responses concise
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

function buildSystemPrompt(characterProfile: CharacterProfile): string {
  return `You are playing the character of ${characterProfile.name} in an interactive fiction game. This is a radio conversation with static and poor reception.

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
${characterProfile.objectives.map((o) => `- ${o}`).join("\n")}

**Critical Instructions:**
1. Stay in character at ALL times - you are ${characterProfile.name}, not an AI
2. Keep responses VERY SHORT (1-3 sentences max) - this is radio with static
3. Show your physical state: cough, groan, breathe heavily when appropriate
4. Use "(cough)" as a verbal tic occasionally
5. If asked about something you don't know, express it naturally: "I don't know man..." or "My memory is fried..."
6. Don't break the fourth wall or acknowledge being an AI assistant
7. Reference past conversation when relevant
8. Sound urgent but helpful - you're dying but trying to help the player survive
9. Use informal language: "man", "shit", "holy crap", etc.
10. DO NOT include radio formatting like "*pop*" - the game adds that

**Example Good Responses:**
- "Yeah man (cough)...I found one of those too...creepy as hell..."
- "I don't know (cough)...my memory is totally fried...but I know this place..."
- "Shit no way...you gotta get the power on first (cough cough)..."

**Example Bad Responses:**
- "*pop* I can help you with that information *pop*" (too formal, includes formatting)
- "As Kevin, I would say..." (breaking character)
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

    // Kevin's past response
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
