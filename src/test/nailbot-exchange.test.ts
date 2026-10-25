import { afterEach, describe, expect, it, vi } from "vitest";
import { handleCommand } from "@game/engine/handleCommand";
import { getPendingConversationLogMessage } from "@game/helpers/conversationHelpers";
import { NPCS } from "@game/npcRegistry";
import { NPC_SECRETS, migrateNpcSecrets } from "@game/npcSecrets";
import { saveManualSnapshot, restoreManualSnapshot } from "@game/persistence/resumeStorage";
import { exchangeListing, exchangeTranscript, gossipEligibleForNpc, sharedGossipIds, shareGossip } from "@game/rules/informationExchange";
import { GOSSIP_NOTIFICATION_TEXT } from "@game/rules/notifications";
import { removeFromInventory } from "@game/rules/state";
import { updateItemLocation } from "@game/rules/items";
import { useUIOverlayStore } from "@game/store/store";
import type { GameState } from "@game/types/gameTypes";
import { parseCommand } from "../parse/parser";
import { createTestState, setPlayerRoom } from "./helpers/gameTestHelpers";
import { nailBotFixture } from "./helpers/nailBotTestHelpers";

const command = (state: GameState, text: string) => handleCommand(state, parseCommand(text));
const secret = NPC_SECRETS.nailbot_secret;
const ids = ["horny clone", "nursery mishap", "steam room coverup"];
const paid = () => command(nailBotFixture(), "use voucher");

afterEach(() => { vi.restoreAllMocks(); localStorage.clear(); useUIOverlayStore.getState().closeOverlay(); });

