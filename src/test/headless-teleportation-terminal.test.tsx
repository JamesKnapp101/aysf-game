import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { StrictMode, useEffect, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { TeleportationTerminalModal } from "../game/components/TeleportationTerminalModal";
import * as engine from "../game/engine/handleCommand";
import * as gameInit from "../game/gameInit";
import { reconcileObjectives } from "../game/rules/objectives";
import { prepareTerminalTeleport, terminalDestinations, RINGS } from "../game/rules/teleportationTerminal";
import { useUIEffectsStore, useUIOverlayStore } from "../game/store/store";
import * as world from "../world/World";
import { setInventory } from "./helpers/gameTestHelpers";
import { overlayFixture, overlayHistory, overlaySession, observationText as text } from "./helpers/headlessOverlayHelpers";

const loadChunk = world.loadWorldChunk;
function fixture(badges: string[] = ["bluebadge"]) {
  const state = setInventory(overlayFixture(["TelepadTerminal"]), badges);
  for (const ring of RINGS) (state.worldState.powerRestoredSections as Record<string, boolean>)[ring.sectionKey] = true;
  return state;
}
function withoutLab(state = fixture()) {
  return { ...state, world: { ...state.world, rooms: state.world.rooms.filter(room => room.id !== "Lab") } };
}

describe("mounted headless translocation terminal", () => {
  it("projects exactly the browser destination matrix with no internal destinations or authorization data", async () => {
    const initial = fixture([]);
    initial.worldState.powerRestoredSections["teleport-pads-violet"] = false;
    const controller = overlaySession(initial);
    await controller.start();
    const opened = text(await controller.explorer.command("use terminal"));
    expect(opened).toContain("OMNI JAUNT");
    expect(opened).toContain("Moves: 1");
    render(<TeleportationTerminalModal state={initial} setGameState={() => {}} onClose={() => {}} />);
    for (const [index, destination] of terminalDestinations(initial).entries()) {
      expect(opened).toContain(`${index + 1}. ${destination.ringLabel}: ${destination.online ? "ONLINE" : "OFFLINE"} — ${destination.label}`);
      expect((screen.getByRole("button", { name: destination.label }) as HTMLButtonElement).disabled).toBe(!destination.online);
    }
    for (const hidden of ["UnderWebOne", "BotanicalOne", "DeepStorageGrid", "RemoteMedicalOne", "XenobiologyLab", "bluebadge", "ultravioletbadge", "fallbackRequiredBadgeIds"]) expect(opened).not.toContain(hidden);
    for (const input of ["select 0", "select 99", "select Lab", "teleport Lab", "wait", "select -1"]) {
      expect(text(await controller.explorer.command(input))).toContain("RING DESTINATION MATRIX");
    }
    expect(controller.capabilityDiagnostics!()).toEqual([]);
  });

  it.each([false, true])("matches authorized/unauthorized browser travel with badge %s", async authorized => {
    const controller = overlaySession(fixture(authorized ? ["bluebadge"] : []));
    const spy = vi.spyOn(engine, "handleCommand");
    await controller.start();
    await controller.explorer.command("examine terminal");
    const before = await spy.mock.results[0].value;
    const response = text(await controller.explorer.command("select 4"));
    expect(response).toContain(authorized ? "tingling in your belly" : '"Unauthorized."');
    expect(response).toContain("Moves: 1");
    expect(useUIOverlayStore.getState().overlay.kind).toBe(authorized ? "none" : "teleportation-terminal");
    expect(useUIEffectsStore.getState().teleportFlashNonce).toBe(authorized ? 1 : 0);
    if (!authorized) await controller.explorer.command("close");
    await controller.explorer.command("inventory");
    const actual = spy.mock.calls[1][0];
    let browserState = before;
    const closed = vi.fn();
    useUIEffectsStore.setState({ teleportFlashNonce: 0 });
    render(<TeleportationTerminalModal state={before} setGameState={updater => {
      const previous = browserState;
      const next = typeof updater === "function" ? updater(previous) : updater;
      browserState = reconcileObjectives(previous, next, { fromRoomId: previous.player.roomId, toRoomId: next.player.roomId });
    }} onClose={closed} />);
    fireEvent.click(screen.getByRole("button", { name: "Medical Lab" }));
    await waitFor(() => expect(browserState).toEqual(actual));
    expect(closed).toHaveBeenCalledTimes(authorized ? 1 : 0);
    expect(useUIEffectsStore.getState().teleportFlashNonce).toBe(authorized ? 1 : 0);
    expect(actual.moves).toBe(1);
    if (authorized) {
      expect(actual.player.roomId).toBe("Lab");
      expect(actual.worldState.visitedRooms.Lab).toBe(true);
      expect(actual.player.recentMoves?.[0]).toMatchObject({ fromRoomId: before.player.roomId, toRoomId: "Lab", atTurn: 1 });
    }
    const records = await overlayHistory(controller);
    expect(text(records[2].observation)).toBe(response);
    expect(JSON.stringify(records)).not.toMatch(/teleportation-terminal|ringId|roomId|recentMoves|powerRestoredSections/);
  });

  it("leaves offline destinations disabled even with a badge, without preparing a room", async () => {
    const initial = fixture();
    initial.worldState.powerRestoredSections["teleport-pads-blue"] = false;
    const controller = overlaySession(initial);
    const loader = vi.spyOn(world, "loadWorldChunk");
    const spy = vi.spyOn(engine, "handleCommand");
    await controller.start();
    await controller.explorer.command("use terminal");
    const before = await spy.mock.results[0].value;
    expect(text(await controller.explorer.command("select 4"))).toContain("MEDICAL: OFFLINE");
    expect(loader).not.toHaveBeenCalled();
    await controller.explorer.command("close");
    await controller.explorer.command("inventory");
    expect(spy.mock.calls[1][0]).toEqual(before);
  });

  it("hydrates a missing endpoint before travel and retains production room-entry/oxygen effects", async () => {
    const initial = withoutLab();
    initial.player.vitals.oxygen = 45;
    const controller = overlaySession(initial);
    const spy = vi.spyOn(engine, "handleCommand");
    const loader = vi.spyOn(world, "loadWorldChunk");
    await controller.start();
    await controller.explorer.command("use terminal");
    const before = await spy.mock.results[0].value;
    const reference = (await prepareTerminalTeleport(before, "medical", "Lab")).complete(before);
    loader.mockClear();
    const response = text(await controller.explorer.command("select 4"));
    expect(loader).toHaveBeenCalledExactlyOnceWith("level-two");
    expect(response).not.toContain("undefined");
    expect(response).toContain("Lab");
    await controller.explorer.command("inventory");
    const after = spy.mock.calls[1][0];
    expect(after).toEqual(reconcileObjectives(before, reference.state, { fromRoomId: before.player.roomId, toRoomId: reference.state.player.roomId }));
    expect(after.world.rooms.some(room => room.id === "Lab")).toBe(true);
    expect(after.player.vitals.oxygen).toBe(reference.state.player.vitals.oxygen);
    expect(after.player.recentMoves).toHaveLength((before.player.recentMoves?.length ?? 0) + 1);
  });

  it("preserves badge metadata and alternative badge authorization", async () => {
    for (const badge of ["maroonbadge", "ultravioletbadge"]) {
      const initial = fixture([badge]);
      const result = (await prepareTerminalTeleport(initial, "medical", "Lab")).complete(initial);
      expect(result.teleported).toBe(true);
      expect(result.state.player.inventory.badges).toContain(badge);
    }
    const initial = fixture(["bluebadge"]);
    initial.world.items = initial.world.items.map(item => item.location === "TPADTerminal" && item.meta?.teleport?.section === "teleport-pads-blue" && item.meta?.teleport?.order === 1
      ? { ...item, meta: { ...item.meta, teleport: { ...item.meta.teleport, requires: ["greenbadge"] } } } : item);
    expect((await prepareTerminalTeleport(initial, "medical", "Lab")).complete(initial).teleported).toBe(false);
  });

  it.each(["badge", "power", "location"])("rechecks %s immediately before committing a prepared transition", async prerequisite => {
    const initial = fixture();
    const prepared = await prepareTerminalTeleport(initial, "medical", "Lab");
    const latest = prerequisite === "badge" ? setInventory(initial, []) : { ...initial, player: { ...initial.player }, worldState: { ...initial.worldState, powerRestoredSections: { ...initial.worldState.powerRestoredSections } } };
    if (prerequisite === "power") latest.worldState.powerRestoredSections["teleport-pads-blue"] = false;
    if (prerequisite === "location") latest.player.roomId = "Kitchen";
    const result = prepared.complete(latest);
    expect(result.teleported).toBe(false);
    expect(result.state.player.roomId).toBe(latest.player.roomId);
    expect(result.state.worldState.visitedRooms.Lab).toBe(latest.worldState.visitedRooms.Lab);
    if (prerequisite === "badge") expect(result.messages.join("\n")).toContain('"Unauthorized."');
    else expect(result.state).toBe(latest);
  });

  it("keeps the interface open on missing endpoints and preparation failure, without debug leakage", async () => {
    const chunk = await loadChunk("level-two");
    const controller = overlaySession(withoutLab());
    const spy = vi.spyOn(engine, "handleCommand");
    const loader = vi.spyOn(world, "loadWorldChunk");
    await controller.start();
    await controller.explorer.command("use terminal");
    loader.mockResolvedValueOnce({ ...chunk, rooms: chunk.rooms.filter(room => room.id !== "Lab") });
    const missing = text(await controller.explorer.command("select 4"));
    expect(missing).toContain("That endpoint is not responding.");
    expect(useUIOverlayStore.getState().overlay.kind).toBe("teleportation-terminal");
    loader.mockRejectedValueOnce(new Error("PRIVATE_PREPARATION_ERROR"));
    const failed = text(await controller.explorer.command("select 4"));
    expect(failed).toContain("RING DESTINATION MATRIX");
    expect(failed).not.toMatch(/PRIVATE_PREPARATION_ERROR|needs a headless gameplay adapter/);
    expect(useUIEffectsStore.getState().teleportFlashNonce).toBe(0);
    await controller.explorer.command("close");
    await controller.explorer.command("inventory");
    expect(spy.mock.calls[1][0].player.roomId).toBe("StairWellSeven");
  });

  it("cancels browser travel when closed during preparation and ignores a duplicate pending click", async () => {
    let state = withoutLab();
    let release!: () => void;
    const barrier = new Promise<void>(resolve => { release = resolve; });
    const loader = vi.spyOn(world, "loadWorldChunk").mockImplementationOnce(async chunkId => {
      await barrier;
      return loadChunk(chunkId);
    });
    const close = vi.fn();
    render(<TeleportationTerminalModal state={state} onClose={close} setGameState={updater => { state = typeof updater === "function" ? updater(state) : updater; }} />);
    fireEvent.click(screen.getByRole("button", { name: "Medical Lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Medical Lab" }));
    await waitFor(() => expect(loader).toHaveBeenCalledTimes(1));
    fireEvent.keyDown(window, { key: "Escape" });
    release();
    await waitFor(() => expect(loader.mock.results[0].value).resolves.toBeTruthy());
    expect(state.player.roomId).toBe("StairWellSeven");
    expect(close).toHaveBeenCalledTimes(1);
    expect(useUIEffectsStore.getState().teleportFlashNonce).toBe(0);
  });

  it("completes flash/close once with a real React setter under StrictMode", async () => {
    let state = fixture();
    const close = vi.fn();
    function Browser() {
      const [current, setCurrent] = useState(state);
      useEffect(() => { state = current; }, [current]);
      return <TeleportationTerminalModal state={current} setGameState={setCurrent} onClose={close} />;
    }
    render(<StrictMode><Browser /></StrictMode>);
    fireEvent.click(screen.getByRole("button", { name: "Medical Lab" }));
    await waitFor(() => expect(state.player.roomId).toBe("Lab"));
    expect(close).toHaveBeenCalledTimes(1);
    expect(useUIEffectsStore.getState().teleportFlashNonce).toBe(1);
    expect(state.log.filter(line => line.includes("tingling in your belly"))).toHaveLength(1);
  });

  it("resets mounted selection and cannot travel remotely after successful completion", async () => {
    const controller = overlaySession(fixture());
    const spy = vi.spyOn(engine, "handleCommand");
    await controller.start();
    await controller.explorer.command("use terminal");
    await controller.explorer.command("select 4");
    await controller.explorer.command("select 5");
    expect(spy.mock.calls[1][0].player.roomId).toBe("Lab");
    vi.mocked(gameInit.createFreshGameState).mockResolvedValueOnce(fixture());
    await controller.reset();
    expect(useUIOverlayStore.getState().overlay.kind).toBe("none");
    expect(text(await controller.explorer.command("use terminal"))).toContain("1. BOTANICAL");
  });
});
