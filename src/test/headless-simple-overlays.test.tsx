import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import { resolve, sep } from "node:path";
import type { Message, MessageCreateParamsNonStreaming } from "@anthropic-ai/sdk/resources/messages";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as actions from "../game/actions/dispatchAction";
import * as engine from "../game/engine/handleCommand";
import * as gameInit from "../game/gameInit";
import { ApiaryTerminalModal } from "../game/components/ApiaryTerminalModal";
import { appendLog } from "../game/engine/log";
import { createHeadlessSession } from "../game/harness/session";
import { runHeadlessAgent } from "../game/harness/agent";
import type { Observation, SessionController, TranscriptEntry } from "../game/harness/types";
import { updateItemLocation } from "../game/rules/items";
import { reconcileObjectives } from "../game/rules/objectives";
import { useUIOverlayStore } from "../game/store/store";
import type { GameState } from "../game/types/gameTypes";
import { DEFERRED_WORLD_CHUNK_IDS } from "../world/World";
import { buildBeeSpecRows } from "../world/maps/levelFour/apiaryReadout";
import { getApiaryTrayBeeSpecs } from "../world/maps/levelFour/Apiary";
import { BAR_JUKEBOX_TRACKS } from "../world/maps/levelThree/Park/Bar/barJukebox";
import { SPIN_STAGE_SPEED_DIAL_PASSWORD } from "../world/maps/levelThree/Park/Gym/gymConstants";
import { createTestState } from "./helpers/gameTestHelpers";

const executeAction = actions.dispatchAction;
const controllers: SessionController[] = [];
const directories: string[] = [];
const text = (observation: Observation) => observation.text.join("\n\n");

// Trusted placement only: all opens and interactions still use authored rules.
function fixture(itemIds: string[] = ["Cooler", "SpinStageSpeedDial", "BarLoungeJukebox", "ApiaryTerminal", "ApiaryTray"]) {
  let state = createTestState({ roomId: "StairWellSeven", rng: () => 0.99 });
  for (const id of itemIds) state = updateItemLocation(state, id, "StairWellSeven");
  state.world = { ...state.world, meta: { ...state.world.meta, loadedChunkIds: [...DEFERRED_WORLD_CHUNK_IDS] } };
  return state;
}
function session(initial = fixture()) {
  vi.spyOn(gameInit, "createFreshGameState").mockResolvedValueOnce(initial);
  const directory = resolve(".headless-transcripts", `overlay-test-${randomUUID()}`);
  directories.push(directory);
  const controller = createHeadlessSession({ transcriptDirectory: directory });
  controllers.push(controller);
  return controller;
}
async function history(controller: SessionController): Promise<TranscriptEntry[]> {
  return (await fs.readFile(controller.transcript().path, "utf8")).trim().split("\n").map(line => JSON.parse(line));
}
function applied(before: GameState, result: Awaited<ReturnType<typeof executeAction>>) {
  const next = result.message ? appendLog(result.state, result.message) : result.state;
  return reconcileObjectives(before, next, { fromRoomId: before.player.roomId, toRoomId: next.player.roomId });
}
afterEach(async () => {
  for (const controller of controllers.splice(0)) await controller.dispose();
  for (const directory of directories.splice(0)) {
    if (!directory.startsWith(resolve(".headless-transcripts") + sep)) throw new Error("Unsafe test cleanup.");
    await fs.rm(directory, { recursive: true, force: true });
  }
  vi.restoreAllMocks();
});

