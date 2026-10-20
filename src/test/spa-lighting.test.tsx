import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import * as engine from "../game/engine/handleCommand";
import { useGameSession } from "../game/hooks/useGameSession";
import { triggerPlayerDeath } from "@game/helpers/gameHelpers";
import { SCRIPTED_EVENTS } from "@game/helpers/scriptedEvents";
import { isRoomDark } from "@game/helpers/itemHelpers";
import { canPlayerSeeInRoom, getRoomVisualLightLevel, isRoomPhysicallyLit } from "@game/helpers/visibilityHelpers";
import { restoreResumeSnapshot, saveManualSnapshot, saveResumeSnapshot } from "@game/persistence/resumeStorage";
import { isRoomAmbientlyLit } from "@game/registries/roomLightRegistry";
import { inventoryHas } from "@game/rules/state";
import { getDoorState } from "@game/selectors/doorSelectors";
import { useUIEffectsStore, useUIOverlayStore } from "@game/store/store";
import { buildRoomDescription } from "@game/text/roomDescription";
import type { GameState } from "@game/types/gameTypes";
import { DEFERRED_WORLD_CHUNK_IDS } from "src/world/World";
import { isSpaLightOn } from "src/world/maps/levelThree/Park/spaLighting";
import { handleSpaLightCommand } from "src/world/maps/levelThree/Park/spaLighting";
import { parseCommand } from "../parse/parser";
import { addInventoryItems, createTestState, getLastLogEntry, patchRoomDarkness, runCommand, runCommands, setPlayerRoom } from "./helpers/gameTestHelpers";
import { observationText, overlaySession } from "./helpers/headlessOverlayHelpers";

const BLOCK = "It's too dark to do that. You can move or turn the Spa lights on.";
const PITCH_BLACK = "It's pitch black in here, you can't see a thing.";

function fixture(roomId = "Spa"): GameState {
  const state = addInventoryItems(createTestState({ roomId, rng: () => 0.99 }), ["Cooler", "CarvingKnife"]);
  return { ...state, world: { ...state.world, meta: { ...state.world.meta, loadedChunkIds: [...DEFERRED_WORLD_CHUNK_IDS] } } };
}

function expectLights(state: GameState, on: boolean) {
  expect(isSpaLightOn(state)).toBe(on);
  for (const room of ["Spa", "SteamRoom"]) {
    expect(isRoomAmbientlyLit(state, room)).toBe(on);
    expect(isRoomDark(state, room)).toBe(!on);
    expect(isRoomPhysicallyLit(state, room)).toBe(on);
    expect(canPlayerSeeInRoom(state, room)).toBe(on);
  }
  expect(isRoomAmbientlyLit(state, "Sauna")).toBe(false);
  expect(isRoomPhysicallyLit(state, "Sauna")).toBe(false);
  expect(isRoomAmbientlyLit(state, "NailSalon")).toBe(true);
}

const flips = ["flip lightswitch", "flip light switch", "flip the light switch", "flip switch", "flip rocker", "flip lights"];
const explicit = (setting: string) => ["light", "lights", "light switch", "lightswitch", "overhead light"].flatMap(noun =>
  [`turn ${noun} ${setting}`, `turn ${setting} ${noun}`, `switch ${noun} ${setting}`, `switch ${setting} ${noun}`, `flip ${noun} ${setting}`, `flip ${setting} ${noun}`]);

