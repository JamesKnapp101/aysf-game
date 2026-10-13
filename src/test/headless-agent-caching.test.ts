import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import { resolve, sep } from "node:path";
import type { Message, MessageCreateParamsNonStreaming, MessageCountTokensParams } from "@anthropic-ai/sdk/resources/messages";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PLAYER_INSTRUCTIONS, runHeadlessAgent } from "../game/harness/agent";
import type { AgentOptions } from "../game/harness/agent";
import { renderAgentReport } from "../game/harness/agentReport";
import { cacheReadMultiplier } from "../game/harness/promptCaching";
import type { SessionController } from "../game/harness/types";

const directories: string[] = [];
const tool = (id = "tool_1") => ({ type: "tool_use" as const, id, name: "game_command", input: { command: "inventory" }, caller: { type: "direct" as const } });
function message(usage: Record<string, unknown> = {}, content: Message["content"] = [tool()], stop: Message["stop_reason"] = "tool_use"): Message {
  return { content, stop_reason: stop, usage: { input_tokens: 10, output_tokens: 20, cache_creation_input_tokens: 0, cache_read_input_tokens: 0, ...usage } } as Message;
}
async function session(): Promise<SessionController> {
  const directory = resolve(".headless-transcripts", `caching-test-${randomUUID()}`);
  directories.push(directory);
  await fs.mkdir(directory, { recursive: true });
  const path = resolve(directory, "mock.jsonl");
  await fs.writeFile(path, "");
  let sequence = 1;
  return {
    start: vi.fn(async () => ({ sequence: 1, text: ["Visible opening."] })), reset: vi.fn(),
    explorer: { command: vi.fn(async () => ({ sequence: ++sequence, text: ["Visible inventory."] })), information: vi.fn() },
    transcript: () => ({ path, sessionId: "private-session", records: sequence }), dispose: vi.fn(async () => {}),
  };
}
function client(responses: Message[]) {
  const queue = [...responses];
  return { messages: {
    countTokens: vi.fn<(params: MessageCountTokensParams) => Promise<{ input_tokens: number }>>().mockResolvedValue({ input_tokens: 100 }),
    create: vi.fn<(params: MessageCreateParamsNonStreaming) => Promise<Message>>().mockImplementation(async () => queue.shift() ?? message({}, [{ type: "text", text: "Finished.", citations: null }], "end_turn")),
  } };
}
afterEach(async () => {
  for (const directory of directories.splice(0)) {
    if (!directory.startsWith(resolve(".headless-transcripts") + sep)) throw new Error("Unsafe test cleanup.");
    await fs.rm(directory, { recursive: true, force: true });
  }
  vi.restoreAllMocks();
});

