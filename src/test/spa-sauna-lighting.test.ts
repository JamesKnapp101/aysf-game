import { describe, expect, it } from "vitest";
import { getItemPlacementContext } from "@game/helpers/itemPlacement";
import { isRoomDark } from "@game/helpers/itemHelpers";
import { canPlayerSeeInRoom, getRoomAmbientLightLevel, getRoomVisualLightLevel, isRoomPhysicallyLit } from "@game/helpers/visibilityHelpers";
import { restoreResumeSnapshot, saveResumeSnapshot } from "@game/persistence/resumeStorage";
import { isRoomAmbientlyLit } from "@game/registries/roomLightRegistry";
import { upsertDoorState } from "@game/rules/doors";
import { updateItemLocation } from "@game/rules/items";
import { inventoryHas } from "@game/rules/state";
import { buildRoomDescription } from "@game/text/roomDescription";
import type { GameState } from "@game/types/gameTypes";
import { DEFERRED_WORLD_CHUNK_IDS } from "src/world/World";
import { getSpaOrganismReaction, SPA_ORGANISM_ID } from "src/world/maps/levelThree/Park/spaOrganism";
import { isSaunaDimlyLit } from "src/world/maps/levelThree/Park/spaLighting";
import { addInventoryItems, createTestState, getLastLogEntry, patchRoomDarkness, runCommand, runCommands, setPlayerRoom } from "./helpers/gameTestHelpers";

function fixture(): GameState {
  const state = createTestState({ roomId: "Spa", rng: () => 0.99, visitedRooms: ["Spa", "ParkWest"] });
  return { ...state, world: { ...state.world, meta: { ...state.world.meta, loadedChunkIds: [...DEFERRED_WORLD_CHUNK_IDS] } } };
}
function door(state: GameState, open: boolean) {
  return upsertDoorState(state, { id: "CedarDoor", isOpen: open, isLocked: false });
}
function conditions(organismRoom: string, on: boolean, open: boolean) {
  return door(patchRoomDarkness(updateItemLocation(fixture(), SPA_ORGANISM_ID, organismRoom), "Spa", !on), open);
}
async function lured() {
  let state = upsertDoorState(door(fixture(), true), { id: "SteamRoomDoor", isOpen: true, isLocked: false });
  state = updateItemLocation(state, "ChefSample", "SteamRoom");
  state = { ...state, worldState: { ...state.worldState, chefSample: { remainingWarmTurns: 4 } } };
  return runCommand(state, "turn lights off");
}
async function trapped() { return runCommands(await lured(), ["turn lights on", "close steam room door"]); }
function expectLighting(state: GameState, visible: boolean) {
  expect(isSaunaDimlyLit(state)).toBe(visible);
  expect(isRoomAmbientlyLit(state, "Sauna")).toBe(visible);
  expect(isRoomDark(state, "Sauna")).toBe(!visible);
  expect(canPlayerSeeInRoom(state, "Sauna")).toBe(visible);
  expect(getRoomAmbientLightLevel(state, "Sauna")).toBe(visible ? "very-dim" : "dark");
  expect(isRoomPhysicallyLit(state, "Sauna")).toBe(false);
  const description = buildRoomDescription(state, "Sauna", { forceFull: true });
  if (visible) {
    expect(getRoomVisualLightLevel(state, "Sauna")).toBe("very-dim");
    expect(description).toContain("Very dim light enters");
    expect(description).not.toContain("does not reach far enough to illuminate");
  } else expect(description).toBe("It's pitch black in here, you can't see a thing.");
}

