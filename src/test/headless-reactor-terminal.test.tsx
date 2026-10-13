import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { ReactorControlTerminalModal } from "../game/components/ReactorControlTerminalModal";
import * as engine from "../game/engine/handleCommand";
import * as gameInit from "../game/gameInit";
import { reconcileObjectives } from "../game/rules/objectives";
import { useUIOverlayStore } from "../game/store/store";
import type { GameState } from "../game/types/gameTypes";
import { setReactorLobeStatus } from "../world/maps/levelFive/reactorConsensus";
import { ENGINE_ROOM_KEY_ID, installReplacementLobe, REACTOR_RESTARTED_TRIGGER, REACTOR_KEY_SLOT_ID, REACTOR_KEY_TURNED_TRIGGER, REACTOR_TERMINAL_AUTH_TRIGGER } from "../world/maps/levelFive/reactorSystems";
import { operateReactorTerminal } from "../world/maps/levelFive/reactorTerminal";
import { setInventory } from "./helpers/gameTestHelpers";
import { overlayFixture, overlayHistory, overlaySession, observationText as text } from "./helpers/headlessOverlayHelpers";

const credential = "3thiC4L";
function fixture(withKey = false, withLobe = false) {
  let state = setInventory(overlayFixture(["ReactorControlTerminal"]), withKey ? [ENGINE_ROOM_KEY_ID, "ReplacementReactorLobe"] : []);
  if (withLobe) state = installReplacementLobe(setReactorLobeStatus(state, "reactor-lobe-13", "missing")).state;
  return state;
}