describe("Spa light switch", () => {
  it("starts ON with one authored switch and no redundant SteamRoom flag", async () => {
    let state = fixture();
    expectLights(state, true);
    expect(state.world.items.filter(item => item.id === "SpaLightSwitch")).toHaveLength(1);
    expect(state.worldState.darkRooms.SteamRoom).toBeUndefined();
    expect(state.itemState.itemSettings.SpaLightSwitch).toBeUndefined();
    state = await runCommand(state, "examine lightswitch");
    expect(getLastLogEntry(state)).toContain("ON position");
  });

  it.each(flips)("toggles twice through '%s', including in darkness", async command => {
    const initial = fixture();
    let state = await runCommand(initial, command);
    expectLights(state, false);
    expect(state.moves).toBe(initial.moves + 1);
    expect(getLastLogEntry(state)).toContain("You turn the Spa lights off.");
    state = await runCommand(state, command);
    expectLights(state, true);
    expect(state.moves).toBe(initial.moves + 2);
  });

  it.each(explicit("on"))("handles ON idempotently and in darkness: %s", async command => {
    let state = await runCommand(fixture(), command);
    expect(getLastLogEntry(state).trim()).toBe(`> ${command}\nThe light is already on.`);
    expectLights(state, true);
    state = await runCommand(state, "flip lightswitch");
    state = await runCommand(state, command);
    expectLights(state, true);
    expect(getLastLogEntry(state)).toContain("You turn the Spa lights on.");
  });

  it.each(explicit("off"))("handles OFF idempotently and in darkness: %s", async command => {
    let state = await runCommand(fixture(), command);
    expectLights(state, false);
    const moves = state.moves;
    state = await runCommand(state, command);
    expect(getLastLogEntry(state).trim()).toBe(`> ${command}\nThe light is already off.`);
    expectLights(state, false);
    expect(state.moves).toBe(moves + 1);
  });

  it("changes physical conditions before a turn tick", () => {
    const initial = fixture();
    const result = handleSpaLightCommand(initial, parseCommand("turn light off"))!;
    expect(result.state.moves).toBe(initial.moves);
    expectLights(result.state, false);
    const switchItem = result.state.world.items.find(item => item.id === "SpaLightSwitch")!;
    expect(switchItem.describe!(result.state, switchItem, { kind: "examine", roomId: "Spa" })).toContain("OFF position");
    expect(result.state.itemState.itemSettings.SpaLightSwitch).toBeUndefined();
    expect(result.state.worldState.darkRooms.SteamRoom).toBeUndefined();
  });

  it.each([false, true])("lights SteamRoom through the glass, door open=%s", async open => {
    let state = fixture();
    state = { ...state, worldState: { ...state.worldState, doors: { ...state.worldState.doors,
      SteamRoomDoor: { ...getDoorState(state, "SteamRoomDoor")!, isOpen: open },
    } } };
    expectLights(state, true);
    const doors = state.worldState.doors;
    state = await runCommand(state, "turn lights off");
    expectLights(state, false);
    expect(state.worldState.doors).toEqual(doors);
    state = await runCommand(state, "turn lights on");
    expectLights(state, true);
  });

  it("leaves independently dark NailSalon state untouched", async () => {
    let state = patchRoomDarkness(fixture(), "NailSalon", true);
    state = await runCommands(state, ["flip light switch", "flip light switch"]);
    expect(isRoomAmbientlyLit(state, "NailSalon")).toBe(false);
    expect(state.worldState.darkRooms.NailSalon).toBe(true);
    expect(isRoomAmbientlyLit(state, "Sauna")).toBe(false);
  });
});

