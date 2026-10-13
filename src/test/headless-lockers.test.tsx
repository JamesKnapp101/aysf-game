import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { LockerModal } from "../game/components/LockerModal";
import * as engine from "../game/engine/handleCommand";
import * as gameInit from "../game/gameInit";
import { getLockerModels, lockerIdFor, openLocker, type LockerType } from "../game/rules/lockers";
import { reconcileObjectives } from "../game/rules/objectives";
import { useUIOverlayStore } from "../game/store/store";
import type { GameState } from "../game/types/gameTypes";
import { setInventory } from "./helpers/gameTestHelpers";
import { overlayFixture, overlayHistory, overlaySession, observationText as text } from "./helpers/headlessOverlayHelpers";

const variants = [
  { type: "men" as const, item: "MensLockers", key: "MensLockerKey1", index: 1, reward: "UndergroundZinePage" },
  { type: "women" as const, item: "WomensLockers", key: "WomensLockerKey12", index: 12, reward: "PhoneNumber" },
];

describe.each(variants)("headless $type lockers", ({ type, item, key, index, reward }) => {
  it("lists sixteen visible doors but never unopened contents or key assignments", async () => {
    const initial = overlayFixture([item]);
    const controller = overlaySession(initial);
    await controller.start();
    const opened = text(await controller.explorer.command("examine lockers"));
    for (const locker of getLockerModels(initial, type)) expect(opened).toContain(`Locker ${locker.idx}: closed`);
    expect(opened).toContain("Moves: 1");
    const contents = type === "men" ? initial.worldState.mensLockerContents : initial.worldState.womensLockerContents;
    for (const id of Object.values(contents).flat()) {
      expect(opened).not.toContain(id);
      expect(opened).not.toContain(initial.world.items.find(item => item.id === id)!.name);
    }
    expect(opened).not.toContain(key);
    expect(text(await controller.explorer.command(`open ${index}`))).toContain("It won't budge.");
    for (const input of ["open 0", "open 17", "open -1", "open menLocker1", "wait"]) {
      expect(text(await controller.explorer.command(input))).toContain("Use open <number>");
    }
    expect(controller.capabilityDiagnostics!()).toEqual([]);
  });

  it("shares the exact keyed inventory transfer and found popup with React, once", async () => {
    const initial = setInventory(overlayFixture([item]), [key]);
    const controller = overlaySession(initial);
    const spy = vi.spyOn(engine, "handleCommand");
    await controller.start();
    await controller.explorer.command("examine lockers");
    const before = await spy.mock.results[0].value;
    let browserState = before;
    function Browser() {
      const [state, setState] = useState(before);
      return <LockerModal type={type} state={state} onClose={() => {}} setGameState={updater => setState((previous: GameState) => {
        browserState = reconcileObjectives(previous, typeof updater === "function" ? updater(previous) : updater);
        return browserState;
      })} />;
    }
    render(<Browser />);
    fireEvent.click(screen.getByRole("button", { name: `Locker ${index}` }));
    const response = text(await controller.explorer.command(`open ${index}`));
    const popup = screen.getByRole("dialog", { name: "Locker contents" });
    expect(response).toContain(popup.querySelector("li")!.textContent!);
    expect(response).toContain("Moves: 1");
    expect(response).not.toContain(reward);
    expect(text(await controller.explorer.command(`open ${index}`))).toContain("Use ok");
    await controller.explorer.command("ok");
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    fireEvent.click(screen.getByRole("button", { name: `Locker ${index}, opened` }));
    expect(text(await controller.explorer.command(`open ${index}`))).toContain("It's empty.");
    await controller.explorer.command("close");
    await controller.explorer.command("inventory");
    const actual = spy.mock.calls[1][0];
    expect(actual).toEqual(browserState);
    const id = lockerIdFor(type, index);
    const opened = type === "men" ? actual.worldState.mensLockersOpened : actual.worldState.womensLockersOpened;
    const contents = type === "men" ? actual.worldState.mensLockerContents : actual.worldState.womensLockerContents;
    expect((opened as Record<string, boolean>)[id]).toBe(true);
    expect((contents as Record<string, string[]>)[id]).toEqual([]);
    expect(actual.itemState.itemRoomId[reward]).toBe("INVENTORY");
    expect(actual.world.items.find(item => item.id === reward)!.location).toBe("INVENTORY");
    expect(Object.values(actual.player.inventory).flat().filter(id => id === reward)).toHaveLength(1);
    expect(actual.moves).toBe(1);
    const entries = await overlayHistory(controller);
    expect(entries.map(entry => entry.input).filter(Boolean)).toEqual(["examine lockers", `open ${index}`, `open ${index}`, "ok", `open ${index}`, "close", "inventory"]);
    expect(JSON.stringify(entries)).not.toMatch(/menLocker|womenLocker|Contents|itemRoomId/);
  });

  it("keeps the opened state on reopening and resets an active popup cleanly", async () => {
    const initial = setInventory(overlayFixture([item]), [key]);
    const controller = overlaySession(initial);
    await controller.start();
    await controller.explorer.command("examine lockers");
    await controller.explorer.command(`open ${index}`);
    await controller.explorer.command("close");
    expect(text(await controller.explorer.command("examine lockers"))).toContain(`Locker ${index}: opened`);
    expect(text(await controller.explorer.command(`open ${index}`))).toContain("It's empty.");
    vi.mocked(gameInit.createFreshGameState).mockResolvedValueOnce(setInventory(overlayFixture([item]), [key]));
    await controller.reset();
    expect(useUIOverlayStore.getState().overlay.kind).toBe("none");
    await controller.explorer.command("examine lockers");
    expect(text(await controller.explorer.command(`open ${index}`))).toContain("Inside the locker you find a");
  });
});

