import { useEffect, useState } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PowerStationTerminalModal } from "@game/components/PowerStationTerminalModal";
import { createInitialState, mergeWorldChunkIntoState } from "@game/gameInit";
import { tickNpcIdleActions } from "@game/engine/ticks/npcIdleActionsTick";
import { isRoomDark } from "@game/helpers/itemHelpers";
import { canPlayerSeeInRoom, isRoomPhysicallyLit } from "@game/helpers/visibilityHelpers";
import { createTerminalOverlayAdapter } from "@game/harness/terminalOverlays";
import { restoreResumeSnapshot, saveResumeSnapshot } from "@game/persistence/resumeStorage";
import {
  activatePowerSwitch, buildInitialSwitchStates, getNodeStatus, isMenu,
  POWER_GRID_ROOT, statusText, synchronizePowerTerminal,
} from "@game/rules/powerStationTerminal";
import { inventoryHas } from "@game/rules/state";
import { resolveItemByNoun } from "@game/rules/scope";
import { getItemsInRoom } from "@game/selectors/roomSelectors";
import { buildRoomDescription } from "@game/text/roomDescription";
import type { GameState } from "@game/types/gameTypes";
import { DEFERRED_WORLD_CHUNK_IDS, INITIAL_WORLD, loadWorldChunk } from "src/world/World";
import { getChefIdleActions } from "src/world/maps/levelThree/Park/Restaurant/chefInteractions";
import { CHEF_SAMPLE_ID } from "src/world/maps/levelThree/Park/Restaurant/chefSample";
import { isWalkInFreezerOn, synchronizeWalkInFreezer, WALK_IN_ORGANISM_ID } from "src/world/maps/levelThree/Park/Restaurant/walkInFreezer";
import { addInventoryItems, createTestState, runCommand, runCommands } from "./helpers/gameTestHelpers";

const levelThree = POWER_GRID_ROOT.children.find(node => node.id === "lvl3")!;
if (!isMenu(levelThree)) throw new Error("Missing Level Three menu");
const freezer = levelThree.children.find(node => node.id === "RestaurantFreezer")!;

function fixture(roomId = "Kitchen"): GameState {
  const state = createTestState({ roomId, rng: () => 0.99 });
  return {
    ...state,
    world: { ...state.world, meta: { ...state.world.meta, loadedChunkIds: [...DEFERRED_WORLD_CHUNK_IDS] } },
    worldState: {
      ...state.worldState,
      doors: { ...state.worldState.doors, WalkInDoor: { id: "WalkInDoor", isOpen: true, isLocked: false } },
    },
  };
}

function toggle(state: GameState): GameState {
  return synchronizePowerTerminal(state, activatePowerSwitch(freezer, buildInitialSwitchStates(state.worldState)));
}

function occupants(state: GameState): string[] {
  return getItemsInRoom(state, "WalkIn").map(item => item.id);
}

function expectLighting(state: GameState, on: boolean) {
  expect(isWalkInFreezerOn(state)).toBe(on);
  expect(isRoomDark(state, "WalkIn")).toBe(!on);
  expect(isRoomPhysicallyLit(state, "WalkIn")).toBe(on);
  expect(canPlayerSeeInRoom(state, "WalkIn")).toBe(on);
  if (on) expect(state.worldState.darkRooms.WalkIn).toBeUndefined();
  else expect(state.worldState.darkRooms.WalkIn).toBe(true);
}

