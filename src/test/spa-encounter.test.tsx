import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import * as engine from "@game/engine/handleCommand";
import * as actions from "@game/actions/dispatchAction";
import { useGameSession } from "@game/hooks/useGameSession";
import { getItemPlacementContext, stashItemInContainer } from "@game/helpers/itemPlacement";
import { canPlayerSeeInRoom, getRoomAmbientLightLevel, getRoomVisualLightLevel, isRoomPhysicallyLit } from "@game/helpers/visibilityHelpers";
import { restoreResumeSnapshot, saveManualSnapshot, saveResumeSnapshot } from "@game/persistence/resumeStorage";
import { setCoolerModeInState } from "@game/rules/cooler";
import { setItemOpen } from "@game/rules/containers";
import { upsertDoorState } from "@game/rules/doors";
import { updateItemLocation } from "@game/rules/items";
import { inventoryHas } from "@game/rules/state";
import { useUIEffectsStore } from "@game/store/store";
import type { ActionResult } from "@game/types/actionsTypes";
import type { GameState } from "@game/types/gameTypes";
import { DEFERRED_WORLD_CHUNK_IDS } from "src/world/World";
import { CHEF_SAMPLE_EXPIRATION_MESSAGE, getChefSampleEnvironment } from "src/world/maps/levelThree/Park/Restaurant/chefSample";
import { getSpaOrganismReaction, SPA_ORGANISM_ID } from "src/world/maps/levelThree/Park/spaOrganism";
import { addInventoryItems, createTestState, getLastLogEntry, patchRoomDarkness, runCommand, runCommands, setPlayerRoom } from "./helpers/gameTestHelpers";
import { observationText, overlaySession } from "./helpers/headlessOverlayHelpers";

const SAMPLE = "ChefSample";
const RUSH = "passes close beside you";
const BLOCK = "It's too dark to do that";
const location = (state: GameState) => getItemPlacementContext(state, SPA_ORGANISM_ID).roomId;
const remaining = (state: GameState) => state.worldState.chefSample?.remainingWarmTurns;