const configurations = ["Sauna", "SteamRoom", "Spa"].flatMap(room => [false, true].flatMap(on => [false, true].map(open => ({ room, on, open }))));
describe("derived Sauna lighting", () => {
  it.each(configurations)("organism in $room, Spa ON=$on, cedar door OPEN=$open", ({ room, on, open }) => {
    const state = conditions(room, on, open);
    const originalDarkRooms = { ...state.worldState.darkRooms };
    expectLighting(state, room !== "Sauna" && on && open);
    expect(state.worldState.darkRooms).toEqual(originalDarkRooms);
    expect(state.worldState.darkRooms.Sauna).toBe(true);
  });

  it("derives light from current placement, independently of encounter history and stale dark flags", () => {
    let state = conditions("SteamRoom", true, true);
    state = { ...state, worldState: { ...state.worldState,
      conditionalTriggers: { ...state.worldState.conditionalTriggers, SpaOrganismLeftSauna: false } } };
    expectLighting(state, true);
    state = patchRoomDarkness(updateItemLocation(state, SPA_ORGANISM_ID, "Sauna"), "Sauna", false);
    state = { ...state, worldState: { ...state.worldState,
      conditionalTriggers: { ...state.worldState.conditionalTriggers, SpaOrganismLeftSauna: true } } };
    expectLighting(state, false);
    expect(getSpaOrganismReaction(state).active).toBe(true);
  });

  it("changes immediately through actual switch and door commands", async () => {
    let state = await lured();
    expectLighting(state, false);
    state = await runCommands(state, ["turn lights on", "close steam room door", "north"]);
    expectLighting(state, true);
    expect(state.player.roomId).toBe("Sauna");
    state = await runCommand(state, "close cedar door");
    expectLighting(state, false);
    state = await runCommand(state, "open cedar door");
    expectLighting(state, true);
    state = await runCommands(state, ["south", "turn lights off"]);
    expectLighting(state, false);
    state = await runCommand(state, "turn lights on");
    expectLighting(state, true);
    expect(state.worldState.playerDeaths.Sauna).toBeUndefined();
    expect(getItemPlacementContext(state, SPA_ORGANISM_ID).roomId).toBe("SteamRoom");
  });

  it("supports ordinary examination and item handling without perception aids", async () => {
    let state = await runCommand(await trapped(), "north");
    expectLighting(state, true);
    expect(inventoryHas(state.player.inventory, "flashlight")).toBe(false);
    expect(state.player.statusEffects.some(effect => effect.id === "nightvision-active")).toBe(false);
    state = await runCommand(state, "examine Freeny Salk");
    expect(getLastLogEntry(state)).toContain("Freeny Salk");
    state = await runCommand(state, "examine benches");
    expect(getLastLogEntry(state)).toContain("body");
    state = await runCommands(state, ["take purse", "open purse"]);
    expect(inventoryHas(state.player.inventory, "saunacorpsepurse")).toBe(true);
    expect(state.itemState.openItems.saunacorpsepurse).toBe(true);
    expect(state.worldState.playerDeaths.Sauna).toBeUndefined();
    expect(state.worldState.doors.SteamRoomDoor.isOpen).toBe(false);
  });

  it("updates the Spa porthole view after relocation and door closure", async () => {
    let state = await trapped();
    state = await runCommand(state, "look through porthole");
    expect(getLastLogEntry(state)).toContain("very dim light");
    expect(getLastLogEntry(state)).not.toContain("Sauna beyond remains dark");
    state = await runCommands(state, ["close cedar door", "look through porthole"]);
    expect(getLastLogEntry(state)).toContain("Sauna beyond remains dark");
  });

  it("a returning organism restores darkness and ordinary contact danger", async () => {
    let state = setPlayerRoom(await lured(), "ParkWest");
    state = updateItemLocation(state, "ChefSample", "Sauna");
    state = { ...state, worldState: { ...state.worldState, chefSample: { remainingWarmTurns: 4 } } };
    state = await runCommands(state, ["wait", "wait"]);
    expect(getItemPlacementContext(state, SPA_ORGANISM_ID).roomId).toBe("Sauna");
    state = await runCommand(setPlayerRoom(state, "Spa"), "turn lights on");
    expectLighting(state, false);
    expect(getSpaOrganismReaction(state).active).toBe(true);
    state = await runCommand(state, "north");
    expect(state.worldState.playerDeaths.Sauna?.cause).toBe("organism");
  });

  it("keeps flashlight illumination independent of the dark ambient classification", async () => {
    let state = addInventoryItems(setPlayerRoom(conditions("Sauna", true, true), "Sauna"), ["flashlight"]);
    state = await runCommand(state, "turn flashlight on");
    expect(getRoomAmbientLightLevel(state, "Sauna")).toBe("dark");
    expect(isRoomDark(state, "Sauna")).toBe(true);
    expect(isRoomPhysicallyLit(state, "Sauna")).toBe(true);
    expect(getSpaOrganismReaction(state).active).toBe(false);
    expect(state.worldState.playerDeaths.Sauna).toBeUndefined();
    state = await runCommand(state, "turn flashlight off");
    expect(state.worldState.playerDeaths.Sauna?.cause).toBe("organism");
  });

  it("night vision does not immobilize a Sauna organism or create ambient light", async () => {
    let state = addInventoryItems(setPlayerRoom(conditions("Sauna", true, true), "Sauna"), ["NVGoggles"]);
    state = { ...state, itemState: { ...state.itemState, wornByPlayer: { ...state.itemState.wornByPlayer, face: "NVGoggles" },
      itemSettings: { ...state.itemState.itemSettings, NVGoggles: { kind: "goggles", isOn: true } } },
      player: { ...state.player, statusEffects: [{ id: "nightvision-active", intensity: 1, remainingTurns: 100 }] } };
    expect(canPlayerSeeInRoom(state, "Sauna")).toBe(true);
    expect(getRoomAmbientLightLevel(state, "Sauna")).toBe("dark");
    expect(isRoomPhysicallyLit(state, "Sauna")).toBe(false);
    const dead = await runCommand(state, "wait");
    expect(dead.worldState.playerDeaths.Sauna?.cause).toBe("organism");
  });

  it("does not let visibility-only spill make an unfrozen sample biologically safe", async () => {
    let state = await runCommand(await trapped(), "north");
    state = updateItemLocation(state, "ChefSample", "Sauna");
    state = { ...state, worldState: { ...state.worldState, chefSample: { remainingWarmTurns: 4 } } };
    expectLighting(state, true);
    const dead = await runCommand(state, "wait");
    expect(dead.worldState.playerDeaths.Sauna?.cause).toBe("organism");
    expect(dead.worldState.chefSample).toBeUndefined();
  });

  it.each(["before", "dark after rush", "very dim", "door closed", "returned"])("reconstructs %s lighting on restore without a new saved lighting flag", async point => {
    let state = point === "before" ? door(fixture(), true) : await lured();
    if (["very dim", "door closed", "returned"].includes(point)) state = await runCommand(state, "turn lights on");
    if (point === "door closed") state = await runCommand(state, "close cedar door");
    if (point === "returned") state = updateItemLocation(state, SPA_ORGANISM_ID, "Sauna");
    const expectedLight = point === "very dim";
    const moves = state.moves;
    const oldDarkFlags = { ...state.worldState.darkRooms };
    expect(saveResumeSnapshot(state)).toBe(true);
    // Legacy snapshots may lack Sauna's default or contain an incorrect override.
    const snapshot = JSON.parse(localStorage.getItem("aysf:resume")!);
    snapshot.worldState.darkRooms.Sauna = expectedLight;
    localStorage.setItem("aysf:resume", JSON.stringify(snapshot));
    const restored = (await restoreResumeSnapshot())!;
    expectLighting(restored, expectedLight);
    expect(restored.moves).toBe(moves);
    expect(restored.worldState.conditionalTriggers).toEqual(state.worldState.conditionalTriggers);
    expect(state.worldState.darkRooms).toEqual(oldDarkFlags);
    expect(getItemPlacementContext(restored, SPA_ORGANISM_ID).roomId).toBe(getItemPlacementContext(state, SPA_ORGANISM_ID).roomId);
  });

  it("preserves illumination behavior of unrelated dim rooms", () => {
    const state = fixture();
    for (const id of ["EngCorridorOne", "ThreeWestBed", "LivingQuartersThreeWest"]) {
      expect(isRoomPhysicallyLit(state, id)).toBe(isRoomAmbientlyLit(state, id));
    }
  });
});