describe("headless cooler controls", () => {
  it("opens the actual cooler, lists only modes/temperature and applies free controls exactly once", async () => {
    const controller = session();
    const engineSpy = vi.spyOn(engine, "handleCommand");
    const dispatch = vi.spyOn(actions, "dispatchAction");
    await controller.start();
    const opened = text(await controller.explorer.command("examine cooler"));
    expect(opened).toContain("OMNICOOL");
    expect(opened).toContain("TEMP 70°F");
    expect(opened).toContain("off, cool, cold, or freeze");
    expect(opened).toContain("Moves: 1");
    let expected = await engineSpy.mock.results[0].value;
    for (const [index, mode] of ["cool", "cold", "freeze", "off"].entries()) {
      const response = text(await controller.explorer.command(mode));
      const result = await executeAction(expected, { verb: "setCoolerMode", payload: { mode: mode as "cool" } });
      expect(response).toContain(result.message);
      expect(response).toContain(`TEMP ${[55, 40, 0, 70][index]}°F`);
      expect(response).toContain("Moves: 1");
      expect(dispatch.mock.calls[index][0]).toEqual(expected);
      expected = applied(expected, result);
    }
    expect(dispatch).toHaveBeenCalledTimes(4);
    expect(engineSpy).toHaveBeenCalledTimes(1);
    await controller.explorer.command("close");
    await controller.explorer.command("wait");
    expect(engineSpy.mock.calls[1][0]).toEqual(expected);
    const entries = await history(controller);
    expect(entries.map(entry => entry.input).filter(Boolean)).toEqual(["examine cooler", "cool", "cold", "freeze", "off", "close", "wait"]);
    expect(JSON.stringify(entries)).not.toMatch(/itemSettings|containerContents|setCoolerMode/);
  });

  it("preserves the authored freezing transition for water-filled contents", async () => {
    const initial = fixture();
    initial.itemState.containerContents.Cooler = ["Cup"];
    initial.itemState.containerFilled.Cup = ["water"];
    const controller = session(initial);
    const engineSpy = vi.spyOn(engine, "handleCommand");
    const dispatch = vi.spyOn(actions, "dispatchAction");
    await controller.start();
    await controller.explorer.command("examine cooler");
    const before = await engineSpy.mock.results[0].value;
    const reference = await executeAction(before, { verb: "setCoolerMode", payload: { mode: "freeze" } });
    await controller.explorer.command("freeze");
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect((await dispatch.mock.results[0].value).state).toEqual(reference.state);
    expect(reference.state.itemState.frozenItems.water).toBe(true);
    await controller.explorer.command("close");
    await controller.explorer.command("look");
    expect(engineSpy.mock.calls[1][0]).toEqual(applied(before, reference));
  });

  it("rejects non-rendered modes and gameplay while mounted without dispatch or turns", async () => {
    const controller = session();
    const dispatch = vi.spyOn(actions, "dispatchAction");
    const engineSpy = vi.spyOn(engine, "handleCommand");
    await controller.start();
    await controller.explorer.command("set cooler");
    for (const input of ["hot", "setCoolerMode freeze", "wait", "up", "restart"]) {
      const response = text(await controller.explorer.command(input));
      expect(response).toContain("OMNICOOL");
      expect(response).toContain("Moves: 1");
    }
    expect(dispatch).not.toHaveBeenCalled();
    expect(engineSpy).toHaveBeenCalledTimes(1);
  });
});

