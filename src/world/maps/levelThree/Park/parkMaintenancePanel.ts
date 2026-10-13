import type { ScriptedEvent } from "@game/types/eventTypes";
import type { GameState } from "@game/types/gameTypes";

function justExitedDepot(state: GameState): boolean {
  const move = state.player.recentMoves?.[0];
  return (
    state.player.roomId === "ParkMaintenance" &&
    move?.fromRoomId === "ParkMaintenanceInterior" &&
    move.toRoomId === "ParkMaintenance" &&
    move.via === "out" &&
    move.atTurn === state.moves
  );
}

function closePanel(state: GameState): GameState {
  return {
    ...state,
    worldState: {
      ...state.worldState,
      conditionalTriggers: {
        ...state.worldState.conditionalTriggers,
        TrashBotMaintenanceDoorOpen: false,
      },
    },
  };
}

export const parkMaintenancePanelEvents: ScriptedEvent[] = [
  {
    id: "maintenance_panel_close_after_player_exit",
    once: false,
    when: (state, ctx) =>
      ctx.kind === "onEnterRoom" &&
      ctx.fromRoomId === "ParkMaintenanceInterior" &&
      ctx.roomId === "ParkMaintenance" &&
      justExitedDepot(state),
    run: closePanel,
  },
];

export function tickParkMaintenancePanel(state: GameState): {
  messages?: string[];
  state: GameState;
} {
  if (!justExitedDepot(state)) return { state };

  // The robot may open the panel during this same movement turn. Close it
  // after that tick without changing the robot's mode or schedule.
  return {
    state: closePanel(state),
    messages: ["The panel slides shut behind you."],
  };
}
