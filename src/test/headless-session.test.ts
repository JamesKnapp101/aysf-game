import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { promisify } from "node:util";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FIRST_RUN_HELP_HINT, OPENING_SPLASH } from "../game/constants";
import * as commandEngine from "../game/engine/handleCommand";
import { appendLog } from "../game/engine/log";
import { createFreshGameState, mergeWorldChunkIntoState } from "../game/gameInit";
import { createHeadlessSession } from "../game/harness/session";
import { TRANSCRIPT_FAILED } from "../game/harness/transcript";
import type { Observation, SessionController, TranscriptEntry } from "../game/harness/types";
import { saveManualSnapshot, saveResumeSnapshot } from "../game/persistence/resumeStorage";
import { reconcileObjectives } from "../game/rules/objectives";
import { useUIEffectsStore, useUIOverlayStore } from "../game/store/store";
import { parseCommand } from "../parse/parser";
import { DEFERRED_WORLD_CHUNK_IDS, isWorldChunkLoaded, loadWorldChunk } from "../world/World";

const execute = commandEngine.handleCommand;
const sessions: SessionController[] = [];
const directories: string[] = [];
const text = (observation: Observation) => observation.text.join("\n\n");

function session(): SessionController {
  const directory = resolve(".headless-transcripts", `test-${randomUUID()}`);
  directories.push(directory);
  const controller = createHeadlessSession({ transcriptDirectory: directory });
  sessions.push(controller);
  return controller;
}

async function history(controller: SessionController): Promise<TranscriptEntry[]> {
  const contents = await fs.readFile(controller.transcript().path, "utf8");
  return contents.trim().split("\n").map((line) => JSON.parse(line));
}

function latch() {
  let release!: () => void;
  const promise = new Promise<void>((resolve) => { release = resolve; });
  return { promise, release };
}

afterEach(async () => {
  for (const controller of sessions.splice(0)) await controller.dispose();
  for (const directory of directories.splice(0)) await fs.rm(directory, { recursive: true, force: true });
  vi.restoreAllMocks();
});

