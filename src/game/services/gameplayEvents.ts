const API_BASE = import.meta.env.PROD
  ? "/api"
  : "http://localhost:3001/api";

const DISABLE_GAMEPLAY_LOGGING = import.meta.env.MODE === "test";
const SESSION_STORAGE_KEY = "aysf-gameplay-session-id";
const FLUSH_DELAY_MS = 750;
const FLUSH_BATCH_SIZE = 10;
const MAX_QUEUE_LENGTH = 80;
const MAX_PAYLOAD_FIELDS = 24;
const MAX_ARRAY_VALUES = 8;
const MAX_EVENT_NAME_LENGTH = 64;
const MAX_FIELD_VALUE_LENGTH = 160;

export type GameplayEventPayloadValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | readonly (string | number | boolean | null | undefined)[];

export type GameplayEventPayload = Record<string, GameplayEventPayloadValue>;

type QueuedGameplayEvent = {
  name: string;
  payload?: GameplayEventPayload;
  timestamp: string;
};

type FlushOptions = {
  useBeacon?: boolean;
};

let gameplaySessionId: string | null = null;
let flushTimer: number | null = null;
let queue: QueuedGameplayEvent[] = [];

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function createSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 12)}`;
}

function getGameplaySessionId(): string {
  if (gameplaySessionId) return gameplaySessionId;

  try {
    const existing = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (existing) {
      gameplaySessionId = existing;
      return existing;
    }

    gameplaySessionId = createSessionId();
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, gameplaySessionId);
    return gameplaySessionId;
  } catch {
    gameplaySessionId = createSessionId();
    return gameplaySessionId;
  }
}

function normalizeText(value: string, maxLength: number): string {
  const normalized = value.trim().replace(/\s+/g, " ");
  return normalized.length <= maxLength
    ? normalized
    : `${normalized.slice(0, maxLength - 3)}...`;
}

function normalizeEventName(name: string): string {
  return normalizeText(name, MAX_EVENT_NAME_LENGTH)
    .replace(/[^A-Za-z0-9_.:-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function normalizeScalarValue(
  value: GameplayEventPayloadValue,
): string | number | boolean | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;

  if (typeof value === "string") {
    return normalizeText(value, MAX_FIELD_VALUE_LENGTH);
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value === "boolean") {
    return value;
  }

  return undefined;
}

function normalizePayload(
  payload: GameplayEventPayload | undefined,
): GameplayEventPayload | undefined {
  if (!payload) return undefined;

  const normalized = Object.entries(payload)
    .slice(0, MAX_PAYLOAD_FIELDS)
    .reduce<GameplayEventPayload>((next, [key, value]) => {
      if (Array.isArray(value)) {
        const values = value
          .slice(0, MAX_ARRAY_VALUES)
          .map(normalizeScalarValue)
          .filter((entry) => entry !== undefined)
          .map((entry) => String(entry));

        if (values.length > 0) {
          next[key] = normalizeText(values.join(","), MAX_FIELD_VALUE_LENGTH);
        }

        return next;
      }

      const normalizedValue = normalizeScalarValue(value);
      if (normalizedValue !== undefined) {
        next[key] = normalizedValue;
      }

      return next;
    }, {});

  return Object.keys(normalized).length > 0 ? normalized : undefined;
}

function scheduleFlush(): void {
  if (flushTimer !== null) return;

  flushTimer = window.setTimeout(() => {
    flushTimer = null;
    flushGameplayEvents();
  }, FLUSH_DELAY_MS);
}

function clearFlushTimer(): void {
  if (flushTimer === null) return;

  window.clearTimeout(flushTimer);
  flushTimer = null;
}

export function trackGameplayEvent(
  name: string,
  payload?: GameplayEventPayload,
): void {
  if (DISABLE_GAMEPLAY_LOGGING || !isBrowser()) return;

  const eventName = normalizeEventName(name);
  if (!eventName) return;

  queue.push({
    name: eventName,
    payload: normalizePayload(payload),
    timestamp: new Date().toISOString(),
  });

  if (queue.length > MAX_QUEUE_LENGTH) {
    queue = queue.slice(queue.length - MAX_QUEUE_LENGTH);
  }

  if (queue.length >= FLUSH_BATCH_SIZE) {
    flushGameplayEvents();
    return;
  }

  scheduleFlush();
}

export function flushGameplayEvents(options: FlushOptions = {}): void {
  if (DISABLE_GAMEPLAY_LOGGING || !isBrowser() || queue.length === 0) return;

  clearFlushTimer();

  const events = queue;
  queue = [];

  const body = JSON.stringify({
    events,
    sessionId: getGameplaySessionId(),
  });
  const url = `${API_BASE}/gameplay/events`;

  if (options.useBeacon && "sendBeacon" in navigator) {
    const sent = navigator.sendBeacon(
      url,
      new Blob([body], { type: "application/json" }),
    );

    if (sent) return;
  }

  void fetch(url, {
    body,
    headers: {
      "Content-Type": "application/json",
    },
    keepalive: true,
    method: "POST",
  }).catch((error) => {
    if (import.meta.env.DEV) {
      console.debug("Failed to send gameplay events.", error);
    }
  });
}

export function installGameplayEventFlush(): () => void {
  if (DISABLE_GAMEPLAY_LOGGING || !isBrowser()) return () => undefined;

  const flushOnPageHide = () => {
    flushGameplayEvents({ useBeacon: true });
  };

  window.addEventListener("pagehide", flushOnPageHide);

  return () => {
    window.removeEventListener("pagehide", flushOnPageHide);
  };
}
