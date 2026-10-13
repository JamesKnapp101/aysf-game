import type { MessageCreateParamsNonStreaming } from "@anthropic-ai/sdk/resources/messages";

// Current Claude API five-minute write rate. One-hour writes, if reported,
// have a separate documented rate and are not added to the five-minute total.
export const CACHE_WRITE_MULTIPLIER = 1.25;
export const CACHE_WRITE_1H_MULTIPLIER = 2;
export const AUTOMATIC_CACHE_CONTROL = { type: "ephemeral", ttl: "5m" } as const satisfies NonNullable<MessageCreateParamsNonStreaming["cache_control"]>;

export function cacheReadMultiplier(model: string, override?: number): number {
  if (override !== undefined) return override;
  if (/^claude-(opus|sonnet)-5-5(?:-|$)/.test(model)) return 0.05;
  if (/^claude-(fable|mythos)-5-1(?:-|$)/.test(model)) return 0.025;
  return 0.1;
}

export type CacheAccounting = {
  enabled: boolean;
  readMultiplier: number;
  uncachedInputTokens: number;
  cacheCreationInputTokens: number;
  cacheReadInputTokens: number;
  cacheCreation5mInputTokens: number;
  cacheCreation1hInputTokens: number;
  uncachedInputCostUsd: number;
  cacheCreationCostUsd: number;
  cacheReadCostUsd: number;
  outputCostUsd: number;
  responsesWithCacheReads: number;
  responsesWithCacheWrites: number;
};
export function createCacheAccounting(enabled: boolean, readMultiplier: number): CacheAccounting {
  return {
    enabled, readMultiplier, uncachedInputTokens: 0, cacheCreationInputTokens: 0, cacheReadInputTokens: 0,
    cacheCreation5mInputTokens: 0, cacheCreation1hInputTokens: 0, uncachedInputCostUsd: 0,
    cacheCreationCostUsd: 0, cacheReadCostUsd: 0, outputCostUsd: 0,
    responsesWithCacheReads: 0, responsesWithCacheWrites: 0,
  };
}
type Usage = {
  uncached: number; created: number; read: number; created5m: number; created1h: number;
  output: number; input: number; complete: boolean;
};
const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const isCount = (value: unknown): value is number => Number.isSafeInteger(value) && Number(value) >= 0;

export function parseAgentUsage(raw: unknown, caching: boolean): Usage | undefined {
  if (!isRecord(raw) || !isCount(raw.input_tokens) || !isCount(raw.output_tokens)) return;
  const created = raw.cache_creation_input_tokens ?? 0;
  const read = raw.cache_read_input_tokens ?? 0;
  if (!isCount(created) || !isCount(read)) return;
  let created5m = created;
  let created1h = 0;
  if (raw.cache_creation !== undefined && raw.cache_creation !== null) {
    const details = raw.cache_creation;
    if (!isRecord(details) || !isCount(details.ephemeral_5m_input_tokens) || !isCount(details.ephemeral_1h_input_tokens)) return;
    created5m = details.ephemeral_5m_input_tokens;
    created1h = details.ephemeral_1h_input_tokens;
    if (created5m + created1h !== created) return;
  }
  const input = raw.input_tokens + created + read;
  if (!isCount(input)) return;
  return {
    uncached: raw.input_tokens, output: raw.output_tokens, created, read, created5m, created1h, input,
    // Explicit null is supported by the SDK and means no usage in that category.
    // Missing metrics while requesting caching cannot safely justify more spend.
    complete: !caching || (raw.cache_creation_input_tokens !== undefined && raw.cache_read_input_tokens !== undefined),
  };
}

export function accountAgentUsage(account: CacheAccounting, usage: Usage, inputPrice: number, outputPrice: number): void {
  account.uncachedInputTokens += usage.uncached;
  account.cacheCreationInputTokens += usage.created;
  account.cacheReadInputTokens += usage.read;
  account.cacheCreation5mInputTokens += usage.created5m;
  account.cacheCreation1hInputTokens += usage.created1h;
  account.uncachedInputCostUsd += (usage.uncached / 1_000_000) * inputPrice;
  account.cacheCreationCostUsd += ((usage.created5m * CACHE_WRITE_MULTIPLIER + usage.created1h * CACHE_WRITE_1H_MULTIPLIER) / 1_000_000) * inputPrice;
  account.cacheReadCostUsd += (usage.read / 1_000_000) * inputPrice * account.readMultiplier;
  account.outputCostUsd += (usage.output / 1_000_000) * outputPrice;
  if (usage.read > 0) account.responsesWithCacheReads += 1;
  if (usage.created > 0) account.responsesWithCacheWrites += 1;
}
