import {
  GAME_PRESERVE_TROPHY_DAIS_ID,
  handleGamePreserveEmptyHandReturn,
} from "@game/preserve/preserveTrophies";
import { resolveItemByNoun } from "@game/rules/scope";
import type { RuleResult } from "@game/rules/result";
import type { GameState } from "@game/types/gameTypes";
import type { Preposition } from "@game/types/parserTypes";

type RegisteredPutCommand = {
  direct: string;
  indirect: string;
  preposition: Extract<Preposition, "in" | "into" | "on">;
};

type PutCommandHandler = (
  state: GameState,
  command: RegisteredPutCommand,
) => RuleResult | undefined;

function isEmptyHandNoun(value: string): boolean {
  const normalized = value.toLowerCase().trim();
  return [
    "hand",
    "hands",
    "empty hand",
    "empty hands",
    "bare hand",
    "bare hands",
  ].includes(normalized);
}

const PUT_COMMAND_HANDLERS: PutCommandHandler[] = [
  (state, command) => {
    if (command.preposition !== "on" || !isEmptyHandNoun(command.direct)) {
      return undefined;
    }

    const host = resolveItemByNoun(state, command.indirect);
    if (host?.id !== GAME_PRESERVE_TROPHY_DAIS_ID) return undefined;

    return handleGamePreserveEmptyHandReturn(state, state.player.roomId);
  },
];

export function tryHandleRegisteredPutCommand(
  state: GameState,
  command: RegisteredPutCommand,
): RuleResult | undefined {
  for (const handler of PUT_COMMAND_HANDLERS) {
    const result = handler(state, command);
    if (result) return result;
  }

  return undefined;
}
