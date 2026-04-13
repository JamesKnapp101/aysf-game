import express, { Request, Response } from "express";
import {
  CharacterProfile,
  ConversationEntry,
  generateClaudeResponse,
  GossipContext,
  PlayerInput,
} from "../services/claudeService.js";
import { getClientIp, summarizeTopicForLog } from "../utils/requestMeta.js";

const router = express.Router();

interface ConversationRequest {
  npcId: string;
  assistantContext?: string;
  characterProfile: CharacterProfile;
  conversationHistory: ConversationEntry[];
  playerInput: PlayerInput;
  gossipContext?: GossipContext;
}

// In-memory cache to avoid re-asking same questions
// In production, use Redis or a database
const responseCache = new Map<string, string>();
const MAX_CACHE_ENTRIES = 500;

// In-memory request governor to keep public abuse bounded.
const clientConversationRequests = new Map<string, number[]>();
const lastClientNpcRequestTime = new Map<string, number>();
const BURST_WINDOW_MS = 10_000;
const BURST_MAX_REQUESTS = 6;
const SUSTAINED_WINDOW_MS = 60_000;
const SUSTAINED_MAX_REQUESTS = 20;
const CLIENT_NPC_COOLDOWN_MS = 1_500;

export function getConversationCacheKey(request: ConversationRequest): string {
  return JSON.stringify({
    npcId: request.npcId,
    assistantContext: request.assistantContext ?? null,
    characterProfile: request.characterProfile,
    conversationHistory: request.conversationHistory ?? [],
    playerInput: {
      type: request.playerInput.type,
      topic: request.playerInput.topic.toLowerCase().trim(),
    },
    gossipContext: request.gossipContext ?? null,
  });
}

function getRequestId(res: Response): string {
  return String(res.locals.requestId ?? "------");
}

function pruneRecentRequestTimestamps(
  clientId: string,
  now: number,
): number[] {
  const recent = (clientConversationRequests.get(clientId) ?? []).filter(
    (timestamp) => now - timestamp < SUSTAINED_WINDOW_MS,
  );

  if (recent.length === 0) {
    clientConversationRequests.delete(clientId);
    return [];
  }

  clientConversationRequests.set(clientId, recent);
  return recent;
}

function rememberConversationRequest(clientId: string, now: number): number[] {
  const recent = pruneRecentRequestTimestamps(clientId, now);
  const next = [...recent, now];
  clientConversationRequests.set(clientId, next);
  return next;
}

function rememberCachedResponse(cacheKey: string, response: string): void {
  if (responseCache.has(cacheKey)) {
    responseCache.delete(cacheKey);
  } else if (responseCache.size >= MAX_CACHE_ENTRIES) {
    const oldestCacheKey = responseCache.keys().next().value;
    if (oldestCacheKey) {
      responseCache.delete(oldestCacheKey);
    }
  }

  responseCache.set(cacheKey, response);
}

