import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as engine from "../game/engine/handleCommand";
import { advanceTurn } from "../game/engine/turn";
import { movePlayerToRoom, runScriptedEvents } from "../game/helpers/gameHelpers";
import { SCRIPTED_EVENTS } from "../game/helpers/scriptedEvents";
import { stashItemInContainer } from "../game/helpers/itemPlacement";
import { useGameSession } from "../game/hooks/useGameSession";
import { updateItemLocation } from "../game/rules/items";
import type { GameState, TrashBotMode } from "../game/types/gameTypes";
import { DEFERRED_WORLD_CHUNK_IDS } from "../world/World";
import { createTestState, runCommand, setInventory } from "./helpers/gameTestHelpers";
import { overlaySession } from "./helpers/headlessOverlayHelpers";

const outside = "ParkMaintenance";
const inside = "ParkMaintenanceInterior";
const panelTrigger = "TrashBotMaintenanceDoorOpen";
const trash = ["PowerStationKey", "Scalpel", "ShedCellarKey"];

function depotState(roomId = outside): GameState {
  const state = createTestState({ roomId, visitedRooms: [outside, inside] });
  return {
    ...state,
    world: {
      ...state.world,
      meta: { ...state.world.meta, loadedChunkIds: [...DEFERRED_WORLD_CHUNK_IDS] },
      items: state.world.items.map((item) => {
        if (!item.overrides?.tick || item.id === "TrashBot") return item;
        return { ...item, overrides: { ...item.overrides, tick: undefined } };
      }),
    },
  };
}

function fillBin(state: GameState): GameState {
  return trash.reduce(
    (next, id) => stashItemInContainer(next, id, "TrashBotBin"),
    state,
  );
}

function placeRobot(state: GameState, roomId: string): GameState {
  return updateItemLocation(
    updateItemLocation(state, "TrashBot", roomId),
    "TrashBotBin",
    roomId,
  );
}

beforeEach(() => {
  vi.spyOn(Math, "random").mockReturnValue(0.99);
  vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Unexpected network call"));
});

