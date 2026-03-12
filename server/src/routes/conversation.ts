import express, { Request, Response } from "express";
import {
  CharacterProfile,
  ConversationEntry,
  generateClaudeResponse,
  PlayerInput,
} from "../services/claudeService.js";

const router = express.Router();

interface ConversationRequest {
  npcId: string;
  characterProfile: CharacterProfile;
  conversationHistory: ConversationEntry[];
  playerInput: PlayerInput;
}

// In-memory cache to avoid re-asking same questions
// In production, use Redis or a database
const responseCache = new Map<string, string>();

// Simple rate limiting per NPC
const lastRequestTime = new Map<string, number>();
const RATE_LIMIT_MS = 100; // 1 second between requests

function getCacheKey(npcId: string, type: string, topic: string): string {
  return `${npcId}:${type}:${topic.toLowerCase().trim()}`;
}

router.post("/ask", async (req: Request, res: Response) => {
  try {
    const { npcId, characterProfile, conversationHistory, playerInput } =
      req.body as ConversationRequest;

    // Validate request
    if (!npcId || !characterProfile || !playerInput) {
      res.status(400).json({
        success: false,
        error: "Missing required fields",
        fallback: true,
      });
      return;
    }

    // Check rate limit
    const lastRequest = lastRequestTime.get(npcId) || 0;
    const now = Date.now();
    if (now - lastRequest < RATE_LIMIT_MS) {
      res.status(429).json({
        success: false,
        error: "Rate limit exceeded",
        fallback: true,
      });
      return;
    }
    lastRequestTime.set(npcId, now);

    // Check cache first
    const cacheKey = getCacheKey(npcId, playerInput.type, playerInput.topic);
    const cached = responseCache.get(cacheKey);
    if (cached) {
      console.log(`Cache hit for ${cacheKey}`);
      res.json({ success: true, response: cached, cached: true });
      return;
    }

    // Generate new response from Claude
    console.log(
      `Generating response for ${npcId}: ${playerInput.type} "${playerInput.topic}"`,
    );
    const response = await generateClaudeResponse({
      npcId,
      characterProfile,
      conversationHistory: conversationHistory || [],
      playerInput,
    });

    // Cache the response
    responseCache.set(cacheKey, response);

    res.json({ success: true, response, cached: false });
  } catch (error) {
    console.error("Conversation error:", error);

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
  });
});

// Clear cache endpoint (for development/testing)
router.post("/clear-cache", (req: Request, res: Response) => {
  responseCache.clear();
  res.json({ success: true, message: "Cache cleared" });
});

export default router;
