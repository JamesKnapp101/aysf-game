import { beforeEach, describe, expect, it } from "vitest";
import { createInitialState } from "@game/gameInit";
import { restoreManualSnapshot, restoreResumeSnapshot, saveManualSnapshot, saveResumeSnapshot } from "@game/persistence/resumeStorage";
import { activatePowerSwitch, buildInitialSwitchStates, POWER_GRID_ROOT, synchronizePowerTerminal } from "@game/rules/powerStationTerminal";
import { buildRoomDescription } from "@game/text/roomDescription";
import type { GameState } from "@game/types/gameTypes";
import { INITIAL_WORLD } from "../world/World";
import { ELEVATOR_CALL_MESSAGE, ELEVATOR_INTERIOR_DESCRIPTION, ELEVATOR_LOBBIES, ELEVATOR_UNPOWERED_MESSAGE } from "../world/maps/stairwell/elevator";
import { createTestState, getLastLogEntry, runCommand, runCommands, setInventory, setPlayerRoom } from "./helpers/gameTestHelpers";

const FLOORS = ["One", "Two", "Three", "Four", "Five", "Six", "Seven"];
const DOORS = ["BridgeStairDoors", "StairDoorTwo", "StairDoorThree", "StairDoorFour", "EngineeringDoors", "StairDoorSix", "CryoStairDoors"];
const CORRIDORS = ["LevelOneCorridorOne", "LevelTwoBurnedArea", "LevelThreeCorridorSeven", "LevelFourCorridorTwo", "EngCorridorOne", "LevelSixCorridorBend", "LevelSevenCorridorBend"];
const levelOneMenu = POWER_GRID_ROOT.children.find((node) => node.id === "lvl1");
if (levelOneMenu?.kind !== "menu") throw new Error("Missing level one menu");
const elevatorSwitch = levelOneMenu.children.find((node) => node.id === "Elevators")!;

function togglePower(state: GameState): GameState {
  return synchronizePowerTerminal(state, activatePowerSwitch(elevatorSwitch, buildInitialSwitchStates(state.worldState)));
}

beforeEach(() => window.localStorage.clear());

describe("elevator power and persistence", () => {
  it("starts off with closed doors and uses the existing terminal switch both ways", () => {
    const start = createInitialState(INITIAL_WORLD);
    expect(start.worldState.powerRestoredSections.elevators).toBe(false);
    expect(start.worldState.elevator).toEqual({ doorsOpen: false });
    expect(elevatorSwitch.kind).toBe("switch");
    const powered = togglePower(start);
    expect(buildInitialSwitchStates(powered.worldState).Elevators).toBe("on");
    expect(powered.worldState.elevator.doorsOpen).toBe(false);
    expect(togglePower(powered).worldState.powerRestoredSections).toEqual(start.worldState.powerRestoredSections);
  });

  it("shuts boarding doors when power is switched off; restoring power requires another call", async () => {
    const start = togglePower(createTestState({ roomId: ELEVATOR_LOBBIES[2] }));
    const called = await runCommand(start, "push call button");
    const off = togglePower(called);
    expect(off.worldState.elevator.doorsOpen).toBe(false);
    const on = togglePower(off);
    expect((await runCommand(on, "north")).player.roomId).toBe(ELEVATOR_LOBBIES[2]);
  });

  it.each([false, true])("persists power=%s through manual save/load", async (powered) => {
    const start = createInitialState(INITIAL_WORLD);
    const state = powered ? togglePower(start) : start;
    expect(saveManualSnapshot(state)).toBe(true);
    const restored = await restoreManualSnapshot();
    expect(restored?.worldState.powerRestoredSections.elevators).toBe(powered);
  });

  it("persists a called elevator and the boarding lobby inside the shared car", async () => {
    let state = togglePower(setPlayerRoom(createInitialState(INITIAL_WORLD), ELEVATOR_LOBBIES[5]));
    state = await runCommand(state, "press call button");
    expect(saveResumeSnapshot(state)).toBe(true);
    state = (await restoreResumeSnapshot())!;
    expect(state.worldState.elevator.doorsOpen).toBe(true);
    state = await runCommand(state, "north");
    expect(state.player.roomId).toBe("Elevator");
    expect(saveManualSnapshot(state)).toBe(true);
    state = (await restoreManualSnapshot())!;
    state = await runCommand(state, "south");
    expect(state.player.roomId).toBe(ELEVATOR_LOBBIES[5]);
    expect(state.worldState.elevator).toEqual({ doorsOpen: false });
  });

  it("loads legacy snapshots without new state or contradictory failure scenery", async () => {
    expect(saveResumeSnapshot(setPlayerRoom(createInitialState(INITIAL_WORLD), "Elevator"))).toBe(true);
    const snapshot = JSON.parse(window.localStorage.getItem("aysf:resume")!);
    delete snapshot.worldState.elevator;
    delete snapshot.worldState.powerRestoredSections.elevators;
    snapshot.worldItems.push({ id: "LevelSixElevators", location: ELEVATOR_LOBBIES[5], name: "elevators", description: "Cable Fault Detected", vocab: ["elevators"] });
    window.localStorage.setItem("aysf:resume", JSON.stringify(snapshot));
    const restored = (await restoreResumeSnapshot())!;
    expect(restored.worldState.powerRestoredSections.elevators).toBe(false);
    expect(restored.world.items.some((item) => item.id === "LevelSixElevators")).toBe(false);
    expect((await runCommand(restored, "south")).player.roomId).toBe(ELEVATOR_LOBBIES[4]);
  });
});