describe("maintenance depot panel", () => {
  it("keeps closed-panel entry and manual outside opening blocked", async () => {
    let state = depotState();
    for (const command of ["in", "open panel", "out", "in"]) {
      state = await runCommand(state, command);
      expect(state.player.roomId).toBe(outside);
      expect(state.worldState.conditionalTriggers[panelTrigger]).not.toBe(true);
    }
    expect(state.log.join("\n")).toContain("You don't see an opening there.");
  });

  it("preserves the robot's six-turn opening, dumping, exit and closing routine", async () => {
    let state = fillBin(depotState());
    const phases = [
      ["wait", "door_open_for_entry", outside, outside, true],
      ["in", "inside_waiting_to_dump", inside, inside, true],
      ["wait", "inside_waiting_to_exit", inside, inside, false],
      ["wait", "door_open_for_exit", inside, inside, true],
      ["wait", "outside_waiting_to_close", inside, outside, true],
      ["wait", "wandering", inside, outside, false],
    ] as const;
    for (const [index, [command, mode, playerRoom, botRoom, open]] of phases.entries()) {
      state = await runCommand(state, command);
      expect(state.moves).toBe(index + 1);
      expect(state.player.roomId).toBe(playerRoom);
      expect(state.worldState.trashBot.mode).toBe(mode);
      expect(state.itemState.itemRoomId.TrashBot).toBe(botRoom);
      expect(state.itemState.itemRoomId.TrashBotBin).toBe(botRoom);
      expect(state.worldState.conditionalTriggers[panelTrigger]).toBe(open);
    }
    expect(state.itemState.containerContents.TrashBotBin ?? []).toEqual([]);
    expect(state.itemState.containerContents.ParkDumpster).toEqual(expect.arrayContaining(trash));
    expect(state.log.join("\n")).toContain("You slip through the hidden opening");
  });

  it.each([false, true])("exits with the panel open=%s and costs exactly one normal movement turn", async (open) => {
    const start = depotState(inside);
    start.worldState.conditionalTriggers[panelTrigger] = open;
    start.worldState.trashBot.cooldownTurns = 3;
    const exited = await runCommand(start, "out");

    expect(exited.player.roomId).toBe(outside);
    expect(exited.worldState.conditionalTriggers[panelTrigger]).toBe(false);
    expect(exited.moves).toBe(start.moves + 1);
    expect(exited.worldState.trashBot.cooldownTurns).toBe(2);
    expect(exited.worldState.trashBot.mode).toBe(start.worldState.trashBot.mode);
    expect(exited.player.recentMoves?.[0]).toEqual({
      fromRoomId: inside, toRoomId: outside, via: "out", atTurn: start.moves,
    });
    expect(exited.worldState.visitedRooms[outside]).toBe(true);
    expect(exited.log.join("\n")).toContain("The hidden panel opens automatically");
    expect(exited.log.join("\n")).toContain("You step back out through the hidden opening in the concrete structure.");
    expect(exited.log.join("\n")).toContain("The panel slides shut behind you.");
    const blocked = await runCommand(exited, "in");
    expect(blocked.player.roomId).toBe(outside);
    expect(blocked.worldState.conditionalTriggers[panelTrigger]).toBe(false);
    // The transition does not mutate the input state.
    expect(start.player.roomId).toBe(inside);
    expect(start.worldState.conditionalTriggers[panelTrigger]).toBe(open);
  });

  it.each<TrashBotMode>([
    "wandering", "returning_to_maintenance", "door_open_for_entry",
    "inside_waiting_to_dump", "inside_waiting_to_exit", "door_open_for_exit",
    "outside_waiting_to_close",
  ])("leaves the panel closed while preserving one robot tick in mode %s", async (mode) => {
    const botRoom = mode === "returning_to_maintenance"
      ? "ParkCenter"
      : mode.startsWith("inside_") || mode === "door_open_for_exit" ? inside : outside;
    let start = placeRobot(depotState(inside), botRoom);
    start.worldState.trashBot.mode = mode;
    start.worldState.trashBot.cooldownTurns = 3;
    if (mode === "inside_waiting_to_dump") {
      start = fillBin(start);
    }

    const normalTick = advanceTurn(movePlayerToRoom(start, outside, { via: "out" }));
    const exited = await runCommand(start, "out");
    expect(exited.player.roomId).toBe(outside);
    expect(exited.worldState.conditionalTriggers[panelTrigger]).toBe(false);
    expect(exited.moves).toBe(normalTick.moves);
    expect(exited.worldState.trashBot).toEqual(normalTick.worldState.trashBot);
    expect(exited.itemState).toEqual(normalTick.itemState);
    expect(exited.player.vitals).toEqual(normalTick.player.vitals);
    expect(exited.player.statusEffects).toEqual(normalTick.player.statusEffects);
    const blocked = await runCommand(exited, "in");
    expect(blocked.player.roomId).toBe(outside);
  });

  it("supports repeated cycles, with immediate reentry blocked and robot return required", async () => {
    let state = depotState();
    for (let cycle = 0; cycle < 3; cycle++) {
      state = fillBin(placeRobot(state, "ParkCenter"));
      state = await runCommand(state, "wait");
      expect(state.itemState.itemRoomId.TrashBot).toBe(outside);
      expect(state.worldState.trashBot.mode).toBe("door_open_for_entry");
      expect(state.worldState.conditionalTriggers[panelTrigger]).toBe(true);
      state = await runCommand(state, "in");
      expect(state.player.roomId).toBe(inside);
      state = await runCommand(state, "wait");
      expect(state.worldState.conditionalTriggers[panelTrigger]).toBe(false);
      state = await runCommand(state, "out");
      expect(state.player.roomId).toBe(outside);
      expect(state.worldState.conditionalTriggers[panelTrigger]).toBe(false);
      expect(state.worldState.trashBot.mode).toBe("door_open_for_exit");
      state = await runCommand(state, "in");
      expect(state.player.roomId).toBe(outside);
      expect(state.worldState.trashBot.mode).toBe("outside_waiting_to_close");
      state = await runCommand(state, "wait");
      expect(state.worldState.trashBot.mode).toBe("wandering");
      expect(state.worldState.conditionalTriggers[panelTrigger]).toBe(false);
      state = await runCommand(state, "in");
      expect(state.player.roomId).toBe(outside);
    }
  });

  it("closes on successful room arrival and ignores stale or unrelated movement", () => {
    const start = depotState(inside);
    start.worldState.conditionalTriggers[panelTrigger] = true;
    const moved = movePlayerToRoom(start, outside, { via: "out" });
    const closed = runScriptedEvents(moved, {
      kind: "onEnterRoom", fromRoomId: inside, roomId: outside,
    }, SCRIPTED_EVENTS);
    expect(closed.worldState.conditionalTriggers[panelTrigger]).toBe(false);
    const later = {
      ...moved,
      moves: moved.moves + 2,
    };
    expect(runScriptedEvents(later, {
      kind: "onEnterRoom", fromRoomId: inside, roomId: outside,
    }, SCRIPTED_EVENTS).worldState.conditionalTriggers[panelTrigger]).toBe(true);
    expect(runScriptedEvents(moved, {
      kind: "onEnterRoom", fromRoomId: "ParkWest", roomId: outside,
    }, SCRIPTED_EVENTS).worldState.conditionalTriggers[panelTrigger]).toBe(true);
  });

  it("produces identical movement, narration and turns in React and headless sessions", async () => {
    const controller = overlaySession(setInventory(fillBin(depotState("StairWellSeven")), ["ParkPass"]));
    const command = vi.spyOn(engine, "handleCommand");
    await controller.start();
    // Reach the depot through authored exits from the required production start.
    const approach = [
      "up", "up", "up", "up", "up", "west", "west",
      "south", "south", "south", "west", "west", "west", "west", "west",
    ];
    const inputs = [...approach, "in", "in", "wait", "out", "in"];
    const expected: GameState[] = [];
    for (const input of inputs) {
      await controller.explorer.command(input);
      expected.push(await command.mock.results[expected.length].value);
    }
    const initial = command.mock.calls[0][0];
    const { result } = renderHook(() => useGameSession({
      onCometCommand: vi.fn(), onInventoryCommand: vi.fn(), onDiagnoseCommand: vi.fn(),
    }));
    await waitFor(() => expect(result.current.isSessionReady).toBe(true));
    act(() => result.current.setGameState(initial));
    for (const [index, input] of inputs.entries()) {
      await act(async () => result.current.enqueueCommand(input));
      await waitFor(() => expect(command).toHaveBeenCalledTimes(inputs.length + index + 1));
      const actual = await command.mock.results[inputs.length + index].value;
      expect(actual.player).toEqual(expected[index].player);
      expect(actual.itemState).toEqual(expected[index].itemState);
      expect(actual.worldState).toEqual(expected[index].worldState);
      expect(actual.moves).toBe(expected[index].moves);
      expect(actual.log).toEqual(expected[index].log);
      expect(command.mock.calls[inputs.length + index][1]).toEqual(command.mock.calls[index][1]);
      await waitFor(() => expect(result.current.gs.moves).toBe(actual.moves));
    }
    const depotResults = expected.slice(approach.length);
    expect(depotResults[0].player.roomId).toBe(outside);
    expect(depotResults[1].player.roomId).toBe(inside);
    expect(depotResults[3].player.roomId).toBe(outside);
    expect(depotResults[3].worldState.conditionalTriggers[panelTrigger]).toBe(false);
    expect(depotResults[4].player.roomId).toBe(outside);
    expect(controller.capabilityDiagnostics!()).toEqual([]);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});
