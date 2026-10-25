import { afterEach, describe, expect, it } from "vitest";
import { handleCommand } from "@game/engine/handleCommand";
import { informationText } from "@game/harness/information";
import { informationExchangeCommandOutput } from "@game/harness/informationExchange";
import { NPCS } from "@game/npcRegistry";
import { NPC_SECRETS } from "@game/npcSecrets";
import { saveManualSnapshot, restoreManualSnapshot } from "@game/persistence/resumeStorage";
import { exchangeTranscript, formatExchangeTranscript, shareGossip } from "@game/rules/informationExchange";
import { buildLogNotification, GOSSIP_NOTIFICATION_TEXT } from "@game/rules/notifications";
import { useUIOverlayStore } from "@game/store/store";
import type { GameState } from "@game/types/gameTypes";
import { parseCommand } from "../parse/parser";
import { nailBotFixture } from "./helpers/nailBotTestHelpers";

const ids = ["nursery mishap", "horny clone", "steam room coverup"];
const config = NPCS.NailBot.informationExchange!;
const secret = NPC_SECRETS.nailbot_secret;
const command = (state: GameState, input: string) => handleCommand(state, parseCommand(input));
const paid = () => command(nailBotFixture(), "use voucher");
const logNotifications = (state: GameState) => state.uiState.notifications.filter(n => n.kind === "log");

afterEach(() => { localStorage.clear(); useUIOverlayStore.getState().closeOverlay(); });

