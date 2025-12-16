import { resolveItemByNoun } from "../rules/scope";
import type { ActionResult } from "../types/actionsTypes";
import type { GameState } from "../types/gameTypes";
import type { ParsedCommand } from "../types/parserTypes";

export function doRead(state: GameState, cmd: ParsedCommand): ActionResult {
  if (cmd.type !== "action" || cmd.verb !== "read") {
    return { state, message: "You can't do that." };
  }

  const direct = cmd.direct?.trim();
  if (!direct) {
    return { state, message: "Read what?" };
  }

  const item = resolveItemByNoun(state, direct);
  if (!item || !item.isReadable) {
    return { state, message: "There's nothing to read." };
  }

  const text = item.readableText?.trim();
  if (!text) {
    return { state, message: `The ${item.name} doesn't say anything useful.` };
  }

  return {
    state,
    message: `You read the ${item.name}...\n\n    "${text}"`,
  };
}