function fixture(roomId = "Spa"): GameState {
  const state = createTestState({ roomId, rng: () => 0.99, visitedRooms: [roomId, "ParkWest", "Kitchen", "WalkIn"] });
  return { ...state, world: { ...state.world, meta: { ...state.world.meta, loadedChunkIds: [...DEFERRED_WORLD_CHUNK_IDS] } } };
}
function door(state: GameState, id: string, open = true, locked = false) {
  return upsertDoorState(state, { id, isOpen: open, isLocked: locked });
}
function bait(state: GameState, room = "SteamRoom", turns = 4): GameState {
  const next = updateItemLocation(state, SAMPLE, room);
  return { ...next, worldState: { ...next.worldState, chefSample: { remainingWarmTurns: turns } } };
}
function ready() { return bait(door(door(fixture(), "CedarDoor"), "SteamRoomDoor")); }
function contained(state: GameState, open = true) {
  return stashItemInContainer(setItemOpen(updateItemLocation(state, "Cooler", "SteamRoom"), "Cooler", open), SAMPLE, "Cooler");
}
function flashlight(state: GameState): GameState {
  const next = addInventoryItems(state, ["flashlight"]);
  return { ...next, itemState: { ...next.itemState, itemSettings: { ...next.itemState.itemSettings,
    flashlight: { kind: "flashlight", isOn: true, currentCharge: 100, maxCharge: 100, drainRate: 0.05, rechargeRate: 10 },
  } } };
}
function nightVision(state: GameState): GameState {
  const next = addInventoryItems(state, ["NVGoggles"]);
  return { ...next, itemState: { ...next.itemState,
    wornByPlayer: { ...next.itemState.wornByPlayer, face: "NVGoggles" },
    itemSettings: { ...next.itemState.itemSettings, NVGoggles: { kind: "goggles", isOn: true } } },
    player: { ...next.player, statusEffects: [{ id: "nightvision-active", intensity: 1, remainingTurns: 100 }] } };
}
function expectGone(state: GameState) {
  expect(remaining(state)).toBeUndefined();
  expect(state.itemState.itemRoomId[SAMPLE]).toBe("seeded");
  expect(inventoryHas(state.player.inventory, SAMPLE)).toBe(false);
  expect(state.itemState.attachedTo[SAMPLE]).toBeUndefined();
  expect(state.itemState.frozenItems[SAMPLE]).toBeUndefined();
  for (const lists of [state.itemState.containerContents, state.itemState.containerFilled,
    state.itemState.surfaceContents, state.itemState.underContents, state.itemState.searchableContents]) {
    expect(Object.values(lists).flat()).not.toContain(SAMPLE);
  }
  expect(state.world.items.filter(item => item.id === SAMPLE)).toHaveLength(1);
  expect(state.world.items.filter(item => item.id === SPA_ORGANISM_ID)).toHaveLength(1);
}
function expectSuccess(state: GameState) {
  expect(state.player.roomId).toBe("Spa");
  expect(location(state)).toBe("SteamRoom");
  expect(state.worldState.playerDeaths.Spa).toBeUndefined();
  expect(state.log.join("\n")).toContain(RUSH);
  expect(state.log.join("\n").split(RUSH)).toHaveLength(2);
  expect(state.worldState.conditionalTriggers.SpaOrganismLeftSauna).toBe(true);
  expectGone(state);
}
function expectDeath(state: GameState) {
  expect(state.player.roomId).not.toBe("Spa");
  expect(state.worldState.playerDeaths.Spa?.cause).toBe("organism");
  expect(location(state)).toBe("Spa");
  expect(state.log.join("\n").split("*** You have died ***")).toHaveLength(2);
  expect(useUIEffectsStore.getState().organismDeath).not.toBeNull();
  expectGone(state);
}

const offCommands = ["flip lightswitch", "flip light switch", "flip the light switch", "flip switch", "flip rocker", "flip lights",
  ...["turn", "switch", "flip"].flatMap(verb => ["light", "lights", "light switch", "lightswitch", "overhead light"]
    .flatMap(noun => [`${verb} ${noun} off`, `${verb} off ${noun}`]))];

