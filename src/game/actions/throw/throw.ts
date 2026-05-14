import {
  throwDartAtBarDartboard,
} from "src/world/maps/levelThree/Park/Bar";
import { resolveItemByNoun } from "@game/rules/scope";
import { inventoryHas } from "@game/rules/state";
import type { ActionResult } from "@game/types/actionsTypes";
import type { GameState } from "@game/types/gameTypes";
import type { ParsedCommand } from "@game/types/parserTypes";

export function doThrow(state: GameState, cmd: ParsedCommand): ActionResult {
  if (cmd.type !== "action" || cmd.verb !== "throw") {
    return { state, message: "You can't do that." };
  }

  const direct = cmd.direct?.trim();
  if (!direct) {
    return { state, message: "Throw what?" };
  }

  const item = resolveItemByNoun(state, direct);
  if (!item) {
    return { state, message: "You don't see that here." };
  }

  if (!inventoryHas(state.player.inventory, item.id)) {
    return { state, message: "You need to be holding that first." };
  }

  const indirect = cmd.indirect?.trim();
  if (item.id === "Dart" && cmd.preposition === "at" && indirect) {
    const target = resolveItemByNoun(state, indirect);
    if (target?.id === "BarDartboard") {
      return throwDartAtBarDartboard(state);
    }
  }

  if (cmd.preposition === "at" && !indirect) {
    return { state, message: "Throw it at what?" };
  }

  return {
    state,
    message: `You throw the ${item.name}, but nothing useful happens.`,
  };
}
