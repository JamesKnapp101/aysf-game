// Frontend client for Claude conversation API
// This runs in the browser but calls your secure backend

import type {
  CharacterProfile,
  ConversationHistoryEntry,
} from "@game/types/npcTypes";
import {
  conversationErrorCode,
  reportAiConversationFailure,
  type AiConversationFailure,
} from "./conversationDiagnostics";

const API_BASE =
  import.meta.env.PROD
    ? "/api" // Production uses same domain
    : "http://localhost:3001/api"; // Dev uses proxy or direct

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
  gossipSharedWithNpc: string[];
  npcSecret?: NpcSecretContext;
  playerGossipInventory?: unknown[];
}

interface ClaudeResponse {
  success: boolean;
  response?: string;
  cached?: boolean;
  error?: string;
  fallback?: boolean;
  reasonCode?: string;
  code?: string;
}

// Track pending requests to prevent duplicate API calls
const pendingRequests = new Map<string, Promise<string | null>>();

function getRequestKey(npcId: string, type: string, topic: string): string {
  return `${npcId}:${type}:${topic.toLowerCase().trim()}`;
}

function logClaudeDebug(message: string): void {
  if (import.meta.env.DEV && import.meta.env.MODE !== "test") {
    console.debug(message);
  }
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
  gossipContext?: GossipContext,
  assistantContext?: string,
): Promise<string | null> {
  // Check if there's already a pending request for this exact question
  const requestKey = getRequestKey(npcId, playerInput.type, playerInput.topic);

  const existingRequest = pendingRequests.get(requestKey);
  if (existingRequest) {
    logClaudeDebug(`Reusing pending Claude request for ${npcId}`);
    return existingRequest;
  }

  // Create new request promise
  const requestPromise = (async () => {
    const endpoint = `${API_BASE}/conversation/ask`;
    let status: number | undefined;
    let requestId: string | undefined;
    let reason: AiConversationFailure["reason"] = "network_error";
    const fail = (failureReason: AiConversationFailure["reason"], reasonCode?: string, errorName?: string) => {
      reportAiConversationFailure({
        npcId, ...playerInput, endpoint, reason: failureReason,
        ...(status === undefined ? {} : { status }),
        ...(requestId ? { requestId } : {}),
        ...(reasonCode ? { reasonCode } : {}),
        ...(errorName ? { errorName } : {}),
      });
      return null;
    };
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          npcId,
          characterProfile,
          conversationHistory,
          playerInput,
          gossipContext,
          assistantContext,
        }),
      });
      status = response.status;
      requestId = response.headers?.get("x-request-id") ?? undefined;
      reason = response.ok ? "invalid_json" : "http_error";
      let data: ClaudeResponse | null;
      try {
        data = await response.json();
      } catch (error) {
        return fail(reason, conversationErrorCode(error), error instanceof Error ? error.name : undefined);
      }
      const reasonCode = typeof data?.reasonCode === "string"
        ? data.reasonCode
        : typeof data?.code === "string" ? data.code : undefined;
      if (!response.ok) {
        return fail("http_error", reasonCode);
      }

      if (!data?.success) return fail("api_error", reasonCode);
      if (typeof data.response !== "string" || !data.response.trim())
        return fail("empty_response", reasonCode);

      if (data.cached) {
        logClaudeDebug(`Using cached response for ${npcId}`);
      }

      return data.response;
    } catch (error) {
      return fail(reason, conversationErrorCode(error), error instanceof Error ? error.name : undefined);
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
