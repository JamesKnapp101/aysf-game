import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import { resolve, sep } from "node:path";
import type { Message, MessageCreateParamsNonStreaming } from "@anthropic-ai/sdk/resources/messages";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as actionDispatcher from "../game/actions/dispatchAction";
import * as engine from "../game/engine/handleCommand";
import * as gameInit from "../game/gameInit";
import { runHeadlessAgent } from "../game/harness/agent";
import { createHeadlessSession } from "../game/harness/session";
import type { Observation, SessionController, TranscriptEntry } from "../game/harness/types";
import { updateItemLocation } from "../game/rules/items";
import { setMessageListened } from "../game/rules/message-machine";
import { GOSSIP_NOTIFICATION_TEXT } from "../game/rules/notifications";
import { useUIEffectsStore, useUIOverlayStore } from "../game/store/store";
import type { GameState } from "../game/types/gameTypes";
import { createTestState } from "./helpers/gameTestHelpers";
import { DEFERRED_WORLD_CHUNK_IDS } from "../world/World";

const sessions: SessionController[] = [];
const directories: string[] = [];
const text = (observation: Observation) => observation.text.join("\n\n");
function fixture(phoneId = "EeglerPhone") {
  const initial = updateItemLocation(createTestState({ roomId: "StairWellSeven", rng: () => 0.99 }), phoneId, "StairWellSeven");
  // FULL_WORLD is already loaded; avoid replacing fixture definitions on hydration.
  initial.world = { ...initial.world, meta: { ...initial.world.meta, loadedChunkIds: [...DEFERRED_WORLD_CHUNK_IDS] } };
  return initial;
}
function session(initial = fixture()) {
  vi.spyOn(gameInit, "createFreshGameState").mockResolvedValueOnce(initial);
  const directory = resolve(".headless-transcripts", `phone-test-${randomUUID()}`);
  directories.push(directory);
  const controller = createHeadlessSession({ transcriptDirectory: directory });
  sessions.push(controller);
  return controller;
}
function archive(initial: GameState) {
  return initial.world.items.find(item => item.id === "EeglerPhone")!.meta!.messages as {
    id: string; title: string; transcript: string;
  }[];
}
async function history(controller: SessionController): Promise<TranscriptEntry[]> {
  const contents = await fs.readFile(controller.transcript().path, "utf8");
  return contents.trim().split("\n").map(line => JSON.parse(line));
}
afterEach(async () => {
  for (const controller of sessions.splice(0)) await controller.dispose();
  for (const directory of directories.splice(0)) {
    if (!directory.startsWith(resolve(".headless-transcripts") + sep)) throw new Error("Unsafe test cleanup.");
    await fs.rm(directory, { recursive: true, force: true });
  }
  vi.restoreAllMocks();
});