router.post("/ask", async (req: Request, res: Response) => {
  const requestId = getRequestId(res);
  const clientIp = getClientIp(req);

  try {
    const {
      npcId,
      assistantContext,
      characterProfile,
      conversationHistory,
      playerInput,
      gossipContext,
    } = req.body as ConversationRequest;

    // Validate request
    if (!npcId || !characterProfile || !playerInput) {
      console.warn(
        `[AI REJECT ${requestId}] ip=${clientIp} reason=missing-required-fields`,
      );
      res.status(400).json({
        success: false,
        error: "Missing required fields",
        fallback: true,
      });
      return;
    }

    const now = Date.now();
    const topicSummary = summarizeTopicForLog(playerInput.topic);
    const recentRequests = pruneRecentRequestTimestamps(clientIp, now);
    const burstRequests = recentRequests.filter(
      (timestamp) => now - timestamp < BURST_WINDOW_MS,
    );

    if (burstRequests.length >= BURST_MAX_REQUESTS) {
      console.warn(
        `[AI LIMIT ${requestId}] ip=${clientIp} npc=${npcId} reason=burst windowMs=${BURST_WINDOW_MS} requests=${burstRequests.length}`,
      );
      res.status(429).json({
        success: false,
        error: "Too many conversation requests in a short burst. Please wait a moment.",
        fallback: true,
      });
      return;
    }

    if (recentRequests.length >= SUSTAINED_MAX_REQUESTS) {
      console.warn(
        `[AI LIMIT ${requestId}] ip=${clientIp} npc=${npcId} reason=sustained windowMs=${SUSTAINED_WINDOW_MS} requests=${recentRequests.length}`,
      );
      res.status(429).json({
        success: false,
        error: "Too many conversation requests in a short period. Please wait a minute and try again.",
        fallback: true,
      });
      return;
    }

    const lastNpcRequestAt =
      lastClientNpcRequestTime.get(`${clientIp}:${npcId}`) ?? 0;
    if (now - lastNpcRequestAt < CLIENT_NPC_COOLDOWN_MS) {
      console.warn(
        `[AI LIMIT ${requestId}] ip=${clientIp} npc=${npcId} reason=npc-cooldown cooldownMs=${CLIENT_NPC_COOLDOWN_MS}`,
      );
      res.status(429).json({
        success: false,
        error: "That conversation is moving too quickly. Give it a second and try again.",
        fallback: true,
      });
      return;
    }

    rememberConversationRequest(clientIp, now);
    lastClientNpcRequestTime.set(`${clientIp}:${npcId}`, now);

    // Check cache first
    const cacheKey = getConversationCacheKey({
      npcId,
      assistantContext,
      characterProfile,
      conversationHistory: conversationHistory || [],
      playerInput,
      gossipContext,
    });
    const cached = responseCache.get(cacheKey);
    if (cached) {
      console.log(
        `[AI CACHE ${requestId}] ip=${clientIp} npc=${npcId} type=${playerInput.type} topic="${topicSummary}"`,
      );
      res.json({ success: true, response: cached, cached: true });
      return;
    }

    // Generate new response from Claude
    console.log(
      `[AI GENERATE ${requestId}] ip=${clientIp} npc=${npcId} type=${playerInput.type} topic="${topicSummary}" history=${conversationHistory?.length ?? 0}`,
    );
    const response = await generateClaudeResponse({
      npcId,
      assistantContext,
      characterProfile,
      conversationHistory: conversationHistory || [],
      playerInput,
      gossipContext,
    });

    // Cache the response
    rememberCachedResponse(cacheKey, response);

    res.json({ success: true, response, cached: false });
  } catch (error) {
    const npcId =
      typeof (req.body as Partial<ConversationRequest> | undefined)?.npcId === "string"
        ? (req.body as ConversationRequest).npcId
        : "unknown";
    const playerInput =
      (req.body as Partial<ConversationRequest> | undefined)?.playerInput;
    const topicSummary =
      playerInput && typeof playerInput.topic === "string"
        ? summarizeTopicForLog(playerInput.topic)
        : "(unknown)";

    console.error(
      `[AI ERROR ${requestId}] ip=${clientIp} npc=${npcId} topic="${topicSummary}"`,
      error,
    );

    // Return error but signal to use fallback
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      fallback: true,
    });
  }
});
// Health check endpoint
router.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    cacheSize: responseCache.size,
    trackedClients: clientConversationRequests.size,
    trackedNpcCooldowns: lastClientNpcRequestTime.size,
  });
});

// Clear cache endpoint (for development/testing)
router.post("/clear-cache", (req: Request, res: Response) => {
  if (process.env.NODE_ENV === "production") {
    res.status(404).json({
      success: false,
      error: "Not found",
    });
    return;
  }

  responseCache.clear();
  res.json({ success: true, message: "Cache cleared" });
});

export default router;
