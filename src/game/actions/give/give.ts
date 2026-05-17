import { handleRegisteredGiveAction } from "@game/registries/actionInteractionRegistry";
import { resolveItemByNoun } from "@game/rules/scope";
import { inventoryHas } from "@game/rules/state";
import type { ActionResult } from "@game/types/actionsTypes";
import type { GameState } from "@game/types/gameTypes";
import type { ParsedCommand } from "@game/types/parserTypes";

export function doGive(state: GameState, cmd: ParsedCommand): ActionResult {
  if (cmd.type !== "action" || cmd.verb !== "give") {
    return { state, message: "You can't do that." };
  }

  const direct = cmd.direct?.trim();
  if (!direct) {
    return { state, message: "Give what?" };
  }

  if (cmd.preposition && cmd.preposition !== "to") {
    return { state, message: "Try: give X to Y." };
  }

  const indirect = cmd.indirect?.trim();
  if (!indirect) {
    return { state, message: "Give it to whom?" };
  }

  const item = resolveItemByNoun(state, direct);
  if (!item) {
    return { state, message: "You don't see that here." };
  }

  if (!inventoryHas(state.player.inventory, item.id)) {
    return { state, message: "You need to be holding that first." };
  }

  const target = resolveItemByNoun(state, indirect);
  if (!target) {
    return { state, message: "You don't see them here." };
  }

  const registered = handleRegisteredGiveAction({ state, item, target });
  if (registered) return registered;

  return {
    state,
    message: `${target.name} does not seem interested in the ${item.name}.`,
  };
}
