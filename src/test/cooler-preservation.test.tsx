import { useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import * as actions from "../game/actions/dispatchAction";
import { OverlayHost } from "@game/components/OverlayHost";
import * as engine from "../game/engine/handleCommand";
import { appendLog } from "@game/engine/log";
import { stashItemInContainer } from "@game/helpers/itemPlacement";
import { restoreResumeSnapshot, saveManualSnapshot, saveResumeSnapshot } from "@game/persistence/resumeStorage";
import { isItemOpen } from "@game/rules/containers";
import { reconcileObjectives } from "@game/rules/objectives";
import { resolveItemByNoun } from "@game/rules/scope";
import { inventoryHas } from "@game/rules/state";
import { getCoolerMode } from "@game/selectors/gadgetSelectors";
import { useUIEffectsStore, useUIOverlayStore } from "@game/store/store";
import type { ActionResult } from "@game/types/actionsTypes";
import type { GameState } from "@game/types/gameTypes";
import type { CoolerMode } from "@game/types/itemTypes";
import { DEFERRED_WORLD_CHUNK_IDS } from "src/world/World";
import { getChefSampleEnvironment } from "src/world/maps/levelThree/Park/Restaurant/chefSample";
import {
  addInventoryItems, createTestState, getLastLogEntry, patchRoomDarkness,
  runCommand, runCommands, setPlayerRoom,
} from "./helpers/gameTestHelpers";
import { observationText, overlaySession } from "./helpers/headlessOverlayHelpers";

const SAMPLE = "ChefSample";
const FROZEN = "It's a small slice of raw, frozen flesh riddled with dark red lines.";
const RAW = "It's a small slice of raw flesh, webbed through with dark red lines.";
const SCULPTURE = "It's deep red and hard, like glass. The shape seems random, covered with intricate ripples and grooves.";
const EXPIRED = "The sample from the poor chef twitches, quivers for a moment, then dissolves into nothing.";
const executeAction = actions.dispatchAction;
const remaining = (state: GameState) => state.worldState.chefSample?.remainingWarmTurns;
const environment = getChefSampleEnvironment;

function completeWorld(state: GameState): GameState {
  return { ...state, world: { ...state.world, meta: { ...state.world.meta, loadedChunkIds: [...DEFERRED_WORLD_CHUNK_IDS] } } };
}

async function sampleInWalkIn() {
  return runCommands(addInventoryItems(completeWorld(createTestState({ roomId: "WalkIn", rng: () => 0.99 })),
    ["CarvingKnife", "Cooler", "saunacorpsepurse", "FISHBOWL"]), ["open cooler", "carve sample from chef"]);
}

function applied(before: GameState, result: ActionResult) {
  const next = result.message ? appendLog(result.state, result.message) : result.state;
  if (result.overlay) useUIOverlayStore.getState().openOverlay(result.overlay);
  return reconcileObjectives(before, next, { fromRoomId: before.player.roomId, toRoomId: next.player.roomId });
}

async function mode(state: GameState, mode: CoolerMode) {
  const result = await executeAction(state, { verb: "setCoolerMode", payload: { mode } });
  expect(result.consumesTurn).toBe(false);
  expect(result.state.moves).toBe(state.moves);
  return applied(state, result);
}

async function frozenInKitchen() {
  let state = await runCommand(await sampleInWalkIn(), "put sample in cooler");
  state = await mode(state, "freeze");
  return runCommand(state, "east");
}

function expectGone(state: GameState) {
  expect(remaining(state)).toBeUndefined();
  expect(inventoryHas(state.player.inventory, SAMPLE)).toBe(false);
  expect(state.itemState.itemRoomId[SAMPLE]).toBe("seeded");
  for (const lists of [state.itemState.containerContents, state.itemState.surfaceContents,
    state.itemState.underContents, state.itemState.searchableContents, state.itemState.containerFilled]) {
    expect(Object.values(lists).flat()).not.toContain(SAMPLE);
  }
  expect(state.world.items.filter(item => item.id === SAMPLE)).toHaveLength(1);
}

describe("Cooler sample preservation", () => {
  it("freezes insertion immediately, even on the last available warm turn", async () => {
    let state = await mode(await sampleInWalkIn(), "freeze");
    state = await runCommands(state, ["east", "wait", "wait"]);
    expect(remaining(state)).toBe(1);
    expect(environment(state).frozen).toBe(false);
    state = await runCommand(state, "put sculpture in cooler");
    expect(environment(state).frozen).toBe(true);
    expect(remaining(state)).toBe(1);
    expect(state.itemState.containerContents.Cooler).toContain(SAMPLE);
    expect(inventoryHas(state.player.inventory, SAMPLE)).toBe(false);
    expect(state.itemState.frozenItems[SAMPLE]).toBeUndefined();
    expect(state.world.items.filter(item => item.id === SAMPLE)).toHaveLength(1);
  });

  it.each([false, true])("freezes an already contained sample at one remaining turn, lid open=%s", async open => {
    let state = await runCommand(await sampleInWalkIn(), "put sample in cooler");
    if (!open) state = await runCommand(state, "close cooler");
    state = await runCommands(state, ["east", "wait", "set cooler"]);
    expect(remaining(state)).toBe(1);
    state = await mode(state, "freeze");
    expect(environment(state).frozen).toBe(true);
    expect(remaining(state)).toBe(1);
    state = await runCommands(state, Array(24).fill("wait"));
    expect(remaining(state)).toBe(1);
  });

  it.each(["off", "cool", "cold"] as const)("thaws immediately on %s and resumes the existing budget", async setting => {
    let state = await frozenInKitchen();
    expect(remaining(state)).toBe(4);
    state = await mode(state, setting);
    expect(environment(state)).toMatchObject({ frozen: false, preserved: false, sculpture: true });
    expect(remaining(state)).toBe(4);
    state = await runCommand(state, "wait");
    expect(remaining(state)).toBe(3);
    state = await runCommand(state, "examine sample");
    expect(getLastLogEntry(state)).toContain(SCULPTURE);
    expect(remaining(state)).toBe(2);
  });

  it("charges only actual warm commands over repeated freeze/thaw cycles", async () => {
    let state = await frozenInKitchen();
    for (const [setting, budget] of [["off", 3], ["cool", 2], ["cold", 1]] as const) {
      state = await mode(state, setting);
      state = await runCommand(state, "wait");
      expect(remaining(state)).toBe(budget);
      state = await mode(state, "freeze");
      state = await runCommands(state, ["wait", "wait"]);
      expect(remaining(state)).toBe(budget);
    }
    state = await mode(state, "off");
    expect(remaining(state)).toBe(1);
    state = await runCommand(state, "wait");
    expectGone(state);
    expect(getLastLogEntry(state).trim()).toBe(EXPIRED);
    expect(state.log.join("\n").split(EXPIRED)).toHaveLength(2);
    state = await runCommands(state, ["west", "carve sample from chef"]);
    expect(remaining(state)).toBe(4);
  });

  it("thaws immediately on removal and charges the take command once", async () => {
    let state = await runCommand(await frozenInKitchen(), "take frozen sample from cooler");
    expect(environment(state)).toMatchObject({ frozen: false, sculpture: true });
    expect(remaining(state)).toBe(3);
    expect(inventoryHas(state.player.inventory, SAMPLE)).toBe(true);
    expect(state.itemState.containerContents.Cooler).not.toContain(SAMPLE);
    state = await runCommand(state, "put sample in cooler");
    expect(environment(state).frozen).toBe(true);
    expect(remaining(state)).toBe(3);
  });

  it("keeps removed or thawed flesh safe inside the WalkIn", async () => {
    let state = await runCommand(await sampleInWalkIn(), "put sample in cooler");
    state = await mode(state, "freeze");
    state = await mode(state, "off");
    expect(environment(state)).toMatchObject({ frozen: false, preserved: true, sculpture: false });
    state = await runCommands(state, ["take sample from cooler", "examine sample", "wait"]);
    expect(getLastLogEntry(await runCommand(state, "examine sample"))).toContain(RAW);
    expect(remaining(state)).toBe(4);
    expect(state.worldState.playerDeaths.WalkIn).toBeUndefined();
  });

  it("returns the exact frozen description while the open lid permits access", async () => {
    let state = await frozenInKitchen();
    state = await runCommand(state, "examine sample");
    expect(getLastLogEntry(state).trim()).toBe(`> examine sample\n${FROZEN}`);
    expect(remaining(state)).toBe(4);
    state = await runCommand(state, "close cooler");
    expect(isItemOpen(state, "Cooler")).toBe(false);
    expect(resolveItemByNoun(state, "sample")).toBeUndefined();
    state = await runCommand(state, "examine sample");
    expect(getLastLogEntry(state)).not.toContain(FROZEN);
    state = await runCommands(state, ["open cooler", "examine sample"]);
    expect(getLastLogEntry(state)).toContain(FROZEN);
  });

  it.each([false, true])("preserves the sample in darkness with lid open=%s", async open => {
    let state = await frozenInKitchen();
    if (!open) state = await runCommand(state, "close cooler");
    state = patchRoomDarkness(state, "Kitchen", true);
    state = await runCommands(state, Array(24).fill("wait"));
    expect(environment(state)).toMatchObject({ frozen: true, preserved: true });
    expect(remaining(state)).toBe(4);
    expect(state.worldState.playerDeaths.Kitchen).toBeUndefined();
    expect(useUIEffectsStore.getState().organismDeath).toBeNull();
  });

  it("refuses insertion through a closed lid using the normal item action", async () => {
    let state = await runCommand(await sampleInWalkIn(), "close cooler");
    state = await runCommand(state, "put sample in cooler");
    expect(getLastLogEntry(state)).toContain("The cooler is closed.");
    expect(inventoryHas(state.player.inventory, SAMPLE)).toBe(true);
    expect(state.itemState.containerContents.Cooler ?? []).not.toContain(SAMPLE);
    state = await runCommands(state, ["open cooler", "put sample in cooler"]);
    expect(state.itemState.containerContents.Cooler).toContain(SAMPLE);
  });

  it("shields light when closed but continues aging without FREEZE", async () => {
    let state = await runCommands(await sampleInWalkIn(), ["put sample in cooler", "east"]);
    expect(environment(state).sculpture).toBe(true);
    state = await runCommand(state, "close cooler");
    expect(environment(state)).toMatchObject({ frozen: false, preserved: false, illuminated: true, sculpture: false });
    expect(remaining(state)).toBe(2);
    state = await runCommands(state, ["wait", "wait"]);
    expectGone(state);
    expect(getLastLogEntry(state).trim()).toBe(EXPIRED);
  });

  it.each([false, true])("uses standard organism death immediately after free thaw, lid open=%s", async open => {
    let state = await frozenInKitchen();
    if (!open) state = await runCommand(state, "close cooler");
    state = patchRoomDarkness(state, "Kitchen", true);
    state = await mode(state, "off");
    expect(state.worldState.playerDeaths.Kitchen?.cause).toBe("organism");
    expect(state.player.roomId).not.toBe("Kitchen");
    expect(state.log.join("\n")).toContain("In the dark, something touches you");
    expect(state.log.join("\n")).toContain("*** You have died ***");
    expect(useUIEffectsStore.getState().organismDeath).not.toBeNull();
    expect(useUIOverlayStore.getState().overlay.kind).toBe("none");
    expectGone(state);
    expect(state.log.join("\n")).not.toContain(EXPIRED);
  });

  it("dies on removing frozen flesh in darkness, before expiration", async () => {
    let state = patchRoomDarkness(await frozenInKitchen(), "Kitchen", true);
    const moves = state.moves;
    state = await runCommand(state, "take sample from cooler");
    expect(state.moves).toBe(moves + 1);
    expect(state.worldState.playerDeaths.Kitchen?.cause).toBe("organism");
    expectGone(state);
  });

  it("permits a real flashlight to protect a thawed sample", async () => {
    let state = addInventoryItems(await frozenInKitchen(), ["flashlight"]);
    state = await runCommand(state, "turn flashlight on");
    state = patchRoomDarkness(state, "Kitchen", true);
    state = await mode(state, "cold");
    expect(environment(state).sculpture).toBe(true);
    expect(remaining(state)).toBe(4);
    expect(state.worldState.playerDeaths.Kitchen).toBeUndefined();
    state = await runCommand(state, "turn flashlight off");
    expect(state.worldState.playerDeaths.Kitchen?.cause).toBe("organism");
    expectGone(state);
  });

  it("follows nested container paths and thaws when the inner container is removed", async () => {
    let state = await runCommands(await sampleInWalkIn(), ["open purse", "put sample in purse", "close purse", "put purse in cooler"]);
    state = await mode(state, "freeze");
    state = await runCommands(state, ["east", "close cooler", "wait"]);
    expect(environment(state)).toMatchObject({ roomId: "Kitchen", frozen: true });
    expect(remaining(state)).toBe(4);
    state = await runCommands(state, ["open cooler", "take purse from cooler"]);
    expect(environment(state)).toMatchObject({ frozen: false, sculpture: false });
    expect(remaining(state)).toBe(3);
    state = await runCommand(state, "put purse in cooler");
    expect(environment(state).frozen).toBe(true);
    expect(remaining(state)).toBe(3);
  });

  it("preserves a dropped Cooler remotely and one carried inside another container", async () => {
    let state = await frozenInKitchen();
    // A trusted nested placement avoids inventing a new oversized container puzzle.
    state = stashItemInContainer(state, "Cooler", "saunacorpsepurse");
    expect(environment(state).roomId).toBe("Kitchen");
    expect(environment(state).frozen).toBe(true);
    state = await runCommands(state, ["drop purse", "west", "wait", "wait", "wait", "wait"]);
    expect(environment(state)).toMatchObject({ roomId: "Kitchen", frozen: true });
    expect(remaining(state)).toBe(4);
  });

  it("does not freeze a sample merely resting on the Cooler", async () => {
    let state = await frozenInKitchen();
    state = { ...state, itemState: { ...state.itemState, containerContents: { ...state.itemState.containerContents, Cooler: [] },
      itemRoomId: { ...state.itemState.itemRoomId, [SAMPLE]: "Kitchen" }, surfaceContents: { Cooler: [SAMPLE] } } };
    expect(environment(state)).toMatchObject({ frozen: false, preserved: false });
    state = await runCommand(state, "wait");
    expect(remaining(state)).toBe(3);
  });

  it.each([false, true])("restores frozen condition and a used budget, lid open=%s", async open => {
    let state = await runCommands(await sampleInWalkIn(), ["put sample in cooler", "east", "wait", "wait"]);
    state = await mode(state, "freeze");
    if (!open) state = await runCommand(state, "close cooler");
    expect(remaining(state)).toBe(1);
    expect(saveResumeSnapshot(state)).toBe(true);
    state = (await restoreResumeSnapshot())!;
    expect(getCoolerMode(state)).toBe("freeze");
    expect(environment(state).frozen).toBe(true);
    expect(isItemOpen(state, "Cooler")).toBe(open);
    expect(remaining(state)).toBe(1);
    expect(state.itemState.containerContents.Cooler).toEqual([SAMPLE]);
    state = await runCommands(state, ["wait", "wait"]);
    expect(remaining(state)).toBe(1);
    state = await mode(state, "off");
    expect(environment(state).frozen).toBe(false);
    expect(remaining(state)).toBe(1);
    state = await runCommand(state, "wait");
    expectGone(state);
  });

  it("restores a frozen sample through nested closed containers", async () => {
    let state = await runCommands(await sampleInWalkIn(), ["open purse", "put sample in purse", "close purse", "put purse in cooler", "close cooler", "east"]);
    expect(remaining(state)).toBe(3);
    state = await mode(state, "freeze");
    expect(saveResumeSnapshot(state)).toBe(true);
    state = (await restoreResumeSnapshot())!;
    expect(environment(state)).toMatchObject({ roomId: "Kitchen", frozen: true });
    expect(environment(state).containers.map(item => item.id)).toEqual(["saunacorpsepurse", "Cooler"]);
    expect(remaining(state)).toBe(3);
    state = await runCommands(state, ["wait", "open cooler", "take purse from cooler"]);
    expect(environment(state).frozen).toBe(false);
    expect(remaining(state)).toBe(2);
    state = await runCommands(state, ["wait", "wait"]);
    expectGone(state);
    expect(state.itemState.containerContents.saunacorpsepurse).toEqual([]);
  });

  it("loads legacy Cooler definitions and settings without new lifecycle fields", async () => {
    const original = await sampleInWalkIn();
    expect(saveResumeSnapshot(original)).toBe(true);
    const snapshot = JSON.parse(window.localStorage.getItem("aysf:resume")!);
    delete snapshot.itemState.itemSettings.Cooler;
    delete snapshot.itemState.openItems.Cooler;
    const cooler = snapshot.worldItems.find((item: { id: string }) => item.id === "Cooler");
    delete cooler.isOpenable;
    window.localStorage.setItem("aysf:resume", JSON.stringify(snapshot));
    let state = (await restoreResumeSnapshot())!;
    expect(getCoolerMode(state)).toBe("off");
    expect(isItemOpen(state, "Cooler")).toBe(false);
    state = await runCommands(state, ["open cooler", "put sample in cooler"]);
    state = await mode(state, "freeze");
    expect(environment(state).frozen).toBe(true);
    expect(state.worldState.chefSample).toEqual({ remainingWarmTurns: 4 });
  });

  it("retains both FREEZE mode and the existing frozen-water state", async () => {
    let state = await runCommands(await sampleInWalkIn(), ["put sample in cooler", "put fishbowl in cooler"]);
    state = { ...state, itemState: { ...state.itemState, containerFilled: { ...state.itemState.containerFilled, FISHBOWL: ["water"] } } };
    state = await mode(state, "freeze");
    expect(getCoolerMode(state)).toBe("freeze");
    expect(state.itemState.frozenItems.water).toBe(true);
    expect(environment(state).frozen).toBe(true);
    expect(state.itemState.containerFilled.FISHBOWL).toEqual(["water"]);
    expect(remaining(await runCommand(state, "east"))).toBe(4);
  });
});

function GraphicalControls({ initial, onState }: { initial: GameState; onState: (state: GameState) => void }) {
  const [state, setState] = useState(initial);
  return <OverlayHost state={state} setGameState={setState} runAction={async (verb, payload) => {
    expect(verb).toBe("setCoolerMode");
    const result = await executeAction(state, { verb: "setCoolerMode", payload: { mode: payload?.mode as CoolerMode } });
    const next = applied(state, result);
    setState(next);
    onState(next);
  }} />;
}

describe("Cooler preservation interfaces", () => {
  it.each([false, true])("matches graphical controls and headless controls, dark=%s", async dark => {
    let initial = dark ? patchRoomDarkness(await frozenInKitchen(), "Kitchen", true)
      : await runCommands(await sampleInWalkIn(), ["put sample in cooler", "east"]);
    // Exercise event narration when the bounded game log is already full, too.
    if (dark) initial = { ...initial, log: Array.from({ length: 500 }, (_, i) => `Earlier entry ${i}`) };
    const controller = overlaySession(setPlayerRoom(initial, "StairWellSeven"));
    const engineSpy = vi.spyOn(engine, "handleCommand");
    const dispatch = vi.spyOn(actions, "dispatchAction");
    await controller.start();
    expect(saveManualSnapshot(initial)).toBe(true);
    await controller.explorer.command("restore");
    await controller.explorer.command("set cooler");
    const opened = await engineSpy.mock.results.at(-1)!.value as GameState;
    expect(opened.moves).toBe(initial.moves + 1);
    expect(remaining(opened)).toBe(dark ? 4 : 2);
    const modes: CoolerMode[] = dark ? ["off"] : ["freeze", "off", "cool", "cold", "freeze"];
    const expected: GameState[] = [];
    for (const setting of modes) {
      const response = observationText(await controller.explorer.command(setting));
      const result = await dispatch.mock.results.at(-1)!.value as ActionResult;
      const before = dispatch.mock.calls.at(-1)![0];
      // Reconciliation and response logging are the same in the two frontends.
      expected.push(applied(before, result));
      expect(result.state.moves).toBe(opened.moves);
      if (dark) {
        expect(response).toContain("In the dark, something touches you");
        expect(response).toContain("*** You have died ***");
        expect(response).not.toContain("Earlier entry");
        expect(response).not.toContain("OMNICOOL");
        expect(response).toContain("SIGNAL RECEIVED");
      } else {
        expect(response).toContain("OMNICOOL");
        expect(remaining(result.state)).toBe(2);
      }
    }
    if (!dark) await controller.explorer.command("close");
    await controller.dispose();
    vi.restoreAllMocks();
    useUIEffectsStore.setState({ organismDeath: null });
    useUIOverlayStore.getState().openOverlay({ kind: "cooler", mode: getCoolerMode(opened) });
    let graphical = opened;
    render(<GraphicalControls initial={opened} onState={next => { graphical = next; }} />);
    for (const [index, setting] of modes.entries()) {
      fireEvent.click(screen.getByRole("button", { name: setting.toUpperCase() }));
      await waitFor(() => expect(graphical).toEqual(expected[index]));
      expect(environment(graphical).frozen).toBe(!dark && setting === "freeze");
    }
    if (dark) {
      expect(useUIOverlayStore.getState().overlay.kind).toBe("none");
      expect(useUIEffectsStore.getState().organismDeath).not.toBeNull();
      expectGone(graphical);
    } else {
      fireEvent.keyDown(document.querySelector(".cooler-root")!, { key: "Escape" });
      expect(useUIOverlayStore.getState().overlay.kind).toBe("none");
      expect(graphical.moves).toBe(opened.moves);
      expect(remaining(graphical)).toBe(2);
    }
  });

  it("transports the frozen sample from Kitchen to Spa through actual headless commands", async () => {
    const initial = completeWorld(createTestState({ roomId: "Kitchen", rng: () => 0.99 }));
    const controller = overlaySession(setPlayerRoom(initial, "StairWellSeven"));
    const engineSpy = vi.spyOn(engine, "handleCommand");
    const dispatch = vi.spyOn(actions, "dispatchAction");
    await controller.start();
    expect(saveManualSnapshot(initial)).toBe(true);
    await controller.explorer.command("restore");
    for (const command of ["take carving knife", "take cooler", "open cooler", "west", "carve sample from chef", "east", "put sample in cooler", "set cooler"]) {
      await controller.explorer.command(command);
    }
    const beforeFreeze = await engineSpy.mock.results.at(-1)!.value as GameState;
    expect(beforeFreeze.player.roomId).toBe("Kitchen");
    expect(remaining(beforeFreeze)).toBe(1);
    await controller.explorer.command("freeze");
    const frozen = (await dispatch.mock.results.at(-1)!.value as ActionResult).state;
    expect(frozen.moves).toBe(beforeFreeze.moves);
    expect(environment(frozen).frozen).toBe(true);
    expect(remaining(frozen)).toBe(1);
    for (const command of ["close", "close cooler", "east", "northeast", "northwest", "west", "open cooler"]) {
      await controller.explorer.command(command);
    }
    const examined = observationText(await controller.explorer.command("examine sample"));
    expect(examined).toContain(FROZEN);
    const atSpa = await engineSpy.mock.results.at(-1)!.value as GameState;
    expect(atSpa.player.roomId).toBe("Spa");
    expect(remaining(atSpa)).toBe(1);
    expect(atSpa.itemState.containerContents.Cooler).toEqual([SAMPLE]);
    await controller.explorer.command("set cooler");
    await controller.explorer.command("off");
    const thawed = (await dispatch.mock.results.at(-1)!.value as ActionResult).state;
    expect(environment(thawed)).toMatchObject({ frozen: false, sculpture: true });
    expect(remaining(thawed)).toBe(1);
    await controller.explorer.command("close");
    const response = observationText(await controller.explorer.command("wait"));
    expect(response).toContain(EXPIRED);
    expectGone(await engineSpy.mock.results.at(-1)!.value as GameState);
  });
});
