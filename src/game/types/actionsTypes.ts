import type { GameState } from "./gameTypes";
import type { ParsedCommand } from "./parserTypes";
import type { Overlay } from "./uiTypes";

export type ActionResult = {
  state: GameState;
  message?: string;
  overlay?: Overlay;
  consumesTurn?: boolean;
};

export type ActionHandler = (
  state: GameState,
  cmd: ParsedCommand
) => ActionResult;

export type ActionRequest = {
  verb:
    | "setCoolerMode"
    | "openCoolerPanel"
    | "markMessagePlayed"
    | "cycleCameraGunView"
    | "command";
  payload: {
    mode?: "off" | "cool" | "cold" | "freeze";
    messageId?: string;
    input?: string;
  };
};