describe("shared locker rule restrictions", () => {
  it("commits against the latest state and preserves previous locker transfers with stale React props", async () => {
    const initial = setInventory(overlayFixture(["MensLockers"]), ["MensLockerKey1", "MensLockerKey5"]);
    let latest = initial;
    render(<LockerModal type="men" state={initial} onClose={() => {}} setGameState={updater => {
      latest = typeof updater === "function" ? updater(latest) : updater;
    }} />);
    fireEvent.click(screen.getByRole("button", { name: "Locker 1" }));
    await screen.findByRole("dialog", { name: "Locker contents" });
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    fireEvent.click(screen.getByRole("button", { name: "Locker 5" }));
    await waitFor(() => expect(latest.worldState.mensLockersOpened.menLocker5).toBe(true));
    expect(latest.worldState.mensLockersOpened.menLocker1).toBe(true);
    expect(Object.values(latest.player.inventory).flat()).toEqual(expect.arrayContaining(["UndergroundZinePage", "IResign"]));
    expect(latest.worldState.mensLockerContents.menLocker1).toEqual([]);
    expect(latest.worldState.mensLockerContents.menLocker5).toEqual([]);
  });

  it("records a keyed empty locker as opened with no item transfer or turn", () => {
    const initial = setInventory(overlayFixture(["MensLockers"]), ["MensLockerKey1"]);
    initial.worldState.mensLockerContents.menLocker1 = [];
    const opened = openLocker(initial, "men", 1);
    expect(opened.state.worldState.mensLockersOpened.menLocker1).toBe(true);
    expect(opened.state.player.inventory).toEqual(initial.player.inventory);
    expect(opened.state.moves).toBe(initial.moves);
    expect(opened.message).toBe("It's empty.");
    expect(opened.foundItemIds).toEqual([]);
    expect(openLocker(opened.state, "men", 1).state.worldState).toEqual(opened.state.worldState);
  });

  it("requires the matching carried key, including locker type, with no remote acquisition", async () => {
    const initial = setInventory(overlayFixture(["WomensLockers"]), ["MensLockerKey1"]);
    const denied = openLocker(initial, "women", 12);
    expect(denied.message).toBe("It won't budge.");
    expect(denied.state.player.inventory).toEqual(initial.player.inventory);
    expect(denied.state.worldState.womensLockersOpened.womenLocker12).toBe(false);
    const controller = overlaySession(overlayFixture([]));
    await controller.start();
    await controller.explorer.command("open 12");
    expect(useUIOverlayStore.getState().overlay.kind).toBe("none");
    expect(text(await controller.explorer.command("inventory"))).not.toContain("phone number");
  });

  it("preserves empty and already-open-with-contents behavior for either type", () => {
    for (const type of ["men", "women"] as LockerType[]) {
      const state = overlayFixture([]);
      const openedKey = type === "men" ? "mensLockersOpened" : "womensLockersOpened";
      const contentsKey = type === "men" ? "mensLockerContents" : "womensLockerContents";
      const id = lockerIdFor(type, 1);
      (state.worldState[openedKey] as Record<string, boolean>)[id] = true;
      (state.worldState[contentsKey] as Record<string, string[]>)[id] = ["UndergroundZinePage"];
      const shown = openLocker(state, type, 1);
      expect(shown.state).toBe(state);
      expect(shown.foundItemIds).toEqual(["UndergroundZinePage"]);
      (state.worldState[contentsKey] as Record<string, string[]>)[id] = [];
      expect(openLocker(state, type, 1).message).toBe("It's empty.");
      expect(openLocker(state, type, 17).state).toBe(state);
    }
  });
});
