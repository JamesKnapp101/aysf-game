import type { GameState } from "./gameTypes";
import type { ParsedCommand } from "./parserTypes";
import type { Overlay } from "./uiTypes";

export type ActionResult = {
  consumesTurn?: boolean;
  message?: string;
  overlay?: Overlay;
  state: GameState;
};

export type ActionHandler = (
  state: GameState,
  cmd: ParsedCommand,
) => ActionResult | Promise<ActionResult>;

export type ActionRequest = {
  payload: {
    input?: string;
    messageId?: string;
    mode?: "off" | "cool" | "cold" | "freeze";
    password?: string;
    speed?: number;
    trackId?: string;
  };
  verb:
    | "setCoolerMode"
    | "openCoolerPanel"
    | "markMessagePlayed"
    | "cycleCameraGunView"
    | "playJukeboxTrack"
    | "submitSpinStageSpeedPassword"
    | "command";
};