describe("headless game session", () => {
  it("starts once at the production room without spending a turn or exposing state", async () => {
    const spy = vi.spyOn(commandEngine, "handleCommand");
    const controller = session();
    const opening = await controller.start();
    expect(text(opening)).toContain(OPENING_SPLASH);
    expect(text(opening)).toContain(FIRST_RUN_HELP_HINT);
    expect(text(opening)).toContain("Bottom of Stairwell");
    expect(text(opening)).toContain("Moves: 0");
    expect(await controller.start()).toBe(opening);
    expect(controller.transcript().records).toBe(1);
    expect(spy).not.toHaveBeenCalled();
    expect(Object.keys(controller.explorer)).toEqual(["command", "information"]);
    expect(Object.keys(opening)).toEqual(["sequence", "text"]);
    expect(JSON.stringify(await history(controller))).not.toMatch(
      /StairWellSeven|BombTimer|itemState|worldState|loadedChunkIds|\[\[/,
    );

    await controller.explorer.command("look");
    const initial = spy.mock.calls[0][0];
    expect(initial.player.roomId).toBe("StairWellSeven");
    expect(initial.moves).toBe(0);
    expect(initial.uiState.conversationMode).toBe("authored");
    for (const chunkId of DEFERRED_WORLD_CHUNK_IDS) {
      expect(isWorldChunkLoaded(initial.world, chunkId)).toBe(true);
    }
  });

  it("plays the required sequence with the same state and costs as direct engine execution", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99);
    const controller = session();
    await controller.start();
    let reference = await createFreshGameState();
    const fresh = reference;
    reference = { ...reference, uiState: { ...reference.uiState, conversationMode: "authored" } };
    for (const chunkId of DEFERRED_WORLD_CHUNK_IDS) {
      if (!isWorldChunkLoaded(reference.world, chunkId)) {
        reference = mergeWorldChunkIntoState(reference, chunkId, await loadWorldChunk(chunkId));
      }
    }
    reference = appendLog(reconcileObjectives(fresh, reference), FIRST_RUN_HELP_HINT);
    const spy = vi.spyOn(commandEngine, "handleCommand");
    const commands = ["look", "examine boxes", "examine dead man", "wait", "up"];
    const phrases = ["Bottom of Stairwell", "metal bands", "slip it into your inventory", "You wait", "Stairs Level Seven"];
    for (const [index, input] of commands.entries()) {
      const previous = reference;
      const result = await execute(reference, parseCommand(input));
      reference = reconcileObjectives(previous, result, {
        fromRoomId: previous.player.roomId,
        toRoomId: result.player.roomId,
      });
      const observation = await controller.explorer.command(input);
      expect(text(observation)).toContain(phrases[index]);
      expect(text(observation)).toContain(`Moves: ${index}`);
      expect(text(observation)).not.toContain(OPENING_SPLASH);
      const actual = await spy.mock.results[index].value;
      expect({ ...actual, rng: undefined }).toEqual({ ...reference, rng: undefined });
      for (const entry of reference.log.slice(previous.log.length)) {
        expect(text(observation)).toContain(entry.replace(/\[\[\/?ROOM_NAME\]\]/g, "").trim());
      }
    }
    expect(reference.player.roomId).toBe("StairSeven");
    expect(reference.player.inventory.general.filter((id) => id === "BombTimer")).toHaveLength(1);
    expect((await history(controller)).map((entry) => entry.input)).toEqual([undefined, ...commands]);
  });

  it("retains acquired items and only grants the dead man's timer once", async () => {
    const spy = vi.spyOn(commandEngine, "handleCommand");
    const controller = session();
    await controller.start();
    expect(text(await controller.explorer.command("examine dead man"))).toContain("slip it into your inventory");
    expect(text(await controller.explorer.command("examine dead man"))).not.toContain("slip it into your inventory");
    expect(spy.mock.calls[1][0].player.inventory.general.filter((id) => id === "BombTimer")).toHaveLength(1);
    expect(text(await controller.explorer.command("examine timer"))).toContain("Moves: 3");
    expect(spy.mock.calls[2][0].itemState.itemRoomId.BombTimer).toBe("INVENTORY");
  });

  it("preserves blank/unknown input and the cost of blocked movement", async () => {
    const spy = vi.spyOn(commandEngine, "handleCommand");
    const controller = session();
    await controller.start();
    expect((await controller.explorer.command("   ")).text).toEqual([]);
    expect(spy).not.toHaveBeenCalled();
    const unknown = text(await controller.explorer.command("unrecognized nonsense"));
    expect(unknown).toContain("I don't understand that.");
    expect(unknown).toContain("Moves: 0");
    const blocked = text(await controller.explorer.command("west"));
    expect(blocked).toContain("You can't go that way.");
    expect(blocked).toContain("Moves: 1");
    expect((await spy.mock.results[1].value).player.roomId).toBe("StairWellSeven");
  });

  it.each(["iljio", "ILJIO", "  IlJiO  "])("rejects developer command %j before any engine execution", async (input) => {
    const spy = vi.spyOn(commandEngine, "handleCommand");
    const controller = session();
    await controller.start();
    expect((await controller.explorer.command(input)).text).toEqual(["That command is unavailable to players."]);
    expect(spy).not.toHaveBeenCalled();
    expect(text(await controller.explorer.command("look"))).toContain("Moves: 0");
    const state = spy.mock.calls[0][0];
    expect(state.player.inventory.general).not.toContain("MindGun");
    expect(state.player.inventory.badges).not.toContain("inframaroonbadge");
    expect(JSON.stringify(await history(controller))).not.toContain("Test items granted");
  });

  it("serializes async commands and queues reset after unfinished work", async () => {
    const entered = latch();
    const finish = latch();
    const spy = vi.spyOn(commandEngine, "handleCommand").mockImplementationOnce(async (...args) => {
      entered.release();
      await finish.promise;
      return execute(...args);
    });
    const controller = session();
    await controller.start();
    const first = controller.explorer.command("examine dead man");
    const second = controller.explorer.command("up");
    const reset = controller.reset();
    const afterReset = controller.explorer.command("examine dead man");
    await entered.promise;
    expect(spy).toHaveBeenCalledTimes(1);
    expect(controller.transcript().records).toBe(1);
    finish.release();
    const observations = await Promise.all([first, second, reset, afterReset]);
    expect(observations.map((entry) => entry.sequence)).toEqual([2, 3, 4, 5]);
    expect(text(observations[0])).toContain("Moves: 1");
    expect(text(observations[1])).toContain("Stairs Level Seven");
    expect(text(observations[1])).toContain("Moves: 2");
    expect(text(observations[2])).toContain("Moves: 0");
    expect(text(observations[3])).toContain("slip it into your inventory");
    expect(spy.mock.calls[1][0].player.inventory.general).toContain("BombTimer");
    expect(spy.mock.calls[2][0].player.inventory.general).not.toContain("BombTimer");
    expect((await history(controller)).map((entry) => entry.kind)).toEqual(["start", "command", "command", "reset", "command"]);
  });

  it("resets inventory, saves and presentation stores while preserving the file's existing records", async () => {
    const spy = vi.spyOn(commandEngine, "handleCommand");
    const controller = session();
    const opening = await controller.start();
    await controller.explorer.command("examine dead man");
    const acquired = await spy.mock.results[0].value;
    expect(saveManualSnapshot(acquired)).toBe(true);
    expect(saveResumeSnapshot(acquired)).toBe(true);
    const oldTranscript = controller.transcript();
    const oldContents = await fs.readFile(oldTranscript.path, "utf8");
    const onEnd = vi.fn();
    useUIOverlayStore.getState().openOverlay({ kind: "help" });
    useUIEffectsStore.setState({
      mindFlash: { memory: "private fixture", onEnd },
      teleportFlashNonce: 3,
      screenShakeNonce: 4,
    });
    const reset = await controller.reset();
    expect(reset.text).toEqual(opening.text);
    expect(window.localStorage.length).toBe(0);
    expect(useUIOverlayStore.getState().overlay.kind).toBe("none");
    expect(useUIEffectsStore.getState()).toMatchObject({
      mindFlash: null, organismDeath: null, syndromeXSignal: null,
      teleportFlashNonce: 0, screenShakeNonce: 0,
    });
    expect(onEnd).toHaveBeenCalledTimes(1);
    expect(oldTranscript.records).toBe(2);
    expect(controller.transcript().records).toBe(3);
    expect((await fs.readFile(oldTranscript.path, "utf8")).startsWith(oldContents)).toBe(true);
    expect(Object.isFrozen(oldTranscript)).toBe(true);
    expect(Object.isFrozen(opening.text)).toBe(true);
    expect(text(await controller.explorer.command("examine dead man"))).toContain("slip it into your inventory");
  });

  it("keeps ordinary restart hydrated and does not repeat history on failed restore", async () => {
    const spy = vi.spyOn(commandEngine, "handleCommand");
    const controller = session();
    await controller.start();
    await controller.explorer.command("examine dead man");
    const restore = text(await controller.explorer.command("restore"));
    expect(restore).toContain("You don't have a saved game to restore.");
    expect(restore).not.toContain("slip it into your inventory");
    expect(restore).toContain("Moves: 1");
    const restart = text(await controller.explorer.command("restart"));
    expect(restart).toContain("Game restarted.");
    expect(restart).toContain("Moves: 0");
    expect(restart).not.toContain("slip it into your inventory");
    expect(text(await controller.explorer.command("examine dead man"))).toContain("slip it into your inventory");
    const fresh = spy.mock.calls[3][0];
    expect(fresh.uiState.conversationMode).toBe("authored");
    expect(fresh.player.inventory.general).not.toContain("BombTimer");
    for (const chunkId of DEFERRED_WORLD_CHUNK_IDS) {
      expect(isWorldChunkLoaded(fresh.world, chunkId)).toBe(true);
    }
  });

  it("stops at unsupported UI interactions rather than bypassing their input gates", async () => {
    const spy = vi.spyOn(commandEngine, "handleCommand");
    const controller = session();
    await controller.start();
    useUIOverlayStore.getState().openOverlay({ kind: "matter-transmitter", isOn: true });
    expect(text(await controller.explorer.command("wait"))).toContain("needs a headless gameplay adapter");
    expect(spy).not.toHaveBeenCalled();
    await controller.reset();
    expect(text(await controller.explorer.command("wait"))).toContain("Moves: 1");
  });

  it("returns generic failure text and requires reset after an uncertain engine failure", async () => {
    const spy = vi.spyOn(commandEngine, "handleCommand").mockRejectedValueOnce(
      new Error("secret solution: StairWellSeven; C:\\private\\debug.ts"),
    );
    const controller = session();
    await controller.start();
    const failed = await controller.explorer.command("wait");
    expect(failed.text).toEqual(["The command could not be completed. Reset the session to continue."]);
    expect((await controller.explorer.command("up")).text).toEqual(failed.text);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(await history(controller))).not.toMatch(/secret|StairWellSeven|debug\.ts/);
    await controller.reset();
    expect(text(await controller.explorer.command("look"))).toContain("Moves: 0");
  });

  it("owns one session at a time and drains pending commands before disposal", async () => {
    const entered = latch();
    const finish = latch();
    vi.spyOn(commandEngine, "handleCommand").mockImplementationOnce(async (...args) => {
      entered.release();
      await finish.promise;
      return execute(...args);
    });
    const controller = session();
    expect(() => createHeadlessSession()).toThrow("Only one headless session");
    await controller.start();
    const pending = controller.explorer.command("wait");
    await entered.promise;
    const end = { finalAgentMessage: "  Final [[ROOM_NAME]] message.\n\n**Complete.**\n" };
    const disposal = controller.dispose(end);
    end.finalAgentMessage = "Changed after disposal began.";
    expect(controller.dispose({ finalAgentMessage: "Duplicate disposal." })).toBe(disposal);
    await expect(controller.explorer.command("up")).rejects.toThrow("session is closed");
    expect(() => createHeadlessSession()).toThrow("Only one headless session");
    finish.release();
    expect(text(await pending)).toContain("Moves: 1");
    await disposal;
    const records = await history(controller);
    expect(records.map(entry => entry.kind)).toEqual(["start", "command", "end"]);
    expect(records.map(entry => entry.sequence)).toEqual([1, 2, 3]);
    expect(records.at(-1)?.finalAgentMessage).toBe("  Final [[ROOM_NAME]] message.\n\n**Complete.**\n");
    expect(records.at(-1)?.observation.text).toEqual([]);
    expect(records.slice(0, -1).every(entry => entry.finalAgentMessage === undefined)).toBe(true);
    expect(text(await session().start())).toContain("Moves: 0");
  });

  it("snapshots public action context before queuing and keeps it out of observations", async () => {
    const entered = latch();
    const finish = latch();
    vi.spyOn(commandEngine, "handleCommand").mockImplementationOnce(async (...args) => {
      entered.release();
      await finish.promise;
      return execute(...args);
    });
    const controller = session();
    await controller.start();
    const details = { goal: "Explore the immediate surroundings", reason: "Wait to observe what happens.", hiddenState: "PRIVATE_STATE" };
    const pending = controller.explorer.command("wait", details);
    await entered.promise;
    details.goal = "Changed after queuing.";
    details.reason = "Changed after queuing.";
    const queued = controller.explorer.information("room", undefined, { reason: "Check my current location." });
    finish.release();
    expect(Object.keys(await pending)).toEqual(["sequence", "text"]);
    expect(Object.keys(await queued)).toEqual(["sequence", "text"]);
    await controller.explorer.command("look");
    await controller.dispose();
    const records = await history(controller);
    expect(records.map(entry => entry.kind)).toEqual(["start", "command", "information", "command", "end"]);
    expect(records[1]).toMatchObject({ goal: "Explore the immediate surroundings", reason: "Wait to observe what happens." });
    expect(records[2]).toMatchObject({ reason: "Check my current location." });
    expect(records[2]).not.toHaveProperty("goal");
    for (const index of [0, 3, 4]) {
      expect(records[index]).not.toHaveProperty("goal");
      expect(records[index]).not.toHaveProperty("reason");
    }
    expect(JSON.stringify(records)).not.toMatch(/PRIVATE_STATE|hiddenState|Changed after queuing/);
  });

  it("persists a long run incrementally without losing repeated output at the engine log cap", async () => {
    const controller = session();
    await controller.start();
    const spy = vi.spyOn(commandEngine, "handleCommand");
    let expected: string | undefined;
    for (let index = 0; index < 520; index += 1) {
      const response = await controller.explorer.command("look");
      expected ??= text(response);
      expect(text(response)).toBe(expected);
    }
    expect((await spy.mock.results[519].value).log).toHaveLength(500);
    expect(controller.transcript().records).toBe(521);
    expect(Object.keys(controller.transcript()).sort()).toEqual(["path", "records", "sessionId"]);
    await controller.dispose();
    const entries = await history(controller);
    expect(entries).toHaveLength(522);
    expect(entries.map((entry) => entry.sequence)).toEqual(Array.from({ length: 522 }, (_, index) => index + 1));
    expect(entries.slice(1, -1).every((entry) => text(entry.observation) === expected)).toBe(true);
    expect(entries.at(-1)?.kind).toBe("end");
    expect(new Set(entries.map((entry) => entry.sessionId)).size).toBe(1);
    expect(new Set(entries.map((entry) => entry.episodeId)).size).toBe(1);
    expect(JSON.stringify(entries)).not.toMatch(/StairWellSeven|BombTimer|itemState|worldState|loadedChunkIds/);
    expect(Object.keys(entries[1]).sort()).toEqual([
      "episodeId", "input", "kind", "observation", "sequence", "sessionId", "timestamp",
    ]);
  }, 30_000);

  it("keeps one append-only history with new episodes across reset and player restart", async () => {
    const controller = session();
    await controller.start();
    await controller.explorer.command("examine dead man");
    const initialContents = await fs.readFile(controller.transcript().path, "utf8");
    await controller.reset();
    await controller.explorer.command("restart");
    await controller.explorer.command("examine dead man");
    await controller.dispose();
    const contents = await fs.readFile(controller.transcript().path, "utf8");
    expect(contents.startsWith(initialContents)).toBe(true);
    expect(contents.endsWith("\n")).toBe(true);
    const entries = await history(controller);
    expect(entries.map((entry) => entry.kind)).toEqual(["start", "command", "reset", "command", "command", "end"]);
    expect(entries[3].event).toBe("restart");
    expect(entries[1].episodeId).toBe(entries[0].episodeId);
    expect(entries[2].episodeId).not.toBe(entries[1].episodeId);
    expect(entries[3].episodeId).not.toBe(entries[2].episodeId);
    expect(entries[4].episodeId).toBe(entries[3].episodeId);
    expect(entries[5].episodeId).toBe(entries[3].episodeId);
    const later = session();
    await later.start();
    expect(later.transcript().path).not.toBe(controller.transcript().path);
    expect(await fs.readFile(controller.transcript().path, "utf8")).toBe(contents);
  });

  it("awaits the file flush before returning output or executing another queued command", async () => {
    const open = vi.spyOn(fs, "open");
    const controller = session();
    await controller.start();
    const file = await open.mock.results[0].value;
    const entered = latch();
    const finish = latch();
    const originalSync = file.sync.bind(file);
    const sync = vi.spyOn(file, "sync").mockImplementationOnce(async () => {
      entered.release();
      await finish.promise;
      await originalSync();
    });
    const engine = vi.spyOn(commandEngine, "handleCommand");
    let completed = false;
    const first = controller.explorer.command("wait").then((response) => { completed = true; return response; });
    const second = controller.explorer.command("up");
    await entered.promise;
    expect(completed).toBe(false);
    expect(engine).toHaveBeenCalledTimes(1);
    expect(controller.transcript().records).toBe(1);
    finish.release();
    await Promise.all([first, second]);
    expect(sync).toHaveBeenCalledTimes(2);
    const close = vi.spyOn(file, "close");
    await controller.dispose();
    expect(close).toHaveBeenCalledTimes(1);
    expect(sync).toHaveBeenCalledTimes(4); // commands, end record, final close flush
    expect(file.fd).toBe(-1);
    await expect(fs.stat(controller.transcript().path)).resolves.toBeDefined();
  });

  it.each(["mkdir", "open"] as const)("fails safely when transcript %s fails", async (method) => {
    vi.spyOn(fs, method).mockRejectedValueOnce(new Error("private path and diagnostics"));
    const engine = vi.spyOn(commandEngine, "handleCommand");
    const controller = session();
    expect((await controller.start()).text).toEqual([TRANSCRIPT_FAILED]);
    await expect(controller.explorer.command("wait")).rejects.toThrow(TRANSCRIPT_FAILED);
    expect(engine).not.toHaveBeenCalled();
    await expect(controller.dispose()).rejects.toThrow(TRANSCRIPT_FAILED);
    sessions.splice(sessions.indexOf(controller), 1);
    expect(text(await session().start())).toContain("Moves: 0");
  });

  it.each(["appendFile", "sync"] as const)("closes the file and stops commands after a %s failure", async (method) => {
    const open = vi.spyOn(fs, "open");
    const controller = session();
    await controller.start();
    const file = await open.mock.results[0].value;
    vi.spyOn(file, method).mockRejectedValueOnce(new Error("secret state at C:\\private\\transcript.jsonl"));
    const engine = vi.spyOn(commandEngine, "handleCommand");
    expect((await controller.explorer.command("wait")).text).toEqual([TRANSCRIPT_FAILED]);
    await expect(controller.explorer.command("up")).rejects.toThrow(TRANSCRIPT_FAILED);
    await expect(controller.reset()).rejects.toThrow(TRANSCRIPT_FAILED);
    expect(engine).toHaveBeenCalledTimes(1);
    const close = vi.spyOn(file, "close");
    await expect(controller.dispose()).rejects.toThrow(TRANSCRIPT_FAILED);
    sessions.splice(sessions.indexOf(controller), 1);
    expect(close).toHaveBeenCalledTimes(1);
    expect(file.fd).toBe(-1);
    expect(JSON.stringify(await history(controller))).not.toMatch(/secret|private|StairWellSeven|worldState/);
  });

  it("attempts close even when the final flush fails, and releases the session lease", async () => {
    const open = vi.spyOn(fs, "open");
    const controller = session();
    await controller.start();
    const file = await open.mock.results[0].value;
    const originalSync = file.sync.bind(file);
    vi.spyOn(file, "sync").mockImplementationOnce(originalSync).mockRejectedValueOnce(new Error("private flush failure"));
    const close = vi.spyOn(file, "close");
    await expect(controller.dispose()).rejects.toThrow(TRANSCRIPT_FAILED);
    sessions.splice(sessions.indexOf(controller), 1);
    expect(close).toHaveBeenCalledTimes(1);
    expect(file.fd).toBe(-1);
    expect((await history(controller)).at(-1)?.kind).toBe("end");
    expect(text(await session().start())).toContain("Moves: 0");
  });

  it("reports close failure without revealing diagnostics or holding the session lease", async () => {
    const open = vi.spyOn(fs, "open");
    const controller = session();
    await controller.start();
    const file = await open.mock.results[0].value;
    const originalClose = file.close.bind(file);
    vi.spyOn(file, "close").mockImplementationOnce(async () => {
      await originalClose();
      throw new Error("private close diagnostics");
    });
    await expect(controller.dispose()).rejects.toThrow(TRANSCRIPT_FAILED);
    sessions.splice(sessions.indexOf(controller), 1);
    expect(file.fd).toBe(-1);
    expect((await history(controller)).at(-1)?.kind).toBe("end");
    expect(text(await session().start())).toContain("Moves: 0");
  });
});

