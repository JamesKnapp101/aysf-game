import type { Request } from "express";

const MAX_USER_AGENT_LENGTH = 120;

export function getClientIp(req: Request): string {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (typeof forwardedFor === "string" && forwardedFor.trim()) {
    return forwardedFor.split(",")[0].trim();
  }

  if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
    return forwardedFor[0]?.split(",")[0]?.trim() || req.ip || "unknown";
  }

  return req.ip || "unknown";
}

export function getUserAgent(req: Request): string {
  const value = req.get("user-agent")?.trim();
  if (!value) return "unknown";

  return value.length <= MAX_USER_AGENT_LENGTH
    ? value
    : `${value.slice(0, MAX_USER_AGENT_LENGTH - 1)}…`;
}

export function summarizeTopicForLog(topic: string | undefined): string {
  const normalized = topic?.trim().replace(/\s+/g, " ") ?? "";
  if (!normalized) return "(empty)";

  return normalized.length <= 80
    ? normalized
    : `${normalized.slice(0, 79)}…`;
}