describe("Anthropic automatic prompt caching", () => {
  it("sets only a top-level boundary and preserves stable prefixes, thinking and tool ordering", async () => {
    const first = message({ cache_creation_input_tokens: 100 }, [
      { type: "thinking", thinking: "PRIVATE_REASONING", signature: "PRIVATE_SIGNATURE" },
      { type: "redacted_thinking", data: "PRIVATE_REDACTION" }, tool("first"), tool("second"),
    ]);
    const sdk = client([first, message({ cache_read_input_tokens: 100, cache_creation_input_tokens: 25 }, [tool("third")])]);
    const run = await runHeadlessAgent({ client: sdk, session: await session() });
    expect(run.reason).toBe("model_finished");
    expect(run.actions).toBe(3);
    const requests = sdk.messages.create.mock.calls.map(call => call[0]);
    for (let index = 0; index < requests.length; index += 1) {
      expect(requests[index].cache_control).toEqual({ type: "ephemeral", ttl: "5m" });
      expect(requests[index].system).toBe(PLAYER_INSTRUCTIONS);
      expect(sdk.messages.countTokens.mock.calls[index][0]).toEqual(expect.objectContaining({ cache_control: requests[index].cache_control, messages: requests[index].messages }));
      expect(JSON.stringify(requests[index].messages)).not.toContain("cache_control");
      if (index) expect(requests[index].messages.slice(0, requests[index - 1].messages.length)).toEqual(requests[index - 1].messages);
    }
    expect(requests[1].messages[1].content).toEqual(first.content);
    expect(requests[1].messages[2].content).toEqual([
      { type: "tool_result", tool_use_id: "first", content: "Visible inventory." },
      { type: "tool_result", tool_use_id: "second", content: "Visible inventory." },
    ]);
    expect(JSON.stringify(run) + await fs.readFile(run.reportPath, "utf8")).not.toMatch(/PRIVATE_REASONING|PRIVATE_SIGNATURE|PRIVATE_REDACTION/);
  });

  it.each([
    [{ input_tokens: 1000 }, 1000, 0, 0, 0.0011],
    [{ input_tokens: 10, cache_creation_input_tokens: 1000 }, 10, 1000, 0, 0.00136],
    [{ input_tokens: 10, cache_read_input_tokens: 1000 }, 10, 0, 1000, 0.00021],
    [{ input_tokens: 10, cache_creation_input_tokens: 200, cache_read_input_tokens: 800 }, 10, 200, 800, 0.00044],
    [{ input_tokens: 10, cache_creation_input_tokens: 100, cache_creation: { ephemeral_5m_input_tokens: 40, ephemeral_1h_input_tokens: 60 } }, 10, 100, 0, 0.00028],
    [{ input_tokens: 10, cache_creation_input_tokens: null, cache_read_input_tokens: null }, 10, 0, 0, 0.00011],
  ])("accounts for hit/write/miss categories: %j", async (usage, uncached, created, read, cost) => {
    const run = await runHeadlessAgent({ client: client([message(usage)]), session: await session(), options: { maxActions: 1 } });
    expect(run.inputTokens).toBe(uncached + created + read);
    expect(run.outputTokens).toBe(20);
    expect(run.estimatedCostUsd).toBeCloseTo(cost, 10);
    expect(run.cacheUsage).toMatchObject({ uncachedInputTokens: uncached, cacheCreationInputTokens: created, cacheReadInputTokens: read });
    expect(run.usageUncertain).toBe(false);
    const report = await fs.readFile(run.reportPath, "utf8");
    expect(report).toContain(`Cache-read input tokens: ${read}`);
    expect(report).toContain("Effective prices");
    expect(report).toContain("Hypothetical uncached cost");
  });

  it.each([
    ["claude-haiku-4-5-20251001", 0.1], ["claude-sonnet-5-5", 0.05], ["claude-opus-5-5", 0.05],
    ["claude-fable-5-1", 0.025], ["claude-mythos-5-1", 0.025], ["custom-model", 0.1],
  ])("derives documented read multipliers without replacing explicit base prices: %s", async (model, multiplier) => {
    const run = await runHeadlessAgent({ client: client([message({ cache_read_input_tokens: 1000 })]), session: await session(),
      options: { model, inputUsdPerMillion: 4, outputUsdPerMillion: 20, maxActions: 1 } });
    expect(run.limits.inputUsdPerMillion).toBe(4);
    expect(run.limits.outputUsdPerMillion).toBe(20);
    expect(run.cacheUsage?.readMultiplier).toBe(multiplier);
    expect(run.cacheUsage?.cacheReadCostUsd).toBeCloseTo(0.004 * multiplier, 10);
  });

  it("uses an explicit read multiplier and rejects invalid rate/boolean/model configurations", async () => {
    expect(cacheReadMultiplier("claude-sonnet-5-5", 0.2)).toBe(0.2);
    const run = await runHeadlessAgent({ client: client([message({ cache_read_input_tokens: 1000 })]), session: await session(), options: { cacheReadMultiplier: 0.2, maxActions: 1 } });
    expect(run.cacheUsage?.cacheReadCostUsd).toBeCloseTo(0.0002, 10);
    for (const options of [ { cacheReadMultiplier: 0 }, { cacheReadMultiplier: -1 }, { cacheReadMultiplier: Infinity }, { promptCaching: "yes" }, { model: "custom-model" }, { inputUsdPerMillion: 0 }, { outputUsdPerMillion: 0 }, { maxCostUsd: 0 } ]) {
      const sdk = client([]);
      await expect(runHeadlessAgent({ client: sdk, session: await session(), options: options as Partial<AgentOptions> })).rejects.toThrow();
      expect(sdk.messages.create).not.toHaveBeenCalled();
    }
  });

  it.each([
    [{ cache_read_input_tokens: undefined }, "incomplete_cache_usage"],
    [{ cache_creation_input_tokens: undefined, cache_read_input_tokens: undefined }, "incomplete_cache_usage"],
    [{ cache_creation_input_tokens: -1 }, "invalid_usage"],
    [{ cache_read_input_tokens: 0.5 }, "invalid_usage"],
    [{ cache_creation_input_tokens: 100, cache_creation: { ephemeral_5m_input_tokens: 50 } }, "invalid_usage"],
    [{ cache_creation_input_tokens: 100, cache_creation: { ephemeral_5m_input_tokens: 50, ephemeral_1h_input_tokens: 25 } }, "invalid_usage"],
  ])("stops without tool execution when cache metrics are incomplete or invalid: %j", async (usage, category) => {
    const controller = await session();
    const sdk = client([message(usage)]);
    const run = await runHeadlessAgent({ client: sdk, session: controller });
    expect(run.reason).toBe("api_protocol_failure");
    expect(run.responseDiagnostics[0].validationFailure).toBe(category);
    expect(run.usageUncertain).toBe(true);
    expect(controller.explorer.command).not.toHaveBeenCalled();
    expect(sdk.messages.create).toHaveBeenCalledTimes(1);
  });

  it("reserves a full miss after a hit instead of assuming future discounted input", async () => {
    const sdk = client([message({ input_tokens: 0, cache_read_input_tokens: 1000, output_tokens: 10 })]);
    sdk.messages.countTokens.mockResolvedValueOnce({ input_tokens: 100 }).mockResolvedValueOnce({ input_tokens: 1000 });
    const run = await runHeadlessAgent({ client: sdk, session: await session(), options: { maxCostUsd: 0.0004 } });
    expect(run.reason).toBe("spending_budget");
    expect(run.actions).toBe(1);
    expect(sdk.messages.create).toHaveBeenCalledTimes(1);
    expect(run.estimatedCostUsd).toBeCloseTo(0.00015, 10);
  });

  it.each([
    [{ maxTokens: 500 }, "token_budget"], [{ maxCostUsd: 0.0005 }, "spending_budget"],
  ] as const)("enforces cumulative input and actual write costs before tools: %j", async (options, reason) => {
    const controller = await session();
    const run = await runHeadlessAgent({ client: client([message({ input_tokens: 0, cache_creation_input_tokens: 1000 })]), session: controller, options });
    expect(run.reason).toBe(reason);
    expect(run.inputTokens).toBe(1000);
    expect(run.estimatedCostUsd).toBeCloseTo(0.00135, 10);
    expect(controller.explorer.command).not.toHaveBeenCalled();
  });

  it("preserves accounted cache costs and uncertain-usage behavior after a request failure", async () => {
    const sdk = client([message({ cache_read_input_tokens: 1000 })]);
    sdk.messages.create.mockImplementationOnce(async () => message({ cache_read_input_tokens: 1000 }));
    sdk.messages.create.mockRejectedValueOnce(new Error("PRIVATE_API_KEY PRIVATE_PROMPT"));
    const run = await runHeadlessAgent({ client: sdk, session: await session() });
    expect(run.reason).toBe("api_request_failure");
    expect(run.actions).toBe(1);
    expect(run.usageUncertain).toBe(true);
    expect(run.cacheUsage?.cacheReadInputTokens).toBe(1000);
    expect(await fs.readFile(run.reportPath, "utf8")).not.toMatch(/PRIVATE_API_KEY|PRIVATE_PROMPT/);
    expect(sdk.messages.create).toHaveBeenCalledTimes(2);
  });

  it("retains legacy metrics and reservations when caching is disabled", async () => {
    const sdk = client([message({ input_tokens: 100, output_tokens: 10, cache_creation_input_tokens: undefined, cache_read_input_tokens: undefined })]);
    const run = await runHeadlessAgent({ client: sdk, session: await session(), options: { promptCaching: false, maxCostUsd: 0.0002, maxActions: 1 } });
    expect(run.reason).toBe("action_limit");
    expect(run.estimatedCostUsd).toBeCloseTo(0.00015, 10);
    expect(run.usageUncertain).toBe(false);
    expect(sdk.messages.create.mock.calls[0][0]).not.toHaveProperty("cache_control");
    expect(sdk.messages.countTokens.mock.calls[0][0]).not.toHaveProperty("cache_control");
    expect(sdk.messages.create.mock.calls[0][0].max_tokens).toBe(13);
    const legacy = { ...run };
    delete legacy.cacheUsage;
    expect(renderAgentReport(legacy)).toContain("Cache accounting was not recorded");
  });

  it("calculates a representative 158-turn conversation before/after with identical histories", async () => {
    const turns = 158;
    const responses = Array.from({ length: turns }, (_value, index) => message({
      input_tokens: 0, output_tokens: 64,
      cache_creation_input_tokens: index === 0 ? 4096 : 256,
      cache_read_input_tokens: index === 0 ? 0 : 4096 + (index - 1) * 256,
    }, [tool(`tool_${index}`)]));
    const sdk = client(responses);
    let index = 0;
    sdk.messages.countTokens.mockImplementation(async () => ({ input_tokens: 4096 + index++ * 256 }));
    const run = await runHeadlessAgent({ client: sdk, session: await session(), options: { maxActions: turns, maxTurns: turns, maxTokens: 10_000_000, maxCostUsd: 100 } });
    expect(run.reason).toBe("action_limit");
    expect(run.inputTokens).toBe(3_822_336);
    expect(run.outputTokens).toBe(10_112);
    expect(run.cacheUsage).toMatchObject({ cacheCreationInputTokens: 44_288, cacheReadInputTokens: 3_778_048, responsesWithCacheReads: 157, responsesWithCacheWrites: 158 });
    expect(run.estimatedCostUsd).toBeCloseTo(0.4837248, 10);
    const uncached = (run.inputTokens + run.outputTokens * 5) / 1_000_000;
    expect(uncached).toBeCloseTo(3.872896, 10);
    expect(1 - run.estimatedCostUsd / uncached).toBeGreaterThan(0.875);
    expect(sdk.messages.create).toHaveBeenCalledTimes(turns);
    const last = sdk.messages.create.mock.calls.at(-1)![0];
    expect(last.messages).toHaveLength(1 + (turns - 1) * 2);
    expect(last.messages.slice(0, 3)).toEqual(sdk.messages.create.mock.calls[1][0].messages);
    expect(await fs.readFile(run.reportPath, "utf8")).toContain("estimated difference: $3.389171");
    const baselineSdk = client(Array.from({ length: turns }, (_value, index) => message({
      input_tokens: 4096 + index * 256, output_tokens: 64,
    }, [tool(`tool_${index}`)])));
    let baselineIndex = 0;
    baselineSdk.messages.countTokens.mockImplementation(async () => ({ input_tokens: 4096 + baselineIndex++ * 256 }));
    const baseline = await runHeadlessAgent({ client: baselineSdk, session: await session(), options: {
      promptCaching: false, maxActions: turns, maxTurns: turns, maxTokens: 10_000_000, maxCostUsd: 100,
    } });
    expect(baseline.inputTokens).toBe(run.inputTokens);
    expect(baseline.outputTokens).toBe(run.outputTokens);
    expect(baseline.estimatedCostUsd).toBeCloseTo(uncached, 10);
    for (let turn = 0; turn < turns; turn += 1) {
      expect(baselineSdk.messages.create.mock.calls[turn][0].messages).toEqual(sdk.messages.create.mock.calls[turn][0].messages);
    }
  });
});
