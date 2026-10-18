import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import { resolve, sep } from "node:path";
import type { Message, MessageCreateParamsNonStreaming } from "@anthropic-ai/sdk/resources/messages";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as engine from "../game/engine/handleCommand";
import * as gameInit from "../game/gameInit";
import { runHeadlessAgent } from "../game/harness/agent";
import { createHeadlessSession } from "../game/harness/session";
import type { SessionController, TranscriptEntry } from "../game/harness/types";
import { updateItemLocation } from "../game/rules/items";
import { useUIEffectsStore, useUIOverlayStore } from "../game/store/store";
import type { OrganismDeathPayload } from "../game/types/uiTypes";
import { DEFERRED_WORLD_CHUNK_IDS } from "../world/World";
import { createTestState } from "./helpers/gameTestHelpers";

const execute = engine.handleCommand;
const controllers: SessionController[] = [];
const directories: string[] = [];
function fixture(attack = false) {
  let state = createTestState({ roomId: "StairWellSeven", rng: () => 0.99 });
  state.world = { ...state.world, meta: { ...state.world.meta, loadedChunkIds: [...DEFERRED_WORLD_CHUNK_IDS] } };
  if (attack) {
    state = updateItemLocation(state, "organism6", "StairWellSeven");
    state.worldState.darkRooms.StairWellSeven = true;
  }
  return state;
}
function session(attack = false) {
  vi.spyOn(gameInit, "createFreshGameState").mockResolvedValueOnce(fixture(attack));
  const directory = resolve(".headless-transcripts", `organism-death-test-${randomUUID()}`);
  directories.push(directory);
  const controller = createHeadlessSession({ transcriptDirectory: directory });
  controllers.push(controller);
  return controller;
}
async function history(controller: SessionController): Promise<TranscriptEntry[]> {
  return (await fs.readFile(controller.transcript().path, "utf8")).trim().split("\n").map(line => JSON.parse(line));
}

afterEach(async () => {
  vi.useRealTimers();
  for (const controller of controllers.splice(0)) await controller.dispose();
  for (const directory of directories.splice(0)) {
    if (!directory.startsWith(resolve(".headless-transcripts") + sep)) throw new Error("Unsafe test cleanup.");
    await fs.rm(directory, { recursive: true, force: true });
  }
  vi.restoreAllMocks();
});