describe("headless instructor password", () => {
  it.each(["wrong", "", SPIN_STAGE_SPEED_DIAL_PASSWORD.toLowerCase()])("submits %j through shared validation and closes before dispatch", async password => {
    const controller = session();
    const engineSpy = vi.spyOn(engine, "handleCommand");
    const dispatch = vi.spyOn(actions, "dispatchAction");
    await controller.start();
    const opened = text(await controller.explorer.command("set speed dial to 25"));
    expect(opened).toContain("SPEED TARGET: 25");
    expect(opened).toContain("PASSWORD REQUIRED");
    expect(opened).toContain("submit <password>");
    expect(opened).not.toContain(SPIN_STAGE_SPEED_DIAL_PASSWORD);
    const before = await engineSpy.mock.results[0].value;
    const request = { verb: "submitSpinStageSpeedPassword" as const, payload: { password, speed: 25 } };
    const expected = await executeAction(before, request);
    dispatch.mockImplementationOnce(async (...args) => {
      expect(useUIOverlayStore.getState().overlay.kind).toBe("none");
      return executeAction(...args);
    });
    const result = text(await controller.explorer.command(`submit ${password}`));
    expect(result).toContain(expected.message);
    expect(result).toContain("Moves: 1");
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(useUIOverlayStore.getState().overlay.kind).toBe("none");
    await controller.explorer.command("look");
    expect(engineSpy.mock.calls[1][0]).toEqual(applied(before, expected));
    expect((await history(controller))[2].observation.text.join("\n")).toContain(expected.message);
  });

  it("retains numeric prerequisites, refuses unadvertised input, and cancels without changing speed", async () => {
    const controller = session();
    const dispatch = vi.spyOn(actions, "dispatchAction");
    const engineSpy = vi.spyOn(engine, "handleCommand");
    await controller.start();
    for (const speed of [-1, 101]) {
      expect(text(await controller.explorer.command(`set speed dial to ${speed}`))).toContain("only runs from 0 to 100");
      expect(useUIOverlayStore.getState().overlay.kind).toBe("none");
    }
    await controller.explorer.command("set speed dial to 0");
    const before = await engineSpy.mock.results[2].value;
    expect(text(await controller.explorer.command("set speed dial to 80"))).toContain("SPEED TARGET: 0");
    await controller.explorer.command("cancel");
    expect(dispatch).not.toHaveBeenCalled();
    await controller.explorer.command("look");
    expect(engineSpy.mock.calls[3][0]).toEqual(before);
  });
});

describe("headless jukebox", () => {
  it.each(["", "R22", "X999", BAR_JUKEBOX_TRACKS[0].trackId.toLowerCase()])("submits %j without disclosing the catalog", async code => {
    const controller = session();
    const engineSpy = vi.spyOn(engine, "handleCommand");
    const dispatch = vi.spyOn(actions, "dispatchAction");
    await controller.start();
    const opened = text(await controller.explorer.command("examine jukebox"));
    expect(opened).toContain("CATALOG UNREADABLE");
    expect(opened).toContain("play <code>");
    for (const track of BAR_JUKEBOX_TRACKS) {
      expect(opened).not.toContain(track.trackId);
      expect(opened).not.toContain(track.trackName);
      expect(opened).not.toContain(track.trackArtist);
      for (const clip of track.trackClips) expect(opened).not.toContain(clip);
    }
    const before = await engineSpy.mock.results[0].value;
    const expected = await executeAction(before, { verb: "playJukeboxTrack", payload: { trackId: code.toUpperCase() } });
    dispatch.mockImplementationOnce(async (...args) => {
      expect(useUIOverlayStore.getState().overlay.kind).toBe("none");
      return executeAction(...args);
    });
    const played = text(await controller.explorer.command(`play ${code}`));
    expect(played).toContain(expected.message);
    expect(played).toContain("Moves: 1");
    expect(dispatch).toHaveBeenCalledTimes(1);
    for (const clip of BAR_JUKEBOX_TRACKS[0].trackClips) expect(played).not.toContain(clip);
    await controller.explorer.command("wait");
    expect(engineSpy.mock.calls[1][0]).toEqual(applied(before, expected));
    if (code) expect((await history(controller))[2].input).toBe(`play ${code}`);
  });

  it("rejects values outside the four UI fields, closes, and preserves ordinary timed playback", async () => {
    const controller = session();
    const dispatch = vi.spyOn(actions, "dispatchAction");
    await controller.start();
    await controller.explorer.command("examine jukebox");
    for (const input of ["play R2215", "play R-221", "list tracks", "wait"]) {
      expect(text(await controller.explorer.command(input))).toContain("CATALOG UNREADABLE");
    }
    expect(dispatch).not.toHaveBeenCalled();
    await controller.explorer.command("close");
    expect(useUIOverlayStore.getState().overlay.kind).toBe("none");
    await controller.explorer.command("examine jukebox");
    await controller.explorer.command(`play ${BAR_JUKEBOX_TRACKS[0].trackId}`);
    let last = "";
    for (let index = 0; index < BAR_JUKEBOX_TRACKS[0].trackLength; index++) last = text(await controller.explorer.command("wait"));
    expect(last).toContain(BAR_JUKEBOX_TRACKS[0].trackClose);
  });
});

