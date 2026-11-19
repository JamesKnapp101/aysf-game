import { describe, expect, it } from "vitest";
import { readItem } from "@game/actions/read/read";
import { triggerPlayerDeath } from "@game/helpers/gameHelpers";
import { collectContacts, collectLogEntry, collectTrivia } from "@game/rules/knowledge";
import { takeDNASample } from "@game/rules/dnaReader";
import { formatDNASampleBody } from "@game/text/playerKnowledge";
import { restoreManualSnapshot, restoreResumeSnapshot, saveManualSnapshot, saveResumeSnapshot } from "@game/persistence/resumeStorage";
import { createTestState, runCommand } from "./helpers/gameTestHelpers";

describe("player knowledge collections", () => {
  it("deduplicates repeat scenery reads while retaining distinct items with identical titles and sources", () => {
    const state = createTestState();
    const plaque = state.world.items.find(item => item.id === "PHONENUMBERS")!;
    const first = readItem(state, plaque);
    const repeated = readItem({ ...first.state, moves: 20 }, plaque);
    expect(repeated.state.player.log).toEqual(first.state.player.log);
    expect(repeated.overlay?.kind).toBe("reader");
    if (repeated.overlay?.kind === "reader") expect(repeated.overlay.postCloseNotifications).toBeUndefined();
    const distinct = readItem(repeated.state, { ...plaque, id: "other-plaque" });
    expect(distinct.state.player.log.map(entry => entry.id)).toEqual(["item:PHONENUMBERS", "item:other-plaque"]);
    expect(distinct.state.player.log[1].title).toBe(first.state.player.log[0].title);
  });

  it("updates text explicitly by identity, preserving acquisition time, order and unrelated entries", () => {
    const original = { id: "journal", title: "Memo", source: "Terminal", body: "First" };
    let state = collectLogEntry(createTestState(), original).state;
    state = collectLogEntry(state, { ...original, id: "other" }).state;
    expect(collectLogEntry(state, { ...original, body: "Changed" }).state).toBe(state);
    const update = collectLogEntry({ ...state, moves: 10 }, { ...original, body: "Expanded" }, true);
    expect(update).toMatchObject({ added: false, updated: true });
    expect(update.state.player.log.map(entry => entry.body)).toEqual(["Expanded", "First"]);
    expect(update.state.player.log[0].loggedAtTurn).toBe(0);
    expect(collectLogEntry(update.state, update.state.player.log[0], true).state).toBe(update.state);
  });

  it("awards authored trivia once by ID, keeping distinct facts even when their answers match", () => {
    const fact = { id: "fact-one", title: "A fact", answer: "Same answer", body: "Full explanation" };
    const first = collectTrivia(createTestState(), [fact, fact]);
    const repeated = collectTrivia(first.state, [{ ...fact, title: "Changed" }]);
    expect(repeated.state).toBe(first.state);
    expect(collectTrivia(first.state, [{ ...fact, id: "fact-two" }]).state.player.trivia).toHaveLength(2);
    expect(first.state.player.trivia[0]).toMatchObject({ ...fact, loggedAtTurn: 0 });
  });

  it("identifies contacts progressively without losing zeros, identity, order or previously known names", () => {
    let state = collectContacts(createTestState(), [{ extension: " x0001 " }, { extension: "0000", name: "Poison Control" }]).state;
    const original = state.player.contacts[0];
    state = collectContacts({ ...state, moves: 40 }, [{ extension: "X0001", name: "Known caller", description: "Updated details" }]).state;
    expect(state.player.contacts).toHaveLength(2);
    expect(state.player.contacts[0]).toEqual({ ...original, name: "Known caller", description: "Updated details" });
    expect(collectContacts(state, [{ extension: "x0001" }]).state).toBe(state);
    expect(state.player.contacts[1].extension).toBe("0000");
  });

  it("banks separate samples from the same person and includes cause of death in full analysis", () => {
    const state = createTestState();
    const first = takeDNASample(state, state.world.items.find(item => item.id === "FallenCorpse")!).updatedState;
    const second = takeDNASample(first, state.world.items.find(item => item.id === "HeadlessCorpse")!).updatedState;
    expect(second.player.dnaBank.map(sample => sample.name)).toEqual(["Mox Eegler", "Mox Eegler"]);
    expect(new Set(second.player.dnaBank.map(sample => sample.id)).size).toBe(2);
    expect(takeDNASample(second, state.world.items.find(item => item.id === "FallenCorpse")!).updatedState).toBe(second);
    expect(formatDNASampleBody(second.player.dnaBank[0])).toContain("Cause of Death: Blunt force head trauma");
  });

  it("persists knowledge through both snapshots and regeneration, then clears it on restart", async () => {
    let state = createTestState({ roomId: "LevelSixCorridorEnd", visitedRooms: ["LevelSixCorridorEnd", "LevelSixCorridorBend"] });
    state = collectLogEntry(state, { id: "note", title: "Note", source: "Paper", body: "Clue" }).state;
    state = collectTrivia(state, [{ id: "fact", title: "Fact", answer: "Answer" }]).state;
    state = collectContacts(state, [{ extension: "X001" }]).state;
    state.player.spiltTea = [{ id: "rumor", title: "Rumor", summary: "Heard", tags: [], type: "gossip" }];
    state = takeDNASample(state, state.world.items.find(item => item.id === "FallenCorpse")!).updatedState;
    const collections = (current: typeof state) => [current.player.log, current.player.spiltTea, current.player.trivia, current.player.contacts, current.player.dnaBank];
    const expected = collections(state);
    expect(saveResumeSnapshot(state)).toBe(true);
    expect(saveManualSnapshot(state)).toBe(true);
    expect(collections((await restoreResumeSnapshot())!)).toEqual(expected);
    expect(collections((await restoreManualSnapshot())!)).toEqual(expected);
    expect(collections(triggerPlayerDeath(state, "A test accident.", "test"))).toEqual(expected);
    expect(collections(await runCommand(state, "restart"))).toEqual([[], [], [], [], []]);
  });

  it("rejects obsolete development snapshots instead of guessing record identities", async () => {
    expect(saveResumeSnapshot(createTestState())).toBe(true);
    const snapshot = JSON.parse(localStorage.getItem("aysf:resume")!);
    snapshot.version = 1;
    localStorage.setItem("aysf:resume", JSON.stringify(snapshot));
    expect(await restoreResumeSnapshot()).toBeNull();
    expect(localStorage.getItem("aysf:resume")).toBeNull();
  });
});