describe("restaurant freezer power", () => {
  it("displays the Level Three control ON and updates its status and world through the browser", () => {
    let current = fixture("PowerGrid");
    function Terminal() {
      const [state, setState] = useState(current);
      useEffect(() => { current = state; }, [state]);
      return <PowerStationTerminalModal state={state} setGameState={setState} onClose={() => {}} />;
    }
    render(<Terminal />);
    fireEvent.click(screen.getByRole("option", { name: /LEVEL THREE/ }));
    const row = screen.getByRole("option", { name: /Restaurant Walk-In Freezer/ });
    expect(within(row).getByText("ON")).toBeTruthy();
    fireEvent.click(row);
    expect(within(row).getByText("OFF")).toBeTruthy();
    expectLighting(current, false);
    expect(occupants(current)).toContain(WALK_IN_ORGANISM_ID);
    fireEvent.click(row);
    expect(within(row).getByText("ON")).toBeTruthy();
    expectLighting(current, true);
    expect(current.worldState.walkInChefTransformed).toBe(true);
  });

  it("starts lit with the living chef and no organism in the room", async () => {
    const initial = fixture();
    expectLighting(initial, true);
    expect(initial.worldState.walkInChefTransformed).not.toBe(true);
    expect(occupants(initial)).toContain("DoomedChef");
    expect(occupants(initial)).not.toContain(WALK_IN_ORGANISM_ID);
    expect(statusText(getNodeStatus(freezer as Parameters<typeof getNodeStatus>[0], buildInitialSwitchStates(initial.worldState)))).toBe("ON");
    const entered = await runCommand(initial, "west");
    expect(entered.player.roomId).toBe("WalkIn");
    expect(entered.worldState.playerDeaths.WalkIn).toBeUndefined();
    expect(entered.log.join("\n")).toContain('"Hello?" a weak voice calls.');
  });

  it("transforms once on OFF and permanently replaces the chef", () => {
    const state = toggle(fixture());
    expectLighting(state, false);
    expect(state.worldState.walkInChefTransformed).toBe(true);
    expect(occupants(state)).not.toContain("DoomedChef");
    expect(occupants(state).filter(id => id === WALK_IN_ORGANISM_ID)).toHaveLength(1);
    expect(buildInitialSwitchStates(state.worldState).RestaurantFreezer).toBe("off");
    expect(canPlayerSeeInRoom(state, "Kitchen")).toBe(true);
  });

  it("kills on entry and again on returning after the standard respawn", async () => {
    let state = toggle(fixture());
    for (let deaths = 1; deaths <= 3; deaths++) {
      state = await runCommand(state, "west");
      expect(state.worldState.playerDeaths.WalkIn?.cause).toBe("organism");
      expect(state.worldState.playerHuskCount).toBe(8 + deaths);
      expect(state.log.join("\n").match(/\*\*\* You have died \*\*\*/g)).toHaveLength(deaths);
      expect(state.player.roomId).toBe("Kitchen");
      expect(state.log.join("\n")).toContain("*** You have died ***");
      expect(state.worldState.walkInChefTransformed).toBe(true);
      expectLighting(state, false);
      expect(occupants(state).filter(id => id === WALK_IN_ORGANISM_ID)).toHaveLength(1);
    }
  });

  it("does not let night vision bypass the attack", async () => {
    let state = toggle(fixture());
    state = { ...state, player: { ...state.player, statusEffects: [{ id: "nightvision-active", intensity: 1, remainingTurns: 10 }] } };
    expect(canPlayerSeeInRoom(state, "WalkIn")).toBe(true);
    state = await runCommand(state, "west");
    expect(state.worldState.playerDeaths.WalkIn?.cause).toBe("organism");
  });

  it("restores illumination and leaves an interactable organism immobilized in the light", async () => {
    let state = toggle(toggle(fixture()));
    expectLighting(state, true);
    expect(occupants(state)).not.toContain("DoomedChef");
    expect(occupants(state)).toContain(WALK_IN_ORGANISM_ID);
    state = await runCommand(state, "west");
    expect(state.player.roomId).toBe("WalkIn");
    expect(state.worldState.playerDeaths.WalkIn).toBeUndefined();
    expect(buildRoomDescription(state, "WalkIn", { forceFull: true })).toContain("glassy sculpture");
    state = await runCommand(state, "examine organism");
    expect(state.log.at(-1)).toContain("rigid in the light");
    state = await runCommands(state, ["take sculpture", "wait", "wait", "wait"]);
    expect(state.log.join("\n")).toContain("You leave the organism alone.");
    expect(state.worldState.playerDeaths.WalkIn).toBeUndefined();
    expect(occupants(state)).toContain(WALK_IN_ORGANISM_ID);
    expect(occupants(state)).not.toContain("DoomedChef");
  });

  it("makes the freezer lethal again after power is restored and then cut again", async () => {
    let state = toggle(toggle(toggle(fixture())));
    expectLighting(state, false);
    state = await runCommand(state, "west");
    expect(state.worldState.playerDeaths.WalkIn?.cause).toBe("organism");
    expect(occupants(state).filter(id => id === WALK_IN_ORGANISM_ID)).toHaveLength(1);
  });

  it("suppresses chef dialogue, greetings, idles, head responses and tissue sampling after transformation", async () => {
    let state = addInventoryItems(toggle(toggle(fixture())), ["CarvingKnife"]);
    state = await runCommand(state, "west");
    expect(resolveItemByNoun(state, "chef")).toBeUndefined();
    const chef = state.world.items.find(item => item.id === "DoomedChef")!;
    expect(getChefIdleActions(state, chef)).toEqual([]);
    state = await runCommands(state, ["talk to chef", "examine chef", "search chef", "carve sample from chef", "cut chef", "cut off chef's head with knife"]);
    expect(state.worldState.chefSample).toBeUndefined();
    expect(inventoryHas(state.player.inventory, CHEF_SAMPLE_ID)).toBe(false);
    const logs = state.log.join("\n");
    expect(logs).not.toContain('"Hello?" a weak voice calls.');
    expect(logs).not.toContain("Take as much as you need");
    expect(logs).not.toContain("Must you? I have so little");
    expect(logs).not.toContain("body mangled");
    const idled = tickNpcIdleActions({ ...state, rng: () => 0.99 });
    expect(idled.log.slice(state.log.length).join("\n")).not.toMatch(/chef|pulls me|feel my/);
  });

  it("preserves samples already collected through repeated toggles", async () => {
    let state = await runCommand(addInventoryItems(fixture("WalkIn"), ["CarvingKnife"]), "carve sample from chef");
    const sampleState = state.worldState.chefSample;
    const sampleLocation = state.itemState.itemRoomId[CHEF_SAMPLE_ID];
    for (let i = 0; i < 6; i++) state = toggle(state);
    expect(state.worldState.chefSample).toEqual(sampleState);
    expect(state.itemState.itemRoomId[CHEF_SAMPLE_ID]).toBe(sampleLocation);
    expect(inventoryHas(state.player.inventory, CHEF_SAMPLE_ID)).toBe(true);
    expect(saveResumeSnapshot(state)).toBe(true);
    state = (await restoreResumeSnapshot())!;
    expect(state.worldState.chefSample).toEqual(sampleState);
    expect(state.itemState.itemRoomId[CHEF_SAMPLE_ID]).toBe(sampleLocation);
    expect(inventoryHas(state.player.inventory, CHEF_SAMPLE_ID)).toBe(true);
  });

  it("keeps unrelated darkness and power controls intact across repeated toggles and synchronization", () => {
    const initial = fixture();
    let state = initial;
    for (let i = 0; i < 12; i++) {
      state = toggle(state);
      state = synchronizePowerTerminal(state, buildInitialSwitchStates(state.worldState));
      const others = { ...state.worldState.darkRooms };
      delete others.WalkIn;
      expect(others).toEqual(initial.worldState.darkRooms);
      expect(occupants(state).filter(id => id === WALK_IN_ORGANISM_ID)).toHaveLength(1);
      expect(state.world.items.filter(item => item.id === WALK_IN_ORGANISM_ID)).toHaveLength(1);
    }
    expect(state.worldState.powerRestoredSections).toEqual(initial.worldState.powerRestoredSections);
    state = synchronizePowerTerminal(state, { Lvl3Terminal: "off", TPADPOWER1: "on" });
    expect(state.worldState.powerRestoredSections["library-power"]).toBe(false);
    expect(state.worldState.powerRestoredSections["teleport-pads-green"]).toBe(true);
    expect(state.worldState.walkInChefTransformed).toBe(true);
    expect(occupants(state)).not.toContain("DoomedChef");
  });

  it("supports the same menu and transitions through the headless adapter", async () => {
    const adapter = createTerminalOverlayAdapter();
    const overlay = { kind: "power-station-terminal" as const, isOn: true };
    let state = adapter.open(fixture("PowerGrid"), overlay);
    let result = await adapter.command(state, overlay, "select 4");
    expect(result.text.join("\n")).toContain("Restaurant Walk-In Freezer: ON");
    result = await adapter.command(result.state, overlay, "select 5");
    expect(result.text.join("\n")).toContain("Restaurant Walk-In Freezer: OFF");
    expectLighting(result.state, false);
    result = await adapter.command(result.state, overlay, "select 5");
    expect(result.text.join("\n")).toContain("Restaurant Walk-In Freezer: ON");
    state = result.state;
    expectLighting(state, true);
    expect(occupants(state)).not.toContain("DoomedChef");
  });

  it("records the transformation before Level Three is loaded", async () => {
    let state = toggle(createInitialState(INITIAL_WORLD));
    expect(state.world.items.some(item => item.id === "DoomedChef")).toBe(false);
    state = mergeWorldChunkIntoState(state, "level-three", await loadWorldChunk("level-three"));
    expect(occupants(state)).not.toContain("DoomedChef");
    expect(occupants(state)).toContain(WALK_IN_ORGANISM_ID);
    expectLighting(state, false);
    state = toggle(state);
    expect(occupants(state)).not.toContain("DoomedChef");
  });
});