describe("Spa darkness restrictions", () => {
  it.each([
    "examine tiles", "examine light switch", "look at jacuzzi", "look through glass wall", "look under cooler",
    "take towels", "take all", "drop carving knife", "put carving knife in cooler", "open cooler", "close cooler",
    "open steam room door", "close steam room door", "open sauna door", "close nail salon door",
    "set cooler", "examine cooler", "read sign", "touch tiles", "turn flashlight on", "wait", "cut jacuzzi",
  ])("rejects '%s' without running its interaction", async command => {
    const before = await runCommand(fixture(), "turn lights off");
    const next = await runCommand(before, command);
    expect(getLastLogEntry(next)).toContain(BLOCK);
    expect(next.moves).toBe(before.moves + (command.startsWith("look") ? 0 : 1));
    expect(next.player.inventory).toEqual(before.player.inventory);
    expect(next.itemState.containerContents).toEqual(before.itemState.containerContents);
    expect(next.worldState.doors).toEqual(before.worldState.doors);
    expect(useUIOverlayStore.getState().overlay.kind).toBe("none");
    expect(useUIEffectsStore.getState().organismDeath).toBeNull();
  });

  it.each(["east", "e", "go east"])("allows navigation '%s' out of the dark Spa", async command => {
    const state = await runCommands(fixture(), ["flip lightswitch", command]);
    expect(state.player.roomId).toBe("ParkWest");
    expect(isSpaLightOn(state)).toBe(false);
  });

  it("preserves locked-door obstruction, automatic unlocked passage, and open doorways", async () => {
    let state = fixture();
    state = { ...state, worldState: { ...state.worldState, doors: { ...state.worldState.doors,
      SteamRoomDoor: { ...getDoorState(state, "SteamRoomDoor")!, isOpen: false, isLocked: true },
    } } };
    state = await runCommands(state, ["turn light off", "south"]);
    expect(state.player.roomId).toBe("Spa");
    expect(getLastLogEntry(state)).not.toContain(BLOCK);
    expect(getLastLogEntry(state)).toMatch(/closed/i);
    state = { ...state, worldState: { ...state.worldState, doors: { ...state.worldState.doors,
      SteamRoomDoor: { ...getDoorState(state, "SteamRoomDoor")!, isLocked: false },
    } } };
    state = await runCommand(state, "south");
    expect(state.player.roomId).toBe("SteamRoom");
    expect(getLastLogEntry(state)).toContain("You open the door and step through.");
    expect(getLastLogEntry(state)).toContain(PITCH_BLACK);
    state = await runCommands(state, ["north", "turn light on", "open steam room door", "turn light off", "south"]);
    expect(state.player.roomId).toBe("SteamRoom");
    expect(isRoomPhysicallyLit(state, "SteamRoom")).toBe(false);
  });

  it("allows meta commands and preserves their free turn conventions", async () => {
    let state = await runCommand(fixture(), "flip lightswitch");
    const moves = state.moves;
    state = await runCommands(state, ["inventory", "help", "diagnose", "comet", "save", "nonsense"]);
    expect(state.moves).toBe(moves);
    expect(isSpaLightOn(state)).toBe(false);
    state = await runCommands(state, ["turn lights on", "restore"]);
    expect(state.moves).toBe(moves);
    expectLights(state, false);
  });

  it("restores normal scenery, inventory, and door handling on relighting", async () => {
    let state = await runCommands(fixture(), ["turn lights off", "drop carving knife", "turn on the lights", "drop carving knife"]);
    expect(inventoryHas(state.player.inventory, "CarvingKnife")).toBe(false);
    state = await runCommands(state, ["take carving knife", "open cooler", "close cooler", "open steam room door", "examine tiles"]);
    expect(inventoryHas(state.player.inventory, "CarvingKnife")).toBe(true);
    expect(getDoorState(state, "SteamRoomDoor")!.isOpen).toBe(true);
    expect(getLastLogEntry(state)).toContain("Pristine white ceramic tiles");
  });

  it.each(["SteamRoom", "Sauna", "NailSalon", "Kitchen"])("does not restrict other dark rooms: %s", async roomId => {
    // The Sauna now contains an organism; physical light isolates this guard test.
    const initial = roomId === "Sauna"
      ? await runCommand(addInventoryItems(fixture(), ["flashlight"]), "turn flashlight on") : fixture();
    const darkSpa = await runCommand(initial, "turn lights off");
    const state = await runCommands(patchRoomDarkness(setPlayerRoom(darkSpa, roomId), roomId, true), ["drop carving knife", "take carving knife", "open cooler"]);
    expect(state.log.slice(-3).join("\n")).not.toContain(BLOCK);
    expect(state.itemState.openItems.Cooler).toBe(true);
    expect(inventoryHas(state.player.inventory, "CarvingKnife")).toBe(true);
  });

  it("does not fire command scripts for rejected interactions while still advancing time", async () => {
    const event = {
      id: "test-spa-dark-guard-script", once: false,
      when: (_state: GameState, ctx: Parameters<(typeof SCRIPTED_EVENTS)[number]["when"]>[1]) =>
        ["onCommand", "onTurnEnd"].includes(ctx.kind) && ctx.commandVerb === "drop",
      run: (state: GameState) => ({ ...state, worldState: { ...state.worldState,
        conditionalTriggers: { ...state.worldState.conditionalTriggers, testSpaDropScript: true },
      } }),
    };
    SCRIPTED_EVENTS.push(event);
    try {
      let state = await runCommand(fixture(), "turn lights off");
      const moves = state.moves;
      state = await runCommand(state, "drop carving knife");
      expect(state.moves).toBe(moves + 1);
      expect(state.worldState.conditionalTriggers.testSpaDropScript).toBeUndefined();
      expect(inventoryHas(state.player.inventory, "CarvingKnife")).toBe(true);
      state = await runCommands(state, ["turn lights on", "drop carving knife"]);
      expect(state.worldState.conditionalTriggers.testSpaDropScript).toBe(true);
    } finally {
      SCRIPTED_EVENTS.splice(SCRIPTED_EVENTS.indexOf(event), 1);
    }
  });

  it("retains FLIP's previous fallback on unrelated items and in other rooms", async () => {
    let state = addInventoryItems(fixture(), ["flashlight"]);
    for (const roomId of ["Spa", "SteamRoom", "NailSalon"]) {
      state = await runCommand(setPlayerRoom(state, roomId), "flip flashlight");
      expect(getLastLogEntry(state)).toContain("I don't understand that.");
    }
    const moves = state.moves;
    state = await runCommand(setPlayerRoom(state, "NailSalon"), "flip lights");
    expect(getLastLogEntry(state)).toContain("I don't understand that.");
    expect(state.moves).toBe(moves);
    expect(isSpaLightOn(state)).toBe(true);
  });
});

