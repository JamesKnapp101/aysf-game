import type { Message, MessageCreateParamsNonStreaming } from "@anthropic-ai/sdk/resources/messages";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { parseCommand } from "../parse/parser";
import { dispatchAction } from "../game/actions/dispatchAction";
import { CameraGunViewerModal } from "../game/components/CameraGunModal";
import * as engine from "../game/engine/handleCommand";
import * as gameInit from "../game/gameInit";
import { runHeadlessAgent } from "../game/harness/agent";
import { cameraGunCommand, cameraGunPresentation } from "../game/harness/cameraGun";
import { cameraGunViewer, getCameraFeedDescription, resolveCameraRoomId } from "../game/helpers/cameraGunViewerHelpers";
import { removeItemFromPlacementLists } from "../game/helpers/itemPlacement";
import { attachGelCameraToHost } from "../game/helpers/gelCameraHelpers";
import { updateItemLocation } from "../game/rules/items";
import { reconcileObjectives } from "../game/rules/objectives";
import { applyStatusEffectToPlayer } from "../game/rules/status";
import { useUIOverlayStore } from "../game/store/store";
import { buildRoomDescription } from "../game/text/roomDescription";
import type { GameState } from "../game/types/gameTypes";
import { overlayFixture, overlayHistory, overlaySession, observationText as text } from "./helpers/headlessOverlayHelpers";

function fixture() {
  const state = overlayFixture(["CameraGun", "GelRound1", "GelRound2", "GelRound3", "Cooler"]);
  for (const id of ["CameraGun", "GelRound1", "GelRound2", "GelRound3", "Cooler"]) {
    for (const key of ["containerContents", "surfaceContents", "underContents", "searchableContents"] as const) state.itemState[key] = removeItemFromPlacementLists(state.itemState[key], id);
  }
  state.itemState.activeGelCameras = {};
  state.itemState.containerContents.CameraGun = [];
  return state;
}

function remoteFixture() {
  let state = fixture();
  state = updateItemLocation(state, "Cooler", "LivingQuartersSixEast");
  return attachGelCameraToHost(state, "GelRound2", "Cooler");
}

function expectBrowserFeed(state: GameState, index: number, observed: string) {
  const rendered = render(<CameraGunViewerModal state={state} currentView={index} onClose={() => {}} onCycleView={() => {}} onRunCommand={() => {}} />);
  expect(observed).toContain(screen.getByLabelText("Camera feed text").querySelector("pre")!.textContent!);
  expect(observed).toContain(cameraGunViewer(state, index).statusLine);
  rendered.unmount();
}

