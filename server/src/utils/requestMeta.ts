import { isIP } from "node:net";
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

function normalizeIpCandidate(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;

  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const bracketedIpv6Match = trimmed.match(/^\[([^\]]+)\](?::\d+)?$/);
  const unbracketed = bracketedIpv6Match?.[1] ?? trimmed;
  const withoutIpv4Port = unbracketed.replace(
    /^(\d{1,3}(?:\.\d{1,3}){3}):\d+$/,
    "$1",
  );

  return isIP(withoutIpv4Port) ? withoutIpv4Port : undefined;
}

function firstValidIpFromHeader(value: string | undefined): string | undefined {
  return value
    ?.split(",")
    .map((part) => normalizeIpCandidate(part))
    .find((ip): ip is string => Boolean(ip));
}

export function getClientIp(req: Request): string {
  // Log-facing only: auth and rate limits should rely on Express trust-proxy state.
  const ip =
    firstValidIpFromHeader(req.get("cf-connecting-ip")) ??
    firstValidIpFromHeader(req.get("x-forwarded-for")) ??
    req.ips.map((candidate) => normalizeIpCandidate(candidate)).find(Boolean) ??
    normalizeIpCandidate(req.ip) ??
    normalizeIpCandidate(req.socket.remoteAddress) ??
    "unknown";

  return sanitizeLogValue(ip, 80);
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
