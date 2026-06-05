import type { Request } from "express";

const MAX_USER_AGENT_LENGTH = 120;
const MAX_LOG_VALUE_LENGTH = 180;

export function sanitizeLogValue(
  value: unknown,
  maxLength = MAX_LOG_VALUE_LENGTH,
): string {
  const normalized = String(value ?? "unknown")
    .replace(/[\r\n\t]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/"/g, "'")
    .trim();

  if (!normalized) return "unknown";

  return normalized.length <= maxLength
    ? normalized
    : `${normalized.slice(0, maxLength - 3)}...`;
}

export function getClientIp(req: Request): string {
  return sanitizeLogValue(req.ip || req.socket.remoteAddress || "unknown", 80);
}

export function getUserAgent(req: Request): string {
  const value = req.get("user-agent")?.trim();
  if (!value) return "unknown";

  return sanitizeLogValue(value, MAX_USER_AGENT_LENGTH);
}

function normalizeTopicForLog(topic: string | undefined): string {
  return topic?.trim().replace(/\s+/g, " ") ?? "";
}

export function formatPlayerInputForLog(
  type: "ask" | "tell",
  topic: string | undefined,
): string {
  const normalized = normalizeTopicForLog(topic);
  return `${type}="${sanitizeLogValue(normalized)}" chars=${normalized.length}`;
}

export function summarizeTopicForLog(topic: string | undefined): string {
  const normalized = normalizeTopicForLog(topic);
  return `chars=${normalized.length}`;
}

export function summarizeErrorForLog(error: unknown): string {
  if (error instanceof Error) {
    return sanitizeLogValue(`${error.name}: ${error.message}`, 220);
  }

  return sanitizeLogValue(String(error), 220);
}