describe("mounted headless CameraGun", () => {
  it("discovers and takes the authored gun, opens empty, and keeps disabled/invalid controls free", async () => {
    const controller = overlaySession(fixture());
    const spy = vi.spyOn(engine, "handleCommand");
    expect(text(await controller.start())).toContain("lightweight pistol");
    await controller.explorer.command("take gun");
    const opened = text(await controller.explorer.command("examine gun"));
    const before: GameState = await spy.mock.results[1].value;
    expect(opened).toContain("NO SIGNAL");
    expect(opened).toContain("VIEW and WATCH disabled");
    expect(opened).toContain("Moves: 2");
    expectBrowserFeed(before, 0, opened);
    for (const input of ["view", "watch", "wait", "select 1", "view GelRound2", "examine cooler", "shoot cooler with gun"]) {
      expect(text(await controller.explorer.command(input))).toContain("Moves: 2");
    }
    expect(spy).toHaveBeenCalledTimes(2);
    expect(controller.capabilityDiagnostics!()).toEqual([]);
    await controller.explorer.command("close");
    await controller.explorer.command("inventory");
    expect(spy.mock.calls[2][0]).toEqual(before);
    const records = await overlayHistory(controller);
    expect(records.filter(entry => entry.kind === "command")).toHaveLength(11);
    expect(JSON.stringify(records)).not.toMatch(/activeGelCameras|itemState|camera-gun-viewer|currentViewIndex/);
  });

  it("uses ordinary ammo loading/shooting, reopens with multiple cameras, and preserves VIEW zero", async () => {
    const controller = overlaySession(fixture());
    const spy = vi.spyOn(engine, "handleCommand");
    await controller.start();
    await controller.explorer.command("take gun");
    expect(text(await controller.explorer.command("shoot cooler with gun"))).toContain("*Click*");
    for (const [color, round] of [["yellow", "GelRound2"], ["blue", "GelRound1"]]) {
      await controller.explorer.command(`take ${color} round`);
      expect(text(await controller.explorer.command(`load gun with ${color} round`))).toContain("You load the soft little projectile");
      expect(text(await controller.explorer.command("shoot cooler with gun"))).toContain("sticky little projectile adheres");
      const opened = text(await controller.explorer.command("examine gun"));
      expect(opened).toContain(`CAM: ${round}`);
      const state = await spy.mock.results.at(-1)!.value;
      expect(state.itemState.activeGelCameras[round]).toBe(true);
      expect(state.itemState.attachedTo[round]).toBe("Cooler");
      expect(state.itemState.containerContents.CameraGun).toEqual([]);
      expectBrowserFeed(state, 0, opened);
      await controller.explorer.command("close");
    }
    await controller.explorer.command("examine gun");
    // Existing nonzero mounted index models a persisted/stale host selection.
    useUIOverlayStore.getState().openOverlay({ kind: "camera-gun-viewer", currentViewIndex: 1 });
    expect(text(await controller.explorer.command("select 2"))).toContain("CAM: GelRound2");
    const calls = spy.mock.calls.length;
    for (let click = 0; click < 3; click++) expect(text(await controller.explorer.command("view"))).toContain("CAM: GelRound1");
    expect(spy).toHaveBeenCalledTimes(calls);
    expect(useUIOverlayStore.getState().overlay).toEqual({ kind: "camera-gun-viewer", currentViewIndex: 0 });
    expect((await dispatchAction(await spy.mock.results.at(-1)!.value, { verb: "cycleCameraGunView", payload: {} })).overlay).toEqual({ kind: "camera-gun-viewer", currentViewIndex: 0 });
  });

  it("cannot open the viewer remotely and retains the engine's existing access in darkness", async () => {
    let initial = remoteFixture();
    initial = updateItemLocation(initial, "CameraGun", "Kitchen");
    const controller = overlaySession(initial);
    const spy = vi.spyOn(engine, "handleCommand");
    await controller.start();
    for (const input of ["examine gun", "view", "watch", "view GelRound2"]) {
      const observed = text(await controller.explorer.command(input));
      expect(observed).not.toContain("GEL CAM VIEWER");
      expect(observed).not.toContain("CAM: GelRound2");
      expect(useUIOverlayStore.getState().overlay.kind).toBe("none");
    }
    expect(spy).toHaveBeenCalledTimes(4);
    await controller.dispose();
    const dark = fixture();
    dark.worldState.darkRooms.StairWellSeven = true;
    const other = overlaySession(dark);
    await other.start();
    await other.explorer.command("examine gun");
    expect(useUIOverlayStore.getState().overlay.kind).toBe("camera-gun-viewer");
  });

  it("matches React WATCH's complete ordinary wait state, hazards, timers and changing remote NPC feed", async () => {
    let initial = fixture();
    initial = updateItemLocation(initial, "cat", "LevelThreeCorridorSeven");
    initial = attachGelCameraToHost(initial, "GelRound2", "cat");
    initial.worldState.catState.settleTurns = 1; // Holds still for examine; WATCH moves it.
    initial = applyStatusEffectToPlayer(initial, "bleeding", 2, 4);
    const controller = overlaySession(initial);
    const spy = vi.spyOn(engine, "handleCommand");
    await controller.start();
    const opened = text(await controller.explorer.command("examine gun"));
    const before: GameState = await spy.mock.results[0].value;
    let browserState = before;
    let browserIndex = 1;
    function Browser() {
      const [state, setState] = useState(before);
      const [index, setIndex] = useState(1);
      return <CameraGunViewerModal state={state} currentView={index} onClose={() => {}} onCycleView={value => {
        browserIndex = value;
        setIndex(value);
      }} onRunCommand={async command => {
        const result = await dispatchAction(browserState, { verb: "command", payload: { input: command } });
        browserState = reconcileObjectives(browserState, result.state);
        setState(browserState);
      }} />;
    }
    const browser = render(<Browser />);
    expect(opened).toContain(cameraGunViewer(before, 0).description);
    fireEvent.click(screen.getByRole("button", { name: "View next camera" }));
    await controller.explorer.command("view");
    expect(browserIndex).toBe(0);
    for (const input of ["view", "select -1", "wait", "shoot cat with gun"]) await controller.explorer.command(input);
    expect(spy).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Watch (wait one turn)" }));
    await waitFor(() => expect(browserState.moves).toBe(before.moves + 1));
    const watched = text(await controller.explorer.command("watch"));
    expect(watched).toContain(screen.getByLabelText("Camera feed text").querySelector("pre")!.textContent!);
    expect(watched).toContain("> wait");
    expect(watched).toContain("Moves: 2");
    expect(browserState.itemState.itemRoomId.cat).not.toBe(before.itemState.itemRoomId.cat);
    expect(browserState.player.vitals.health).toBe(before.player.vitals.health - 2);
    expect(browserState.player.statusEffects.find(effect => effect.id === "bleeding")!.remainingTurns).toBe(2);
    expect(browserState.player.roomId).toBe("StairWellSeven");
    expect(browserState.worldState.visitedRooms).toEqual(before.worldState.visitedRooms);
    browser.unmount();
    await controller.explorer.command("close");
    await controller.explorer.command("inventory");
    expect(spy.mock.calls.at(-1)![0]).toEqual(browserState);
    expect(spy.mock.calls[2][1]).toEqual(parseCommand("wait"));
    const records = await overlayHistory(controller);
    expect(records.find(entry => entry.input === "watch")!.observation.text.join("\n\n")).toBe(watched);
  });

  it("refreshes attachment/location when an attached camera's real host dissolves during WATCH", async () => {
    let initial = fixture();
    initial = attachGelCameraToHost(initial, "GelRound2", "seed");
    initial.world.items = initial.world.items.map(item => item.id === "seed" ? { ...item, meta: { ...item.meta, playerHusk: { number: 8, turnsRemaining: 2 } } } : item);
    const controller = overlaySession(initial);
    const spy = vi.spyOn(engine, "handleCommand");
    await controller.start();
    expect(text(await controller.explorer.command("examine gun"))).not.toContain("UNKNOWN LOCATION");
    const watched = text(await controller.explorer.command("watch"));
    expect(watched).toContain("dissolves into nothing");
    expect(watched).toContain("CAM: GelRound2");
    expect(watched).toContain("BOTTOM OF STAIRWELL");
    const after: GameState = await spy.mock.results[1].value;
    expectBrowserFeed(after, 0, watched);
    expect(after.itemState.activeGelCameras.GelRound2).toBe(true);
    expect(after.world.items.find(item => item.id === "seed")).toBeUndefined();
    expect(after.itemState.attachedTo.GelRound2).toBeUndefined();
    expect(text(await controller.explorer.command("view"))).toContain("BOTTOM OF STAIRWELL");
    expect(text(await controller.explorer.command("watch"))).toContain("Moves: 3");
  });

  it("uses infrared remote descriptions without disclosing closed contents, hidden exits or state", async () => {
    let initial = remoteFixture();
    initial = updateItemLocation(initial, "GelRound3", "Cooler");
    initial.itemState.containerContents.Cooler = ["GelRound3"];
    initial.itemState.openItems.Cooler = false;
    initial.worldState.darkRooms.LivingQuartersSixEast = true;
    expect(buildRoomDescription(initial, "LivingQuartersSixEast")).toContain("pitch black");
    const controller = overlaySession(initial);
    const spy = vi.spyOn(engine, "handleCommand");
    await controller.start();
    const opened = text(await controller.explorer.command("examine gun"));
    const before: GameState = await spy.mock.results[0].value;
    expect(opened).toContain("faintly red-tinged light");
    expect(opened).not.toContain("red projectile round");
    expectBrowserFeed(before, 0, opened);
    for (const input of ["view", "select LivingQuartersSixEast", "select LevelThreeSecretRoom", "view 2"]) await controller.explorer.command(input);
    await controller.explorer.command("close");
    await controller.explorer.command("inventory");
    expect(spy.mock.calls[1][0]).toEqual(before);
    expect(before.worldState.darkRooms.LivingQuartersSixEast).toBe(true);
    expect(before.worldState.visitedRooms.LivingQuartersSixEast).toBeFalsy();
    const outputs = (await overlayHistory(controller)).map(entry => entry.observation.text.join("\n")).join("\n");
    // Inputs may contain arbitrary IDs; observations never project those inputs' data.
    expect(outputs).not.toMatch(/itemRoomId|activeGelCameras|darkRooms|visitedRooms|powerRestoredSections/);
    expect(opened).not.toMatch(/LivingQuartersSixEast|LevelThreeSecretRoom|GelRound3/);
  });

  it("clears mounted index on reopen/reset/disposal and applies close effects once", async () => {
    const controller = overlaySession(remoteFixture());
    await controller.start();
    await controller.explorer.command("examine gun");
    useUIOverlayStore.getState().openOverlay({ kind: "camera-gun-viewer", currentViewIndex: 9, postCloseMessage: "Viewer closed message.", postCloseNotifications: [{ kind: "gossip", text: "Viewer closed notification." }] });
    const closed = text(await controller.explorer.command("close"));
    expect(closed.split("Viewer closed message.")).toHaveLength(2);
    expect(closed.split("Viewer closed notification.")).toHaveLength(2);
    expect(text(await controller.explorer.command("watch"))).not.toContain("GEL CAM VIEWER");
    await controller.explorer.command("examine gun");
    expect(useUIOverlayStore.getState().overlay).toMatchObject({ currentViewIndex: 0 });
    vi.mocked(gameInit.createFreshGameState).mockResolvedValueOnce(fixture());
    await controller.reset();
    expect(useUIOverlayStore.getState().overlay.kind).toBe("none");
    expect(text(await controller.explorer.command("examine gun"))).toContain("VIEW and WATCH disabled");
    await controller.dispose();
    expect(useUIOverlayStore.getState().overlay.kind).toBe("none");
    await expect(controller.explorer.command("watch")).rejects.toThrow("closed");
    expect((await overlayHistory(controller)).at(-1)!.kind).toBe("end");
  });

  it("retains the production's initially active undeployed round", async () => {
    const initial = overlayFixture(["CameraGun"]);
    expect(initial.itemState.activeGelCameras.GelRound1).toBe(true);
    const controller = overlaySession(initial);
    await controller.start();
    const opened = text(await controller.explorer.command("examine gun"));
    expect(opened).toContain("CAM: GelRound1");
    expect(opened).toContain("Use view, watch (wait one turn), or close.");
  });

  it("serializes repeated WATCH turns before disposal and retains output at the game log cap", async () => {
    const initial = remoteFixture();
    initial.log = Array.from({ length: 500 }, (_, index) => `Prior log ${index}`);
    const controller = overlaySession(initial);
    const spy = vi.spyOn(engine, "handleCommand");
    await controller.start();
    await controller.explorer.command("examine gun");
    const first = controller.explorer.command("watch");
    const second = controller.explorer.command("watch");
    const disposal = controller.dispose();
    expect(text(await first)).toContain("You wait for a bit.");
    expect(text(await second)).toContain("Moves: 3");
    await disposal;
    expect(spy).toHaveBeenCalledTimes(3);
    expect((await spy.mock.results[2].value).log).toHaveLength(500);
    const records = await overlayHistory(controller);
    expect(records.map(entry => entry.kind)).toEqual(["start", "command", "command", "command", "end"]);
    for (const record of records.filter(entry => entry.input === "watch")) expect(record.observation.text.join("\n")).toContain("You wait for a bit.");
    expect(useUIOverlayStore.getState().overlay.kind).toBe("none");
  });

  it("retains agent explanations, request order and complete JSONL for VIEW/WATCH/close", async () => {
    const controller = overlaySession(remoteFixture());
    const commands = ["examine gun", "view", "watch", "close", "inventory"];
    const requests: MessageCreateParamsNonStreaming[] = [];
    let turn = 0;
    const client = { messages: {
      countTokens: vi.fn(async () => ({ input_tokens: 100 })),
      create: vi.fn(async (request: MessageCreateParamsNonStreaming) => {
        requests.push(request);
        const command = commands[turn++];
        return {
          content: [{ type: "text", text: `Camera action explanation ${turn}: ${command}.`, citations: null }, { type: "tool_use", id: `camera_${turn}`, name: "game_command", input: { command } }],
          stop_reason: "tool_use", usage: { input_tokens: 100, output_tokens: 20, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 },
        } as Message;
      }),
    } };
    const run = await runHeadlessAgent({ client, session: controller, options: { maxActions: commands.length } });
    expect(run.reason).toBe("action_limit");
    expect(run.events.map(event => event.request)).toEqual(commands);
    expect(run.events[2].text.join("\n")).toContain("Moves: 2");
    expect(JSON.stringify(requests[3].messages)).toContain("Camera action explanation 3: watch.");
    const records = await overlayHistory(controller);
    expect(records.filter(entry => entry.kind === "command").map(entry => entry.input)).toEqual(commands);
    expect(records.filter(entry => entry.kind === "command").map(entry => entry.observation.text)).toEqual(run.events.map(event => event.text));
    expect(run.capabilityDiagnostics).toEqual([]);
    expect(records.at(-1)!.kind).toBe("end");
  });
});

