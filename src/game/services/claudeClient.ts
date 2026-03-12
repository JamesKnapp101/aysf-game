// Frontend client for Claude conversation API
// This runs in the browser but calls your secure backend

import type {
  CharacterProfile,
  ConversationHistoryEntry,
} from "@game/types/npcTypes";

const API_BASE =
  process.env.NODE_ENV === "production"
    ? "/api" // Production uses same domain
    : "http://localhost:3001/api"; // Dev uses proxy or direct

export interface PlayerInput {
  type: "ask" | "tell";
  topic: string;
}

interface ClaudeResponse {
  success: boolean;
  response?: string;
  cached?: boolean;
  error?: string;
  fallback?: boolean;
}

// Track pending requests to prevent duplicate API calls
const pendingRequests = new Map<string, Promise<string | null>>();

function getRequestKey(npcId: string, type: string, topic: string): string {
  return `${npcId}:${type}:${topic.toLowerCase().trim()}`;
}

/**
 * Get a Claude-generated response for an NPC conversation
 * Returns null if the API fails (signals to use static fallback)
 */
export async function getClaudeResponse(
  npcId: string,
  characterProfile: CharacterProfile,
  conversationHistory: ConversationHistoryEntry[],
  playerInput: PlayerInput,
): Promise<string | null> {
  // Check if there's already a pending request for this exact question
  const requestKey = getRequestKey(npcId, playerInput.type, playerInput.topic);

  const existingRequest = pendingRequests.get(requestKey);
  if (existingRequest) {
    console.log(`Reusing pending request for ${requestKey}`);
    return existingRequest;
  }

  // Create new request promise
  const requestPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE}/conversation/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          npcId,
          characterProfile,
          conversationHistory,
          playerInput,
        }),
      });

      if (!response.ok) {
        console.warn(
          `Claude API returned ${response.status}, falling back to static dialog`,
        );
        return null;
      }

      const data: ClaudeResponse = await response.json();

      if (!data.success || !data.response) {
        console.warn("Claude API failed, falling back to static dialog");
        return null;
      }

      if (data.cached) {
        console.log(`Using cached response for ${npcId}`);
      }

      return data.response;
    } catch (error) {
      console.error("Failed to reach Claude service:", error);
      return null; // Signal to use static fallback
    } finally {
      // Clean up pending request after completion
      pendingRequests.delete(requestKey);
    }
  })();

  // Store the promise so duplicate requests can reuse it
  pendingRequests.set(requestKey, requestPromise);

  return requestPromise;
}

/**
 * Check if the Claude API server is reachable
 */
export async function checkClaudeServerHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/health`, {
      method: "GET",
    });
    return response.ok;
  } catch {
    return false;
  }
}
