import type { GameState } from "@game/types/gameTypes";
import {
  authenticateReactorTerminal, ENGINE_ROOM_KEY_ID, insertReactorTerminalKey,
  isReactorTerminalAuthenticated, REACTOR_KEY_SLOT_ID, REACTOR_KEY_TURNED_TRIGGER,
  REACTOR_RESTARTED_TRIGGER, restartReactorCore, turnReactorTerminalKey,
} from "./reactorSystems";

export type ReactorTerminalControl = "authenticate" | "insert" | "turn" | "restart";
export const REACTOR_TERMINAL_INITIAL_MESSAGE = "AWAITING ETHICS CREDENTIAL";

/** Controls and statuses available on the mounted browser screen, after login only. */
export function reactorTerminalView(state: GameState) {
  const authenticated = isReactorTerminalAuthenticated(state);
  const controls: ReactorTerminalControl[] = [];
  if (!authenticated) return { authenticated, controls: ["authenticate"] as ReactorTerminalControl[] };
  const inserted = Boolean(state.itemState.containerContents[REACTOR_KEY_SLOT_ID]?.includes(ENGINE_ROOM_KEY_ID));
  const turned = Boolean(state.worldState.conditionalTriggers[REACTOR_KEY_TURNED_TRIGGER]);
  const restarted = Boolean(state.worldState.conditionalTriggers[REACTOR_RESTARTED_TRIGGER]);
  if (!inserted) controls.push("insert");
  if (inserted && !turned) controls.push("turn");
  if (turned && !restarted) controls.push("restart");
  return { authenticated, controls, keyStatus: turned ? "TURNED" : inserted ? "INSERTED" : "MISSING", coreStatus: restarted ? "ONLINE" : "OFFLINE" };
}

/** Visibility gates are essential: the underlying key rules don't require login. */
export function operateReactorTerminal(state: GameState, control: ReactorTerminalControl, password = "") {
  if (!reactorTerminalView(state).controls.includes(control)) return { state, message: undefined, available: false };
  const result = control === "authenticate" ? authenticateReactorTerminal(state, password)
    : control === "insert" ? insertReactorTerminalKey(state)
    : control === "turn" ? turnReactorTerminalKey(state)
    : restartReactorCore(state);
  return { ...result, available: true };
}
