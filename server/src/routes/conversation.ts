import express, { Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { generateClaudeResponse } from "../services/claudeService.js";
import {
  formatPlayerInputForLog,
  getClientIp,
  summarizeErrorForLog,
  summarizeTopicForLog,
} from "../utils/requestMeta.js";
import {
  type ConversationRequest,
  validateConversationRequest,
} from "./conversationValidation.js";

const DEFAULT_RATE_LIMIT_WINDOW_MS = 60_000;
const DEFAULT_RATE_LIMIT_REQUESTS = 8;
const MAX_CACHE_ENTRIES = 500;

export type GenerateConversationResponse = (
  request: ConversationRequest,
) => Promise<string>;

interface ConversationRouterOptions {
  generateResponse?: GenerateConversationResponse;
  rateLimitMaxRequests?: number;
  rateLimitWindowMs?: number;
}

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

function rememberCachedResponse(
  responseCache: Map<string, string>,
  cacheKey: string,
  response: string,
): void {
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

export function createConversationRouter(
  options: ConversationRouterOptions = {},
): express.Router {
  const router = express.Router();
  const responseCache = new Map<string, string>();
  const generateResponse = options.generateResponse ?? generateClaudeResponse;
  const limiter = rateLimit({
    legacyHeaders: false,
    limit: options.rateLimitMaxRequests ?? DEFAULT_RATE_LIMIT_REQUESTS,
    standardHeaders: "draft-8",
    windowMs: options.rateLimitWindowMs ?? DEFAULT_RATE_LIMIT_WINDOW_MS,
    handler: (req: Request, res: Response) => {
      const requestId = getRequestId(res);
      const clientIp = getClientIp(req);

      console.warn(
        `[AI LIMIT ${requestId}] ip=${clientIp} reason=per-minute-limit`,
      );
      res.status(429).json({
        success: false,
        error: "Too many conversation requests. Please wait a minute and try again.",
        fallback: true,
      });
    },
  });

  router.post("/ask", limiter, async (req: Request, res: Response) => {
    const requestId = getRequestId(res);
    const clientIp = getClientIp(req);

    try {
      const validation = validateConversationRequest(req.body);
      if (!validation.ok) {
        console.warn(
          `[AI REJECT ${requestId}] ip=${clientIp} reason=${validation.reason}`,
        );
        res.status(400).json({
          success: false,
          error: "Invalid conversation request",
          fallback: true,
        });
        return;
      }

      const request = validation.request;
      const topicSummary = summarizeTopicForLog(request.playerInput.topic);
      const cacheKey = getConversationCacheKey(request);
      const cached = responseCache.get(cacheKey);
      if (cached) {
        console.log(
          `[AI CACHE ${requestId}] ip=${clientIp} npc=${request.npcId} type=${request.playerInput.type} topic=${topicSummary}`,
        );
        res.json({ success: true, response: cached, cached: true });
        return;
      }

      console.log(
        `[AI GENERATE ${requestId}] ip=${clientIp} npc=${request.npcId} ${formatPlayerInputForLog(
          request.playerInput.type,
          request.playerInput.topic,
        )} history=${request.conversationHistory.length}`,
      );
      const response = await generateResponse(request);

      rememberCachedResponse(responseCache, cacheKey, response);

      res.json({ success: true, response, cached: false });
    } catch (error) {
      console.error(
        `[AI ERROR ${requestId}] ip=${clientIp} error="${summarizeErrorForLog(error)}"`,
      );

      res.status(500).json({
        success: false,
        error: "Conversation service failed",
        fallback: true,
      });
    }
  });

  router.get("/health", (req: Request, res: Response) => {
    void req;
    res.json({
      status: "ok",
      cacheSize: responseCache.size,
    });
  });

  router.post("/clear-cache", (req: Request, res: Response) => {
    void req;
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

  return router;
}

export default createConversationRouter();