describe("Spa light sources and persistence", () => {
  it("distinguishes night vision from physical light and keeps the ambient guard", async () => {
    let state = await runCommand(fixture(), "turn lights off");
    state = addInventoryItems(state, ["NVGoggles"]);
    state = { ...state, itemState: { ...state.itemState, wornByPlayer: { ...state.itemState.wornByPlayer, face: "NVGoggles" },
      itemSettings: { ...state.itemState.itemSettings, NVGoggles: { kind: "goggles", isOn: true } } },
      player: { ...state.player, statusEffects: [{ id: "nightvision-active", intensity: 1, remainingTurns: 10 }] } };
    expect(canPlayerSeeInRoom(state, "Spa")).toBe(true);
    expect(isRoomPhysicallyLit(state, "Spa")).toBe(false);
    expect(isRoomPhysicallyLit(state, "SteamRoom")).toBe(false);
    expect(getRoomVisualLightLevel(state, "SteamRoom")).toBe("dark");
    expect(buildRoomDescription(state, "Spa", { forceFull: true })).toContain("overhead light is off");
    state = await runCommand(state, "examine tiles");
    expect(getLastLogEntry(state)).toContain(BLOCK);
    state = await runCommand(state, "turn lights on");
    expect(isRoomPhysicallyLit(state, "SteamRoom")).toBe(true);
  });

  it.each([false, true])("uses actual ambient light for existing safe respawn selection, ON=%s", async on => {
    let state = fixture();
    if (!on) state = await runCommand(state, "turn lights off");
    state = setPlayerRoom(state, "ParkWest");
    state = { ...state, worldState: { ...state.worldState, visitedRooms: { ParkWest: true, SteamRoom: true } } };
    state = triggerPlayerDeath(state, "A test accident.", "test");
    expect(state.player.roomId).toBe(on ? "SteamRoom" : "PowerGrid");
  });

  it("preserves a carried flashlight without spreading its light between rooms", async () => {
    let state = addInventoryItems(fixture(), ["flashlight"]);
    state = await runCommands(state, ["turn flashlight on", "turn lights off"]);
    expect(canPlayerSeeInRoom(state, "Spa")).toBe(true);
    expect(isRoomPhysicallyLit(state, "Spa")).toBe(true);
    expect(isRoomAmbientlyLit(state, "Spa")).toBe(false);
    expect(isRoomPhysicallyLit(state, "SteamRoom")).toBe(false);
    state = await runCommand(state, "examine tiles");
    expect(getLastLogEntry(state)).toContain(BLOCK);
    state = setPlayerRoom(state, "SteamRoom");
    expect(isRoomPhysicallyLit(state, "SteamRoom")).toBe(true);
    expect(isRoomPhysicallyLit(state, "Spa")).toBe(false);
    state = await runCommand(state, "examine tiles");
    expect(getLastLogEntry(state)).toContain("cool and dry");
  });

  it.each([false, true])("restores switch state and derived illumination, ON=%s", async on => {
    let state = fixture();
    if (!on) state = await runCommand(state, "turn lights off");
    const moves = state.moves;
    expect(saveResumeSnapshot(state)).toBe(true);
    state = (await restoreResumeSnapshot())!;
    expect(state.moves).toBe(moves);
    expectLights(state, on);
    expect(state.worldState.darkRooms.SteamRoom).toBeUndefined();
    state = await runCommand(state, "flip light switch");
    expectLights(state, !on);
  });

  it.each([false, true])("supports manual save and restore, lights ON=%s", async on => {
    let state = fixture();
    if (!on) state = await runCommand(state, "turn lights off");
    state = await runCommand(state, "save");
    const moves = state.moves;
    state = await runCommands(state, ["flip lightswitch", "restore"]);
    expectLights(state, on);
    expect(state.moves).toBe(moves);
  });

  it("resets to lights ON on an ordinary restart from darkness", async () => {
    const state = await runCommands(fixture(), ["turn lights off", "restart"]);
    expect(isSpaLightOn(state)).toBe(true);
    expect(state.moves).toBe(0);
  });

  it("describes the unlit Spa consistently from a night-vision view of Sauna", async () => {
    let state = await runCommand(fixture(), "turn lights off");
    state = setPlayerRoom(state, "Sauna");
    state = { ...state, player: { ...state.player, statusEffects: [{ id: "nightvision-active", intensity: 1, remainingTurns: 10 }] } };
    expect(buildRoomDescription(state, "Sauna", { forceFull: true })).not.toContain("only light to see by");
    expect(buildRoomDescription(state, "Sauna", { forceFull: true })).toContain("Spa beyond the doorway is unlit");
    state = await runCommand(state, "look through porthole");
    expect(getLastLogEntry(state)).toContain("overhead light is off");
  });

  it("upgrades older saves without a switch or state and ignores stale SteamRoom flags", async () => {
    expect(saveResumeSnapshot(fixture())).toBe(true);
    const snapshot = JSON.parse(window.localStorage.getItem("aysf:resume")!);
    snapshot.worldItems = snapshot.worldItems.filter((item: { id: string }) => item.id !== "SpaLightSwitch");
    delete snapshot.worldState.darkRooms.Spa;
    delete snapshot.worldState.darkRooms.Sauna;
    snapshot.worldState.darkRooms.SteamRoom = true;
    delete snapshot.itemState.itemRoomId.SpaLightSwitch;
    window.localStorage.setItem("aysf:resume", JSON.stringify(snapshot));
    let state = (await restoreResumeSnapshot())!;
    expectLights(state, true);
    expect(state.worldState.darkRooms.SteamRoom).toBeUndefined();
    expect(state.world.items.filter(item => item.id === "SpaLightSwitch")).toHaveLength(1);
    state = await runCommand(state, "turn lights off");
    expectLights(state, false);
    state = await runCommand(state, "turn lights on");
    expectLights(state, true);
  });
});