describe.each(ELEVATOR_LOBBIES)("elevator lobby %s", (lobbyId) => {
  it("shows closed doors, an unlit call panel, and blocks unpowered boarding", async () => {
    const start = createTestState({ roomId: lobbyId });
    for (const noun of ["elevator", "elevator doors", "elevator door"]) {
      expect(getLastLogEntry(await runCommand(start, `look at ${noun}`))).toContain("its heavy doors currently closed.");
    }
    for (const noun of ["elevator button", "call button", "button", "panel"]) {
      const text = getLastLogEntry(await runCommand(start, `examine ${noun}`));
      expect(text).toContain("polished brass panel with a single round button.");
      expect(text).not.toContain("glowing ring");
    }
    const pressed = await runCommand(start, "press call button");
    expect(getLastLogEntry(pressed)).toContain(ELEVATOR_UNPOWERED_MESSAGE);
    expect(pressed.worldState.elevator.doorsOpen).toBe(false);
    const manualOpen = await runCommand(start, "open elevator doors");
    expect(getLastLogEntry(manualOpen)).toContain("Use the call button");
    expect(manualOpen.worldState.elevator.doorsOpen).toBe(false);
    expect(manualOpen.itemState.openItems).toEqual(start.itemState.openItems);
    const blocked = await runCommand(pressed, "north");
    expect(blocked.player.roomId).toBe(lobbyId);
    expect(getLastLogEntry(blocked)).toContain("doors are closed");
  });

  it("lights the button, opens on calling, boards north, and returns south to the boarding lobby", async () => {
    const powered = togglePower(createTestState({ roomId: lobbyId }));
    expect(getLastLogEntry(await runCommand(powered, "look at button"))).toContain("The button is lit with a glowing ring.");
    expect((await runCommand(powered, "north")).player.roomId).toBe(lobbyId);
    const called = await runCommand(powered, "push elevator button.");
    expect(getLastLogEntry(called)).toContain(ELEVATOR_CALL_MESSAGE);
    expect(called.player.roomId).toBe(lobbyId);
    expect(getLastLogEntry(await runCommand(called, "examine elevator doors"))).toContain("doors open onto the elevator car");
    const boarded = await runCommand(called, "north");
    expect(boarded.player.roomId).toBe("Elevator");
    expect(getLastLogEntry(boarded)).toContain(ELEVATOR_INTERIOR_DESCRIPTION);
    const exited = await runCommand(boarded, "south");
    expect(exited.player.roomId).toBe(lobbyId);
    expect(exited.worldState.elevator).toEqual({ doorsOpen: false });
    expect((await runCommand(exited, "north")).player.roomId).toBe(lobbyId);
  });
});

describe("elevator commands and travel", () => {
  it.each(["push elevator button", "press elevator button", "push call button", "press call button", "press button"])("calls with %s", async (input) => {
    const next = await runCommand(togglePower(createTestState({ roomId: ELEVATOR_LOBBIES[2] })), input);
    expect(next.worldState.elevator.doorsOpen).toBe(true);
  });

  it.each(["press 4", "push 4", "press 4 button", "push 4 button", "pick 4", "press 4."])("selects a floor with %s only inside the elevator", async (input) => {
    const start = togglePower(createTestState({ roomId: ELEVATOR_LOBBIES[2] }));
    const outside = await runCommand(start, input);
    expect(outside.player.roomId).toBe(start.player.roomId);
    const boarded = await runCommands(start, ["press button", "north"]);
    const arrived = await runCommand(boarded, input);
    expect(arrived.player.roomId).toBe(ELEVATOR_LOBBIES[3]);
    expect(getLastLogEntry(arrived)).toContain("You tap the button labeled 4, and the elevator hums for a moment before emitting an electronic chime, then the door opens and you step out into the lobby.");
    expect(arrived.worldState.elevator).toEqual({ doorsOpen: false });
  });

  it.each(ELEVATOR_LOBBIES)("travels from %s to every floor, including itself", async (from) => {
    for (let floor = 1; floor <= 7; floor++) {
      const start = togglePower(createTestState({ roomId: from }));
      const arrived = await runCommands(start, ["press button", "north", `press ${floor}`]);
      expect(arrived.player.roomId).toBe(ELEVATOR_LOBBIES[floor - 1]);
      expect(arrived.player.prevRoomId).toBe("Elevator");
      expect(arrived.worldState.visitedRooms[arrived.player.roomId]).toBe(true);
      expect(arrived.worldState.elevator).toEqual({ doorsOpen: false });
      expect((await runCommand(arrived, "north")).player.roomId).toBe(arrived.player.roomId);
    }
  });

  it("examines the controls and numbered buttons, rejecting invalid or unrelated selections", async () => {
    const start = await runCommands(togglePower(createTestState({ roomId: ELEVATOR_LOBBIES[2] })), ["press button", "north"]);
    expect(getLastLogEntry(await runCommand(start, "examine control panel"))).toContain("1 through 7");
    expect(getLastLogEntry(await runCommand(start, "look at 4 button"))).toContain("labeled 4");
    for (const input of ["press 0", "push 8 button", "pick -1", "press 99", "press 4.5", "pick lock", "pick up 4", "push 4 with panel"]) {
      expect((await runCommand(start, input)).player.roomId).toBe("Elevator");
    }
    expect(getLastLogEntry(await runCommand(start, "press 8"))).toContain("1 through 7");
    const unpowered = togglePower(start);
    expect((await runCommand(unpowered, "press 4")).player.roomId).toBe("Elevator");
    expect((await runCommand(unpowered, "south")).player.roomId).toBe(ELEVATOR_LOBBIES[2]);
  });

  it("closes doors when the player walks away and always answers a fresh call immediately", async () => {
    let state = await runCommands(togglePower(createTestState({ roomId: ELEVATOR_LOBBIES[2] })), ["press button", "east"]);
    expect(state.worldState.elevator).toEqual({ doorsOpen: false });
    state = await runCommands(state, ["up", "west", "press button", "north", "press 7"]);
    state = await runCommands(state, ["press button", "north", "press 2"]);
    expect(state.player.roomId).toBe(ELEVATOR_LOBBIES[1]);
  });
});

