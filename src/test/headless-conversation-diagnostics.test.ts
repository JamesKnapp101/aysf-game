import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import { resolve } from "node:path";
import { expect, it, vi } from "vitest";
import * as engine from "../game/engine/handleCommand";
import { createHeadlessSession } from "../game/harness/session";
import type { TranscriptEntry } from "../game/harness/types";
import { reportAiConversationFailure } from "../game/services/conversationDiagnostics";

it("persists a failed NPC tell on its command without exposing diagnostics to the player", async () => {
  const directory = resolve(".headless-transcripts", `conversation-test-${randomUUID()}`);
  const onFailure = vi.fn();
  const session = createHeadlessSession({ transcriptDirectory: directory, onAiConversationFailure: onFailure });
  try {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("fetch failed", {
      cause: Object.assign(new Error("refused"), { code: "ECONNREFUSED" }),
    }));
    await session.start();
    // Place the test player at the NPC; subsequent commands use the real engine.
    vi.spyOn(engine, "handleCommand").mockImplementationOnce(async state => ({
      ...state, player: { ...state.player, roomId: "GymWeightRoom" },
    }));
    await session.explorer.command("look");
    const result = await session.explorer.command("tell robot to lift the barbell");
    expect(result.text.join("\n")).toContain("considers this...");
    expect(result.text.join("\n")).toContain("doesn't seem to care.");
    expect(JSON.stringify(result)).not.toMatch(/ECONNREFUSED|network_error|aiConversationFailures|SpotBot/);
    expect(onFailure).toHaveBeenCalledTimes(1);
    await session.explorer.command("look");
    await session.reset();
    await session.dispose();
    const records: TranscriptEntry[] = (await fs.readFile(session.transcript().path, "utf8")).trim().split("\n").map(line => JSON.parse(line));
    const failed = records.find(record => record.input === "tell robot to lift the barbell")!;
    expect(failed.aiConversationFailures).toHaveLength(1);
    expect(failed.aiConversationFailures![0]).toMatchObject({ npcId: "SpotBot", type: "tell", reason: "network_error", reasonCode: "ECONNREFUSED" });
    expect(records.filter(record => record.aiConversationFailures)).toHaveLength(1);
    reportAiConversationFailure({ npcId: "SpotBot", type: "tell", topic: "test", reason: "network_error" });
    expect(onFailure).toHaveBeenCalledTimes(1); // Disposal unsubscribes the session.
  } finally {
    await session.dispose();
    await fs.rm(directory, { recursive: true, force: true });
    vi.restoreAllMocks();
  }
});
