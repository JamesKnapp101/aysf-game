import type { GameState } from "./gameTypes";
import type { ParsedCommand } from "./parserTypes";

export type ActionResult = { state: GameState; message: string };
export type ActionHandler = (
  state: GameState,
  cmd: ParsedCommand
) => ActionResult;
