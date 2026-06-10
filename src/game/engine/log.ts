import type { GameState } from "@game/types/gameTypes";

const MAX_LOG_ENTRIES = 500;

export function appendLog(state: GameState, text: string): GameState {
  const newLog = [...state.log, text];
  const prunedLog =
    newLog.length > MAX_LOG_ENTRIES ? newLog.slice(-MAX_LOG_ENTRIES) : newLog;

  return { ...state, log: prunedLog };
}
