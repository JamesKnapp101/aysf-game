import express, { Request, Response } from "express";
import { getClientIp } from "../utils/requestMeta.js";

const router = express.Router();

const MAX_EVENTS_PER_BATCH = 25;
const MAX_PAYLOAD_FIELDS = 24;
const MAX_EVENT_NAME_LENGTH = 64;
const MAX_FIELD_NAME_LENGTH = 40;
const MAX_FIELD_VALUE_LENGTH = 160;
const MAX_SESSION_ID_LENGTH = 80;
const MAX_ARRAY_VALUES = 8;
const SENSITIVE_FIELD_NAME_PATTERN =
  /(?:authorization|cookie|secret|token|password|api_?key|apikey|credential|private_?key)/i;
const FREE_TEXT_FIELD_NAME_PATTERN =
  /(?:command|topic|message|text|input|response|assistantContext)/i;
const SENSITIVE_VALUE_PATTERN =
  /(?:sk-ant-|bearer\s+|-----BEGIN [A-Z ]*PRIVATE KEY-----|eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.)/i;

type LogPayloadValue = string | number | boolean | null;
type LogPayload = Record<string, LogPayloadValue>;

type GameplayEventsRequest = {
  events?: unknown;
  sessionId?: unknown;
};

type RawGameplayEvent = {
  name?: unknown;
  payload?: unknown;
  timestamp?: unknown;
};

function getRequestId(res: Response): string {
  return String(res.locals.requestId ?? "------");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeText(value: unknown, maxLength: number): string {
  const normalized = String(value).trim().replace(/\s+/g, " ");
  return normalized.length <= maxLength
    ? normalized
    : `${normalized.slice(0, maxLength - 3)}...`;
}

function sanitizeIdentifier(
  value: unknown,
  fallback: string,
  maxLength: number,
): string {
  const normalized = normalizeText(value ?? "", maxLength)
    .replace(/[^A-Za-z0-9_.:-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");

  return normalized || fallback;
}

function sanitizeScalar(value: unknown): LogPayloadValue | undefined {
  if (value === null) return null;

  if (typeof value === "string") {
    const normalized = normalizeText(value, MAX_FIELD_VALUE_LENGTH);
    return SENSITIVE_VALUE_PATTERN.test(normalized) ? "[redacted]" : normalized;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value === "boolean") {
    return value;
  }

  return undefined;
}

function sanitizePayloadValue(value: unknown): LogPayloadValue | undefined {
  const scalar = sanitizeScalar(value);
  if (scalar !== undefined) return scalar;

  if (!Array.isArray(value)) return undefined;

  const values = value
    .slice(0, MAX_ARRAY_VALUES)
    .map(sanitizeScalar)
    .filter((entry): entry is LogPayloadValue => entry !== undefined)
    .map((entry) => String(entry));

  if (values.length === 0) return undefined;
  return normalizeText(values.join(","), MAX_FIELD_VALUE_LENGTH);
}

function sanitizePayload(payload: unknown): LogPayload {
  if (!isRecord(payload)) return {};

  return Object.entries(payload)
    .slice(0, MAX_PAYLOAD_FIELDS)
    .reduce<LogPayload>((next, [rawKey, rawValue]) => {
      const key = sanitizeIdentifier(
        rawKey,
        "field",
        MAX_FIELD_NAME_LENGTH,
      );
      if (
        SENSITIVE_FIELD_NAME_PATTERN.test(key) ||
        FREE_TEXT_FIELD_NAME_PATTERN.test(key)
      ) {
        return next;
      }

      const value = sanitizePayloadValue(rawValue);

      if (value !== undefined) {
        next[key] = value;
      }

      return next;
    }, {});
}

function formatPayload(payload: LogPayload): string {
  return Object.entries(payload)
    .map(([key, value]) => {
      if (typeof value === "string") {
        return `${key}=${JSON.stringify(value)}`;
      }

      return `${key}=${String(value)}`;
    })
    .join(" ");
}

router.post("/events", (req: Request, res: Response) => {
  const requestId = getRequestId(res);
  const clientIp = getClientIp(req);
  const body = (req.body ?? {}) as GameplayEventsRequest;
  const sessionId = sanitizeIdentifier(
    body.sessionId,
    "unknown",
    MAX_SESSION_ID_LENGTH,
  );

  if (!Array.isArray(body.events) || body.events.length === 0) {
    console.warn(
      `[PLAY REJECT ${requestId}] ip=${clientIp} session=${sessionId} reason=empty-events`,
    );
    res.status(400).json({ success: false, error: "No gameplay events." });
    return;
  }

  let accepted = 0;
  const events = body.events.slice(0, MAX_EVENTS_PER_BATCH);

  for (const candidate of events) {
    if (!isRecord(candidate)) continue;

    const event = candidate as RawGameplayEvent;
    const name = sanitizeIdentifier(
      event.name,
      "unknown",
      MAX_EVENT_NAME_LENGTH,
    );
    const payload = sanitizePayload(event.payload);
    const fields = formatPayload(payload);

    console.log(
      `[PLAY ${requestId}] ip=${clientIp} session=${sessionId} event=${name}${
        fields ? ` ${fields}` : ""
      }`,
    );
    accepted += 1;
  }

  if (accepted === 0) {
    console.warn(
      `[PLAY REJECT ${requestId}] ip=${clientIp} session=${sessionId} reason=malformed-events`,
    );
    res.status(400).json({ success: false, error: "Malformed gameplay events." });
    return;
  }

  res.json({
    accepted,
    dropped: body.events.length - accepted,
    success: true,
  });
});

router.get("/health", (req: Request, res: Response) => {
  void req;
  res.json({
    status: "ok",
    service: "gameplay-events",
  });
});

export default router;
