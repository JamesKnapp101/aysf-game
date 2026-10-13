import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Game } from "../game/Game";
import { dispatchAction } from "../game/actions/dispatchAction";
import { CameraGunViewerModal } from "../game/components/CameraGunModal";
import * as engine from "../game/engine/handleCommand";
import { cameraGunViewer, getCameraFeedDescription, resolveCameraRoomId } from "../game/helpers/cameraGunViewerHelpers";
import { removeItemFromPlacementLists } from "../game/helpers/itemPlacement";
import { saveResumeSnapshot } from "../game/persistence/resumeStorage";
import { updateItemLocation } from "../game/rules/items";
import { useUIOverlayStore } from "../game/store/store";
import type { GameState } from "../game/types/gameTypes";
import { createTestState, getLastLogEntry, runCommand, runCommands, setInventory } from "./helpers/gameTestHelpers";
import { observationText, overlayFixture, overlayHistory, overlaySession } from "./helpers/headlessOverlayHelpers";

const OUTSIDE = "LevelSixCorridorEnd";
const INSIDE = "HydroponicsPlatform";
const GAP = "LevelSixCorridorEndDoorGap";
const EQUIPMENT = ["CameraGun", "GelRound1", "GelRound2", "GelRound3"];
const PHRASES = [
  "shoot camera through gap", "shoot camera through the gap",
  "fire camera through gap", "fire camera through the gap",
  "shoot through gap", "shoot through the gap",
  "shoot camera through hole", "fire camera through the hole",
  "shoot the camera through the hole", "fire a camera through an opening",
  ...["gun", "gel", "viewer", "lightweight pistol", "pistol"].map(noun => `fire the ${noun} through the gap`),
];

function equipmentFixture(base = createTestState({ roomId: OUTSIDE, rng: () => 0.99 })) {
  let state = setInventory(base, EQUIPMENT);
  for (const id of EQUIPMENT) {
    for (const key of ["containerContents", "surfaceContents", "underContents", "searchableContents"] as const) {
      state.itemState[key] = removeItemFromPlacementLists(state.itemState[key], id);
    }
    state = updateItemLocation(state, id, "INVENTORY");
  }
  state.itemState.containerContents.CameraGun = [];
  state.itemState.activeGelCameras = {};
  return state;
}

async function loadedFixture() {
  return runCommand(equipmentFixture(), "load gun with blue round");
}

function expectOneCamera(before: GameState, after: GameState) {
  expect(after.itemState.containerContents.CameraGun).toEqual([]);
  expect(after.itemState.itemRoomId.GelRound1).toBe(INSIDE);
  expect(after.itemState.attachedTo.GelRound1).toBeUndefined();
  expect(after.itemState.activeGelCameras).toEqual({ GelRound1: true });
  expect(resolveCameraRoomId(after, "GelRound1")).toBe(INSIDE);
  expect(after.player.inventory).toEqual(before.player.inventory);
  expect(after.itemState.itemRoomId.GelRound2).toBe(before.itemState.itemRoomId.GelRound2);
  expect(after.itemState.itemRoomId.GelRound3).toBe(before.itemState.itemRoomId.GelRound3);
  for (const key of ["containerContents", "surfaceContents", "underContents", "searchableContents"] as const) {
    expect(Object.values(after.itemState[key]).flat()).not.toContain("GelRound1");
  }
  expect(after.moves).toBe(before.moves + 1);
  expect(after.player.roomId).toBe(OUTSIDE);
  expect(after.worldState.visitedRooms).toEqual(before.worldState.visitedRooms);
  expect(after.worldState.hydroponicsSpider.doorHealth).toBe(before.worldState.hydroponicsSpider.doorHealth);
  expect(after.worldState.hydroponicsSpider.pendingAcidTarget).toBe("none");
  expect(after.worldState.conditionalTriggers.HydroponicsDoorUnblocked).toBe(false);
  expect(after.worldState.doors).toEqual(before.worldState.doors);
  // Physical entry initializes this puzzle. A remote shot must leave it alone.
  expect(after.worldState.hydroponicsCocoonPuzzle).toEqual(before.worldState.hydroponicsCocoonPuzzle);
  expect(getLastLogEntry(after)).toMatch(/projectile slips through the narrow gap/);
  expect(getLastLogEntry(after)).not.toMatch(/spider|jet of acid|gout of acid|LevelSixCorridorEnd|HydroponicsPlatform/);
}