describe("NailBot's persistent exchange journal", () => {
  it("keeps unrelated output when headless presentation expands the transition into dialogue", async () => {
    let before = await paid();
    for (const id of ids.slice(0, 2)) before = shareGossip(before, "NailBot", id).state;
    const after = shareGossip(before, "NailBot", ids[2]).state;
    const input = `share ${ids[2]} with nailbot`;
    const output = [`> ${input}\n${config.secretTransition}\n\nA station light flickers.`, "A robot wipes the counter."];
    const presented = informationExchangeCommandOutput(before, after, input, output);
    expect(presented.join("\n")).toContain(config.responses[ids[2]]);
    expect(presented.join("\n")).toContain(secret.text);
    expect(presented.join("\n").split(config.secretTransition)).toHaveLength(2);
    expect(presented[0]).toContain("A station light flickers.");
    expect(presented[1]).toBe(output[1]);
    expect(output[0]).not.toContain(secret.text);
  });
  it("records nothing on opening or rejected submissions, then notifies on the first actual share", async () => {
    const unpaid = nailBotFixture();
    expect(shareGossip(unpaid, "NailBot", ids[0]).state.player.log).toEqual([]);
    let state = await paid();
    state = await command(state, "share gossip");
    expect(state.player.log).toEqual([]);
    expect(logNotifications(state)).toEqual([]);
    expect(shareGossip(state, "NailBot", "unknown").state).toBe(state);
    useUIOverlayStore.getState().closeOverlay();
    state = await command(state, "spill tea");
    expect(logNotifications(state)).toEqual([]);
    const firstTurn = state.moves;
    const shared = shareGossip(state, "NailBot", ids[0]);
    expect(shared.message).toBeUndefined();
    state = shared.state;
    expect(state.player.log).toEqual([{
      source: "NailBot", title: "Gossip exchange with NailBot", loggedAtTurn: firstTurn,
      body: formatExchangeTranscript("NailBot", exchangeTranscript(state, "NailBot")),
    }]);
    expect(logNotifications(state)).toEqual([expect.objectContaining(buildLogNotification("You log the message for future reference."))]);
  });

  it.each(["authored", "ai"] as const)("updates one coherent entry and prints only the exact transition upon revelation in %s mode", async mode => {
    let state = await paid();
    state.uiState.conversationMode = mode;
    // Keep another journal record to verify updates preserve position and unrelated entries.
    const unrelated = { source: "Research", title: "Research memo", loggedAtTurn: 0, body: "Original record." };
    state.player.log = [unrelated];
    let firstTurn: number | undefined;
    for (const [index, id] of ids.entries()) {
      const output: string[] = [];
      const input = `share ${id} with nailbot`;
      firstTurn ??= state.moves;
      state = await handleCommand(state, parseCommand(input), { onOutput: entries => output.push(...entries) });
      const response = output.find(entry => entry.startsWith(`> ${input}\n`))!.slice(`> ${input}\n`.length).trim();
      expect(response).toBe(index === 2 ? config.secretTransition : "");
      expect(state.player.log).toHaveLength(2);
      expect(state.player.log[0]).toEqual(unrelated);
      expect(state.player.log[1].loggedAtTurn).toBe(firstTurn);
      expect(state.player.log[1].body).toBe(formatExchangeTranscript("NailBot", exchangeTranscript(state, "NailBot")));
      expect(logNotifications(state)).toHaveLength(1);
      expect(output.join("\n")).not.toContain(config.responses[id]);
      expect(output.join("\n")).not.toContain(secret.text);
    }
    const body = state.player.log[1].body;
    expect(body).toContain(secret.text);
    expect(body.indexOf(config.responses[ids[2]])).toBeLessThan(body.indexOf(config.secretTransition));
    expect(body.indexOf(config.secretTransition)).toBeLessThan(body.indexOf(secret.text));
    expect(state.log.join("\n").split(config.secretTransition)).toHaveLength(2);
    expect(state.uiState.notifications.filter(n => n.text === "You have obtained a small whistle")).toHaveLength(1);
    expect(state.uiState.notifications.filter(n => n.text === GOSSIP_NOTIFICATION_TEXT)).toHaveLength(3);
    const entry = state.player.log[1];
    const notifications = state.uiState.notifications;
    expect(shareGossip(state, "NailBot", ids[0]).state).toBe(state);
    for (const input of ["share gossip", "spill tea"]) {
      state = await command(state, input);
      useUIOverlayStore.getState().closeOverlay();
      expect(state.player.log[1]).toBe(entry);
      expect(state.uiState.notifications).toBe(notifications);
      expect(state.log.join("\n").split(config.secretTransition)).toHaveLength(2);
    }
    state.player.spiltTea = [...state.player.spiltTea, { id: "future rumor", title: "Future rumor", summary: "A future scandal.", tags: [], type: "gossip" }];
    const fourth = shareGossip(state, "NailBot", "future rumor");
    expect(fourth.message).toBeUndefined();
    expect(fourth.state.player.log).toHaveLength(2);
    expect(fourth.state.player.log[1].body).toContain(config.fallbackResponse);
    expect(fourth.state.uiState.notifications).toBe(notifications);
  });

  it("preserves partial and completed entries across save/load, appending in sharing order", async () => {
    let state = await paid();
    state = await command(state, `share ${ids[0]} with nailbot`);
    const partial = state.player.log[0];
    expect(saveManualSnapshot(state)).toBe(true);
    state = (await restoreManualSnapshot())!;
    expect(state.player.log).toEqual([partial]);
    expect(logNotifications(state)).toEqual([]);
    for (const id of ids.slice(1)) state = await command(state, `share ${id} with robot`);
    const completed = state.player.log[0];
    expect(state.player.log).toHaveLength(1);
    expect(completed.loggedAtTurn).toBe(partial.loggedAtTurn);
    expect(completed.body.startsWith(partial.body)).toBe(true);
    expect(logNotifications(state)).toEqual([]);
    expect(saveManualSnapshot(state)).toBe(true);
    state = (await restoreManualSnapshot())!;
    expect(state.player.log).toEqual([completed]);
    expect(informationText(state, "log", 1)).toBe(`${completed.title}\n\n${completed.body}`);
    expect(logNotifications(state)).toEqual([]);
  });

  it.each([1, 3])("backfills an older save with %s accepted rumors without replaying log notifications", async count => {
    let state = await paid();
    for (const id of ids.slice(0, count)) state = shareGossip(state, "NailBot", id).state;
    const transcript = formatExchangeTranscript("NailBot", exchangeTranscript(state, "NailBot"));
    state.player.log = [];
    expect(saveManualSnapshot(state)).toBe(true);
    state = (await restoreManualSnapshot())!;
    expect(state.player.log).toHaveLength(1);
    expect(state.player.log[0].body).toBe(transcript);
    expect(logNotifications(state)).toEqual([]);
    state = await command(state, "share gossip");
    expect(state.player.log).toHaveLength(1);
    expect(logNotifications(state)).toEqual([]);
  });
});
