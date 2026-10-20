import { describe, expect, it, vi } from "vitest";
import * as engine from "@game/engine/handleCommand";
import * as actions from "@game/actions/dispatchAction";
import { canPlayerSeeInRoom } from "@game/helpers/visibilityHelpers";
import { getItemPlacementContext, stashItemInContainer } from "@game/helpers/itemPlacement";
import { restoreResumeSnapshot, saveManualSnapshot, saveResumeSnapshot } from "@game/persistence/resumeStorage";
import { setCoolerModeInState } from "@game/rules/cooler";
import { setItemOpen } from "@game/rules/containers";
import { upsertDoorState } from "@game/rules/doors";
import { updateItemLocation } from "@game/rules/items";
import { findOrganismRoute, isOrganismRoomActive } from "@game/rules/organismMovement";
import { inventoryHas } from "@game/rules/state";
import { useUIEffectsStore } from "@game/store/store";
import type { ActionResult } from "@game/types/actionsTypes";
import type { GameState } from "@game/types/gameTypes";
import { DEFERRED_WORLD_CHUNK_IDS } from "src/world/World";
import { CHEF_SAMPLE_EXPIRATION_MESSAGE, getAccessibleChefSampleRoom, getChefSampleEnvironment } from "src/world/maps/levelThree/Park/Restaurant/chefSample";
import { getSpaOrganismReaction, SPA_ORGANISM_ID, SPA_ORGANISM_RANGE, spaOrganism, tickSpaOrganism } from "src/world/maps/levelThree/Park/spaOrganism";
import { addInventoryItems, createTestState, patchRoomDarkness, runCommand, runCommands, setPlayerRoom } from "./helpers/gameTestHelpers";
import { observationText, overlaySession } from "./helpers/headlessOverlayHelpers";

const SAMPLE = "ChefSample";
const remaining = (state: GameState) => state.worldState.chefSample?.remainingWarmTurns;
const location = (state: GameState) => getItemPlacementContext(state, SPA_ORGANISM_ID).roomId;
const reaction = getSpaOrganismReaction;

function fixture(roomId = "ParkWest"): GameState {
  const state = createTestState({ roomId, rng: () => 0.99 });
  return { ...state, world: { ...state.world, meta: { ...state.world.meta, loadedChunkIds: [...DEFERRED_WORLD_CHUNK_IDS] } } };
}

function door(state: GameState, id: string, open = true, locked = false) {
  return upsertDoorState(state, { id, isOpen: open, isLocked: locked });
}

function darkness(state: GameState) {
  return patchRoomDarkness(state, "Spa", true);
}

function bait(state: GameState, roomId = "SteamRoom", turns = 4): GameState {
  const next = updateItemLocation(state, SAMPLE, roomId);
  return { ...next, worldState: { ...next.worldState, chefSample: { remainingWarmTurns: turns } } };
}

function ready(roomId = "ParkWest") {
  return bait(darkness(door(door(fixture(roomId), "CedarDoor"), "SteamRoomDoor")));
}

function flashlight(state: GameState) {
  const next = addInventoryItems(state, ["flashlight"]);
  return { ...next, itemState: { ...next.itemState, itemSettings: { ...next.itemState.itemSettings,
    flashlight: { kind: "flashlight" as const, isOn: true, currentCharge: 100, maxCharge: 100, drainRate: 0.05, rechargeRate: 10 },
  } } };
}