describe("shared camera viewer selection and location", () => {
  it("refreshes headless selection and disabled guards when the selected active flag disappears", async () => {
    let state = attachGelCameraToHost(remoteFixture(), "GelRound1", "PLAYER");
    const overlay = { kind: "camera-gun-viewer", currentViewIndex: 1 } as const;
    useUIOverlayStore.getState().openOverlay(overlay);
    expect(cameraGunPresentation(state, overlay)).toContain("CAM: GelRound2");
    state = { ...state, itemState: { ...state.itemState, activeGelCameras: { GelRound2: false, GelRound1: true } } };
    expectBrowserFeed(state, 1, cameraGunPresentation(state, overlay));
    expect(cameraGunPresentation(state, overlay)).toContain("CAM: GelRound1");
    state = { ...state, itemState: { ...state.itemState, activeGelCameras: {} } };
    for (const input of ["view", "watch", "select 1"]) {
      const result = await cameraGunCommand(state, overlay, input);
      expect(result.wait).toBe(false);
      expect(result.state).toBe(state);
      expect(result.text.join("\n")).toContain("VIEW and WATCH disabled");
    }
    expect(useUIOverlayStore.getState().overlay).toEqual(overlay);
  });

  it.each([0, 1, 2, -1, 19])("matches the rendered selection at wrapped index %s and reacts to camera removal", index => {
    let state = remoteFixture();
    state = attachGelCameraToHost(state, "GelRound1", "PLAYER");
    const view = cameraGunViewer(state, index);
    const rendered = render(<CameraGunViewerModal state={state} currentView={index} onClose={() => {}} onCycleView={() => {}} onRunCommand={() => {}} />);
    expect(rendered.container.querySelector(".cgv-status")!.getAttribute("title")).toBe(view.statusLine);
    expect(screen.getByLabelText("Camera feed text").querySelector("pre")!.textContent).toBe(view.description);
    state = { ...state, itemState: { ...state.itemState, activeGelCameras: { GelRound2: false, GelRound1: true } } };
    rendered.rerender(<CameraGunViewerModal state={state} currentView={index} onClose={() => {}} onCycleView={() => {}} onRunCommand={() => {}} />);
    expect(cameraGunViewer(state, index).selectedCameraId).toBe("GelRound1");
    expect(rendered.container.querySelector(".cgv-status")!.getAttribute("title")).toBe(cameraGunViewer(state, index).statusLine);
  });

  it("resolves attachment chains before live locations, contained/carried/seed locations, and cycles safely", () => {
    let state = remoteFixture();
    state.itemState.itemRoomId.GelRound2 = "Kitchen";
    expect(resolveCameraRoomId(state, "GelRound2")).toBe("LivingQuartersSixEast");
    state = updateItemLocation(state, "Cooler", "INVENTORY");
    expect(resolveCameraRoomId(state, "GelRound2")).toBe(state.player.roomId);
    state.itemState.attachedTo.GelRound2 = "GelRound1";
    state.itemState.attachedTo.GelRound1 = "GelRound2";
    expect(resolveCameraRoomId(state, "GelRound2")).toBeUndefined();
    delete state.itemState.attachedTo.GelRound2;
    state.itemState.itemRoomId.GelRound2 = "Cooler";
    expect(resolveCameraRoomId(state, "GelRound2")).toBe(state.player.roomId);
    delete state.itemState.itemRoomId.GelRound2;
    state.world.items = state.world.items.map(item => item.id === "GelRound2" ? { ...item, location: "Kitchen" } : item);
    expect(resolveCameraRoomId(state, "GelRound2")).toBe("Kitchen");
    expect(resolveCameraRoomId(state, "unavailable")).toBeUndefined();
    expect(getCameraFeedDescription(state, undefined)).toContain("only static");
  });

  it("retains active-but-unresolved and missing-item behavior, without enabling unrendered selection controls", () => {
    const state = fixture();
    state.itemState.activeGelCameras = { GelRound2: true };
    state.itemState.itemRoomId.GelRound2 = "missing host";
    const rendered = render(<CameraGunViewerModal state={state} currentView={0} onClose={() => {}} onCycleView={() => {}} />);
    expect(cameraGunViewer(state, 0).statusLine).toContain("UNKNOWN LOCATION");
    expect(screen.getByRole("button", { name: "View next camera" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Watch (wait one turn)" })).toBeDisabled();
    state.world.items = state.world.items.filter(item => item.id !== "GelRound2");
    expect(cameraGunViewer(state, 0).description).toContain("only static");
    rendered.unmount();
    state.itemState.activeGelCameras = {};
    render(<CameraGunViewerModal state={state} currentView={0} onClose={() => {}} onCycleView={() => {}} onRunCommand={() => {}} />);
    expect(screen.getByRole("button", { name: "View next camera" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Watch (wait one turn)" })).toBeDisabled();
  });
});