describe("restaurant freezer persistence", () => {
  it.each([0, 1, 2])("saves and resumes valid state after %i toggles", async toggles => {
    let state = fixture();
    for (let i = 0; i < toggles; i++) state = toggle(state);
    expect(saveResumeSnapshot(state)).toBe(true);
    state = (await restoreResumeSnapshot())!;
    expect(state).toBeTruthy();
    expectLighting(state, toggles !== 1);
    expect(state.worldState.walkInChefTransformed).toBe(toggles > 0);
    expect(occupants(state).includes("DoomedChef")).toBe(toggles === 0);
    expect(occupants(state).includes(WALK_IN_ORGANISM_ID)).toBe(toggles > 0);
    if (toggles === 1) {
      state = await runCommand(state, "west");
      expect(state.worldState.playerDeaths.WalkIn?.cause).toBe("organism");
    }
  });

  it.each([1, 2])("manual restore preserves transformation after %i toggles", async toggles => {
    let state = fixture();
    for (let i = 0; i < toggles; i++) state = toggle(state);
    state = await runCommand(state, "save");
    state = toggle(state);
    state = await runCommand(state, "restore");
    expectLighting(state, toggles === 2);
    expect(state.worldState.walkInChefTransformed).toBe(true);
    expect(occupants(state)).not.toContain("DoomedChef");
    expect(occupants(state)).toContain(WALK_IN_ORGANISM_ID);
  });

  it("upgrades old saves without freezer state or the new creature", async () => {
    expect(saveResumeSnapshot(fixture())).toBe(true);
    const snapshot = JSON.parse(window.localStorage.getItem("aysf:resume")!);
    delete snapshot.worldState.powerRestoredSections["restaurant-freezer"];
    delete snapshot.worldState.walkInChefTransformed;
    delete snapshot.itemState.itemRoomId[WALK_IN_ORGANISM_ID];
    snapshot.worldItems = snapshot.worldItems.filter((item: { id: string }) => item.id !== WALK_IN_ORGANISM_ID);
    window.localStorage.setItem("aysf:resume", JSON.stringify(snapshot));
    let state = (await restoreResumeSnapshot())!;
    expectLighting(state, true);
    expect(state.worldState.walkInChefTransformed).toBe(false);
    expect(occupants(state)).toContain("DoomedChef");
    expect(occupants(state)).not.toContain(WALK_IN_ORGANISM_ID);
    state = toggle(state);
    expect(occupants(state)).not.toContain("DoomedChef");
    expect(occupants(state)).toContain(WALK_IN_ORGANISM_ID);
  });

  it.each([false, true])("repairs stale restored lighting and placements with power ON=%s", async on => {
    let state = toggle(fixture());
    if (on) state = toggle(state);
    expect(saveResumeSnapshot(state)).toBe(true);
    const snapshot = JSON.parse(window.localStorage.getItem("aysf:resume")!);
    snapshot.worldState.darkRooms.WalkIn = on;
    snapshot.itemState.itemRoomId.DoomedChef = "WalkIn";
    snapshot.itemState.itemRoomId[WALK_IN_ORGANISM_ID] = "seeded";
    window.localStorage.setItem("aysf:resume", JSON.stringify(snapshot));
    state = (await restoreResumeSnapshot())!;
    expectLighting(state, on);
    expect(occupants(state)).not.toContain("DoomedChef");
    expect(occupants(state)).toContain(WALK_IN_ORGANISM_ID);
    expect(synchronizeWalkInFreezer(state)).toBe(state);
  });
});
