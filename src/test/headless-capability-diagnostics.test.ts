import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import { resolve, sep } from "node:path";
import type { Message, MessageCreateParamsNonStreaming } from "@anthropic-ai/sdk/resources/messages";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as engine from "../game/engine/handleCommand";
import * as gameInit from "../game/gameInit";
import { runHeadlessAgent } from "../game/harness/agent";
import { missingCapabilityDiagnostic } from "../game/harness/capabilityDiagnostics";
import { createHeadlessSession } from "../game/harness/session";
import type { MissingCapabilityDiagnostic, SessionController } from "../game/harness/types";
import { updateItemLocation } from "../game/rules/items";
import { useUIEffectsStore, useUIOverlayStore } from "../game/store/store";
import { DEFERRED_WORLD_CHUNK_IDS } from "../world/World";
import { createTestState } from "./helpers/gameTestHelpers";

const controllers: SessionController[] = [];
const directories: string[] = [];
function fixture(kind: string) {
  let state = createTestState({ roomId: "StairWellSeven", rng: () => 0.99 });
  const item = state.world.items.find(item => item.meta?.kind === kind)!;
  if (!item) throw new Error(`Missing authored fixture for ${kind}`);
  state = updateItemLocation(state, item.id, "StairWellSeven");
  state.world = { ...state.world, meta: { ...state.world.meta, loadedChunkIds: [...DEFERRED_WORLD_CHUNK_IDS] } };
  state.worldState.powerRestoredSections["power-initialized"] = true;
  return { state, input: `examine ${item.vocab[0]}` };
}
function session(kind = "hydroponics-admin-terminal") {
  const initial = fixture(kind);
  vi.spyOn(gameInit, "createFreshGameState").mockResolvedValueOnce(initial.state);
  const directory = resolve(".headless-transcripts", `capability-test-${randomUUID()}`);
  directories.push(directory);
  const controller = createHeadlessSession({ transcriptDirectory: directory });
  controllers.push(controller);
  return { controller, ...initial };
}
afterEach(async () => {
  for (const controller of controllers.splice(0)) await controller.dispose();
  for (const directory of directories.splice(0)) {
    if (!directory.startsWith(resolve(".headless-transcripts") + sep)) throw new Error("Unsafe test cleanup.");
    await fs.rm(directory, { recursive: true, force: true });
  }
  vi.restoreAllMocks();
});