describe("automatic headless organism death sequences", () => {
  it("reveals the triggered cipher, preserves regeneration, and resumes exploration", async () => {
    const controller = session(true);
    const spy = vi.spyOn(engine, "handleCommand");
    const played = vi.spyOn(useUIEffectsStore.getState(), "playOrganismDeath");
    await controller.start();
    const response = await controller.explorer.command("wait");
    expect(played).toHaveBeenCalledTimes(1);
    const payload = played.mock.calls[0][0];
    expect(response.text.join("\n")).toContain("You have died");
    expect(response.text).toContain(`${payload.title}\n\n${payload.cipherText}`);
    expect(response.text.join("\n")).not.toContain("needs a headless gameplay adapter");
    expect(response.text.at(-1)).toContain("Power Grid");
    expect(response.text.at(-1)).toContain("Moves: 1");
    const after = await spy.mock.results[0].value;
    expect(after.player.roomId).toBe("PowerGrid");
    expect(after.worldState.playerDeaths.StairWellSeven.cause).toBe("organism");
    expect(after.world.items.filter((item: { id: string }) => item.id.startsWith("playerRegenHusk"))).toHaveLength(1);
    expect(useUIEffectsStore.getState().organismDeath).toBeNull();
    expect(controller.capabilityDiagnostics!()).toEqual([]);
    const next = await controller.explorer.command("wait");
    expect(next.text.join("\n")).toContain("Moves: 2");
    expect(next.text.join("\n")).not.toContain(payload.cipherText);
    expect(spy.mock.calls[1][0]).toEqual(after);
    expect((await history(controller))[1].observation).toEqual(response);
  });

  it("finishes once without timers before executing queued commands", async () => {
    const controller = session(true);
    await controller.start();
    vi.useFakeTimers();
    const ended = vi.fn();
    let release!: () => void;
    const barrier = new Promise<void>(resolve => { release = resolve; });
    let entered!: () => void;
    const entry = new Promise<void>(resolve => { entered = resolve; });
    const spy = vi.spyOn(engine, "handleCommand").mockImplementationOnce(async (...args) => {
      const result = await execute(...args);
      const payload = useUIEffectsStore.getState().organismDeath!;
      useUIEffectsStore.setState({ organismDeath: { ...payload, onEnd: ended } });
      entered();
      await barrier;
      return result;
    });
    const death = controller.explorer.command("wait");
    const queued = controller.explorer.command("wait");
    await entry;
    expect(spy).toHaveBeenCalledTimes(1);
    expect(ended).not.toHaveBeenCalled();
    release();
    expect((await death).text.join("\n")).toContain("SIGNAL RECEIVED");
    expect((await queued).text.join("\n")).toContain("Moves: 2");
    expect(ended).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
    await controller.dispose();
    expect(ended).toHaveBeenCalledTimes(1);
  });

  it.each(["command", "information"])("settles a sequence already pending before a %s request", async request => {
    const controller = session();
    const spy = vi.spyOn(engine, "handleCommand");
    await controller.start();
    const started = vi.fn();
    const ended = vi.fn();
    useUIEffectsStore.getState().playOrganismDeath({
      title: "SIGNAL RECEIVED", cipherText: "AAAAA BBBBB\nCCCCC DDDDD", onStart: started, onEnd: ended,
    });
    const response = request === "command"
      ? await controller.explorer.command("look")
      : await controller.explorer.information("room");
    expect(response.text[0]).toBe("SIGNAL RECEIVED\n\nAAAAA BBBBB\nCCCCC DDDDD");
    expect(response.text.at(-1)).toContain("Bottom of Stairwell");
    expect(response.text.join("\n")).toContain("Moves: 0");
    expect(spy).toHaveBeenCalledTimes(request === "command" ? 1 : 0);
    expect(started).toHaveBeenCalledTimes(1);
    expect(ended).toHaveBeenCalledTimes(1);
    expect(useUIEffectsStore.getState().organismDeath).toBeNull();
    expect(controller.capabilityDiagnostics!()).toEqual([]);
  });

  it.each(["fade", "type", "random-chunks"] as const)("preserves the final cipher layout for %s reveals", async revealMode => {
    const controller = session();
    await controller.start();
    useUIEffectsStore.getState().playOrganismDeath({
      cipherText: "ABCDE FGHIJ\n\nKLMNO PQRST", revealMode, seed: 7, chunkSize: 2, chunkMs: 999999,
    });
    const response = await controller.explorer.command("look");
    expect(response.text[0]).toBe("ABCDE FGHIJ\n\nKLMNO PQRST");
    expect(response.text.join("\n")).not.toMatch(/seed|chunkSize|chunkMs|random-chunks/);
    expect(useUIEffectsStore.getState().organismDeath).toBeNull();
  });

  it("keeps unsupported gameplay controls blocked after finishing the sequence", async () => {
    const controller = session();
    const spy = vi.spyOn(engine, "handleCommand");
    await controller.start();
    useUIEffectsStore.getState().playOrganismDeath({ cipherText: "ABCDE", onEnd: () => {
      useUIOverlayStore.getState().openOverlay({ kind: "matter-transmitter", isOn: true });
    } });
    const response = await controller.explorer.command("wait");
    expect(response.text).toContain("ABCDE");
    expect(response.text.join("\n")).toContain("needs a headless gameplay adapter");
    expect(controller.capabilityDiagnostics!()[0]).toMatchObject({ overlayKind: "matter-transmitter", triggeringActionExecuted: false });
    expect(spy).not.toHaveBeenCalled();
  });

  it("completes repeated signals independently without replaying previous reveals", async () => {
    const controller = session();
    await controller.start();
    const ended = vi.fn();
    for (const cipherText of ["AAAAA BBBBB", "CCCCC DDDDD"]) {
      useUIEffectsStore.getState().playOrganismDeath({ cipherText, onEnd: ended });
      const response = await controller.explorer.command("wait");
      expect(response.text).toContain(cipherText);
      expect(useUIEffectsStore.getState().organismDeath).toBeNull();
    }
    expect(ended).toHaveBeenCalledTimes(2);
    const records = await history(controller);
    expect(records[1].observation.text).toContain("AAAAA BBBBB");
    expect(records[2].observation.text).toContain("CCCCC DDDDD");
    expect(records[2].observation.text).not.toContain("AAAAA BBBBB");
    expect(records[2].observation.text.join("\n")).toContain("Moves: 2");
    expect(controller.capabilityDiagnostics!()).toEqual([]);
    await controller.dispose();
    expect(ended).toHaveBeenCalledTimes(2);
  });

  it("clears a pending sequence on reset without leaking it into the next episode", async () => {
    const controller = session();
    await controller.start();
    const ended = vi.fn();
    useUIEffectsStore.getState().playOrganismDeath({ cipherText: "OLD CIPHER", onEnd: ended });
    vi.mocked(gameInit.createFreshGameState).mockResolvedValueOnce(fixture());
    const reset = await controller.reset();
    expect(reset.text.join("\n")).not.toContain("OLD CIPHER");
    expect(ended).toHaveBeenCalledTimes(1);
    expect(useUIEffectsStore.getState().organismDeath).toBeNull();
    const next = await controller.explorer.command("wait");
    expect(next.text.join("\n")).toContain("Moves: 1");
    expect(next.text.join("\n")).not.toContain("OLD CIPHER");
    expect(controller.capabilityDiagnostics!()).toEqual([]);
  });

  it("allows an autonomous agent to continue after an organism death", async () => {
    const controller = session(true);
    const requests: MessageCreateParamsNonStreaming[] = [];
    const client = { messages: {
      countTokens: async () => ({ input_tokens: 100 }),
      create: async (request: MessageCreateParamsNonStreaming) => {
        requests.push(request);
        return {
          content: [{ type: "tool_use", id: `tool_${requests.length}`, name: "game_command", input: { command: "wait" } }],
          stop_reason: "tool_use", usage: { input_tokens: 100, output_tokens: 20, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 },
        } as Message;
      },
    } };
    const played = vi.spyOn(useUIEffectsStore.getState(), "playOrganismDeath");
    const run = await runHeadlessAgent({ client, session: controller, options: { maxActions: 2 } });
    expect(run.reason).toBe("action_limit");
    expect(run.actions).toBe(2);
    expect(run.capabilityDiagnostics).toEqual([]);
    const payload: OrganismDeathPayload = played.mock.calls[0][0];
    expect(run.events[0].text).toContain(`${payload.title}\n\n${payload.cipherText}`);
    expect(JSON.stringify(requests[1].messages)).toContain(payload.cipherText);
    expect(run.events[1].text.join("\n")).toContain("Moves: 2");
  });
});
