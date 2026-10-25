import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import { resolve, sep } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as gameInit from "@game/gameInit";
import * as engine from "@game/engine/handleCommand";
import { createHeadlessSession } from "@game/harness/session";
import type { SessionController } from "@game/harness/types";
import type { GameState } from "@game/types/gameTypes";
import { NPC_SECRETS } from "@game/npcSecrets";
import { NPCS } from "@game/npcRegistry";
import { useUIOverlayStore } from "@game/store/store";
import { parseCommand } from "../parse/parser";
import { nailBotFixture } from "./helpers/nailBotTestHelpers";

let session: SessionController | undefined;
let directory: string | undefined;
afterEach(async () => {
  await session?.dispose();
  if (directory) {
    if (!directory.startsWith(resolve(".headless-transcripts") + sep)) throw new Error("Unsafe test cleanup.");
    await fs.rm(directory, { recursive: true, force: true });
  }
  session = undefined;
  directory = undefined;
  vi.restoreAllMocks();
});

describe("headless NailBot encounter", () => {
  it.each(["authored", "ai"] as const)("lists and completes with the same state as browser commands in %s mode", async mode => {
    const fixture = nailBotFixture();
    fixture.uiState.conversationMode = mode;
    const fetch = vi.spyOn(globalThis, "fetch");
    vi.spyOn(gameInit, "createFreshGameState").mockResolvedValueOnce({ ...fixture, player: { ...fixture.player, roomId: gameInit.FINAL_PLAYER_START_ROOM_ID } });
    const spy = vi.spyOn(engine, "handleCommand");
    directory = resolve(".headless-transcripts", `nailbot-${randomUUID()}`);
    session = createHeadlessSession({ transcriptDirectory: directory, scenario: {
      id: "nailbot-exchange", objective: "Exchange gossip with NailBot", startRoom: "NailSalon", inventory: ["ManiPediVoucher"],
      prerequisites: [{ description: "Choose conversation mode", apply: state => ({ ...state, uiState: { ...state.uiState, conversationMode: mode } }) }],
    } });
    await session.start();
    const text = async (input: string) => (await session!.explorer.command(input)).text.join("\n");
    const unpaidInputs = ["talk to robot", "tell robot", "tell robot about horny clone"];
    for (const input of unpaidInputs) expect(await text(input)).toMatch(/voucher/i);
    expect(fetch).not.toHaveBeenCalled();
    expect(await text("give voucher")).toContain(NPCS.NailBot.informationExchange!.greeting);
    const listingInputs = ["share gossip", "tell robot about the captain", "tell robot about nonsense", "tell nailbot about horny clone", "tell robot", "tell nailbot about"];
    for (const input of listingInputs) {
      const listing = await text(input);
      for (const topic of fixture.player.spiltTea) {
        expect(listing).toContain(topic.title);
        expect(listing).not.toContain(`[${topic.id}]`);
      }
      expect(listing).toContain("share <topic title> with nailbot");
      expect(listing).not.toContain("Use tell");
      const opened: GameState = await spy.mock.results.at(-1)!.value;
      expect(opened.conversation?.npcs?.NailBot?.gossipToldIds ?? []).toEqual([]);
      expect(opened.player.log).toEqual([]);
      expect(opened.player.inventory.general).not.toContain("RobotWhistle");
      expect(opened.worldState.npcSecrets.NailBot).toBeUndefined();
      expect(useUIOverlayStore.getState().overlay.kind).toBe("none");
    }
    const commands = ["spill tea", "share nursery mishap with nailbot", "share horny clone with nailbot", "tell robot about steam room coverup", "share steam room coverup with nailbot"];
    let finalText = "";
    for (const input of commands) {
      finalText = await text(input);
      if (input.startsWith("tell ")) {
        const opened: GameState = await spy.mock.results.at(-1)!.value;
        expect(opened.conversation?.npcs?.NailBot?.gossipToldIds).toEqual(["nursery mishap", "horny clone"]);
        expect(opened.player.log).toHaveLength(1);
        expect(opened.worldState.npcSecrets.NailBot).toBeUndefined();
        expect(opened.player.inventory.general).not.toContain("RobotWhistle");
        expect(finalText).toContain("share <topic title> with nailbot");
      }
    }
    expect(finalText).toContain(NPC_SECRETS.nailbot_secret.text);
    const transition = NPCS.NailBot.informationExchange!.secretTransition;
    expect(finalText.split(transition)).toHaveLength(2);
    expect(finalText).toContain("You have obtained a small whistle");
    expect(finalText).toContain("You obtained some salacious gossip!");
    const last: GameState = await spy.mock.results[spy.mock.results.length - 1].value;
    expect(last.player.inventory.general).toContain("RobotWhistle");
    expect(last.player.log).toHaveLength(1);
    expect(last.player.log[0].body).toContain(NPC_SECRETS.nailbot_secret.text);
    expect(last.uiState.notifications.filter(notification => notification.kind === "log")).toHaveLength(1);
    const journal = (await session.explorer.information("log", 1)).text.join("\n");
    expect(journal).toContain(last.player.log[0].body);
    expect(last.log.join("\n")).not.toContain(NPC_SECRETS.nailbot_secret.text);
    expect(useUIOverlayStore.getState().overlay.kind).toBe("none");
    expect(fetch).not.toHaveBeenCalled();
    const knowledge = (await session.explorer.information("gossip")).text.join("\n");
    expect(knowledge).toContain("The Hiding Robot");
    expect(knowledge).toContain(NPC_SECRETS.nailbot_secret.text);
    let browser = fixture;
    for (const input of unpaidInputs) browser = await engine.handleCommand(browser, parseCommand(input));
    browser = await engine.handleCommand(browser, parseCommand("give voucher"));
    for (const input of listingInputs) browser = await engine.handleCommand(browser, parseCommand(input));
    for (const input of commands) browser = await engine.handleCommand(browser, parseCommand(input));
    expect(browser.player.inventory).toEqual(last.player.inventory);
    expect(browser.player.spiltTea).toEqual(last.player.spiltTea);
    expect(browser.player.log).toEqual(last.player.log);
    expect(browser.conversation).toEqual(last.conversation);
    expect(browser.worldState.npcSecrets).toEqual(last.worldState.npcSecrets);
    expect(browser.worldState.conditionalTriggers).toEqual(last.worldState.conditionalTriggers);
  });
});
