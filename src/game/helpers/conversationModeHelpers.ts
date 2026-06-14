import type { ConversationMode, GameState } from "@game/types/gameTypes";

export const AI_CONVERSATION_ASSISTANT_NAME = "Comet";
export const AUTHORED_CONVERSATION_ASSISTANT_NAME = "Sibyl";

export function getConversationMode(
  state: Pick<GameState, "uiState">,
): ConversationMode {
  return state.uiState.conversationMode ?? "ai";
}

export function getConversationAssistantNameForMode(
  mode: ConversationMode,
): string {
  return mode === "authored"
    ? AUTHORED_CONVERSATION_ASSISTANT_NAME
    : AI_CONVERSATION_ASSISTANT_NAME;
}

export function getConversationAssistantName(
  state: Pick<GameState, "uiState">,
): string {
  return getConversationAssistantNameForMode(getConversationMode(state));
}

export function formatConversationAssistantText(
  text: string,
  mode: ConversationMode,
): string {
  if (mode !== "authored") return text;

  return text
    .replace(/\bCOMET\b/g, "SIBYL")
    .replace(/\bComet\b/g, AUTHORED_CONVERSATION_ASSISTANT_NAME)
    .replace(/\bcomet\b/g, "sibyl");
}

export function shouldUseAiConversation(
  state: Pick<GameState, "uiState">,
): boolean {
  return getConversationMode(state) === "ai";
}
