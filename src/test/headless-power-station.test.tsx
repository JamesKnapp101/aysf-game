import { fireEvent, render, screen } from "@testing-library/react";
import { useCallback, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { PowerStationTerminalModal } from "../game/components/PowerStationTerminalModal";
import * as engine from "../game/engine/handleCommand";
import * as gameInit from "../game/gameInit";
import { reconcileObjectives } from "../game/rules/objectives";
import { activatePowerSwitch, buildInitialSwitchStates, POWER_GRID_ROOT, synchronizePowerTerminal } from "../game/rules/powerStationTerminal";
import { useUIOverlayStore } from "../game/store/store";
import type { GameState } from "../game/types/gameTypes";
import { overlayFixture, overlayHistory, overlaySession, observationText as text } from "./helpers/headlessOverlayHelpers";

function fixture(powered = true) {
  const state = overlayFixture(["PowerStationMonitor"]);
  state.worldState.powerRestoredSections["power-initialized"] = powered;
  return state;
}

describe("mounted power distribution", () => {
  it("requires power to open, with unchanged ordinary opening costs", async () => {
    const controller = overlaySession(fixture(false));
    await controller.start();
    const failed = text(await controller.explorer.command("examine monitor"));
    expect(failed).toContain("currently dark");
    expect(failed).toContain("Moves: 1");
    expect(useUIOverlayStore.getState().overlay.kind).toBe("none");
    expect(controller.capabilityDiagnostics!()).toEqual([]);
  });

  it("shows only current menu children and validates numbered rows", async () => {
    const controller = overlaySession(fixture());
    const spy = vi.spyOn(engine, "handleCommand");
    await controller.start();
    const root = text(await controller.explorer.command("examine monitor"));
    expect(root).toContain("Main Power Distribution");
    expect(root).toContain("1. TELEPORTATION");
    expect(root).not.toMatch(/Green Network|Engine Core Power Lock|Lvl5Lights|TPADPOWER/);
    expect(root).toContain("Moves: 1");
    for (const input of ["select 0", "select 99", "toggle Lvl5Lights", "select -1", "wait"]) {
      const invalid = text(await controller.explorer.command(input));
      expect(invalid).toContain("1. TELEPORTATION");
      expect(invalid).not.toContain("Green Network");
    }
    const next = text(await controller.explorer.command("select 1"));
    expect(next).toContain("Main Power Distribution / TELEPORTATION");
    expect(next).toContain("Green Network:");
    expect(next).not.toContain("Artificial Gravity Field");
    expect(text(await controller.explorer.command("back"))).toContain("1. TELEPORTATION");
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("retains LOCKED/FAIL rows and does not toggle static or restricted switches", async () => {
    const controller = overlaySession(fixture());
    const spy = vi.spyOn(engine, "handleCommand");
    await controller.start();
    await controller.explorer.command("examine monitor");
    const before = await spy.mock.results[0].value;
    const levelOne = text(await controller.explorer.command("select 2"));
    expect(levelOne).toContain("Main Shields: LOCKED");
    expect(levelOne).toContain("Elevators: FAIL");
    expect(levelOne).not.toContain("Bridge access only");
    await controller.explorer.command("select 3");
    await controller.explorer.command("select 4");
    await controller.explorer.command("close");
    await controller.explorer.command("inventory");
    expect(spy.mock.calls[1][0]).toEqual(reconcileObjectives(before, synchronizePowerTerminal(before, buildInitialSwitchStates(before.worldState))));
  });

  it("matches browser mount synchronization and propagates switch changes to global power", async () => {
    const initial = fixture();
    for (const section of ["teleport-pads-yellow", "gravity-level-five", "lights-level-five", "engine-room-power-lock", "loading-dock-door", "loading-grid"]) {
      (initial.worldState.powerRestoredSections as Record<string, boolean>)[section] = false;
    }
    const controller = overlaySession(initial);
    const spy = vi.spyOn(engine, "handleCommand");
    await controller.start();
    await controller.explorer.command("examine monitor");
    const before = await spy.mock.results[0].value;
    let browserState = before;
    function Browser() {
      const [state, setState] = useState(before);
      const apply = useCallback((updater: (previous: GameState) => GameState) => setState((previous: GameState) => {
        browserState = reconcileObjectives(previous, updater(previous));
        return browserState;
      }), []);
      return <PowerStationTerminalModal state={state} onClose={() => {}} setGameState={apply} />;
    }
    render(<Browser />);
    const operations = [
      ["select 1", /^TELEPORTATION/], ["select 4", /Yellow Network/], ["back", /^BACK/],
      ["select 6", /LEVEL FIVE/], ["select 1", /Artificial Gravity Field/], ["select 2", /Level Five Lights/], ["select 3", /Engine Core Power Lock/], ["back", /^BACK/],
      ["select 7", /LEVEL SIX/], ["select 3", /Loading Dock Door/], ["select 4", /Loading Grid/],
    ] as const;
    for (const [input, label] of operations) {
      fireEvent.click(screen.getByRole("option", { name: label }));
      const response = text(await controller.explorer.command(input));
      expect(response).toContain("Moves: 1");
    }
    await controller.explorer.command("close");
    await controller.explorer.command("inventory");
    expect(spy.mock.calls[1][0]).toEqual(browserState);
    for (const section of ["teleport-pads-yellow", "gravity-level-five", "lights-level-five", "engine-room-power-lock", "loading-dock-door", "loading-grid"]) {
      expect((browserState.worldState.powerRestoredSections as Record<string, boolean>)[section]).toBe(true);
    }
    expect(text(await controller.explorer.command("examine monitor"))).not.toContain("Loading Grid");
    expect(text(await controller.explorer.command("select 6"))).toContain("Level Five Lights: ON");
    const history = await overlayHistory(controller);
    expect(history.filter(entry => entry.kind === "command")).toHaveLength(operations.length + 5);
    expect(JSON.stringify(history)).not.toMatch(/powerRestoredSections|power_grid_menu|TPADPOWER|Lvl5Lights/);
  });

  it("clears navigation on reset and cannot toggle after close", async () => {
    const controller = overlaySession(fixture());
    const spy = vi.spyOn(engine, "handleCommand");
    await controller.start();
    await controller.explorer.command("examine monitor");
    await controller.explorer.command("select 6");
    await controller.explorer.command("select 2");
    await controller.explorer.command("close");
    await controller.explorer.command("select 2");
    expect(spy).toHaveBeenCalledTimes(2);
    vi.mocked(gameInit.createFreshGameState).mockResolvedValueOnce(fixture());
    await controller.reset();
    expect(useUIOverlayStore.getState().overlay.kind).toBe("none");
    expect(text(await controller.explorer.command("examine monitor"))).toContain("1. TELEPORTATION");
    expect(text(await controller.explorer.command("select 6"))).toContain("Level Five Lights: OFF");
  });

  it("keeps unmapped switch state local and preserves restricted activation", () => {
    const state = fixture();
    const local = { id: "browser-local-switch", kind: "switch" as const, label: "Local switch" };
    const toggled = activatePowerSwitch(local, { [local.id]: "off" });
    expect(toggled[local.id]).toBe("on");
    expect(synchronizePowerTerminal(state, toggled)).toBe(state);
    for (const status of ["locked", "failure"] as const) {
      const switches = { [local.id]: status };
      expect(activatePowerSwitch(local, switches)).toBe(switches);
    }
    const staticNode = POWER_GRID_ROOT.children.find(node => node.id === "lvl1")!;
    if (staticNode.kind !== "menu") throw new Error("Missing authored menu.");
    const shields = staticNode.children.find(node => node.id === "Lvl1Sheilds")!;
    expect(activatePowerSwitch(shields, toggled)).toBe(toggled);
  });
});