beforeEach(() => {
  vi.spyOn(Math, "random").mockReturnValue(0.99);
  vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Unexpected network call"));
});

describe("Hydroponics damaged-door camera shot", () => {
  it.each(PHRASES)("deploys exactly one real loaded camera with %s", async input => {
    const before = await loadedFixture();
    const after = await runCommand(before, input);
    expectOneCamera(before, after);
    const view = cameraGunViewer(after, 0);
    expect(view.selectedCameraId).toBe("GelRound1");
    expect(view.description).toBe(getCameraFeedDescription(after, INSIDE));
    expect(view.description).toMatch(/circular platform/);
    expect(view.description).toMatch(/spider.*fifty meters/);
    expect(view.statusLine).toContain("HYDROPONICS: CENTRAL PLATFORM TOP");
    const blocked = await runCommand(after, "south");
    expect(blocked.player.roomId).toBe(OUTSIDE);
    expect(blocked.worldState.visitedRooms[INSIDE]).not.toBe(true);
  });

  it.each(["missing", "on the floor", "unloaded", "invalid round", "stale round", "already active", "unusable"])(
    "keeps ammo and camera placement unchanged when the gun is %s", async condition => {
      let before = await loadedFixture();
      if (condition === "missing" || condition === "on the floor") {
        before = setInventory(before, ["GelRound2", "GelRound3"]);
        before = updateItemLocation(before, "CameraGun", condition === "missing" ? "Kitchen" : OUTSIDE);
      } else if (condition === "unloaded") {
        before.itemState.containerContents.CameraGun = [];
      } else if (condition === "invalid round") {
        before.itemState.containerContents.CameraGun = ["Cooler"];
      } else if (condition === "stale round") {
        before = updateItemLocation(before, "GelRound1", "Kitchen");
      } else if (condition === "already active") {
        before.itemState.activeGelCameras.GelRound1 = true;
      } else {
        before.world = { ...before.world, items: before.world.items.map(item => item.id === "CameraGun" ? { ...item, isShootable: false } : item) };
      }
      const after = await runCommand(before, "fire camera through the gap");
      expect(after.itemState.containerContents).toEqual(before.itemState.containerContents);
      for (const id of EQUIPMENT) expect(after.itemState.itemRoomId[id]).toBe(before.itemState.itemRoomId[id]);
      expect(after.itemState.activeGelCameras).toEqual(before.itemState.activeGelCameras);
      expect(getLastLogEntry(after)).toMatch(condition === "unusable" ? /isn't something you can shoot/ : condition === "missing" || condition === "on the floor" ? /nothing to shoot/ : /\*Click\*/);
    },
  );

  it.each(["shoot cooler through gap", "shoot camera through wall", "fire camera through", "shoot camera through gap with gun"])(
    "does not spend or duplicate ammo for invalid syntax %s", async input => {
      const before = await loadedFixture();
      const after = await runCommand(before, input);
      expect(after.itemState.containerContents.CameraGun).toEqual(["GelRound1"]);
      expect(after.itemState.activeGelCameras).toEqual({});
      expect(after.itemState.itemRoomId.GelRound1).toBe("CameraGun");
    },
  );

  it("requires the real accessible gap and the correct side of the door", async () => {
    const loaded = await loadedFixture();
    for (const before of [
      updateItemLocation(loaded, GAP, "Kitchen"),
      { ...loaded, player: { ...loaded.player, roomId: "Kitchen" } },
      updateItemLocation({ ...loaded, player: { ...loaded.player, roomId: INSIDE } }, GAP, INSIDE),
      { ...loaded, world: { ...loaded.world, rooms: loaded.world.rooms.filter(room => room.id !== INSIDE) } },
    ]) {
      const after = await runCommand(before, "shoot camera through gap");
      expect(after.itemState.containerContents.CameraGun).toEqual(["GelRound1"]);
      expect(after.itemState.activeGelCameras).toEqual({});
    }
  });

  it("preserves each acid damage stage, the third blast unlock, and the camera on later entry", async () => {
    let state = await loadedFixture();
    const shot = await runCommand(state, "shoot through gap");
    expectOneCamera(state, shot);
    state = shot;
    for (let stage = 1; stage <= 3; stage++) {
      // Loading and firing are real turns, which let the spider's attention
      // fade. Renew its attention using the existing authored look sequence.
      state = await runCommands(state, ["look through gap", "look through hole", "look through the gap", "wait"]);
      expect(state.worldState.hydroponicsSpider.doorHealth).toBe(3 - stage);
      expect(getLastLogEntry(state)).toMatch(/acid|blast/);
      expect(state.worldState.conditionalTriggers.HydroponicsDoorUnblocked).toBe(stage === 3);
      if (stage < 3) {
        state = await runCommand(state, `load gun with ${stage === 1 ? "yellow" : "red"} round`);
        const before = state;
        state = await runCommand(state, "fire camera through the hole");
        expect(state.worldState.hydroponicsSpider.doorHealth).toBe(before.worldState.hydroponicsSpider.doorHealth);
        expect(state.worldState.conditionalTriggers.HydroponicsDoorUnblocked).toBe(false);
      }
    }
    expect(Object.keys(state.itemState.activeGelCameras)).toHaveLength(3);
    state = await runCommand(state, "south");
    expect(state.player.roomId).toBe(INSIDE);
    expect(state.itemState.itemRoomId.GelRound1).toBe(INSIDE);
    expect(state.worldState.visitedRooms[INSIDE]).toBe(true);
  });

  it.each([1, 2])("preserves door damage after %s preliminary looks", async looks => {
    let state = await loadedFixture();
    for (let look = 0; look < looks; look++) state = await runCommand(state, "look through gap");
    const after = await runCommand(state, "shoot camera through gap");
    expectOneCamera(state, after);
    // Ordinary time passes while firing, including attention fading outside.
    const ordinaryTurn = await runCommand(state, "wait");
    expect(after.worldState.hydroponicsSpider).toEqual(ordinaryTurn.worldState.hydroponicsSpider);
  });

  it("lets an acid blast already provoked by looking resolve on the ordinary firing turn", async () => {
    const before = await runCommands(await loadedFixture(), ["look through gap", "look through gap", "look through gap"]);
    expect(before.worldState.hydroponicsSpider.pendingAcidTarget).toBe("door");
    const ordinaryTurn = await runCommand(before, "wait");
    const shot = await runCommand(before, "shoot camera through gap");
    expect(shot.worldState.hydroponicsSpider).toEqual(ordinaryTurn.worldState.hydroponicsSpider);
    expect(shot.worldState.hydroponicsSpider.doorHealth).toBe(2);
    expect(shot.itemState.activeGelCameras).toEqual({ GelRound1: true });
    expect(shot.player.roomId).toBe(OUTSIDE);
    expect(shot.worldState.conditionalTriggers.HydroponicsDoorUnblocked).toBe(false);
  });

  it("retains ordinary multiple-camera sorting, viewing, WATCH, and lighting behavior", async () => {
    let state = await loadedFixture();
    state = updateItemLocation(state, "Cooler", OUTSIDE);
    state = await runCommand(state, "shoot cooler with gun");
    expect(state.itemState.attachedTo.GelRound1).toBe("Cooler");
    state = await runCommand(state, "load gun with yellow round");
    const before = state;
    state = await runCommand(state, "shoot camera through gap");
    expect(state.moves).toBe(before.moves + 1);
    expect(state.itemState.activeGelCameras).toEqual({ GelRound1: true, GelRound2: true });
    expect(cameraGunViewer(state, 0).selectedCameraId).toBe("GelRound1");
    expect(cameraGunViewer(state, 1).selectedCameraId).toBe("GelRound2");
    expect(cameraGunViewer(state, 2).selectedCameraId).toBe("GelRound1");
    state.worldState.darkRooms[INSIDE] = true;
    const view = cameraGunViewer(state, 1);
    expect(view.description).toBe(getCameraFeedDescription(state, INSIDE));
    expect(view.description).toMatch(/spider/);
    const viewed = await runCommand(state, "examine gun");
    expect(useUIOverlayStore.getState().overlay.kind).toBe("camera-gun-viewer");
    expect(viewed.itemState.activeGelCameras).toEqual(state.itemState.activeGelCameras);
    for (const id of EQUIPMENT) expect(viewed.itemState.itemRoomId[id]).toBe(state.itemState.itemRoomId[id]);
    expect(viewed.worldState.visitedRooms[INSIDE]).not.toBe(true);
    const watched = await runCommand(viewed, "wait");
    expect(watched.moves).toBe(viewed.moves + 1);
    expect(watched.worldState.hydroponicsSpider.doorHealth).toBe(3);
    const failed = await runCommand(watched, "shoot through gap");
    expect(failed.itemState.activeGelCameras).toEqual(watched.itemState.activeGelCameras);
    expect(failed.itemState.itemRoomId.GelRound2).toBe(INSIDE);
    expect(getLastLogEntry(failed)).toContain("*Click*");
  });

  it("does not expose remote contents through local look, examination, or taking", async () => {
    const shot = await runCommand(await loadedFixture(), "shoot camera through gap");
    const looked = await runCommand(shot, "look");
    expect(getLastLogEntry(looked)).not.toMatch(/spider|fifty meters/);
    const examined = await runCommand(shot, "examine spider");
    expect(getLastLogEntry(examined)).not.toMatch(/distended body|spider looks enormous/);
    const taken = await runCommand(shot, "take blue round");
    expect(taken.player.inventory).toEqual(shot.player.inventory);
    expect(taken.itemState.itemRoomId.GelRound1).toBe(INSIDE);
  });
});

describe("browser and headless Hydroponics camera parity", () => {
  it.each(["fire the camera through the hole", "shoot through the gap"])(
    "uses identical production transitions for %s and the ordinary viewer", async input => {
      const controller = overlaySession(equipmentFixture(overlayFixture([])));
      const command = vi.spyOn(engine, "handleCommand");
      await controller.start();
      for (const movement of ["up", "up", "open door", "west", "west", "west", "load gun with blue round"]) {
        await controller.explorer.command(movement);
      }
      const before: GameState = await command.mock.results.at(-1)!.value;
      expect(before.player.roomId).toBe(OUTSIDE);
      const output = observationText(await controller.explorer.command(input));
      const expected: GameState = await command.mock.results.at(-1)!.value;
      expectOneCamera(before, expected);
      expect(output).not.toMatch(/spider|HydroponicsPlatform|LevelSixCorridorEnd|itemState|activeGelCameras/);
      expect(saveResumeSnapshot(before)).toBe(true);

      const user = userEvent.setup();
      const browser = render(<Game />);
      await waitFor(() => expect(browser.container.querySelector(".game-input")).toBeTruthy());
      const calls = command.mock.calls.length;
      await user.type(browser.container.querySelector(".game-input") as HTMLInputElement, `${input}{enter}`);
      await waitFor(() => expect(command).toHaveBeenCalledTimes(calls + 1));
      const actual: GameState = await command.mock.results.at(-1)!.value;
      for (const key of ["player", "itemState", "worldState", "radio", "moves", "score", "log"] as const) {
        expect(actual[key]).toEqual(expected[key]);
      }
      expect(command.mock.calls.at(-1)![1]).toEqual(command.mock.calls[calls - 1][1]);
      browser.unmount();

      const observed = observationText(await controller.explorer.command("examine gun"));
      const viewing: GameState = await command.mock.results.at(-1)!.value;
      const modal = render(<CameraGunViewerModal state={viewing} currentView={0} onClose={() => {}} onCycleView={() => {}} />);
      expect(observed).toContain(screen.getByLabelText("Camera feed text").querySelector("pre")!.textContent!);
      expect(observed).toMatch(/spider.*fifty meters/);
      expect(observed).not.toMatch(/HydroponicsPlatform|LevelSixCorridorEnd|itemState|activeGelCameras/);
      modal.unmount();
      await controller.explorer.command("view");
      await expect(command.mock.results.at(-1)!.value).resolves.toEqual(viewing);
      const watchExpected = await dispatchAction(viewing, { verb: "command", payload: { input: "wait" } });
      await controller.explorer.command("watch");
      const watched: GameState = await command.mock.results.at(-1)!.value;
      expect(watched).toEqual(watchExpected.state);
      expect(watched.itemState.activeGelCameras).toEqual({ GelRound1: true });
      expect(watched.worldState.visitedRooms[INSIDE]).not.toBe(true);
      expect(controller.capabilityDiagnostics!()).toEqual([]);
      expect(JSON.stringify(await overlayHistory(controller))).not.toMatch(/HydroponicsPlatform|LevelSixCorridorEnd|itemState|activeGelCameras/);
      expect(globalThis.fetch).not.toHaveBeenCalled();
    },
  );
});