describe("headless phone message machine", () => {
  it("opens the authored phone without exposing unread bodies or blocking the session", async () => {
    const initial = fixture();
    const messages = archive(initial);
    const controller = session(initial);
    const spy = vi.spyOn(engine, "handleCommand");
    await controller.start();
    const opened = text(await controller.explorer.command("examine phone"));
    expect(opened).toContain("MESSAGE BUTLER");
    expect(opened).toContain("Stored messages: 3; unheard: 3.");
    expect(opened).toContain("Use play");
    expect(opened).toContain("Moves: 1");
    expect(opened).not.toContain("needs a headless gameplay adapter");
    const examined = await spy.mock.results[0].value;
    for (const observation of [opened, text(await controller.explorer.information("log")), text(await controller.explorer.information("history"))]) {
      for (const message of messages) {
        expect(observation).not.toContain(message.transcript);
        expect(observation).not.toContain(message.id);
      }
    }
    expect(examined.itemState.messagesPlayed).toEqual({});
    expect(text(await controller.explorer.command("close"))).toContain("You close the message machine.");
    expect(useUIOverlayStore.getState().overlay.kind).toBe("none");
    expect(text(await controller.explorer.command("inventory"))).toContain("Moves: 1");
    expect(spy.mock.calls[1][0]).toEqual(examined);
  });

  it("plays one message at a time through the browser action without advancing turns", async () => {
    const initial = fixture();
    const messages = archive(initial);
    const controller = session(initial);
    const spy = vi.spyOn(engine, "handleCommand");
    const dispatch = vi.spyOn(actionDispatcher, "dispatchAction");
    await controller.start();
    await controller.explorer.command("examine phone");
    let expected = await spy.mock.results[0].value;
    for (let index = 0; index < messages.length; index += 1) {
      const played = text(await controller.explorer.command("play"));
      expect(played).toContain(`Message ${index + 1}/3: ${messages[index].title}`);
      expect(played).toContain(messages[index].transcript);
      expect(played).toContain("Moves: 1");
      for (const other of messages.filter((_message, otherIndex) => otherIndex !== index)) expect(played).not.toContain(other.transcript);
      expect(dispatch.mock.calls[index]).toEqual([expected, { verb: "markMessagePlayed", payload: { messageId: messages[index].id } }]);
      expected = setMessageListened(expected, messages[index].id);
      expect((await dispatch.mock.results[index].value).state).toEqual(expected);
    }
    const replay = text(await controller.explorer.command("play next"));
    expect(replay).toContain(messages[0].transcript);
    expect(dispatch).toHaveBeenCalledTimes(3);
    expect(spy).toHaveBeenCalledTimes(1);
    await controller.explorer.command("close phone");
    await controller.explorer.command("look");
    expect(spy.mock.calls[1][0]).toEqual(expected);
    const records = await history(controller);
    expect(records.map(entry => entry.kind)).toEqual(["start", "command", "command", "command", "command", "command", "command", "command"]);
    expect(records.map(entry => entry.input).filter(Boolean)).toEqual(["examine phone", "play", "play", "play", "play next", "close phone", "look"]);
    expect(JSON.stringify(records)).not.toMatch(/3EM1|3EM2|3EM7|messagesPlayed|itemState/);
  });

  it("retains heard flags across reopening and prefers remaining unheard messages", async () => {
    const initial = fixture();
    const messages = archive(initial);
    const controller = session(initial);
    const spy = vi.spyOn(engine, "handleCommand");
    await controller.start();
    await controller.explorer.command("examine phone");
    await controller.explorer.command("play");
    await controller.explorer.command("close");
    const reopened = text(await controller.explorer.command("take messages"));
    expect(reopened).toContain("Stored messages: 3; unheard: 2.");
    expect(reopened).not.toContain(messages[1].transcript);
    const second = text(await controller.explorer.command("play message"));
    expect(second).toContain(messages[1].transcript);
    expect(second).not.toContain(messages[0].transcript);
    await controller.explorer.command("close messages");
    await controller.explorer.command("look");
    expect(spy.mock.calls[2][0].itemState.messagesPlayed).toEqual({ [messages[0].id]: true, [messages[1].id]: true });
  });

  it("requires closing the phone before ordinary gameplay and rejects arbitrary playback selection", async () => {
    const controller = session();
    const spy = vi.spyOn(engine, "handleCommand");
    const dispatch = vi.spyOn(actionDispatcher, "dispatchAction");
    await controller.start();
    await controller.explorer.command("play");
    expect(dispatch).not.toHaveBeenCalled();
    await controller.explorer.command("examine phone");
    for (const input of ["wait", "up", "look", "play 99", "restart"]) {
      const response = text(await controller.explorer.command(input));
      expect(response).toContain("The message machine is open.");
      expect(response).not.toContain("needs a headless gameplay adapter");
      expect(response).toContain("Moves: 2");
    }
    expect(spy).toHaveBeenCalledTimes(2);
    expect(dispatch).not.toHaveBeenCalled();
    expect(text(await controller.explorer.command("ILJIO"))).toContain("unavailable to players");
    await controller.explorer.command("close");
    await controller.explorer.command("wait");
    expect(spy).toHaveBeenCalledTimes(3);
  });

  it("handles an authored empty phone and resets an open phone's playback context", async () => {
    const initial = fixture("SixEastBedPhone");
    const controller = session(initial);
    const dispatch = vi.spyOn(actionDispatcher, "dispatchAction");
    await controller.start();
    const opened = text(await controller.explorer.command("examine phone"));
    expect(opened).toContain("Stored messages: 0; unheard: 0.");
    expect(opened).toContain("No stored messages.");
    expect(text(await controller.explorer.command("play"))).toContain("No stored messages.");
    expect(dispatch).not.toHaveBeenCalled();
    await controller.reset();
    expect(useUIOverlayStore.getState().overlay.kind).toBe("none");
    expect(text(await controller.explorer.command("wait"))).toContain("Moves: 1");
  });

  it("emits and applies deferred gossip notifications once on close", async () => {
    const initial = fixture();
    initial.world = { ...initial.world, items: initial.world.items.map(item => item.id === "EeglerPhone" ? {
      ...item, containsTea: [{ id: "phone-test-secret", title: "Phone secret", summary: "An acquired test secret.", type: "secret" as const, tags: [] }],
    } : item) };
    const controller = session(initial);
    const spy = vi.spyOn(engine, "handleCommand");
    await controller.start();
    expect(text(await controller.explorer.command("examine phone"))).not.toContain(GOSSIP_NOTIFICATION_TEXT);
    const closed = text(await controller.explorer.command("close"));
    expect(closed.split(GOSSIP_NOTIFICATION_TEXT)).toHaveLength(2);
    expect(text(await controller.explorer.information("gossip"))).toContain("An acquired test secret.");
    expect(text(await controller.explorer.command("inventory"))).not.toContain(GOSSIP_NOTIFICATION_TEXT);
    const afterClose = spy.mock.calls[1][0];
    expect(afterClose.uiState.notifications.filter(notification => notification.kind === "gossip")).toHaveLength(1);
    expect(afterClose.itemState.messagesPlayed).toEqual({});
    await controller.explorer.command("examine phone");
    expect(text(await controller.explorer.command("close"))).not.toContain(GOSSIP_NOTIFICATION_TEXT);
  });

  it("retains unrelated terminal and effect gates", async () => {
    const controller = session();
    const dispatch = vi.spyOn(actionDispatcher, "dispatchAction");
    await controller.start();
    await controller.explorer.command("examine phone");
    useUIEffectsStore.getState().playMindFlash({ memory: "Unadapted effect content" });
    const response = text(await controller.explorer.command("play"));
    expect(response).toContain("needs a headless gameplay adapter");
    expect(response).not.toContain("Unadapted effect content");
    expect(dispatch).not.toHaveBeenCalled();
    await controller.reset();
    useUIOverlayStore.getState().openOverlay({ kind: "matter-transmitter", isOn: true });
    expect(text(await controller.explorer.command("close"))).toContain("needs a headless gameplay adapter");
  });

  it.each([1, 2])("respects an action budget of %i inside a phone tool batch", async maxActions => {
    const initial = fixture();
    const messages = archive(initial);
    const controller = session(initial);
    const dispatch = vi.spyOn(actionDispatcher, "dispatchAction");
    const client = { messages: {
      countTokens: vi.fn(async () => ({ input_tokens: 100 })),
      create: vi.fn(async () => ({
        content: ["examine phone", "play", "close"].map((command, index) => ({
          type: "tool_use", id: `tool_${index}`, name: "game_command", input: { command },
        })),
        stop_reason: "tool_use", usage: { input_tokens: 100, output_tokens: 20, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 },
      } as Message)),
    } };
    const run = await runHeadlessAgent({ client, session: controller, options: { maxActions } });
    expect(run.reason).toBe("action_limit");
    expect(run.actions).toBe(maxActions);
    expect(client.messages.create).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledTimes(maxActions - 1);
    expect(run.events.map(event => event.request)).toEqual(["examine phone", "play"].slice(0, maxActions));
    const recorded = JSON.stringify(run.events) + await fs.readFile(run.transcriptPath, "utf8");
    if (maxActions === 1) expect(recorded).not.toContain(messages[0].transcript);
    expect(recorded).not.toContain(messages[1].transcript);
    expect(recorded).not.toContain(messages[2].transcript);
    expect(useUIOverlayStore.getState().overlay.kind).toBe("none");
  });

  it("lets the autonomous player explicitly play and close using its existing tool and action budget", async () => {
    const initial = fixture();
    const messages = archive(initial);
    const controller = session(initial);
    const inputs = ["examine phone", "play", "close", "inventory"];
    let turn = 0;
    const requests: MessageCreateParamsNonStreaming[] = [];
    const client = { messages: {
      countTokens: vi.fn(async () => ({ input_tokens: 100 })),
      create: vi.fn(async (request: MessageCreateParamsNonStreaming) => {
        requests.push(request);
        const command = inputs[turn++];
        return {
          content: [{ type: "tool_use", id: `tool_${turn}`, name: "game_command", input: { command } }],
          stop_reason: "tool_use", usage: { input_tokens: 100, output_tokens: 20, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 },
        } as Message;
      }),
    } };
    const run = await runHeadlessAgent({ client, session: controller, options: { maxActions: 4 } });
    expect(run.reason).toBe("action_limit");
    expect(run.actions).toBe(4);
    expect(run.events.map(event => event.request)).toEqual(inputs);
    expect(run.events[0].text.join("\n")).not.toContain(messages[0].transcript);
    expect(run.events[1].text.join("\n")).toContain(messages[0].transcript);
    expect(run.events[3].text.join("\n")).toContain("Moves: 1");
    expect(JSON.stringify(requests[1].messages)).not.toContain(messages[0].transcript);
    expect(JSON.stringify(requests[2].messages)).toContain(messages[0].transcript);
    const recorded = await fs.readFile(run.transcriptPath, "utf8") + await fs.readFile(run.reportPath, "utf8");
    expect(recorded).not.toContain(messages[1].transcript);
    expect(recorded).not.toContain(messages[2].transcript);
    expect(recorded).not.toMatch(/3EM1|3EM2|3EM7|itemState|messagesPlayed/);
  });
});
