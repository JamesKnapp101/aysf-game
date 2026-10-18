/** Diagnostics for the host/developer; never part of NPC speech. */
export type AiConversationFailure = Readonly<{
  timestamp: string;
  npcId: string;
  type: "ask" | "tell";
  topic: string;
  reason: "network_error" | "http_error" | "invalid_json" | "api_error" | "empty_response" | "integration_error";
  endpoint?: string;
  status?: number;
  reasonCode?: string;
  requestId?: string;
  errorName?: string;
}>;

const listeners = new Set<(failure: AiConversationFailure) => void>();

export function subscribeAiConversationFailures(
  listener: (failure: AiConversationFailure) => void,
): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

/** Node fetch often nests ECONNREFUSED inside a cause or AggregateError. */
export function conversationErrorCode(error: unknown): string | undefined {
  const queue: unknown[] = [error];
  const visited = new Set<unknown>();
  while (queue.length && visited.size < 16) {
    const next = queue.shift();
    if (!next || typeof next !== "object" || visited.has(next)) continue;
    visited.add(next);
    const details = next as { code?: unknown; cause?: unknown; errors?: unknown };
    if (typeof details.code === "string") return details.code;
    queue.push(details.cause);
    if (Array.isArray(details.errors)) queue.push(...details.errors);
  }
  return undefined;
}

export function reportAiConversationFailure(
  details: Omit<AiConversationFailure, "timestamp">,
): void {
  const failure = Object.freeze({ timestamp: new Date().toISOString(), ...details });
  console.warn(`[AI CONVERSATION FAILURE] ${JSON.stringify(failure)}`);
  for (const listener of listeners) {
    // Logging must not interrupt the normal authored-dialogue fallback.
    try { listener(failure); } catch { /* Host logging is best effort. */ }
  }
}
