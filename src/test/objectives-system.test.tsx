import { ObjectivesTab } from "@game/components/ObjectivesTab";
import {
  getVisibleObjectives,
  reconcileObjectives,
  type ObjectiveCommandContext,
} from "@game/rules/objectives";
import { addInventoryItems, createTestState } from "./helpers/gameTestHelpers";
import { startGamePreserveRun } from "@game/preserve/preserveState";
import type { GameState } from "@game/types/gameTypes";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

function getObjective(state: GameState, title: string) {
  return getVisibleObjectives(state).find(
    (objective) => objective.title === title,
  );
}

function reconcileWithContext(
  state: GameState,
  context: ObjectiveCommandContext,
): GameState {
  return reconcileObjectives(state, state, context);
}

describe("objectives", () => {
  it("starts every game with Restore power active", () => {
    const state = createTestState();

    expect(getObjective(state, "Restore power")).toMatchObject({
      status: "active",
    });
  });

  it("completes Restore power when main power is initialized", () => {
    const state = createTestState();
    const powered = {
      ...state,
      worldState: {
        ...state.worldState,
        powerRestoredSections: {
          ...state.worldState.powerRestoredSections,
          "power-initialized": true,
        },
      },
    };

    const next = reconcileObjectives(state, powered);

    expect(getObjective(next, "Restore power")).toMatchObject({
      status: "completed",
    });
  });

  it("tracks Vivarium Park access after the ranger bot blocks entry", () => {
    const state = createTestState({ roomId: "ParkEntrance" });
    const blocked = reconcileWithContext(state, {
      attemptedDestinationRoomId: "ParkWest",
      commandType: "move",
      direction: "west",
      fromRoomId: "ParkEntrance",
      message: "Sorry to be a stickler, but I will need to see that park pass.",
      toRoomId: "ParkEntrance",
    });

    expect(getObjective(blocked, "Access Vivarium Park")).toMatchObject({
      status: "active",
    });

    const reachedPark = {
      ...blocked,
      player: {
        ...blocked.player,
        roomId: "ParkWest",
      },
      worldState: {
        ...blocked.worldState,
        visitedRooms: {
          ...blocked.worldState.visitedRooms,
          ParkWest: true,
        },
      },
    };

    const completed = reconcileObjectives(blocked, reachedPark);

    expect(getObjective(completed, "Access Vivarium Park")).toMatchObject({
      status: "completed",
    });
  });

  it("tracks reactor warning evidence and replacement lobe completion", () => {
    const state = createTestState();
    const warned = {
      ...state,
      player: {
        ...state.player,
        log: [
          ...state.player.log,
          {
            body: "Heard warning re: reactor overload, look into that.",
            loggedAtTurn: state.moves,
            source: "Mysterious Note",
            title: "Note Found on Body: Stairwell Bottom",
          },
        ],
      },
    };

    const active = reconcileObjectives(state, warned);

    expect(
      getObjective(active, "Prevent the reactor from overheating"),
    ).toMatchObject({
      status: "active",
    });

    const repaired = {
      ...active,
      worldState: {
        ...active.worldState,
        reactorConsensus: {
          ...active.worldState.reactorConsensus!,
          lobes: active.worldState.reactorConsensus!.lobes.map((lobe) =>
            lobe.id === "reactor-lobe-13"
              ? { ...lobe, status: "harmonic" as const }
              : lobe,
          ),
        },
      },
    };

    const completed = reconcileObjectives(active, repaired);

    expect(
      getObjective(completed, "Prevent the reactor from overheating"),
    ).toMatchObject({
      status: "completed",
    });
    expect(getObjective(completed, "Find replacement lobe")).toMatchObject({
      status: "completed",
    });
  });

  it("tracks the yellow badge once the weightlifter blocks taking it", () => {
    const state = createTestState({ roomId: "GymWeights" });
    const blocked = reconcileWithContext(state, {
      commandDirect: "yellow badge",
      commandText: "take yellow badge",
      commandType: "action",
      commandVerb: "take",
      fromRoomId: "GymWeights",
      message:
        "The pinned weightlifter's body has the rest of it trapped. You'll need to move him first.",
      toRoomId: "GymWeights",
    });

    expect(getObjective(blocked, "Obtain yellow badge")).toMatchObject({
      status: "active",
    });

    const withBadge = addInventoryItems(blocked, ["yellowbadge"]);
    const completed = reconcileObjectives(blocked, withBadge);

    expect(getObjective(completed, "Obtain yellow badge")).toMatchObject({
      status: "completed",
    });
  });

  it("tracks optional preserve objectives by active animal and completion", () => {
    const base = createTestState({ roomId: "GamePreservePortal" });
    const selected = {
      ...base,
      worldState: {
        ...base.worldState,
        gamePreserve: {
          ...base.worldState.gamePreserve,
          selectedDifficulty: "very-easy" as const,
        },
      },
    };
    const started = startGamePreserveRun(selected);
    const atEntrance = {
      ...started,
      player: {
        ...started.player,
        roomId: "GamePreserveEntrance",
      },
    };

    const active = reconcileObjectives(selected, atEntrance);

    expect(getObjective(active, "Preserve the badger")).toMatchObject({
      optional: true,
      status: "active",
    });

    const completedRun = {
      ...active,
      worldState: {
        ...active.worldState,
        gamePreserve: {
          ...active.worldState.gamePreserve,
          completedDifficulties: {
            ...active.worldState.gamePreserve.completedDifficulties,
            "very-easy": true,
          },
        },
      },
    };

    const completed = reconcileObjectives(active, completedRun);

    expect(getObjective(completed, "Preserve the badger")).toMatchObject({
      status: "completed",
    });
  });

  it("renders objective checkboxes without allowing manual changes", () => {
    const base = createTestState();
    const state = reconcileObjectives(base, {
      ...base,
      worldState: {
        ...base.worldState,
        powerRestoredSections: {
          ...base.worldState.powerRestoredSections,
          "power-initialized": true,
        },
      },
    });

    render(<ObjectivesTab gameState={state} />);

    const checkbox = screen.getByRole("checkbox", {
      name: /restore power completed/i,
    });

    expect(screen.getByText("Objectives")).toBeInTheDocument();
    expect(checkbox).toBeChecked();
    expect(checkbox).toBeDisabled();
  });
});