describe("Spa command integration", () => {
  const commands = ["west", "examine tiles", "turn lights off", "examine tiles", "drop carving knife", "open steam room door", "flip light switch", "examine tiles", "drop carving knife", "take carving knife"];

  it("matches the graphical session's command queue and headless command handling", async () => {
    const initial = fixture("ParkWest");
    const controller = overlaySession(setPlayerRoom(initial, "StairWellSeven"));
    await controller.start();
    expect(saveManualSnapshot(initial)).toBe(true);
    await controller.explorer.command("restore");
    const spy = vi.spyOn(engine, "handleCommand");
    const headlessStates: GameState[] = [];
    for (const [index, command] of commands.entries()) {
      const text = observationText(await controller.explorer.command(command));
      const state = await spy.mock.results.at(-1)!.value as GameState;
      headlessStates.push(state);
      if ([3, 4, 5].includes(index)) expect(text).toContain(BLOCK);
      if ([1, 7].includes(index)) expect(text).toContain("Pristine white ceramic tiles");
      if (index === 2) expect(text).toContain(PITCH_BLACK);
    }
    expect(headlessStates.at(-1)!.player.roomId).toBe("Spa");
    await controller.dispose();
    vi.restoreAllMocks();
    expect(saveResumeSnapshot(initial)).toBe(true);
    const { result } = renderHook(() => useGameSession({ onCometCommand: vi.fn(), onInventoryCommand: vi.fn(), onDiagnoseCommand: vi.fn() }));
    await waitFor(() => expect(result.current.isSessionReady).toBe(true));
    for (const [index, command] of commands.entries()) {
      await act(async () => result.current.enqueueCommand(command));
      await waitFor(() => expect(getLastLogEntry(result.current.gs)).toContain(`> ${command}`));
      const state = result.current.gs;
      const reference = headlessStates[index];
      expect(state.moves).toBe(reference.moves);
      expect(state.player.inventory).toEqual(reference.player.inventory);
      expect(state.worldState.darkRooms).toEqual(reference.worldState.darkRooms);
      expect(getLastLogEntry(state)).toBe(getLastLogEntry(reference));
      expect(isRoomPhysicallyLit(state, "SteamRoom")).toBe(isSpaLightOn(state));
    }
  });
});