function contained(state: GameState, open = true) {
  return stashItemInContainer(setItemOpen(updateItemLocation(state, "Cooler", "SteamRoom"), "Cooler", open), SAMPLE, "Cooler");
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

describe("Spa organism biological primitives", () => {
  it("begins active in Sauna and stays there without bait", async () => {
    let state = fixture();
    expect(location(state)).toBe("Sauna");
    expect(reaction(state).active).toBe(true);
    state = await runCommands(state, ["wait", "wait"]);
    expect(location(state)).toBe("Sauna");
    expect(state.worldState.chefSample).toBeUndefined();
  });

  it("takes only one room transition per ordinary player turn", async () => {
    const initial = ready();
    let state = await runCommand(initial, "wait");
    expect(location(state)).toBe("Spa");
    expect(remaining(state)).toBe(3);
    expect(state.moves).toBe(initial.moves + 1);
    state = await runCommand(state, "wait");
    expect(location(state)).toBe("SteamRoom");
    expectGone(state);
    expect(state.moves).toBe(initial.moves + 2);
    expect(location(await runCommand(state, "wait"))).toBe("SteamRoom");
    expect(state.world.items.find(item => item.id === SPA_ORGANISM_ID)).toEqual({ ...initial.world.items.find(item => item.id === SPA_ORGANISM_ID), location: "SteamRoom" });
  });

  it("moves on a failed turn-consuming action, but not on free or unknown commands", async () => {
    const state = ready();
    const free = await runCommands(state, ["inventory", "help", "nonsense"]);
    expect(free.moves).toBe(state.moves);
    expect(location(free)).toBe("Sauna");
    expect(remaining(free)).toBe(4);
    const failed = await runCommand(free, "take nonexistent spoon");
    expect(failed.moves).toBe(state.moves + 1);
    expect(location(failed)).toBe("Spa");
    expect(remaining(failed)).toBe(3);
  });

  it("applies the same light and door rules after absorption and accepts fresh bait", () => {
    let state = tickSpaOrganism(updateItemLocation(ready(), SPA_ORGANISM_ID, "SteamRoom"));
    expectGone(state);
    state = bait(patchRoomDarkness(state, "Spa", false), "Sauna");
    expect(location(tickSpaOrganism(state))).toBe("SteamRoom");
    state = darkness(door(state, "SteamRoomDoor", false));
    expect(location(tickSpaOrganism(state))).toBe("SteamRoom");
    state = tickSpaOrganism(door(state, "SteamRoomDoor"));
    expect(location(state)).toBe("Spa");
    state = tickSpaOrganism(state);
    expect(location(state)).toBe("Sauna");
    expectGone(state);
  });

  it("never retreats out of an illuminated source room", async () => {
    let state = updateItemLocation(ready(), SPA_ORGANISM_ID, "Spa");
    state = patchRoomDarkness(bait(state, "Sauna"), "Spa", false);
    expect(reaction(state)).toMatchObject({ active: false, sensedRoute: ["Spa", "Sauna"], movementRoute: undefined });
    expect(location(await runCommand(state, "wait"))).toBe("Spa");
    expect(spaOrganism.named!(state, spaOrganism)).toBe("deep red sculpture");
    expect(spaOrganism.describe!(state, spaOrganism, { kind: "examine", roomId: "Spa" })).toContain("rigid in the light");
    expect(location(tickSpaOrganism(darkness(state)))).toBe("Sauna");
  });

  it("senses adjacent sculpture bait and reports excitement despite intervening light", async () => {
    const initial = bait(door(fixture("Spa"), "CedarDoor"), "Spa");
    expect(getChefSampleEnvironment(initial).sculpture).toBe(true);
    expect(getAccessibleChefSampleRoom(initial)).toBe("Spa");
    expect(reaction(initial).sensedRoute).toEqual(["Sauna", "Spa"]);
    const state = await runCommand(initial, "wait");
    expect(location(state)).toBe("Sauna");
    expect(state.log.join("\n")).toContain("Excited chittering");
    expect(state.log.join("\n")).toContain("cannot reach the sample through the light");
  });

  it("senses two transitions away without granting global detection", () => {
    const state = ready();
    expect(reaction(state).sensedRoute).toEqual(["Sauna", "Spa", "SteamRoom"]);
    expect(reaction(bait(state, "ParkWest")).sensedRoute).toBeUndefined();
    expect(findOrganismRoute(state, "Sauna", "SteamRoom", { ...SPA_ORGANISM_RANGE, maxTransitions: 1 }, "sense")).toBeUndefined();
  });

  it("cannot cross a lit intermediate room even when the target is dark", () => {
    const state = patchRoomDarkness(updateItemLocation(bait(ready(), "Sauna"), SPA_ORGANISM_ID, "SteamRoom"), "Spa", false);
    expect(findOrganismRoute(state, "SteamRoom", "Sauna", SPA_ORGANISM_RANGE, "move")).toBeUndefined();
    // Independent fixture with a lit intermediate room and dark source/target.
    const custom = { ...ready(), world: { ...state.world, rooms: state.world.rooms.map(room => room.id === "Sauna"
      ? { ...room, exits: [{ direction: "east" as const, toRoomId: "ParkWest" }] }
      : room.id === "ParkWest" ? { ...room, exits: [{ direction: "east" as const, toRoomId: "SteamRoom" }] } : room) } };
    expect(findOrganismRoute(custom, "Sauna", "SteamRoom", { roomIds: new Set(["Sauna", "ParkWest", "SteamRoom"]), maxTransitions: 2 }, "move")).toBeUndefined();
  });

  it.each(["CedarDoor", "SteamRoomDoor"])("resolves both sides of %s and refuses closed or locked passage", id => {
    const initial = ready();
    expect(reaction(initial).movementRoute).toEqual(["Sauna", "Spa", "SteamRoom"]);
    for (const state of [door(initial, id, false), door(initial, id, true, true)]) {
      expect(reaction(state).sensedRoute).toBeDefined();
      expect(reaction(state).movementRoute).toBeUndefined();
      expect(location(tickSpaOrganism(state))).toBe("Sauna");
    }
    const reverse = bait(updateItemLocation(initial, SPA_ORGANISM_ID, "SteamRoom"), "Sauna");
    expect(reaction(reverse).movementRoute).toEqual(["SteamRoom", "Spa", "Sauna"]);
  });

  it("uses closed authored defaults if an older snapshot has no door state", () => {
    const state = ready();
    delete state.worldState.doors.CedarDoor;
    expect(reaction(state).movementRoute).toBeUndefined();
  });

  it.each(["missing", "blocked", "disconnected"])("rejects a %s passage definition", kind => {
    const state = ready();
    const next = { ...state, world: { ...state.world, doors: state.world.doors.flatMap(door => {
      if (door.id !== "CedarDoor") return [door];
      if (kind === "missing") return [];
      return [{ ...door, ...(kind === "blocked" ? { kind: "blocked" as const }
        : { connects: { roomAId: "NailSalon", roomBId: "Spa" } }) }];
    }) } };
    expect(reaction(next).sensedRoute).toBeUndefined();
    expect(location(tickSpaOrganism(next))).toBe("Sauna");
  });

  it("uses another legal route rather than treating a blocked first exit as passable", () => {
    const state = door(ready(), "CedarDoor", false);
    const next = { ...state, world: { ...state.world, rooms: state.world.rooms.map(room => room.id === "Sauna"
      ? { ...room, exits: [...room.exits, { direction: "east" as const, toRoomId: "SteamRoom" }] } : room) } };
    expect(reaction(next).movementRoute).toEqual(["Sauna", "SteamRoom"]);
    expectGone(tickSpaOrganism(next));
  });

  it("night vision does not affect physical movement", async () => {
    const state = addInventoryItems(ready(), ["NVGoggles"]);
    const nightVision: GameState = { ...state, itemState: { ...state.itemState,
      wornByPlayer: { ...state.itemState.wornByPlayer, face: "NVGoggles" },
      itemSettings: { ...state.itemState.itemSettings, NVGoggles: { kind: "goggles", isOn: true } } },
      player: { ...state.player, statusEffects: [{ id: "nightvision-active", intensity: 1, remainingTurns: 10 }] } };
    const moved = await runCommand(nightVision, "wait");
    expect(moved.player.statusEffects.some(effect => effect.id === "nightvision-active")).toBe(true);
    expect(location(moved)).toBe("Spa");
    expect(isOrganismRoomActive(nightVision, "Sauna")).toBe(true);
    const exposed = setPlayerRoom(nightVision, "Spa");
    expect(canPlayerSeeInRoom(exposed, "Spa")).toBe(true);
    expect((await runCommand(exposed, "wait")).worldState.playerDeaths.Spa?.cause).toBe("organism");
  });

  it("a flashlight immobilizes the source organism and reports its sensing response", async () => {
    const state = flashlight(ready("Sauna"));
    expect(reaction(state).active).toBe(false);
    const next = await runCommand(state, "wait");
    expect(location(next)).toBe("Sauna");
    expect(next.worldState.playerDeaths.Sauna).toBeUndefined();
    expect(next.log.join("\n")).toContain("light holds it inert");
  });

  it("a flashlight blocks approach and explains the blocked lure without bypassing the Spa guard", async () => {
    const state = flashlight(ready("Spa"));
    const next = await runCommand(state, "take sample");
    expect(location(next)).toBe("Sauna");
    expect(next.log.join("\n")).toContain("It's too dark to do that");
    expect(next.log.join("\n")).toContain("Your flashlight illuminates its route");
    expect(next.worldState.playerDeaths.Spa).toBeUndefined();
    expect(isOrganismRoomActive(next, "Sauna")).toBe(true);
  });

  it("resolves flashlight exhaustion before biological activity", async () => {
    const state = flashlight(ready("Sauna"));
    const next = { ...state, itemState: { ...state.itemState, itemSettings: { ...state.itemState.itemSettings,
      flashlight: { ...state.itemState.itemSettings.flashlight, kind: "flashlight" as const, currentCharge: 0.01 },
    } } };
    const dead = await runCommand(next, "wait");
    expect(dead.worldState.playerDeaths.Sauna?.cause).toBe("organism");
    expect(useUIEffectsStore.getState().organismDeath).not.toBeNull();
  });

  it.each(["off", "cool", "cold", "freeze"] as const)("only thawed bait attracts: Cooler %s", mode => {
    const state = setCoolerModeInState(contained(ready()), mode);
    expect(Boolean(reaction(state).sensedRoute)).toBe(mode !== "freeze");
    expect(location(tickSpaOrganism(state))).toBe(mode === "freeze" ? "Sauna" : "Spa");
  });

  it.each([false, true])("closed Cooler blocks detection and absorption even if transparent=%s", transparent => {
    const state = contained(updateItemLocation(ready(), SPA_ORGANISM_ID, "SteamRoom"), false);
    const next = { ...state, world: { ...state.world, items: state.world.items.map(item => item.id === "Cooler"
      ? { ...item, meta: { ...item.meta, transparentContainer: transparent } } : item) } };
    expect(reaction(next).sensedRoute).toBeUndefined();
    expect(remaining(tickSpaOrganism(next))).toBe(4);
    expectGone(tickSpaOrganism(setItemOpen(next, "Cooler", true)));
  });

  it("requires every nested container to be open and resolves its effective room", () => {
    let state = setItemOpen(contained(ready()), "saunacorpsepurse", true);
    state = stashItemInContainer(state, "saunacorpsepurse", "Cooler");
    state = stashItemInContainer(state, SAMPLE, "saunacorpsepurse");
    expect(getAccessibleChefSampleRoom(state)).toBe("SteamRoom");
    expect(reaction(state).sensedRoute).toBeDefined();
    expect(reaction(setItemOpen(state, "saunacorpsepurse", false)).sensedRoute).toBeUndefined();
    expect(reaction(setItemOpen(state, "Cooler", false)).sensedRoute).toBeUndefined();
    const absorbed = tickSpaOrganism(updateItemLocation(state, SPA_ORGANISM_ID, "SteamRoom"));
    expectGone(absorbed);
    expect(absorbed.itemState.containerContents.Cooler).toContain("saunacorpsepurse");
  });

  it.each(["underContents", "searchableContents"] as const)("does not sense concealed %s bait", key => {
    const state = ready();
    const next = { ...state, itemState: { ...state.itemState, [key]: { SteamRoomBench: [SAMPLE] } } };
    expect(reaction(next).sensedRoute).toBeUndefined();
  });

  it.each([0, -1])("ignores expired samples with remaining budget %s", turns => {
    const state = bait(ready(), "SteamRoom", turns);
    expect(reaction(state).sensedRoute).toBeUndefined();
    expect(location(tickSpaOrganism(state))).toBe("Sauna");
  });

  it.each(["floor", "open cooler", "surface"])("absorbs last-turn bait from %s before expiration, retaining the organism", async placement => {
    let state = bait(updateItemLocation(ready("Sauna"), SPA_ORGANISM_ID, "Spa"), "SteamRoom", 1);
    if (placement === "open cooler") state = contained(state);
    if (placement === "surface") state = { ...state, itemState: { ...state.itemState, surfaceContents: { SteamRoomBench: [SAMPLE] } } };
    const next = await runCommand(state, "wait");
    expectGone(next);
    expect(location(next)).toBe("SteamRoom");
    expect(next.log.join("\n")).toContain("organism engulfs the sample");
    expect(next.log.join("\n")).not.toContain(CHEF_SAMPLE_EXPIRATION_MESSAGE);
    const replacement = await runCommand(addInventoryItems(setPlayerRoom(next, "WalkIn"), ["CarvingKnife"]), "carve sample from chef");
    expect(remaining(replacement)).toBe(4);
  });

  it("expires after the first step if the target is still another turn away", async () => {
    const state = await runCommand(bait(ready(), "SteamRoom", 1), "wait");
    expect(location(state)).toBe("Spa");
    expectGone(state);
    expect(state.log.join("\n")).toContain(CHEF_SAMPLE_EXPIRATION_MESSAGE);
  });

  it("does not absorb while inert even in the same room as thawed bait", () => {
    const state = patchRoomDarkness(updateItemLocation(ready(), SPA_ORGANISM_ID, "SteamRoom"), "Spa", false);
    expect(remaining(tickSpaOrganism(state))).toBe(4);
    expectGone(tickSpaOrganism(darkness(state)));
  });

  it.each(["Sauna", "Spa"])("contact in %s uses standard organism death without bait immunity", async roomId => {
    const state = await runCommand(ready(roomId), "wait");
    expect(state.worldState.playerDeaths[roomId]?.cause).toBe("organism");
    expect(useUIEffectsStore.getState().organismDeath).not.toBeNull();
    expectGone(state);
    expect(state.log.join("\n")).toContain("In the dark, something touches you");
  });

  it("keeps sample contact death ahead of organism pursuit", async () => {
    const state = await runCommand(bait(ready("Spa"), "Spa"), "turn lights on");
    expect(state.worldState.playerDeaths.Spa).toBeUndefined();
    const dead = await runCommand(state, "turn lights off");
    expectGone(dead);
    expect(location(dead)).toBe("Sauna");
    expect(dead.worldState.playerDeaths.Spa?.cause).toBe("organism");
  });

  it("resolves the completed encounter's no-bait rush without unrelated rewards", async () => {
    const state = await runCommand(door(door(fixture("Spa"), "CedarDoor"), "SteamRoomDoor"), "turn lights off");
    expect(state.player.roomId).not.toBe("Spa");
    expect(location(state)).toBe("Spa");
    expect(state.worldState.playerDeaths.Spa?.cause).toBe("organism");
    expect(state.itemState.itemRoomId.RobotWhistle).toBe("seeded");
  });
});

describe("Spa organism persistence", () => {
  it.each(["manual", "resume"])("preserves mid-pursuit location and remaining sample lifetime through %s restore", async kind => {
    const state = await runCommand(contained(ready()), "wait");
    expect(location(state)).toBe("Spa");
    if (kind === "manual") expect(saveManualSnapshot(state)).toBe(true);
    else expect(saveResumeSnapshot(state)).toBe(true);
    const restored = kind === "manual" ? await runCommand(state, "restore") : (await restoreResumeSnapshot())!;
    expect(restored).not.toBeNull();
    expect(location(restored)).toBe("Spa");
    expect(remaining(restored)).toBe(3);
    expect(restored.itemState.containerContents.Cooler).toContain(SAMPLE);
    const absorbed = await runCommand(restored, "wait");
    expect(location(absorbed)).toBe("SteamRoom");
    expectGone(absorbed);
    expect(saveResumeSnapshot(absorbed)).toBe(true);
    expectGone((await restoreResumeSnapshot())!);
  });

  it("introduces exactly one Sauna organism in pre-Stage-5 snapshots", async () => {
    expect(saveResumeSnapshot(fixture())).toBe(true);
    const snapshot = JSON.parse(localStorage.getItem("aysf:resume")!);
    snapshot.worldItems = snapshot.worldItems.filter((item: { id: string }) => item.id !== SPA_ORGANISM_ID);
    delete snapshot.itemState.itemRoomId[SPA_ORGANISM_ID];
    localStorage.setItem("aysf:resume", JSON.stringify(snapshot));
    const restored = (await restoreResumeSnapshot())!;
    expect(location(restored)).toBe("Sauna");
    expect(restored.world.items.filter(item => item.id === SPA_ORGANISM_ID)).toHaveLength(1);
    expect(location(await runCommand(bait(darkness(door(door(restored, "CedarDoor"), "SteamRoomDoor"))), "wait"))).toBe("Spa");
  });
});

describe("four-turn Spa preparation feasibility using actual headless commands", () => {
  it.each(["WalkIn", "Kitchen"])("freezing in %s preserves exactly the available budget", async freezeRoom => {
    const initial = fixture("Kitchen");
    const controller = overlaySession(setPlayerRoom(initial, "StairWellSeven"));
    const commandSpy = vi.spyOn(engine, "handleCommand");
    const actionSpy = vi.spyOn(actions, "dispatchAction");
    try {
      await controller.start();
      expect(saveManualSnapshot(initial)).toBe(true);
      await controller.explorer.command("restore");
      for (const command of ["take carving knife", "take cooler", "open cooler", "west", "carve sample from chef",
        ...(freezeRoom === "Kitchen" ? ["east"] : []), "put sample in cooler", "set cooler"]) {
        await controller.explorer.command(command);
      }
      await controller.explorer.command("freeze");
      const frozen = (await actionSpy.mock.results.at(-1)!.value as ActionResult).state;
      expect(remaining(frozen)).toBe(freezeRoom === "WalkIn" ? 4 : 1);
      for (const command of ["close", ...(freezeRoom === "WalkIn" ? ["east"] : []),
        "east", "northeast", "northwest", "west", "open sauna door", "open steam room door", "south", "drop cooler", "set cooler"]) {
        await controller.explorer.command(command);
      }
      await controller.explorer.command("off");
      const thawed = (await actionSpy.mock.results.at(-1)!.value as ActionResult).state;
      expect(thawed.player.roomId).toBe("SteamRoom");
      expect(thawed.worldState.doors.CedarDoor.isOpen).toBe(true);
      expect(thawed.worldState.doors.SteamRoomDoor.isOpen).toBe(true);
      expect(getAccessibleChefSampleRoom(thawed)).toBe("SteamRoom");
      expect(remaining(thawed)).toBe(freezeRoom === "WalkIn" ? 4 : 1);
      await controller.explorer.command("close");
      const returned = observationText(await controller.explorer.command("north"));
      const atSwitch = await commandSpy.mock.results.at(-1)!.value as GameState;
      expect(atSwitch.player.roomId).toBe("Spa");
      expect(atSwitch.moves).toBe(thawed.moves + 1);
      if (freezeRoom === "Kitchen") {
        expectGone(atSwitch);
        expect(returned).toContain(CHEF_SAMPLE_EXPIRATION_MESSAGE);
      } else {
        expect(remaining(atSwitch)).toBe(3);
        expect(reaction(atSwitch).sensedRoute).toEqual(["Sauna", "Spa", "SteamRoom"]);
        expect(returned).not.toContain(CHEF_SAMPLE_EXPIRATION_MESSAGE);
      }
      await controller.explorer.command("turn lights off");
      const off = await commandSpy.mock.results.at(-1)!.value as GameState;
      expect(off.moves).toBe(atSwitch.moves + 1);
      if (freezeRoom === "WalkIn") {
        // Stage 6 consumes the entire organism action on the validated crossing.
        expect(off.worldState.playerDeaths.Spa).toBeUndefined();
        expect(off.player.roomId).toBe("Spa");
        expect(location(off)).toBe("SteamRoom");
        expectGone(off);
        expect(off.log.join("\n")).not.toContain(CHEF_SAMPLE_EXPIRATION_MESSAGE);
      }
    } finally {
      await controller.dispose();
      vi.restoreAllMocks();
    }
  });

  it("still expires before the five-move unprotected WalkIn-to-Spa route ends", async () => {
    let state = await runCommand(addInventoryItems(fixture("WalkIn"), ["CarvingKnife"]), "carve sample from chef");
    for (const [index, command] of ["east", "east", "northeast", "northwest", "west"].entries()) {
      state = await runCommand(state, command);
      expect(remaining(state)).toBe(index < 3 ? 3 - index : undefined);
    }
    expect(state.player.roomId).toBe("Spa");
    expectGone(state);
  });
});
