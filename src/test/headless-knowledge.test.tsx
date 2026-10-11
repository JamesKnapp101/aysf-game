import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import { resolve } from "node:path";
import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LogTab } from "../game/components/LogTab";
import { DNASampleTab } from "../game/components/DNASampleTab";
import { ObjectivesTab } from "../game/components/ObjectivesTab";
import * as gameInit from "../game/gameInit";
import * as engine from "../game/engine/handleCommand";
import { informationText } from "../game/harness/information";
import { createHeadlessSession } from "../game/harness/session";
import type { InformationView, Observation, SessionController, TranscriptEntry } from "../game/harness/types";
import { updateItemLocation } from "../game/rules/items";
import { getVisibleObjectives } from "../game/rules/objectives";
import { useUIOverlayStore } from "../game/store/store";
import type { GameState } from "../game/types/gameTypes";
import { createTestState } from "./helpers/gameTestHelpers";

const sessions: SessionController[] = [];
const directories: string[] = [];
const text = (observation: Observation) => observation.text.join("\n\n");
const execute = engine.handleCommand;
const views: InformationView[] = ["log", "gossip", "dna", "objectives", "room", "history"];

async function session(fixture?: GameState) {
  if (fixture) vi.spyOn(gameInit, "createFreshGameState").mockResolvedValueOnce(fixture);
  const directory = resolve(".headless-transcripts", `knowledge-test-${randomUUID()}`);
  directories.push(directory);
  const controller = createHeadlessSession({ transcriptDirectory: directory });
  sessions.push(controller);
  await controller.start();
  return controller;
}

const fixture = () => createTestState({ roomId: "StairWellSeven", rng: () => 0.99 });

afterEach(async () => {
  for (const controller of sessions.splice(0)) await controller.dispose();
  for (const directory of directories.splice(0)) await fs.rm(directory, { recursive: true, force: true });
  vi.restoreAllMocks();
});

