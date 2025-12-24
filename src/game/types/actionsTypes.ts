import type { GameState } from "./gameTypes";
import type { ParsedCommand } from "./parserTypes";
import type { Overlay } from "./uiTypes";

export type ActionResult = {
  state: GameState;
  message?: string;
  overlay?: Overlay;
};

export type ActionHandler = (
  state: GameState,
  cmd: ParsedCommand
) => ActionResult;

export type ActionRequest = {
  verb: "setCoolerMode" | "openCoolerPanel";
  payload: {
    mode?: "off" | "cool" | "cold" | "freeze";
  };
};
// add more UI actions later
