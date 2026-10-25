import { afterEach, describe, expect, it, vi } from "vitest";
import { handleCommand } from "@game/engine/handleCommand";
import { getPendingConversationLogMessage } from "@game/helpers/conversationHelpers";
import { exchangeTranscript, openInformationExchange, sharedGossipIds } from "@game/rules/informationExchange";
import { useUIOverlayStore } from "@game/store/store";
import type { GameState } from "@game/types/gameTypes";
import { parseCommand } from "../parse/parser";
import { createTestState, setPlayerRoom } from "./helpers/gameTestHelpers";
import { nailBotFixture } from "./helpers/nailBotTestHelpers";

const command = (state: GameState, input: string) => handleCommand(state, parseCommand(input));
const ids = ["horny clone", "nursery mishap", "steam room coverup"];
const tellInputs = [
  "tell robot about captain", "tell nailbot about captain", "tell robot about the captain",
  "tell robot about nonsense", "tell robot about gossip", "tell nailbot about gossip",
  "tell robot about something", "tell robot", "tell nailbot", "tell robot about", "tell nailbot about",
  "TELL NAILBOT ABOUT THE SHIP", "tell the robot about tea", "tell manibot about nonsense",
  "tell pedibot about nonsense", "tell nail tech about nonsense", "tell bot about nonsense",
  "tell robot to listen", ...ids.map(id => `tell robot about ${id}`),
];

function expectNoExchangeChanges(before: GameState, after: GameState) {
  expect(sharedGossipIds(after, "NailBot")).toEqual(sharedGossipIds(before, "NailBot"));
  expect(exchangeTranscript(after, "NailBot")).toEqual(exchangeTranscript(before, "NailBot"));
  expect(after.conversation).toEqual(before.conversation);
  expect(after.player.log).toEqual(before.player.log);
  expect(after.player.inventory).toEqual(before.player.inventory);
  expect(after.player.spiltTea).toEqual(before.player.spiltTea);
  expect(after.worldState.npcSecrets).toEqual(before.worldState.npcSecrets);
  expect(after.uiState.notifications).toEqual(before.uiState.notifications);
  expect(after.score).toBe(before.score);
  expect(after.moves).toBe(before.moves);
}

afterEach(() => { vi.restoreAllMocks(); useUIOverlayStore.getState().closeOverlay(); });

describe("NailBot TELL routing", () => {
  it.each(["authored", "ai"] as const)("opens the selector for every topic and incomplete form without progress in %s mode", async mode => {
    let state = await command(nailBotFixture(), "use voucher");
    state.uiState.conversationMode = mode;
    const fetch = vi.spyOn(globalThis, "fetch");
    const inputs = [...tellInputs, ...state.player.spiltTea.map(topic => `tell nailbot about ${topic.title}`), "share gossip", "spill tea"];
    for (const input of inputs) {
      const before = state;
      expect(getPendingConversationLogMessage(state, parseCommand(input))).toBeUndefined();
      state = await command(state, input);
      expect(useUIOverlayStore.getState().overlay).toEqual({ kind: "information-exchange", npcId: "NailBot" });
      expectNoExchangeChanges(before, state);
      useUIOverlayStore.getState().closeOverlay();
      expectNoExchangeChanges(before, state);
    }
    expect(state.worldState.npcSecrets.NailBot).toBeUndefined();
    expect(state.player.inventory.general).not.toContain("RobotWhistle");
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each(["authored", "ai"] as const)("keeps the voucher gate on all TELL forms in %s mode", async mode => {
    let state = nailBotFixture();
    state.uiState.conversationMode = mode;
    const fetch = vi.spyOn(globalThis, "fetch");
    for (const input of tellInputs) {
      const before = state;
      const output: string[] = [];
      state = await handleCommand(state, parseCommand(input), { onOutput: entries => output.push(...entries) });
      expect(output.join("\n")).toMatch(/voucher/);
      expect(useUIOverlayStore.getState().overlay.kind).toBe("none");
      expectNoExchangeChanges(before, state);
    }
    expect(fetch).not.toHaveBeenCalled();
  });

  it("ignores ambiguous gossip titles and preserves a partial exchange when TELL names the final rumor", async () => {
    let state = await command(nailBotFixture(), "use voucher");
    state = await command(state, `share ${ids[0]} with nailbot`);
    state = await command(state, `share ${ids[1]} with nailbot`);
    state.player.spiltTea = [...state.player.spiltTea, { ...state.player.spiltTea[0], id: "another clone" }];
    for (const input of ["tell robot about Sanyi", `tell robot about ${ids[2]}`]) {
      const before = state;
      state = await command(state, input);
      expect(useUIOverlayStore.getState().overlay.kind).toBe("information-exchange");
      expectNoExchangeChanges(before, state);
    }
    expect(sharedGossipIds(state, "NailBot")).toEqual(ids.slice(0, 2));
    expect(state.player.log).toHaveLength(1);
    expect(state.worldState.npcSecrets.NailBot).toBeUndefined();
    expect(state.player.inventory.general).not.toContain("RobotWhistle");
  });

  it("opens without repairing progress or backfilling a journal, and requires a present partner", async () => {
    const state = await command(nailBotFixture(), "use voucher");
    state.conversation = { npcs: { NailBot: { gossipToldIds: ids } } };
    const opened = openInformationExchange(state, "NailBot");
    expect(opened.state).toBe(state);
    expect(opened.overlay).toEqual({ kind: "information-exchange", npcId: "NailBot" });
    expect(state.player.log).toEqual([]);
    expect(state.worldState.npcSecrets.NailBot).toBeUndefined();
    useUIOverlayStore.getState().closeOverlay();
    const absent = await command(setPlayerRoom(state, "Spa"), "tell nailbot about horny clone");
    expect(useUIOverlayStore.getState().overlay.kind).toBe("none");
    expect(absent.player.log).toEqual([]);
    expect(absent.worldState.npcSecrets.NailBot).toBeUndefined();
  });

  it.each(["authored", "ai"] as const)("keeps ASK on the existing conversation path in %s mode", async mode => {
    let state = await command(nailBotFixture(), "use voucher");
    state.uiState.conversationMode = mode;
    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: true, json: async () => ({ success: true, response: "An ordinary answer." }) } as Response);
    for (const input of ["ask robot about the captain", "ask nailbot about the ship", "ask robot why it's here"]) {
      const parsed = parseCommand(input);
      expect(parsed).toMatchObject({ type: "action", verb: "ask" });
      state = await handleCommand(state, parsed);
      expect(useUIOverlayStore.getState().overlay.kind).toBe("none");
      expect(state.conversation?.npcs?.NailBot?.conversationHistory?.at(-1)?.type).toBe("ask");
      expect(sharedGossipIds(state, "NailBot")).toEqual([]);
    }
    if (mode === "ai") expect(fetch).toHaveBeenCalledTimes(3);
    else expect(fetch).not.toHaveBeenCalled();
  });

  it.each(["authored", "ai"] as const)("keeps other NPCs on their normal TELL path in %s mode", async mode => {
    let state = createTestState({ roomId: "GymWeightRoom" });
    state.uiState.conversationMode = mode;
    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: true, json: async () => ({ success: true, response: "An ordinary reply." }) } as Response);
    state = await command(state, "tell robot the man is dead");
    expect(useUIOverlayStore.getState().overlay.kind).toBe("none");
    expect(state.conversation?.npcs?.SpotBot?.conversationHistory?.at(-1)?.type).toBe("tell");
    if (mode === "ai") expect(fetch).toHaveBeenCalledOnce();
    else expect(fetch).not.toHaveBeenCalled();
  });
});