describe("relocated floor boundaries", () => {
  it.each(FLOORS)("keeps Level %s lobby freely reachable and its original door west", async (word) => {
    const index = FLOORS.indexOf(word);
    const start = createTestState({ roomId: `Stair${word}` });
    const door = start.world.doors.find((entry) => entry.id === DOORS[index])!;
    expect(door.connects).toEqual({ roomAId: ELEVATOR_LOBBIES[index], roomBId: CORRIDORS[index] });
    expect(door.directions).toEqual({ fromA: "west", fromB: "east" });
    expect(start.world.doors.some((entry) => Object.values(entry.connects).includes(`Stair${word}`))).toBe(false);
    const lobby = await runCommand(start, "west");
    expect(lobby.player.roomId).toBe(ELEVATOR_LOBBIES[index]);
    expect((await runCommand(lobby, "east")).player.roomId).toBe(`Stair${word}`);
    const corridor = start.world.rooms.find((entry) => entry.id === CORRIDORS[index])!;
    expect(corridor.exits.find((entry) => entry.direction === "east")).toEqual({ direction: "east", doorId: door.id });
    expect((await runCommand(setPlayerRoom(start, corridor.id), "east")).player.roomId).toBe(lobby.player.roomId);
  });

  it.each([[0, "maroonbadge"], [6, "whitebadge"]] as const)("keeps badge access at floor index %s", async (index, badge) => {
    const start = createTestState({ roomId: ELEVATOR_LOBBIES[index] });
    const blocked = await runCommand(start, "west");
    expect(blocked.player.roomId).toBe(start.player.roomId);
    expect(getLastLogEntry(blocked)).toContain("badge scanner");
    const admitted = await runCommand(setInventory(start, [badge]), "west");
    expect(admitted.player.roomId).toBe(CORRIDORS[index]);
    expect((await runCommand(setInventory(admitted, []), "east")).player.roomId).toBe(start.player.roomId);
  });

  it("keeps stairs usable in both directions with power on or off", async () => {
    for (const powered of [false, true]) {
      let state = createTestState({ roomId: "StairOne" });
      if (powered) state = togglePower(state);
      for (const word of FLOORS.slice(1)) {
        state = await runCommand(state, "down");
        expect(state.player.roomId).toBe(`Stair${word}`);
      }
      for (const word of FLOORS.slice(0, -1).reverse()) {
        state = await runCommand(state, "up");
        expect(state.player.roomId).toBe(`Stair${word}`);
      }
    }
  });

  it("preserves translocation terminal access southeast of the Level Three lobby", async () => {
    const start = createTestState({ roomId: ELEVATOR_LOBBIES[2] });
    const terminal = await runCommand(start, "southeast");
    expect(terminal.player.roomId).toBe("TPADTerminal");
    expect((await runCommand(terminal, "northwest")).player.roomId).toBe(start.player.roomId);
  });

  it("does not leave failed-elevator descriptions in any powered lobby", () => {
    const state = togglePower(createTestState());
    for (const lobbyId of ELEVATOR_LOBBIES) {
      const text = buildRoomDescription(state, lobbyId, { mode: "panel", forceFull: true });
      expect(text).toContain("elevator door on the north wall");
      expect(text).toContain("glowing ring");
      expect(text).not.toMatch(/ELEVATOR FAILURE|Cable Fault|powered down|stuck at this floor/);
    }
  });
});
