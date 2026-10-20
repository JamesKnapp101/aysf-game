import type { GameState } from "@game/types/gameTypes";
import type { ParsedCommand } from "@game/types/parserTypes";
import { getSpaDarkActionGuard } from "src/world/zoneRegistrations";

type ActionGuard = (state: GameState, command: ParsedCommand) =>
  { message: string; consumesTurn: boolean } | undefined;

const ACTION_GUARDS: ActionGuard[] = [(state, command) => getSpaDarkActionGuard(state, command)];

export function getRegisteredActionGuard(state: GameState, command: ParsedCommand) {
  for (const guard of ACTION_GUARDS) {
    const result = guard(state, command);
    if (result) return result;
  }
  return undefined;
}