describe("mounted reactor control terminal", () => {
  it("shows only the login screen and blocks key/restart functions before authentication", async () => {
    const controller = overlaySession(fixture(true, true));
    const spy = vi.spyOn(engine, "handleCommand");
    await controller.start();
    const opened = text(await controller.explorer.command("examine reactor terminal"));
    expect(opened).toContain("AWAITING ETHICS CREDENTIAL");
    expect(opened).not.toContain(credential);
    expect(opened).not.toMatch(/ENGINE ROOM KEY:|REACTOR CORE:|Use insert|Use turn|Use restart/);
    const before = await spy.mock.results[0].value;
    for (const input of ["insert", "turn", "restart", "wait", "authenticate 3THIC4L", "authenticate", `authenticate ${credential} `,
      `authenticate the ${credential}`, `authenticate a ${credential}`, `authenticate an ${credential}`]) {
      const response = text(await controller.explorer.command(input));
      expect(response).not.toContain("ETHICS CREDENTIAL: ACCEPTED");
      expect(response).toContain("Moves: 1");
    }
    await controller.explorer.command("close");
    await controller.explorer.command("inventory");
    expect(spy.mock.calls[1][0]).toEqual(before);
  });

  it("preserves failed login and missing-key messages as local terminal output", async () => {
    const controller = overlaySession(fixture());
    const spy = vi.spyOn(engine, "handleCommand");
    await controller.start();
    await controller.explorer.command("examine reactor terminal");
    expect(text(await controller.explorer.command("authenticate wrong"))).toContain("ACCESS DENIED — INVALID ETHICS CREDENTIAL.");
    const loggedIn = text(await controller.explorer.command(`authenticate ${credential}`));
    expect(loggedIn).toContain("ETHICS CREDENTIAL: ACCEPTED");
    expect(loggedIn).toContain("ENGINE ROOM KEY: MISSING");
    expect(loggedIn).toContain("Use insert");
    expect(loggedIn).not.toContain("Use restart");
    expect(text(await controller.explorer.command("insert"))).toContain("You do not have the Engine Room Key.");
    await controller.explorer.command("close");
    await controller.explorer.command("inventory");
    const after = spy.mock.calls[1][0];
    expect(after.worldState.conditionalTriggers[REACTOR_TERMINAL_AUTH_TRIGGER]).toBe(true);
    expect(after.log.join("\n")).not.toMatch(/ACCESS DENIED|ACCESS GRANTED|do not have the Engine Room Key/);
    expect(text(await controller.explorer.command("examine reactor terminal"))).toContain("ETHICS CREDENTIAL: ACCEPTED");
  });

  it.each([false, true])("matches React INSERT/TURN/RESTART with replacement lobe %s", async withLobe => {
    const controller = overlaySession(fixture(true, withLobe));
    const spy = vi.spyOn(engine, "handleCommand");
    await controller.start();
    await controller.explorer.command("examine reactor terminal");
    const before = await spy.mock.results[0].value;
    let browserState = before;
    function Browser() {
      const [state, setState] = useState(before);
      return <ReactorControlTerminalModal state={state} onClose={() => {}} setGameState={updater => setState((previous: GameState) => {
        browserState = reconcileObjectives(previous, updater(previous));
        return browserState;
      })} />;
    }
    render(<Browser />);
    fireEvent.change(screen.getByLabelText("PASSWORD"), { target: { value: credential } });
    fireEvent.click(screen.getByRole("button", { name: "AUTHENTICATE" }));
    await controller.explorer.command(`authenticate ${credential}`);
    expect(screen.queryByRole("button", { name: "RESTART REACTOR CORE" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "INSERT ENGINE ROOM KEY" }));
    const inserted = text(await controller.explorer.command("insert"));
    expect(inserted).toContain("ENGINE ROOM KEY: INSERTED");
    expect(inserted).not.toContain("Use insert");
    fireEvent.click(screen.getByRole("button", { name: "TURN AUTHORIZATION KEY" }));
    expect(text(await controller.explorer.command("turn"))).toContain("ENGINE ROOM KEY: TURNED");
    fireEvent.click(screen.getByRole("button", { name: "RESTART REACTOR CORE" }));
    const restarted = text(await controller.explorer.command("restart"));
    expect(restarted).toContain(withLobe ? "REACTOR RESTART ACCEPTED" : "RESTART BLOCKED — LOBE ARRAY FAULT 13 REMAINS ACTIVE.");
    expect(restarted).toContain("Moves: 1");
    if (withLobe) {
      expect(restarted).not.toContain("Use restart");
      const repeated = text(await controller.explorer.command("restart"));
      expect(repeated).toContain("REACTOR CORE ONLINE");
      expect(screen.queryByRole("button", { name: "RESTART REACTOR CORE" })).toBeNull();
    }
    await controller.explorer.command("insert");
    await controller.explorer.command("turn");
    await controller.explorer.command("close");
    await controller.explorer.command("inventory");
    expect(spy.mock.calls[1][0]).toEqual(browserState);
    const after = spy.mock.calls[1][0];
    expect(after.itemState.containerContents[REACTOR_KEY_SLOT_ID]).toEqual([ENGINE_ROOM_KEY_ID]);
    expect(after.itemState.itemRoomId[ENGINE_ROOM_KEY_ID]).toBe(REACTOR_KEY_SLOT_ID);
    expect(Object.values(after.player.inventory).flat()).not.toContain(ENGINE_ROOM_KEY_ID);
    expect(after.worldState.conditionalTriggers[REACTOR_KEY_TURNED_TRIGGER]).toBe(true);
    expect(Boolean(after.worldState.conditionalTriggers[REACTOR_RESTARTED_TRIGGER])).toBe(withLobe);
    if (withLobe) {
      expect(after.worldState.powerRestoredSections["engine-room-power-lock"]).toBe(true);
      expect(after.worldState.roomAudioLevel.ReactorCore).toBe(6);
    }
    expect((await overlayHistory(controller)).filter(entry => entry.kind === "command").map(entry => text(entry.observation))).toContain(restarted);
  });

  it("denies shared operations that are not visible and resets authenticated mount state", async () => {
    const initial = fixture(true, true);
    expect(operateReactorTerminal(initial, "insert").state).toBe(initial);
    expect(operateReactorTerminal(initial, "turn").available).toBe(false);
    expect(operateReactorTerminal(initial, "restart").available).toBe(false);
    const controller = overlaySession(initial);
    await controller.start();
    await controller.explorer.command("examine reactor terminal");
    await controller.explorer.command(`authenticate ${credential}`);
    vi.mocked(gameInit.createFreshGameState).mockResolvedValueOnce(fixture(true, true));
    await controller.reset();
    expect(useUIOverlayStore.getState().overlay.kind).toBe("none");
    await controller.explorer.command("insert");
    expect(text(await controller.explorer.command("examine reactor terminal"))).not.toContain("ETHICS CREDENTIAL: ACCEPTED");
  });
});