describe("headless apiary readout", () => {
  it.each([false, true])("matches the React readout with tray occupancy %s", async occupied => {
    let initial = fixture();
    if (occupied) {
      initial = updateItemLocation(initial, "DeactivatedBee", "ApiaryTray");
      initial.itemState.surfaceContents.ApiaryTray = ["DeactivatedBee"];
    }
    const controller = session(initial);
    const engineSpy = vi.spyOn(engine, "handleCommand");
    const dispatch = vi.spyOn(actions, "dispatchAction");
    await controller.start();
    const opened = text(await controller.explorer.command("examine apiary terminal"));
    expect(opened).toContain("OMNI-BEE");
    expect(opened).toContain("Moves: 1");
    render(<ApiaryTerminalModal state={initial} onClose={() => {}} />);
    if (!occupied) {
      expect(opened).toContain(screen.getByText("Place Unit on Tray").textContent);
      expect(opened).not.toMatch(/Shutdown freq|168\.8800|Hive ID/);
    } else {
      const rows = buildBeeSpecRows(getApiaryTrayBeeSpecs(initial)!);
      for (const row of rows) {
        expect(opened).toContain(`${row.label}: ${row.value}`);
        expect(screen.getByText(`${row.label}:`)).toBeTruthy();
      }
      expect(rows).toHaveLength(18);
    }
    const before = await engineSpy.mock.results[0].value;
    expect(text(await controller.explorer.command("transmit"))).toContain("Use close");
    await controller.explorer.command("close");
    await controller.explorer.command("wait");
    expect(dispatch).not.toHaveBeenCalled();
    expect(engineSpy.mock.calls[1][0]).toEqual(before);
  });

  it("retains the browser's unavailable-data fallback for an invalid tray unit", async () => {
    const initial = fixture();
    initial.itemState.surfaceContents.ApiaryTray = ["DeactivatedBee"];
    initial.world = { ...initial.world, items: initial.world.items.map(item => item.id === "DeactivatedBee" ? { ...item, meta: { ...item.meta, specs: undefined } } : item) };
    const controller = session(initial);
    await controller.start();
    expect(text(await controller.explorer.command("examine apiary terminal"))).toContain("Unit data unavailable");
  });
});

