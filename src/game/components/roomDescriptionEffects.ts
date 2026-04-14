export type Flash = {
  id: string;
  text: string;
  x: number;
  y: number;
  phase: "enter" | "steady" | "exit";
};

export type OrganismDeathRevealMode = "fade" | "random-chunks";

export type OrganismDeathToken = {
  id: number;
  text: string;
  revealable: boolean;
};

const START_DELAY_MS = 220;
const FADE_IN_MS = 180;
const FADE_OUT_MS = 160;
const GAP_MS = 260;
const WIND_DOWN_MS = 220;
const MIN_LINGER_MS = 700;
const MAX_LINGER_MS = 2600;
const MS_PER_WORD = 220;

export const MIND_FLASH_TIMINGS = {
  START_DELAY_MS,
  FADE_IN_MS,
  FADE_OUT_MS,
  GAP_MS,
  WIND_DOWN_MS,
};

export function computeLingerMs(text: string): number {
  const wordCount = text.trim().split(/\s+/).length;
  const raw = wordCount * MS_PER_WORD;

  return Math.max(MIN_LINGER_MS, Math.min(MAX_LINGER_MS, raw));
}

export function splitMemory(memory: string): string[] {
  return memory
    .split(".")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => (s.endsWith(".") ? s : `${s}.`));
}

// Tiny deterministic RNG so flashes feel consistent per run.
export function makeRand(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(text: string): number {
  let hash = 0;

  for (let i = 0; i < text.length; i++) {
    hash = (Math.imul(hash, 31) + text.charCodeAt(i)) | 0;
  }

  return hash >>> 0;
}

export function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export const clamp = (n: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, n));

export function resolveOrganismDeathRevealMode(
  mode?: string,
): OrganismDeathRevealMode {
  return mode === "type" || mode === "random-chunks"
    ? "random-chunks"
    : "fade";
}

export function buildOrganismDeathTokens(
  text: string,
  chunkSize: number,
): OrganismDeathToken[] {
  const normalizedChunkSize = Math.max(1, Math.floor(chunkSize));
  const parts = text.match(/\s+|\S+/g) ?? [];
  const tokens: OrganismDeathToken[] = [];
  let tokenId = 0;

  for (const part of parts) {
    if (/^\s+$/.test(part)) {
      tokens.push({ id: tokenId++, text: part, revealable: false });
      continue;
    }

    for (let i = 0; i < part.length; i += normalizedChunkSize) {
      tokens.push({
        id: tokenId++,
        text: part.slice(i, i + normalizedChunkSize),
        revealable: true,
      });
    }
  }

  return tokens;
}

export function shuffleTokenIds(tokens: OrganismDeathToken[], seed: number): number[] {
  const ids = tokens
    .filter((token) => token.revealable)
    .map((token) => token.id);
  const rand = makeRand(seed);

  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }

  return ids;
}