it("loads and plays the demonstration in real Node without a DOM and shuts down cleanly", async () => {
  const script = resolve("scripts/play-headless.mjs");
  const { stdout, stderr } = await promisify(execFile)(process.execPath, [script, "--demo"], {
    cwd: tmpdir(),
    timeout: 20_000,
    maxBuffer: 1024 * 1024,
  });
  expect(stderr).toBe("");
  for (const command of ["look", "examine boxes", "examine dead man", "wait", "up"]) {
    expect(stdout).toContain(`> ${command}`);
  }
  expect(stdout).toContain("slip it into your inventory");
  expect(stdout).toContain("Stairs Level Seven");
  expect(stdout).toContain("Moves: 4");
  expect(stdout.match(/You dream of falling\./g)).toHaveLength(2);
  expect(stdout.slice(stdout.indexOf(":reset"))).toContain("Moves: 0");
  expect(stdout).toContain("Transcript: 8 records written to");
  const path = stdout.match(/Transcript: 8 records written to (.+)/)?.[1].trim();
  expect(path).toBeDefined();
  const records: TranscriptEntry[] = (await fs.readFile(path!, "utf8")).trim().split("\n").map((line) => JSON.parse(line));
  expect(records).toHaveLength(8);
  expect(records.at(-1)?.kind).toBe("end");
  expect(stdout).not.toMatch(/StairWellSeven|BombTimer|worldState|loadedChunkIds|\[\[|Error:|debug\.ts/);
}, 30_000);

it("accepts ordinary commands and host controls through the Node CLI's stdin", async () => {
  const script = resolve("scripts/play-headless.mjs");
  const { stdout, stderr } = await new Promise<{ stdout: string; stderr: string }>((resolveOutput, reject) => {
    const child = execFile(process.execPath, [script], { timeout: 20_000 }, (error, stdout, stderr) => {
      if (error) reject(error);
      else resolveOutput({ stdout, stderr });
    });
    child.stdin!.end("examine dead man\nILJIO\n:reset\nlook\n:transcript\n:quit\n");
  });
  expect(stderr).toBe("");
  expect(stdout).toContain("slip it into your inventory");
  expect(stdout).toContain("That command is unavailable to players.");
  expect(stdout).toContain('"records": 5');
  expect(stdout).toContain('"path":');
  expect(stdout).not.toMatch(/StairWellSeven|BombTimer|Developer mode enabled|Error:/);
}, 30_000);
