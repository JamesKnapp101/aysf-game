import type { CometEntry } from "./comet-index";

export const COMET_CHARACTER_PROFILE_ID = "comet";
export const COMET_CONVERSATION_ID = "comet";
export const COMET_HISTORY_LIMIT = 6;
export const COMET_MAX_INPUT_CHARS = 220;
export const COMET_MAX_INPUT_WORDS = 40;
export const COMET_MAX_MATCHES = 4;

const EDIT_REQUEST_PATTERNS = [
  /\belectronic request\b/i,
  /\bsubmit\b.*\b(request|edit|entry)\b/i,
  /\brequest\b.*\b(add|edit|update|entry)\b/i,
  /\b(add|edit|update|change)\b.*\b(entry|database|library|record)\b/i,
];

const ASK_PATTERNS = [
  /\?$/,
  /^\s*(?:comet,?\s*)?(?:tell me about|ask comet about)\b/i,
  /^\s*(?:comet,?\s*)?(?:(?:can|could|would)\s+you\s+)?tell me(?:\s+more)?\s+about\b/i,
  /^\s*(?:comet,?\s*)?(?:anything else about|what about|more about|describe|explain|do you know)\b/i,
  /^\s*(?:comet,?\s*)?(?:how|what|why|where|when|who|can|could|would|should|is|are|do|does)\b/i,
];

const GUIDANCE_PATTERNS = [
  /\bwhat should i do\b/i,
  /\bwhat do i do\b/i,
  /\bwhat now\b/i,
  /\bwhere next\b/i,
  /\bhow do i\b/i,
  /\bhow can i\b/i,
  /\bget past\b/i,
  /\bget through\b/i,
  /\bopen\b/i,
  /\bstuck\b/i,
  /\bhelp\b/i,
  /\bdo here\b/i,
  /\bthis room\b/i,
  /\bthis area\b/i,
];

const IGNORED_CONTAINS_TERMS = new Set([
  "body",
  "cold",
  "disease",
  "drug",
  "field",
  "matter",
  "me",
  "robot",
  "serum",
  "ship",
  "space",
  "suit",
]);

export type CometIntent = "ask" | "tell" | "edit_request";
export type CometInteractionMode = "library" | "guess";

export type CometEntryMatch = {
  entry: CometEntry;
  matchedBy: string[];
  score: number;
};

export function normalizeCometText(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function countCometWords(text: string): number {
  const normalized = normalizeCometText(text);
  if (!normalized) return 0;
  return normalized.split(" ").length;
}

export function classifyCometIntent(rawInput: string): CometIntent {
  const input = rawInput.trim();

  if (EDIT_REQUEST_PATTERNS.some((pattern) => pattern.test(input))) {
    return "edit_request";
  }

  if (ASK_PATTERNS.some((pattern) => pattern.test(input))) {
    return "ask";
  }

  return "tell";
}

export function shouldUseCometRoomContext(
  rawInput: string,
  queryMatchCount: number,
): boolean {
  if (queryMatchCount > 0) {
    return false;
  }

  return GUIDANCE_PATTERNS.some((pattern) => pattern.test(rawInput));
}

export function buildCometConfidence(
  matchCount: number,
  mode: CometInteractionMode,
): { label: string; score: number } {
  const safeCount = Math.max(0, matchCount);
  const score =
    mode === "guess"
      ? Math.min(18 + safeCount * 16, 82)
      : safeCount === 0
        ? 35
        : Math.min(76 + safeCount * 8, 96);

  const label = score >= 80 ? "High" : score >= 55 ? "Moderate" : "Low";
  return { label, score };
}

export function findRelevantCometEntries(
  entryList: CometEntry[],
  textInputs: string[],
  limit = COMET_MAX_MATCHES,
): CometEntryMatch[] {
  const normalizedInputs = textInputs
    .map(normalizeCometText)
    .filter((text): text is string => Boolean(text));

  if (normalizedInputs.length === 0) {
    return [];
  }

  const matches = new Map<string, CometEntryMatch>();

  for (const entry of entryList) {
    const candidates = Array.from(
      new Set([entry.id, ...entry.terms].map(normalizeCometText).filter(Boolean)),
    );

    let bestScore = 0;
    const matchedBy = new Set<string>();

    for (const input of normalizedInputs) {
      for (const candidate of candidates) {
        const score = scoreCandidateMatch(input, candidate);
        if (score <= 0) continue;

        if (score > bestScore) {
          bestScore = score;
        }
        matchedBy.add(candidate);
      }
    }

    if (bestScore <= 0 || matchedBy.size === 0) continue;

    matches.set(entry.id, {
      entry,
      matchedBy: Array.from(matchedBy).sort(),
      score: bestScore,
    });
  }

  return Array.from(matches.values())
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.matchedBy.length !== a.matchedBy.length) {
        return b.matchedBy.length - a.matchedBy.length;
      }
      return a.entry.id.localeCompare(b.entry.id);
    })
    .slice(0, limit);
}

function scoreCandidateMatch(input: string, candidate: string): number {
  if (!candidate) return 0;

  if (input === candidate) {
    return 300;
  }

  if (candidate.length < 3) {
    return 0;
  }

  if (IGNORED_CONTAINS_TERMS.has(candidate)) {
    return 0;
  }

  if (input.includes(candidate)) {
    return 100 + candidate.length;
  }

  return 0;
}
