import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getClaudeResponse } from "../game/services/claudeClient";
import {
  subscribeAiConversationFailures,
  type AiConversationFailure,
} from "../game/services/conversationDiagnostics";
import { getCharacterProfile } from "../game/npcProfiles";

const profile = getCharacterProfile("spot_bot")!;
const input = { type: "tell" as const, topic: "lift barbell" };
let failures: AiConversationFailure[];
let unsubscribe: () => void;

beforeEach(() => {
  failures = [];
  unsubscribe = subscribeAiConversationFailures(failure => failures.push(failure));
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
});
afterEach(() => {
  unsubscribe();
  vi.restoreAllMocks();
});

const request = () => getClaudeResponse("SpotBot", profile, [], input);

describe("AI conversation failure diagnostics", () => {
  it.each(["ask", "tell"] as const)("captures nested network reason codes for %s", async type => {
    const error = new TypeError("fetch failed", {
      cause: new AggregateError([Object.assign(new Error("private connection detail"), { code: "ECONNREFUSED" })]),
    });
    vi.spyOn(globalThis, "fetch").mockRejectedValue(error);
    expect(await getClaudeResponse("SpotBot", profile, [], { ...input, type })).toBeNull();
    expect(failures).toHaveLength(1);
    expect(failures[0]).toMatchObject({ npcId: "SpotBot", type, topic: "lift barbell", reason: "network_error", reasonCode: "ECONNREFUSED", errorName: "TypeError" });
    expect(failures[0].timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(failures[0].endpoint).toContain("/api/conversation/ask");
    expect(failures[0].status).toBeUndefined();
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("[AI CONVERSATION FAILURE]"));
    expect(JSON.stringify(failures)).not.toContain("private connection detail");
  });

  it.each([
    [400, "playerInput-topic-too-long"],
    [429, "per-minute-limit"],
    [500, "conversation-service-failed"],
  ])("records HTTP %s, backend reason code and request ID", async (status, reasonCode) => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ success: false, reasonCode }), {
      status, headers: { "x-request-id": "000123" },
    }));
    expect(await request()).toBeNull();
    expect(failures).toHaveLength(1);
    expect(failures[0]).toMatchObject({ reason: "http_error", status, reasonCode, requestId: "000123" });
  });

  it("retains HTTP status when the error body is not JSON", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("<html>Unavailable</html>", { status: 502 }));
    expect(await request()).toBeNull();
    expect(failures[0]).toMatchObject({ reason: "http_error", status: 502 });
    expect(failures[0].reasonCode).toBeUndefined();
  });

  it("distinguishes invalid JSON on a successful HTTP response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("not JSON"));
    expect(await request()).toBeNull();
    expect(failures[0]).toMatchObject({ reason: "invalid_json", status: 200 });
  });

  it.each([
    [{ success: false, code: "upstream_unavailable" }, "api_error", "upstream_unavailable"],
    [null, "api_error", undefined],
    [{ success: true, response: "   " }, "empty_response", undefined],
    [{ success: true, response: 123 }, "empty_response", undefined],
  ])("diagnoses unsuccessful/empty API payloads %j", async (body, reason, reasonCode) => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(body)));
    expect(await request()).toBeNull();
    expect(failures[0]).toMatchObject({ reason, status: 200 });
    expect(failures[0].reasonCode).toBe(reasonCode);
  });

  it("does not log failures for successful responses", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ success: true, response: "Bro, keep lifting." })));
    expect(await request()).toBe("Bro, keep lifting.");
    expect(failures).toEqual([]);
    expect(console.warn).not.toHaveBeenCalled();
  });

  it("logs a deduplicated failed request once and allows retry", async () => {
    const fetch = vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("fetch failed"));
    expect(await Promise.all([request(), request()])).toEqual([null, null]);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(failures).toHaveLength(1);
    expect(await request()).toBeNull();
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(failures).toHaveLength(2);
  });

  it("continues fallback if a diagnostic subscriber fails", async () => {
    const stop = subscribeAiConversationFailures(() => { throw new Error("log failed"); });
    try {
      vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("fetch failed"));
      expect(await request()).toBeNull();
      expect(failures).toHaveLength(1);
    } finally { stop(); }
  });
});