describe("complete Spa encounter", () => {
  it.each(offCommands)("resolves the successful lure once through '%s'", async command => {
    const initial = ready();
    expect(location(initial)).toBe("Sauna");
    expect(isRoomPhysicallyLit(initial, "Spa")).toBe(true);
    expect(isRoomPhysicallyLit(initial, "Sauna")).toBe(false);
    const state = await runCommand(initial, command);
    expectSuccess(state);
    expect(state.moves).toBe(initial.moves + 1);
    expect(isRoomPhysicallyLit(state, "SteamRoom")).toBe(false);
    expect(Object.getOwnPropertySymbols(state)).toHaveLength(0);
  });

  it.each(["none", "steam door closed", "closed cooler", "frozen", "expired", "elsewhere", "hidden", "nested closed", "steam door locked"])(
    "kills once when the initial lure fails: %s", async kind => {
      let state = ready();
      if (kind === "none") state = door(door(fixture(), "CedarDoor"), "SteamRoomDoor");
      if (kind === "steam door closed") state = door(state, "SteamRoomDoor", false);
      if (kind === "steam door locked") state = door(state, "SteamRoomDoor", true, true);
      if (kind === "closed cooler") state = contained(state, false);
      if (kind === "frozen") state = setCoolerModeInState(contained(state), "freeze");
      if (kind === "expired") state = bait(state, "SteamRoom", 0);
      if (kind === "elsewhere") state = bait(state, "Kitchen");
      if (kind === "hidden") state = { ...state, itemState: { ...state.itemState, underContents: { SteamRoomBench: [SAMPLE] } } };
      if (kind === "nested closed") {
        state = stashItemInContainer(contained(state), "saunacorpsepurse", "Cooler");
        state = stashItemInContainer(setItemOpen(state, "saunacorpsepurse", false), SAMPLE, "saunacorpsepurse");
      }
      const moves = state.moves;
      const dead = await runCommand(state, "turn off lights");
      expectDeath(dead);
      expect(dead.moves).toBe(moves + 1);
      expect(dead.log.join("\n")).not.toContain(RUSH);
    },
  );

  it.each([false, true])("a closed Sauna door prevents the rush, bait=%s", async hasBait => {
    const initial = hasBait ? door(ready(), "CedarDoor", false) : fixture();
    const state = await runCommand(initial, "turn lights off");
    expect(state.player.roomId).toBe("Spa");
    expect(location(state)).toBe("Sauna");
    expect(state.worldState.playerDeaths.Spa).toBeUndefined();
    expect(state.worldState.conditionalTriggers.SpaOrganismLeftSauna).toBeUndefined();
  });

  it("a flashlight blocks the rush, explains why, and supports retry", async () => {
    let state = await runCommand(flashlight(ready()), "turn lights off");
    expect(state.player.roomId).toBe("Spa");
    expect(location(state)).toBe("Sauna");
    expect(getLastLogEntry(state)).toContain("flashlight still illuminates");
    expect(remaining(state)).toBe(3);
    state = await runCommand(state, "turn flashlight off");
    expect(state.log.join("\n")).toContain(BLOCK);
    expect(isRoomPhysicallyLit(state, "Spa")).toBe(true);
    // Renew the fixture's bait budget; the command-level acceptance covers extraction.
    state = bait(state);
    state = await runCommands(state, ["turn lights on", "turn flashlight off", "turn lights off"]);
    expectSuccess(state);
    expect(state.log.join("\n")).not.toContain(CHEF_SAMPLE_EXPIRATION_MESSAGE);
  });

  it("resolves battery exhaustion before deciding whether the route is physically lit", async () => {
    const initial = flashlight(ready());
    const state = { ...initial, itemState: { ...initial.itemState, itemSettings: { ...initial.itemState.itemSettings,
      flashlight: { kind: "flashlight" as const, isOn: true, currentCharge: 0.01, maxCharge: 100, drainRate: 0.05, rechargeRate: 10 },
    } } };
    expectSuccess(await runCommand(state, "turn lights off"));
  });

  it("night vision allows sight but does not prevent the rush", async () => {
    const state = await runCommand(nightVision(ready()), "turn lights off");
    expectSuccess(state);
    expect(state.player.statusEffects.some(effect => effect.id === "nightvision-active")).toBe(true);
    expect(isRoomPhysicallyLit(state, "Spa")).toBe(false);
  });

  it.each(["floor", "open cooler", "nested open"])("absorbs last-turn bait from %s before expiration", async placement => {
    let state = bait(ready(), "SteamRoom", 1);
    if (placement !== "floor") state = contained(state);
    if (placement === "nested open") {
      state = stashItemInContainer(state, "saunacorpsepurse", "Cooler");
      state = stashItemInContainer(setItemOpen(state, "saunacorpsepurse", true), SAMPLE, "saunacorpsepurse");
    }
    expect(getChefSampleEnvironment(state).sculpture).toBe(true);
    const next = await runCommand(state, "turn lights off");
    expectSuccess(next);
    expect(next.log.join("\n")).not.toContain(CHEF_SAMPLE_EXPIRATION_MESSAGE);
    const replacement = await runCommand(addInventoryItems(setPlayerRoom(next, "WalkIn"), ["CarvingKnife"]), "carve sample from chef");
    expect(remaining(replacement)).toBe(4);
  });

  it("idempotent OFF grants no crossing exception to an otherwise valid lure", async () => {
    const state = await runCommand(patchRoomDarkness(ready(), "Spa", true), "turn off lights");
    expectDeath(state);
    expect(state.log.join("\n")).toContain("The light is already off.");
    expect(state.log.join("\n")).not.toContain(RUSH);
  });

  it("carried bait retains ordinary sample contact death instead of protecting the player", async () => {
    let state = addInventoryItems(bait(ready(), "INVENTORY"), [SAMPLE]);
    state = await runCommand(state, "turn lights off");
    expect(state.worldState.playerDeaths.Spa?.cause).toBe("organism");
    expect(location(state)).toBe("Sauna");
    expectGone(state);
    expect(state.log.join("\n").split("*** You have died ***")).toHaveLength(2);
  });
});

