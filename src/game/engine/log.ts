import type { GameState } from "@game/types/gameTypes";

const MAX_LOG_ENTRIES = 500;

// A command-local collector follows immutable state spreads. Symbols are
// excluded from snapshots/JSON, and are removed before returning engine state.
const CAPTURE = Symbol("command log capture");
type CapturedState = GameState & { [CAPTURE]?: (text: string) => void };

export function beginLogCapture(initial: GameState) {
  let active = true;
  const entries: string[] = [];
  const collect = (text: string) => { if (active) entries.push(text); };
  const attach = (state: GameState): CapturedState => ({ ...state, [CAPTURE]: collect });
  return {
    state: attach(initial),
    attach,
    take: () => entries.splice(0),
    finish: (state: GameState): GameState => {
      const clean: CapturedState = { ...state };
      delete clean[CAPTURE];
      return clean;
    },
    close: () => { active = false; entries.length = 0; },
  };
}

export function appendLog(state: GameState, text: string): GameState {
  (state as CapturedState)[CAPTURE]?.(text);
  const newLog = [...state.log, text];
  const prunedLog =
    newLog.length > MAX_LOG_ENTRIES ? newLog.slice(-MAX_LOG_ENTRIES) : newLog;

  return { ...state, log: prunedLog };
}