describe("mounted adapter lifecycle", () => {
  it("preserves the existing agent command/history protocol through all four interfaces", async () => {
    const controller = session();
    const commands = ["examine cooler", "freeze", "close", "set speed dial to 25", "submit wrong", "examine jukebox", "play X999", "examine apiary terminal", "close", "inventory"];
    const requests: MessageCreateParamsNonStreaming[] = [];
    let turn = 0;
    const client = { messages: {
      countTokens: vi.fn(async () => ({ input_tokens: 100 })),
      create: vi.fn(async (request: MessageCreateParamsNonStreaming) => {
        requests.push(request);
        const command = commands[turn++];
        return {
          content: [
            { type: "text", text: `Action explanation ${turn}.`, citations: null },
            { type: "tool_use", id: `tool_${turn}`, name: "game_command", input: { command } },
          ], stop_reason: "tool_use",
          usage: { input_tokens: 100, output_tokens: 20, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 },
        } as Message;
      }),
    } };
    const run = await runHeadlessAgent({ client, session: controller, options: { maxActions: commands.length } });
    expect(run.reason).toBe("action_limit");
    expect(run.events.map(event => event.request)).toEqual(commands);
    expect(run.events.at(-1)!.text.join("\n")).toContain("Moves: 4");
    expect(JSON.stringify(requests[1].messages)).toContain("Action explanation 1.");
    const entries = await history(controller);
    expect(entries.filter(entry => entry.kind === "command").map(entry => entry.observation.text)).toEqual(run.events.map(event => event.text));
    const playerData = JSON.stringify(requests) + JSON.stringify(entries);
    expect(playerData).not.toMatch(/setCoolerMode|submitSpinStageSpeedPassword|playJukeboxTrack|apiary-terminal|itemSettings/);
    expect(playerData).not.toContain(SPIN_STAGE_SPEED_DIAL_PASSWORD);
    expect(playerData).not.toContain(BAR_JUKEBOX_TRACKS[0].trackId);
    expect(useUIOverlayStore.getState().overlay.kind).toBe("none");
  });

  it.each([1, 2])("preserves an action budget of %i across a mounted control batch", async maxActions => {
    const controller = session();
    const dispatch = vi.spyOn(actions, "dispatchAction");
    const client = { messages: {
      countTokens: vi.fn(async () => ({ input_tokens: 100 })),
      create: vi.fn(async () => ({
        content: ["examine cooler", "freeze", "close"].map((command, index) => ({ type: "tool_use", id: `tool_${index}`, name: "game_command", input: { command } })),
        stop_reason: "tool_use",
        usage: { input_tokens: 100, output_tokens: 20, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 },
      } as Message)),
    } };
    const run = await runHeadlessAgent({ client, session: controller, options: { maxActions } });
    expect(run.reason).toBe("action_limit");
    expect(run.actions).toBe(maxActions);
    expect(dispatch).toHaveBeenCalledTimes(maxActions - 1);
    expect(run.events.map(event => event.request)).toEqual(["examine cooler", "freeze"].slice(0, maxActions));
    expect(useUIOverlayStore.getState().overlay.kind).toBe("none");
  });

  it.each(["examine cooler", "set speed dial to 25", "examine jukebox", "examine apiary terminal"])("resets %s without retaining a control capability", async opening => {
    const controller = session();
    const dispatch = vi.spyOn(actions, "dispatchAction");
    await controller.start();
    await controller.explorer.command(opening);
    vi.mocked(gameInit.createFreshGameState).mockResolvedValueOnce(fixture([]));
    const reset = text(await controller.reset());
    expect(reset).not.toMatch(/PASSWORD REQUIRED|CATALOG UNREADABLE|TEMP 70|Shutdown freq/);
    expect(useUIOverlayStore.getState().overlay.kind).toBe("none");
    expect(controller.capabilityDiagnostics!()).toEqual([]);
    await controller.explorer.command("freeze");
    await controller.explorer.command("submit secret");
    await controller.explorer.command("play R221");
    expect(dispatch).not.toHaveBeenCalled();
    expect((await history(controller)).map(entry => entry.kind)).toContain("reset");
  });

  it("requires ordinary visibility/access and never grants controls before an opening action", async () => {
    const controller = session(fixture([]));
    const dispatch = vi.spyOn(actions, "dispatchAction");
    await controller.start();
    for (const input of ["examine cooler", "set speed dial to 25", "examine jukebox", "examine apiary terminal", "freeze", "submit secret", "play R221"]) {
      const response = text(await controller.explorer.command(input));
      expect(response).not.toMatch(/THERMAL REGULATION UNIT|PASSWORD REQUIRED|CATALOG UNREADABLE|Pollination Unit Diagnostic Terminal/);
      expect(useUIOverlayStore.getState().overlay.kind).toBe("none");
    }
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("applies deferred notifications/log once on close and preserves player transcript", async () => {
    const controller = session();
    const engineSpy = vi.spyOn(engine, "handleCommand");
    await controller.start();
    await controller.explorer.command("examine cooler");
    const overlay = useUIOverlayStore.getState().overlay;
    if (overlay.kind === "none") throw new Error("Expected mounted cooler.");
    useUIOverlayStore.getState().openOverlay({ ...overlay, postCloseMessage: "Deferred message.", postCloseNotifications: [{ kind: "gossip", text: "Deferred notification." }] });
    const closed = await controller.explorer.command("close");
    expect(text(closed).split("Deferred message.")).toHaveLength(2);
    expect(text(closed).split("Deferred notification.")).toHaveLength(2);
    await controller.explorer.command("inventory");
    const after = engineSpy.mock.calls[1][0];
    expect(after.log.filter(line => line === "Deferred message.")).toHaveLength(1);
    expect(after.uiState.notifications.filter(notification => notification.text === "Deferred notification.")).toHaveLength(1);
    expect((await history(controller))[2].observation).toEqual(closed);
  });
});