describe("ordinary behavior after the Spa lure", () => {
  it("gives the next command to the player, then relights and physically traps the organism", async () => {
    let state = await runCommand(ready(), "turn lights off");
    expectSuccess(state);
    state = await runCommand(state, "turn lights on");
    expect(location(state)).toBe("SteamRoom");
    expect(getSpaOrganismReaction(state).active).toBe(false);
    state = await runCommand(state, "close steam room door");
    expect(state.worldState.doors.SteamRoomDoor.isOpen).toBe(false);
    state = await runCommands(state, ["turn lights off", "wait", "turn lights on"]);
    expect(location(state)).toBe("SteamRoom");
    expect(state.player.roomId).toBe("Spa");
    expect(state.worldState.playerDeaths.Spa).toBeUndefined();
  });

  it.each(["wait", "turn lights off", "close steam room door"])("delaying relighting with '%s' permits one ordinary contact attack", async command => {
    const initial = await runCommand(ready(), "turn lights off");
    const state = await runCommand(initial, command);
    expectDeath(state);
    expect(state.moves).toBe(initial.moves + 1);
    if (command === "close steam room door") {
      expect(state.log.join("\n")).toContain(BLOCK);
      expect(state.worldState.doors.SteamRoomDoor.isOpen).toBe(true);
    }
    expect(state.log.join("\n").split(RUSH)).toHaveLength(2);
  });

  it("free information and saving do not consume the relighting opportunity", async () => {
    let state = await runCommand(ready(), "turn lights off");
    const moves = state.moves;
    state = await runCommands(state, ["inventory", "look", "save", "help"]);
    expect(state.moves).toBe(moves);
    expect(location(state)).toBe("SteamRoom");
    state = await runCommand(state, "turn lights on");
    expect(state.player.roomId).toBe("Spa");
  });

  it("an independently illuminated SteamRoom cannot be escaped into a dark Spa", async () => {
    const light = await import("@game/helpers/visibilityHelpers");
    const original = light.isRoomPhysicallyLit;
    let state = await runCommand(ready(), "turn lights off");
    const spy = vi.spyOn(light, "isRoomPhysicallyLit").mockImplementation((s, room) => room === "SteamRoom" || original(s, room));
    try {
      state = await runCommand(state, "wait");
      expect(location(state)).toBe("SteamRoom");
      expect(state.player.roomId).toBe("Spa");
    } finally { spy.mockRestore(); }
  });

  it("does not remotely immobilize an organism in Sauna when Spa is relit", async () => {
    let state = await runCommand(ready(), "turn lights off");
    state = updateItemLocation(state, SPA_ORGANISM_ID, "Sauna");
    state = await runCommand(state, "turn lights on");
    expect(getSpaOrganismReaction(state).active).toBe(true);
    expect(location(state)).toBe("Sauna");
    expect(state.player.roomId).toBe("Spa");
  });

  it("does not replay the special crossing after the creature returns to Sauna, even after restore", async () => {
    let state = await runCommand(ready(), "turn lights off");
    // Let ordinary bait pursuit actually return it through Spa to Sauna.
    state = bait(setPlayerRoom(state, "ParkWest"), "Sauna");
    state = await runCommands(state, ["wait", "wait"]);
    expect(location(state)).toBe("Sauna");
    expectGone(state);
    state = patchRoomDarkness(bait(setPlayerRoom(state, "Spa")), "Spa", false);
    expect(saveResumeSnapshot(state)).toBe(true);
    state = (await restoreResumeSnapshot())!;
    state = await runCommand(state, "turn lights off");
    expectDeath(state);
    expect(state.log.join("\n").split(RUSH)).toHaveLength(2);
  });

  it("supports a complete retry after death without resetting creature placement", async () => {
    const initial = addInventoryItems(door(door(fixture(), "CedarDoor"), "SteamRoomDoor"), ["flashlight", "CarvingKnife", "Cooler"]);
    let state = await runCommand(initial, "turn lights off");
    expectDeath(state);
    expect(state.player.roomId).toBe("ParkWest");
    state = await runCommands(state, ["turn flashlight on", "west", "turn lights on"]);
    expect(state.player.roomId).toBe("Spa");
    expect(location(state)).toBe("Spa");
    expect(getSpaOrganismReaction(state).active).toBe(false);
    state = await runCommands(state, ["east", "southeast", "southwest", "west", "west"]);
    expect(state.player.roomId).toBe("WalkIn");
    state = await runCommands(state, ["open cooler", "carve sample from chef", "put sample in cooler", "set cooler"]);
    state = (await actions.dispatchAction(state, { verb: "setCoolerMode", payload: { mode: "freeze" } })).state;
    expect(remaining(state)).toBe(4);
    state = await runCommands(state, ["east", "east", "northeast", "northwest", "west", "south", "drop cooler", "set cooler"]);
    state = (await actions.dispatchAction(state, { verb: "setCoolerMode", payload: { mode: "off" } })).state;
    state = await runCommands(state, ["north", "turn lights off"]);
    // The carried beam holds the organism in Spa until the player leaves safely.
    expect(location(state)).toBe("Spa");
    expect(remaining(state)).toBe(2);
    state = await runCommand(state, "east");
    expect(location(state)).toBe("SteamRoom");
    expectGone(state);
    state = await runCommands(state, ["west", "turn lights on", "close steam room door"]);
    expect(state.player.roomId).toBe("Spa");
    expect(location(state)).toBe("SteamRoom");
    expect(state.worldState.doors.SteamRoomDoor.isOpen).toBe(false);
    expect(state.log.join("\n").split("*** You have died ***")).toHaveLength(2);
    expect(state.log.join("\n")).not.toContain(RUSH);
  });
});

