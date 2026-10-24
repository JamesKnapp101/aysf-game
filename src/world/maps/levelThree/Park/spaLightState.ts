import type { GameState } from "@game/types/gameTypes";

// The switch and glass-lit SteamRoom share this one authoritative state.
export function isSpaLightOn(state: GameState): boolean {
  return state.worldState.darkRooms.Spa !== true;
}

export function setSpaLightOn(state: GameState, on: boolean): GameState {
  return {
    ...state,
    worldState: {
      ...state.worldState,
      darkRooms: { ...state.worldState.darkRooms, Spa: !on },
    },
  };
}