describe("host-only missing capability diagnostics", () => {
  it.each([
    ["hydroponics-admin-terminal", "menu-controls"],
    ["matter-transmitter", "item-transfer"],
    ["3d-printer", "crafting"],
    ["game-preserve-terminal", "hunt-selection"],
  ])("records the actual %s opening and stops conservatively", async (kind, category) => {
    const { controller, input } = session(kind);
    const spy = vi.spyOn(engine, "handleCommand");
    await controller.start();
    const opened = await controller.explorer.command(input);
    expect(opened.text.join("\n")).toContain("needs a headless gameplay adapter");
    expect(useUIOverlayStore.getState().overlay.kind).toBe(kind);
    const diagnostic = {
      overlayKind: kind, originatingCommand: input, category,
      triggeringActionExecuted: true, overlayEntered: true,
    };
    expect(controller.capabilityDiagnostics!()).toEqual([diagnostic]);
    expect(Object.isFrozen(controller.capabilityDiagnostics!())).toBe(true);
    expect(Object.isFrozen(controller.capabilityDiagnostics!()[0])).toBe(true);
    expect(controller.explorer).not.toHaveProperty("capabilityDiagnostics");
    await controller.explorer.command("close");
    await controller.explorer.command("wait");
    expect(spy).toHaveBeenCalledTimes(1);
    expect(controller.capabilityDiagnostics!()).toEqual([diagnostic]);
    expect(useUIOverlayStore.getState().overlay.kind).toBe(kind);
    const transcript = await fs.readFile(controller.transcript().path, "utf8");
    expect(transcript).not.toContain(kind);
    expect(transcript).not.toMatch(/triggeringActionExecuted|overlayEntered|originatingCommand|category/);
    await controller.reset();
    expect(controller.capabilityDiagnostics!()).toEqual([]);
    expect(useUIOverlayStore.getState().overlay.kind).toBe("none");
    expect((await controller.explorer.command("wait")).text.join("\n")).toContain("Moves: 1");
  });

  it("reports unexecuted pending gates without inventing an originating action", async () => {
    const { controller } = session();
    const spy = vi.spyOn(engine, "handleCommand");
    await controller.start();
    useUIOverlayStore.getState().openOverlay({ kind: "matter-transmitter", isOn: true });
    const observation = await controller.explorer.information("room");
    expect(observation.text.join("\n")).toContain("needs a headless gameplay adapter");
    expect(controller.capabilityDiagnostics!()).toEqual([{
      overlayKind: "matter-transmitter", originatingCommand: null, category: "item-transfer",
      triggeringActionExecuted: false, overlayEntered: true,
    }]);
    await controller.explorer.command("close");
    expect(spy).not.toHaveBeenCalled();
  });

  it("allows supported radio controls without a missing-capability diagnostic", async () => {
    const { controller, state } = session();
    state.itemState.itemRoomId.Radio = "StairWellSeven";
    await controller.start();
    await controller.explorer.command("set radio");
    expect(controller.capabilityDiagnostics!()).toEqual([]);
    expect((await controller.explorer.command("tune 150")).text.join("\n")).toContain("150.000 MHz");
  });

  it("does not block or diagnose an ordinary failed power prerequisite", async () => {
    const { controller, state, input } = session("power-station-terminal");
    state.worldState.powerRestoredSections["power-initialized"] = false;
    await controller.start();
    expect((await controller.explorer.command(input)).text.join("\n")).toContain("currently dark");
    expect(controller.capabilityDiagnostics!()).toEqual([]);
    expect(useUIOverlayStore.getState().overlay.kind).toBe("none");
    expect((await controller.explorer.command("wait")).text.join("\n")).toContain("Moves: 2");
  });

  it.each(["mind-flash", "syndrome-x-signal"])("records pending %s without exposing its payload", async kind => {
    const { controller } = session();
    await controller.start();
    const effects = useUIEffectsStore.getState();
    if (kind === "mind-flash") effects.playMindFlash({ memory: "PRIVATE_EFFECT_PAYLOAD" });
    if (kind === "syndrome-x-signal") effects.playSyndromeXSignal({ id: "PRIVATE_EFFECT_ID", text: "PRIVATE_EFFECT_PAYLOAD" });
    const observation = await controller.explorer.command("wait");
    expect(observation.text.join("\n")).not.toContain("PRIVATE_EFFECT");
    expect(controller.capabilityDiagnostics!()[0]).toMatchObject({ overlayKind: kind, category: "automatic-sequence", triggeringActionExecuted: false });
    expect(JSON.stringify(controller.capabilityDiagnostics!())).not.toContain("PRIVATE_EFFECT");
  });

  it("classifies the legacy union and world visor without gaining control access", () => {
    const state = createTestState();
    useUIOverlayStore.getState().openOverlay({ kind: "mindFlash", memory: "PRIVATE_MEMORY" });
    expect(missingCapabilityDiagnostic(state, "wait", false)).toMatchObject({ overlayKind: "mindFlash", category: "unknown-interface" });
    useUIOverlayStore.getState().closeOverlay();
    state.player.roomId = "DeepStorageGrid";
    state.itemState.wornByPlayer.body = "ColdSuit";
    expect(missingCapabilityDiagnostic(state, "wear suit", true)).toEqual({
      overlayKind: "deep-storage-suit", category: "suit-navigation", originatingCommand: "wear suit",
      triggeringActionExecuted: true, overlayEntered: true,
    });
  });

  it("copies host metadata to the report, keeps it out of model context and stops before another tool", async () => {
    const { controller, input } = session();
    const requests: MessageCreateParamsNonStreaming[] = [];
    const client = { messages: {
      countTokens: vi.fn(async () => ({ input_tokens: 100 })),
      create: vi.fn(async (request: MessageCreateParamsNonStreaming) => {
        requests.push(request);
        return {
          content: [input, "wait"].map((command, index) => ({
            type: "tool_use", id: `tool_${index}`, name: "game_command", input: { command },
          })), stop_reason: "tool_use",
          usage: { input_tokens: 100, output_tokens: 20, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 },
        } as Message;
      }),
    } };
    const run = await runHeadlessAgent({ client, session: controller, options: { maxActions: 3 } });
    expect(run.reason).toBe("missing_harness_capability");
    expect(run.actions).toBe(1);
    expect(client.messages.create).toHaveBeenCalledTimes(1);
    expect(run.capabilityDiagnostics).toEqual(controller.capabilityDiagnostics!());
    expect(run.capabilityDiagnostics).toHaveLength(1);
    const report = await fs.readFile(run.reportPath, "utf8");
    expect(report).toContain("Overlay: hydroponics-admin-terminal");
    expect(report).toContain(`originating command: ${input}`);
    expect(report).toContain("triggering action executed: true; overlay entered: true");
    const playerData = JSON.stringify(requests) + JSON.stringify(run.events) + await fs.readFile(run.transcriptPath, "utf8");
    expect(playerData).not.toMatch(/hydroponics-admin-terminal|menu-controls|triggeringActionExecuted|originatingCommand/);
    expect(run.capabilityDiagnostics![0]).toSatisfy((diagnostic: MissingCapabilityDiagnostic) => Object.isFrozen(diagnostic));
  });
});