describe("Spa encounter persistence", () => {
  it.each([5, 6])("retains an active sample from the previous six-turn setting with %s remaining", async turns => {
    const state = setCoolerModeInState(contained(bait(ready(), "SteamRoom", turns)), "freeze");
    expect(saveResumeSnapshot(state)).toBe(true);
    const restored = (await restoreResumeSnapshot())!;
    expect(remaining(restored)).toBe(4);
    expect(restored.itemState.containerContents.Cooler).toContain(SAMPLE);
    expect(getChefSampleEnvironment(restored).frozen).toBe(true);
    expect(location(restored)).toBe("Sauna");
  });

  it.each(["before", "relocated", "trapped"])("restores %s encounter state without an extra turn", async point => {
    let state = ready();
    if (point !== "before") state = await runCommand(state, "turn lights off");
    if (point === "trapped") state = await runCommands(state, ["turn lights on", "close steam room door"]);
    const moves = state.moves;
    expect(saveResumeSnapshot(state)).toBe(true);
    expect(Object.getOwnPropertySymbols(state)).toHaveLength(0);
    const restored = (await restoreResumeSnapshot())!;
    expect(restored.moves).toBe(moves);
    expect(location(restored)).toBe(location(state));
    expect(restored.worldState.darkRooms).toEqual(state.worldState.darkRooms);
    expect(restored.worldState.doors).toEqual(state.worldState.doors);
    expect(remaining(restored)).toBe(remaining(state));
    if (point === "before") expectSuccess(await runCommand(restored, "turn lights off"));
    else {
      expectGone(restored);
      const next = await runCommand(restored, point === "relocated" ? "turn lights on" : "turn lights off");
      expect(next.player.roomId).toBe("Spa");
      expect(location(next)).toBe("SteamRoom");
      expect(next.log.join("\n").split(RUSH)).toHaveLength(2);
    }
  });
});