describe("headless player knowledge", () => {
  it("lists only acquired records and lets a consumed document be reviewed without rereading", async () => {
    const controller = await session();
    const spy = vi.spyOn(engine, "handleCommand");
    const empty = text(await controller.explorer.information("log"));
    expect(empty).toContain("Log Entries (0)");
    expect(empty).toContain("Gossip (0)");
    expect(empty).toContain("DNA (0)");
    expect(empty).not.toContain("Note Found on Body");
    expect(text(await controller.explorer.information("log", 1))).toContain("Choose a record number");
    expect(spy).not.toHaveBeenCalled();

    await controller.explorer.command("read paper");
    const afterRead = await spy.mock.results[0].value;
    const entry = afterRead.player.log[0];
    expect(text(await controller.explorer.information("log"))).toContain(`1. ${entry.title}`);
    const review = text(await controller.explorer.information("log", 1));
    expect(review).toBe(`${entry.title}\n\n${entry.body}`);
    expect(review).not.toContain("You log the message");
    expect(useUIOverlayStore.getState().overlay.kind).toBe("none");
    await controller.explorer.command("look");
    expect(spy.mock.calls[1][0]).toEqual(afterRead);
    expect(afterRead.player.log).toHaveLength(1);
    expect(afterRead.itemState.itemRoomId.MysteriousNote).toBe("unknown");
  });

  it("preserves document order, authored bodies and browser previews while omitting metadata", () => {
    const state = fixture();
    state.player.log = [
      { title: "First memorandum", body: "First line.\n\n" + "More detail. ".repeat(10), source: "PrivateSourceId", loggedAtTurn: 999 },
      { title: "Second memorandum", body: "Second body with exact spacing.\n  Retain this line.", source: "PrivateOtherId", loggedAtTurn: 1000 },
    ];
    const { getByText } = render(<LogTab gameState={state} />);
    const preview = state.player.log[0].body.replace(/\s+/g, " ").trim().slice(0, 50).trimEnd() + "...";
    expect(getByText(preview)).toBeDefined();
    const list = informationText(state, "log");
    expect(list).toContain(preview);
    expect(list.indexOf("First memorandum")).toBeLessThan(list.indexOf("Second memorandum"));
    expect(informationText(state, "log", 2)).toBe(`Second memorandum\n\n${state.player.log[1].body}`);
    expect(list).not.toMatch(/PrivateSourceId|PrivateOtherId|loggedAtTurn|999|1000/);
  });

  it("reveals gossip only after ordinary reading and keeps acquired secrets distinct", async () => {
    // Trusted placement fixture; acquisition still uses the real authored item/action.
    const initial = updateItemLocation(fixture(), "GimThreeJournal", "StairWellSeven");
    const journal = initial.world.items.find(item => item.id === "GimThreeJournal")!;
    const topic = journal.containsTea![0];
    const controller = await session(initial);
    expect(text(await controller.explorer.information("gossip"))).not.toContain(topic.summary);
    await controller.explorer.command("read green journal");
    const acquired = text(await controller.explorer.information("gossip"));
    expect(acquired).toContain(`Gossip: ${topic.title}`);
    expect(acquired).toContain(topic.summary);
    expect(acquired).not.toMatch(/horny clone|GimThreeJournal|topic\.id/);
    await controller.explorer.command("read green journal");
    expect(text(await controller.explorer.information("gossip"))).toBe(acquired);
    const state = fixture();
    state.player.spiltTea = [{ id: "PrivateSecretId", title: "Shift report", summary: "An acquired secret.", tags: ["engineering"], type: "secret" }];
    expect(informationText(state, "gossip")).toContain("Secret: Shift report\nAn acquired secret.\nTags: engineering");
    expect(informationText(state, "gossip")).not.toContain("PrivateSecretId");
  });

  it("reviews only banked DNA after the ordinary sampling action", async () => {
    const initial = updateItemLocation(fixture(), "DNAReader", "StairWellSeven");
    const reader = initial.world.items.find(item => item.id === "DNAReader")!;
    const controller = await session(initial);
    expect(text(await controller.explorer.information("dna"))).toContain("No samples collected yet.");
    expect(text(await controller.explorer.information("dna", 1))).toContain("Choose a record number");
    await controller.explorer.command(`take ${reader.name}`);
    const spy = vi.spyOn(engine, "handleCommand");
    await controller.explorer.command(`touch fallen corpse with ${reader.name}`);
    const sampled = await spy.mock.results[0].value;
    expect(sampled.player.dnaBank).toHaveLength(1);
    const sample = sampled.player.dnaBank[0];
    const listing = text(await controller.explorer.information("dna"));
    expect(listing).toContain(sample.causeOfDeath);
    const review = text(await controller.explorer.information("dna", 1));
    expect(review).toContain(sample.occupation);
    expect(review).toContain(sample.info);
    expect(review).not.toContain("bottomStairwellBody");
    const { getByRole } = render(<DNASampleTab gameState={sampled} />);
    getByRole("button", { name: `Open DNA sample: ${sample.title}` }).click();
    expect(useUIOverlayStore.getState().overlay).toMatchObject({ body: review.slice(review.indexOf("DNA Analysis Results:")) });
  });

  it("does not expose internal IDs in unknown-sample placeholders or enumerate the DNA database", () => {
    const state = fixture();
    state.player.dnaBank = [{ id: "unknown:PrivateItemId", title: "Unknown sample: PrivateItemId", loggedAtTurn: 555, causeOfDeath: "Unknown", name: "Unknown", gender: "Non-binary", age: 0, occupation: "Unknown", info: "Subject not in records, or could not be identified." }];
    expect(informationText(state, "dna")).toContain("Unknown sample");
    expect(informationText(state, "dna", 1)).not.toMatch(/PrivateItemId|loggedAtTurn|555|Joelson Dend/);
  });

  it("shows only visible objectives and reflects ordinary progress and completion", async () => {
    const controller = await session();
    const before = text(await controller.explorer.information("objectives"));
    expect(before).toContain("[Active] Restore power");
    expect(before).not.toMatch(/Get equipment|Find replacement lobe|Preserve the bear|access_lab/);
    await controller.explorer.command("read paper");
    const after = text(await controller.explorer.information("objectives"));
    expect(after).toContain("Get equipment from your quarters");
    expect(after).toContain("Access lab to find more info on nature of threat");
    expect(after).not.toMatch(/Get equipment.*DNAReader|MindGun|ReactorControlRoom|activatedAtTurn/);

    // Trusted equipment placement; real take commands complete the objective.
    await controller.dispose();
    const equipmentIds = ["DNAReader", "MindGun", "MindCap"];
    const initial = equipmentIds.reduce((state, id) => updateItemLocation(state, id, "StairWellSeven"), fixture());
    const progressed = await session(initial);
    await progressed.explorer.command("read paper");
    for (const id of equipmentIds) {
      const item = initial.world.items.find(item => item.id === id)!;
      await progressed.explorer.command(`take ${item.name}`);
    }
    expect(text(await progressed.explorer.information("objectives"))).toContain("[Completed] Get equipment from your quarters");
  });

  it("uses the visible objective selector without exposing definitions or progression fields", () => {
    const state = fixture();
    state.player.objectives = [{ id: "preserve_badger", title: "Preserve the badger", status: "completed", optional: true, activatedAtTurn: 111, completedAtTurn: 222 }];
    const response = informationText(state, "objectives");
    const { getByLabelText } = render(<ObjectivesTab gameState={state} />);
    expect(getByLabelText("Preserve the badger completed")).toBeDefined();
    for (const objective of getVisibleObjectives(state)) expect(response).toContain(objective.title);
    expect(response).toContain("[Completed] Preserve the badger (Optional)");
    expect(response).not.toMatch(/preserve_badger|111|222|activatedAtTurn|Preserve Barry/);
  });

  it("returns current visibility and equipment information while hiding concealed exits and destinations", () => {
    const state = fixture();
    state.player.roomId = "ThreeEastBed";
    const visible = informationText(state, "room");
    expect(visible).toContain("Eegler Residence: Bedroom");
    expect(visible).not.toMatch(/SecretLab|Secret Lab|Compass|down|toRoomId|EeglerSecretLabOpen/);
    state.worldState.darkRooms.ThreeEastBed = true;
    const dark = informationText(state, "room");
    expect(dark).toContain("It's pitch black in here");
    expect(dark).toContain("Visibility: Pitch black.");
    expect(dark).not.toContain("The bedroom feels familiar");
    state.player.inventory.general.push("flashlight");
    state.itemState.itemSettings.flashlight = { kind: "flashlight", isOn: true, currentCharge: 30, maxCharge: 100, drainRate: 0.05, rechargeRate: 10 };
    expect(informationText(state, "room")).toContain("Flashlight: on.");
    expect(informationText(state, "room")).toContain("The bedroom feels familiar");
    expect(informationText(state, "room")).not.toMatch(/30|drainRate|SecretLab/);
    state.player.roomId = "AqOpen1";
    const underwaterBefore = JSON.stringify(state);
    expect(informationText(state, "room")).toContain("Environment: underwater.");
    expect(JSON.stringify(state)).toBe(underwaterBefore);
  });

  it("keeps every projection pure and every session information request turn-free", async () => {
    const initial = fixture();
    const before = JSON.stringify(initial);
    for (const view of views) informationText(initial, view);
    expect(JSON.stringify(initial)).toBe(before);
    const controller = await session(initial);
    const spy = vi.spyOn(engine, "handleCommand");
    await controller.explorer.command("wait");
    const previous = await spy.mock.results[0].value;
    for (const view of views) await controller.explorer.information(view);
    expect(spy).toHaveBeenCalledTimes(1);
    await controller.explorer.command("look");
    expect(spy.mock.calls[1][0]).toEqual(previous);
    expect(spy.mock.calls[1][0].moves).toBe(1);
  });

  it("reviews only the capped gameplay history and never the durable transcript", async () => {
    const initial = fixture();
    initial.log = Array.from({ length: 500 }, (_, index) => `Seen narration ${index + 1}`);
    const controller = await session(initial);
    await controller.explorer.command("ILJIO");
    const spy = vi.spyOn(fs, "readFile");
    const response = text(await controller.explorer.information("history"));
    expect(response).toContain("Seen narration 500");
    expect(response).not.toMatch(/Seen narration 1\n|ILJIO|That command is unavailable|sessionId|episodeId|jsonl/);
    expect(spy).not.toHaveBeenCalled();
    expect(text(await controller.explorer.information("log"))).toContain("Log Entries (0)");
  });

  it("rejects invalid selections, arbitrary views and blocked player contexts without engine execution", async () => {
    const controller = await session();
    const spy = vi.spyOn(engine, "handleCommand");
    for (const index of [0, -1, 1.5, NaN, Infinity, 1000]) {
      expect(text(await controller.explorer.information("log", index))).toContain("Choose a record number");
    }
    expect(text(await controller.explorer.information("iljio" as InformationView))).toContain("Available information views");
    expect(text(await controller.explorer.information("objectives", 1))).toContain("Record selection is available only");
    useUIOverlayStore.getState().openOverlay({ kind: "3d-printer" });
    expect(text(await controller.explorer.information("log"))).toContain("needs a headless gameplay adapter");
    expect(spy).not.toHaveBeenCalled();
    useUIOverlayStore.getState().closeOverlay();
    await controller.dispose();
    const initial = fixture();
    initial.worldState.gameOver = { atMove: 0, cause: "fixture", message: "You are dead." };
    const dead = await session(initial);
    expect(text(await dead.explorer.information("objectives"))).toContain("unavailable while the game is over");
  });

  it("orders information behind unfinished commands and before reset, clearing knowledge and stale selections", async () => {
    let release!: () => void;
    const pause = new Promise<void>(resolvePause => { release = resolvePause; });
    vi.spyOn(engine, "handleCommand").mockImplementationOnce(async (...args) => {
      await pause;
      return execute(...args);
    });
    const controller = await session();
    const read = controller.explorer.command("read paper");
    const acquired = controller.explorer.information("log", 1);
    const reset = controller.reset();
    const empty = controller.explorer.information("log", 1);
    release();
    const observations = await Promise.all([read, acquired, reset, empty]);
    expect(observations.map(o => o.sequence)).toEqual([2, 3, 4, 5]);
    expect(text(observations[1])).toContain("Note Found on Body");
    expect(text(observations[3])).toContain("Choose a record number");
    expect(text(await controller.explorer.information("objectives"))).not.toContain("Get equipment");
    await controller.explorer.command("restart");
    expect(text(await controller.explorer.information("log"))).toContain("Log Entries (0)");
    await controller.dispose();
    const records: TranscriptEntry[] = (await fs.readFile(controller.transcript().path, "utf8")).trim().split("\n").map(line => JSON.parse(line));
    expect(records[2]).toMatchObject({ kind: "information", input: ":log 1", observation: observations[1] });
    expect(records[4]).toMatchObject({ kind: "information", input: ":log 1", observation: observations[3] });
    expect(records[2].episodeId).not.toBe(records[4].episodeId);
    expect(JSON.stringify(records)).not.toMatch(/MysteriousNote|activatedAtTurn|sourceItemId|player\.log|itemState|worldState/);
  });

  it("clears all acquired knowledge categories on reset and player restart", async () => {
    const acquired = () => {
      const state = fixture();
      state.player.log = [{ title: "Recorded note", body: "Acquired document.", source: "PrivateNoteId", loggedAtTurn: 1 }];
      state.player.spiltTea = [{ id: "PrivateTopicId", title: "Recorded gossip", summary: "Acquired topic.", tags: [], type: "gossip" }];
      state.player.dnaBank = [{ id: "PrivateSampleId", title: "Recorded sample", loggedAtTurn: 1, causeOfDeath: "Unknown", name: "Known subject", gender: "Non-binary", age: 20, occupation: "Engineer", info: "Acquired analysis." }];
      return state;
    };
    for (const resetKind of ["reset", "restart"] as const) {
      const controller = await session(acquired());
      const before = text(await controller.explorer.information("log"));
      expect(before).toContain("Log Entries (1)");
      expect(before).toContain("Gossip (1)");
      expect(before).toContain("DNA (1)");
      if (resetKind === "reset") await controller.reset();
      else await controller.explorer.command("restart");
      const after = text(await controller.explorer.information("log"));
      expect(after).toContain("Log Entries (0)");
      expect(after).toContain("Gossip (0)");
      expect(after).toContain("DNA (0)");
      expect(after).not.toMatch(/Recorded|Acquired|Known subject|Private/);
      expect(text(await controller.explorer.information("dna", 1))).toContain("Choose a record number");
      await controller.dispose();
    }
  });

  it("does not repeat room descriptions already emitted by look or movement", async () => {
    const controller = await session();
    const looked = text(await controller.explorer.command("look"));
    expect(looked.match(/This is the dimly lit bottom/g)).toHaveLength(1);
    const moved = text(await controller.explorer.command("up"));
    expect(moved).toContain("Stairs Level Seven");
    expect(text(await controller.explorer.information("room"))).toContain("Stairs Level Seven");
  });
});

it("plays the new player-information requests through the actual Node CLI", async () => {
  const { stdout, stderr } = await new Promise<{ stdout: string; stderr: string }>((resolveOutput, reject) => {
    const child = execFile(process.execPath, [resolve("scripts/play-headless.mjs")], { timeout: 20_000, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) reject(error);
      else resolveOutput({ stdout, stderr });
    });
    child.stdin!.end(":log\n:objectives\nread paper\n:log\n:log 1\n:gossip\n:dna\n:objectives\nup\n:room\n:history\n:reset\n:log 1\n:transcript\n:quit\n");
  });
  expect(stderr).toBe("");
  expect(stdout).toContain("Log Entries (0)");
  expect(stdout).toContain("Log Entries (1)");
  expect(stdout).toContain("Note Found on Body: Stairwell Bottom\n\nNotes:");
  expect(stdout).toContain("Get equipment from your quarters");
  expect(stdout).toContain("Gossip (0)");
  expect(stdout).toContain("DNA (0)");
  expect(stdout).toContain("Visibility:");
  expect(stdout).toContain("Recent gameplay messages");
  expect(stdout).not.toMatch(/MysteriousNote|StairWellSeven|toRoomId|activatedAtTurn|Error:/);
}, 30_000);