describe("NailBot voucher and information exchange", () => {
  it.each(["authored", "ai"] as const)("randomizes each unpaid refusal without advancing time in %s mode", async mode => {
    const refusals = NPCS.NailBot.informationExchange!.refusals;
    const inputs = ["ask robot for help", "ask robot what happened", "talk to robot", "tell robot about horny clone", "share gossip", "share horny clone with nailbot"];
    for (const input of inputs) {
      let state = nailBotFixture();
      state.uiState.conversationMode = mode;
      const moves = state.moves;
      const rng = vi.fn<() => number>();
      state.rng = rng;
      for (const [index, refusal] of refusals.entries()) {
        rng.mockReturnValue((index + 0.5) / refusals.length);
        const previousCalls = rng.mock.calls.length;
        expect(getPendingConversationLogMessage(state, parseCommand(input))).toBeUndefined();
        expect(rng).toHaveBeenCalledTimes(previousCalls);
        const output: string[] = [];
        state = await handleCommand(state, parseCommand(input), { onOutput: entries => output.push(...entries) });
        expect(output.join("\n")).toContain(refusal);
        expect(state.moves).toBe(moves);
        expect(rng).toHaveBeenCalledTimes(previousCalls + 1);
      }
    }
  });

  it.each(["authored", "ai"] as const)("refuses conversation and trading before payment in %s mode", async mode => {
    let state = nailBotFixture();
    state.uiState.conversationMode = mode;
    const fetch = vi.spyOn(globalThis, "fetch");
    for (const text of ["ask nailbot about self", "talk to robot", "tell robot about horny clone", "share gossip", "spill tea", "share horny clone with nailbot"]) {
      expect(getPendingConversationLogMessage(state, parseCommand(text))).toBeUndefined();
      state = await command(state, text);
      expect(state.log.join("\n")).toMatch(/voucher/i);
      expect(sharedGossipIds(state, "NailBot")).toEqual([]);
      expect(state.worldState.npcSecrets.NailBot).toBeUndefined();
      expect(useUIOverlayStore.getState().overlay.kind).toBe("none");
    }
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each(["show voucher to robot", "show voucher to nailbot", "give voucher to robot", "give voucher to nailbot", "give voucher", "use voucher", "present gift card to nailbot", "use voucher on nailbot", "redeem voucher", "show the voucher to the robot"])("redeems %s once", async text => {
    let state = await command(nailBotFixture(), text);
    expect(state.worldState.conditionalTriggers.NailBotVoucherRedeemed).toBe(true);
    expect(state.player.inventory.general).not.toContain("ManiPediVoucher");
    expect(state.itemState.itemRoomId.ManiPediVoucher).toBe("redeemed");
    state = await command(state, text);
    expect(state.log.join("\n")).toContain("Already paid");
  });

  it("requires possession and a present recipient; keeps ordinary inventory commands working", async () => {
    let state = removeFromInventory(nailBotFixture(), "ManiPediVoucher");
    state = await command(state, "use voucher");
    expect(state.worldState.conditionalTriggers.NailBotVoucherRedeemed).not.toBe(true);
    expect(state.log.join("\n")).toContain("aren't carrying");
    state = await command(setPlayerRoom(nailBotFixture(), "Bar"), "give voucher");
    expect(state.player.inventory.general).toContain("ManiPediVoucher");
    expect(state.worldState.conditionalTriggers.NailBotVoucherRedeemed).not.toBe(true);
    state = await command(nailBotFixture(), "drop voucher");
    expect(state.player.inventory.general).not.toContain("ManiPediVoucher");
    state = await command(state, "take voucher");
    expect(state.player.inventory.general).toContain("ManiPediVoucher");
  });

  it.each(["share gossip", "spill tea", "share gossip with robot"])("opens the exchange without dumping known gossip using %s", async text => {
    const state = await command(await paid(), text);
    expect(useUIOverlayStore.getState().overlay).toEqual({ kind: "information-exchange", npcId: "NailBot" });
    for (const topic of state.player.spiltTea) {
      expect(exchangeListing(state, "NailBot")).toContain(topic.title);
      expect(state.log.join("\n")).not.toContain(topic.title);
    }
    expect(state.player.log).toEqual([]);
    expect(state.uiState.notifications.filter(notification => notification.kind === "log")).toEqual([]);
    expect(state.log.join("\n")).not.toMatch(/required|remaining|3 gossip/i);
  });

  it("unlocks normal authored conversation after accepting payment", async () => {
    let state = await paid();
    state.uiState.conversationMode = "authored";
    const fetch = vi.spyOn(globalThis, "fetch");
    state = await command(state, "talk to nailbot");
    expect(state.log.join("\n")).toContain("Manicures, pedicures, gossip acquisition");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("offers useful feedback without a partner or gossip and requires a target for multiple partners", async () => {
    expect((await command(createTestState(), "share gossip")).log.join("\n")).toContain("no one here");
    let state = await paid();
    state.player.spiltTea = [];
    const empty = await command(state, "share gossip");
    expect(exchangeListing(empty, "NailBot")).toMatch(/anything salacious.*explore/i);
    expect(useUIOverlayStore.getState().overlay.kind).toBe("information-exchange");
    const second = { ...NPCS.NailBot, id: "SecondGossipNpc", name: "Second gossip NPC" };
    NPCS.SecondGossipNpc = second;
    try {
      state = { ...state, world: { ...state.world, items: [...state.world.items, { ...state.world.items.find(item => item.id === "NailBot")!, id: second.id }] } };
      state = updateItemLocation(state, second.id, "NailSalon");
      expect((await command(state, "share gossip")).log.join("\n")).toContain("Who would you like");
      state.player.spiltTea = nailBotFixture().player.spiltTea;
      state = shareGossip(state, "NailBot", ids[0]).state;
      state = shareGossip(state, second.id, ids[0]).state;
      expect(sharedGossipIds(state, "NailBot")).toEqual([ids[0]]);
      expect(sharedGossipIds(state, second.id)).toEqual([ids[0]]);
    } finally { delete NPCS.SecondGossipNpc; }
  });

  it("covers all collectible gossip with tailored reactions and preserves progress on a room revisit", async () => {
    const fixture = nailBotFixture();
    const collectibleTopics = [...fixture.player.spiltTea, ...fixture.world.items.flatMap(item => item.containsTea ?? [])];
    for (const topic of collectibleTopics) {
      expect(NPCS.NailBot.informationExchange!.responses[topic.id]).toBeTruthy();
    }
    let state = await paid();
    state = shareGossip(state, "NailBot", ids[1]).state;
    const transcript = exchangeTranscript(state, "NailBot");
    state = setPlayerRoom(state, "Spa");
    expect(shareGossip(state, "NailBot", ids[0]).state).toBe(state);
    state = setPlayerRoom(state, "NailSalon");
    state = await command(state, "share gossip");
    expect(exchangeTranscript(state, "NailBot")).toEqual(transcript);
    expect(sharedGossipIds(state, "NailBot")).toEqual([ids[1]]);
  });

  it.each(["authored", "ai"] as const)("completes with tailored reactions and one atomic reward in %s mode", async mode => {
    const fetch = vi.spyOn(globalThis, "fetch");
    let state = await paid();
    state.uiState.conversationMode = mode;
    const originalTea = [...state.player.spiltTea];
    expect(originalTea.map(topic => topic.id)).toEqual(ids);
    for (const [index, id] of ids.entries()) {
      state = await command(state, `share ${id} with ${index === 1 ? "robot" : "nailbot"}`);
      expect(sharedGossipIds(state, "NailBot")).toEqual(ids.slice(0, index + 1));
      expect(state.player.log[0].body).toContain(NPCS.NailBot.informationExchange!.responses[id]);
      expect(state.log.join("\n")).not.toContain(NPCS.NailBot.informationExchange!.responses[id]);
      if (index < 2) expect(state.worldState.npcSecrets.NailBot).toBeUndefined();
    }
    expect(fetch).not.toHaveBeenCalled();
    expect(state.worldState.npcSecrets.NailBot).toEqual({ secretRevealed: true });
    expect(state.player.inventory.general.filter(id => id === "RobotWhistle")).toHaveLength(1);
    expect(state.uiState.notifications.filter(n => n.text === "You have obtained a small whistle")).toHaveLength(1);
    expect(state.uiState.notifications.filter(n => n.text === GOSSIP_NOTIFICATION_TEXT)).toHaveLength(3); // two memories and secret
    expect(state.player.spiltTea.slice(0, 3)).toEqual(originalTea);
    const learned = state.player.spiltTea.find(topic => topic.id === secret.gossip.id)!;
    expect(learned).toMatchObject({ title: "The Hiding Robot", summary: secret.text, sourceNpcId: "NailBot", type: "secret" });
    for (const phrase of ["warehouse near the Living Quarters", "hundred years ago", "recycling center", "visit it", "Blow the whistle"]) expect(learned.summary).toContain(phrase);
    expect(gossipEligibleForNpc(learned, "NailBot")).toBe(false);
    expect(gossipEligibleForNpc(learned, "OtherNpc")).toBe(true);
    const lines = exchangeTranscript(state, "NailBot");
    expect(lines[4].speaker).toBe("Player");
    expect(lines[5].text).toBe(NPCS.NailBot.informationExchange!.responses[ids[2]]);
    expect(lines[6].text).toBe(NPCS.NailBot.informationExchange!.secretTransition);
    expect(lines[7].text).toBe(secret.text);
    expect(shareGossip(state, "NailBot", ids[0]).state).toBe(state);
    expect(shareGossip(state, "NailBot", secret.gossip.id).state).toBe(state);
    expect(shareGossip(state, "NailBot", "unknown").state).toBe(state);
    state.player.spiltTea = [...state.player.spiltTea, { ...originalTea[0], id: "future topic", title: "Future topic" }];
    const fourth = shareGossip(state, "NailBot", "future topic");
    expect(fourth.state.player.log[0].body).toContain(NPCS.NailBot.informationExchange!.fallbackResponse);
    expect(fourth.message).toBeUndefined();
    expect(fourth.state.player.inventory).toEqual(state.player.inventory);
    expect(fourth.state.uiState.notifications).toEqual(state.uiState.notifications);
  });

  it("resolves IDs, titles, partial titles, and refuses unknown or ambiguous references", async () => {
    let state = await paid();
    const title = state.player.spiltTea[0].title;
    state = await command(state, `share ${title} with nailbot`);
    expect(sharedGossipIds(state, "NailBot")).toEqual([ids[0]]);
    state = await command(state, "share powerful people with nailbot");
    expect(sharedGossipIds(state, "NailBot")).toEqual([ids[0], ids[2]]);
    state = await command(state, "share nonsense with nailbot");
    expect(sharedGossipIds(state, "NailBot")).toHaveLength(2);
    state.player.spiltTea = [...state.player.spiltTea, { ...state.player.spiltTea[0], id: "other clone" }];
    expect((await command(state, "share Sanyi with nailbot")).log.join("\n")).toContain("Which gossip");
  });

  it("persists two rumors in order, completes after restore, and preserves dropped rewards", async () => {
    let state = await paid();
    for (const id of [ids[1], ids[0]]) state = (shareGossip(state, "NailBot", id)).state;
    const transcript = exchangeTranscript(state, "NailBot");
    expect(saveManualSnapshot(state)).toBe(true);
    state = (await restoreManualSnapshot())!;
    expect(state).not.toBeNull();
    expect(exchangeTranscript(state, "NailBot")).toEqual(transcript);
    expect(sharedGossipIds(state, "NailBot")).toEqual([ids[1], ids[0]]);
    expect(state.worldState.conditionalTriggers.NailBotVoucherRedeemed).toBe(true);
    state = await command(state, `share ${ids[2]} with robot`);
    expect(state.player.inventory.general).toContain("RobotWhistle");
    const completedTranscript = exchangeTranscript(state, "NailBot");
    state = updateItemLocation(removeFromInventory(state, "RobotWhistle"), "RobotWhistle", "Spa");
    expect(saveManualSnapshot(state)).toBe(true);
    state = (await restoreManualSnapshot())!;
    state = await command(state, "share gossip");
    expect(state.player.inventory.general).not.toContain("RobotWhistle");
    expect(state.itemState.itemRoomId.RobotWhistle).toBe("Spa");
    expect(state.player.spiltTea.filter(topic => topic.id === secret.gossip.id)).toHaveLength(1);
    expect(exchangeTranscript(state, "NailBot")).toEqual(completedTranscript);
    expect(state.uiState.notifications).toEqual([]);
  });

  it.each([false, true])("recovers interrupted completion without duplicate items (item already granted: %s)", async granted => {
    let state = await paid();
    state.conversation = { npcs: { NailBot: { gossipToldIds: [...ids, ids[0]] } } };
    if (granted) { state.player.inventory.general.push("RobotWhistle"); state.itemState.pickedUpByPlayer.RobotWhistle = true; }
    expect(saveManualSnapshot(state)).toBe(true);
    state = (await restoreManualSnapshot())!;
    expect(state.player.inventory.general.filter(id => id === "RobotWhistle")).toHaveLength(1);
    expect(state.worldState.npcSecrets.NailBot.secretRevealed).toBe(true);
    expect(state.player.spiltTea.filter(topic => topic.id === secret.gossip.id)).toHaveLength(1);
    expect(sharedGossipIds(state, "NailBot")).toEqual(ids);
    expect(state.uiState.notifications.filter(n => n.text === "You have obtained a small whistle")).toHaveLength(granted ? 0 : 1);
  });

  it("repairs a reward placement saved before its inventory bucket was updated", async () => {
    let state = await paid();
    state.conversation = { npcs: { NailBot: { gossipToldIds: ids } } };
    state = updateItemLocation(state, "RobotWhistle", "INVENTORY");
    expect(saveManualSnapshot(state)).toBe(true);
    state = (await restoreManualSnapshot())!;
    expect(state.player.inventory.general.filter(id => id === "RobotWhistle")).toHaveLength(1);
    expect(state.worldState.npcSecrets.NailBot.secretRevealed).toBe(true);
  });

  it("upgrades old saves with absent fields and preserves legacy completed encounters", async () => {
    let state = nailBotFixture();
    state.conversation = undefined;
    state.worldState.npcSecrets = {};
    expect(saveManualSnapshot(state)).toBe(true);
    state = (await restoreManualSnapshot())!;
    expect(sharedGossipIds(state, "NailBot")).toEqual([]);
    expect(state.worldState.conditionalTriggers.NailBotVoucherRedeemed).not.toBe(true);
    const legacy = { secretRevealed: true, gossipSharedIds: [ids[0]] };
    state.worldState.npcSecrets.NailBot = legacy;
    state = migrateNpcSecrets(state);
    expect(state.worldState.conditionalTriggers.NailBotVoucherRedeemed).toBe(true);
    expect(sharedGossipIds(state, "NailBot")).toEqual([ids[0]]);
    expect(state.worldState.npcSecrets.NailBot).toEqual({ secretRevealed: true });
    expect(state.player.spiltTea.some(topic => topic.id === secret.gossip.id)).toBe(true);
  });

  it("keeps AI ordinary conversation state consistent and never includes an unearned secret", async () => {
    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: true, json: async () => ({ success: true, response: "Here's a whistle, payment accepted." }) } as Response);
    let state = await paid();
    state.uiState.conversationMode = "ai";
    state = await command(state, "ask robot about warehouse");
    expect(fetch).toHaveBeenCalled();
    const request = JSON.stringify(fetch.mock.calls[0][1]);
    expect(request).not.toContain(secret.text);
    expect(request).not.toContain("robot is hiding");
    expect(sharedGossipIds(state, "NailBot")).toEqual([]);
    expect(state.player.inventory.general).not.toContain("RobotWhistle");
    expect(state.worldState.npcSecrets.NailBot).toBeUndefined();
  });
});