describe("Spa encounter interfaces and acceptance", () => {
  it("completes the four-turn puzzle and explores Sauna using actual headless player commands", async () => {
    const initial = addInventoryItems(fixture("WalkIn"), ["CarvingKnife", "Cooler"]);
    const controller = overlaySession(setPlayerRoom(initial, "StairWellSeven"));
    const commandSpy = vi.spyOn(engine, "handleCommand");
    const actionSpy = vi.spyOn(actions, "dispatchAction");
    try {
      await controller.start();
      expect(saveManualSnapshot(initial)).toBe(true);
      await controller.explorer.command("restore");
      for (const command of ["open cooler", "carve sample from chef", "put sample in cooler", "set cooler"]) await controller.explorer.command(command);
      await controller.explorer.command("freeze");
      const frozen = (await actionSpy.mock.results.at(-1)!.value as ActionResult).state;
      expect(frozen.player.roomId).toBe("WalkIn");
      expect(remaining(frozen)).toBe(4);
      expect(getChefSampleEnvironment(frozen).frozen).toBe(true);
      for (const command of ["close", "close cooler", "east", "east", "northeast", "northwest", "west",
        "open sauna door", "open steam room door", "south", "drop cooler", "open cooler", "set cooler"]) {
        await controller.explorer.command(command);
      }
      await controller.explorer.command("off");
      const thawed = (await actionSpy.mock.results.at(-1)!.value as ActionResult).state;
      expect(thawed.player.roomId).toBe("SteamRoom");
      expect(remaining(thawed)).toBe(4);
      expect(getChefSampleEnvironment(thawed).frozen).toBe(false);
      await controller.explorer.command("close");
      await controller.explorer.command("north");
      const atSwitch = await commandSpy.mock.results.at(-1)!.value as GameState;
      expect(remaining(atSwitch)).toBe(3);
      expect(atSwitch.worldState.doors.CedarDoor.isOpen).toBe(true);
      expect(atSwitch.worldState.doors.SteamRoomDoor.isOpen).toBe(true);
      const crossed = observationText(await controller.explorer.command("turn lights off"));
      const absorbed = await commandSpy.mock.results.at(-1)!.value as GameState;
      expectSuccess(absorbed);
      expect(crossed).toContain(RUSH);
      expect(crossed).toContain("organism engulfs the sample");
      expect(crossed).not.toContain("SIGNAL RECEIVED");
      await controller.explorer.command("turn lights on");
      const lit = await commandSpy.mock.results.at(-1)!.value as GameState;
      expect(location(lit)).toBe("SteamRoom");
      expect(getSpaOrganismReaction(lit).active).toBe(false);
      await controller.explorer.command("close steam room door");
      const trapped = await commandSpy.mock.results.at(-1)!.value as GameState;
      expect(trapped.player.roomId).toBe("Spa");
      expect(trapped.worldState.doors.SteamRoomDoor.isOpen).toBe(false);
      expect(trapped.worldState.playerDeaths.Spa).toBeUndefined();
      expect(trapped.moves).toBe(atSwitch.moves + 3);
      expectGone(trapped);
      expect(trapped.log.join("\n")).not.toContain(CHEF_SAMPLE_EXPIRATION_MESSAGE);
      expect(getRoomAmbientLightLevel(trapped, "Sauna")).toBe("very-dim");
      expect(getRoomVisualLightLevel(trapped, "Sauna")).toBe("very-dim");
      expect(canPlayerSeeInRoom(trapped, "Sauna")).toBe(true);
      const entered = observationText(await controller.explorer.command("north"));
      expect(entered).toContain("Very dim light enters through the open cedar door");
      expect(entered).not.toContain("It's pitch black");
      expect(observationText(await controller.explorer.command("examine Freeny Salk"))).toContain("Freeny Salk");
      expect(observationText(await controller.explorer.command("examine purse"))).toContain("ID window");
      await controller.explorer.command("take purse");
      await controller.explorer.command("open purse");
      const explored = await commandSpy.mock.results.at(-1)!.value as GameState;
      expect(explored.player.roomId).toBe("Sauna");
      expect(inventoryHas(explored.player.inventory, "saunacorpsepurse")).toBe(true);
      expect(explored.itemState.openItems.saunacorpsepurse).toBe(true);
      expect(explored.worldState.playerDeaths.Sauna).toBeUndefined();
      expect(explored.worldState.playerDeaths.Spa).toBeUndefined();
      expect(explored.worldState.doors.SteamRoomDoor.isOpen).toBe(false);
      expect(location(explored)).toBe("SteamRoom");
      expect(getSpaOrganismReaction(explored).active).toBe(false);
    } finally { await controller.dispose(); vi.restoreAllMocks(); }
  });

  it("matches graphical command queuing and headless state through crossing, trapping and Sauna exploration", async () => {
    const initial = ready();
    const commands = ["turn lights off", "turn lights on", "close steam room door", "turn lights off", "turn lights on",
      "north", "examine Freeny Salk", "examine purse", "take purse", "open purse"];
    const controller = overlaySession(setPlayerRoom(initial, "StairWellSeven"));
    const reference: GameState[] = [];
    try {
      await controller.start();
      expect(saveManualSnapshot(initial)).toBe(true);
      await controller.explorer.command("restore");
      const spy = vi.spyOn(engine, "handleCommand");
      for (const command of commands) {
        await controller.explorer.command(command);
        reference.push(await spy.mock.results.at(-1)!.value as GameState);
      }
    } finally { await controller.dispose(); vi.restoreAllMocks(); }
    expect(saveResumeSnapshot(initial)).toBe(true);
    const { result } = renderHook(() => useGameSession({ onCometCommand: vi.fn(), onInventoryCommand: vi.fn(), onDiagnoseCommand: vi.fn() }));
    await waitFor(() => expect(result.current.isSessionReady).toBe(true));
    for (const [index, command] of commands.entries()) {
      await act(async () => result.current.enqueueCommand(command));
      await waitFor(() => expect(result.current.gs.moves).toBe(reference[index].moves));
      const graphical = result.current.gs;
      expect(graphical.player.roomId).toBe(reference[index].player.roomId);
      expect(graphical.worldState.playerDeaths).toEqual(reference[index].worldState.playerDeaths);
      expect(graphical.worldState.conditionalTriggers).toEqual(reference[index].worldState.conditionalTriggers);
      expect(graphical.worldState.doors).toEqual(reference[index].worldState.doors);
      expect(graphical.worldState.darkRooms).toEqual(reference[index].worldState.darkRooms);
      // Unrelated roaming creatures use fresh RNG after each restore.
      for (const id of [SPA_ORGANISM_ID, SAMPLE, "Cooler", "saunacorpsepurse"]) {
        expect(graphical.itemState.itemRoomId[id]).toBe(reference[index].itemState.itemRoomId[id]);
      }
      expect(graphical.itemState.containerContents).toEqual(reference[index].itemState.containerContents);
      expect(graphical.itemState.openItems).toEqual(reference[index].itemState.openItems);
      expect(graphical.worldState.chefSample).toEqual(reference[index].worldState.chefSample);
      expect(graphical.player.inventory).toEqual(reference[index].player.inventory);
      expect(getRoomAmbientLightLevel(graphical, "Sauna")).toBe(getRoomAmbientLightLevel(reference[index], "Sauna"));
      expect(graphical.log).toEqual(reference[index].log.slice(1));
      expectGone(graphical);
    }
  });
});
