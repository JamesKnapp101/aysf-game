import {
  dislodgeAttachedBadger,
  isBadgerAttachedToPlayer,
} from "@game/preserve/preserveAnimals";
import { resolveItemByNoun } from "@game/rules/scope";
import { inventoryHas } from "@game/rules/state";
import type { ActionResult } from "@game/types/actionsTypes";
import type { GameState } from "@game/types/gameTypes";
import type { ParsedCommand } from "@game/types/parserTypes";

export function doAttack(state: GameState, cmd: ParsedCommand): ActionResult {
  if (
    cmd.type !== "action" ||
    (cmd.verb !== "hit" && cmd.verb !== "punch")
  ) {
    return { state, message: "You can't do that." };
  }

  const direct = cmd.direct?.trim();
  if (!direct) {
    return {
      state,
      message: cmd.verb === "punch" ? "Punch what?" : "Hit what?",
    };
  }

  const target = resolveItemByNoun(state, direct);
  if (!target || target.id !== "badger") {
    return { state, message: "You don't see a good target for that." };
  }

  if (cmd.preposition === "with") {
    const indirect = cmd.indirect?.trim();
    if (!indirect) {
      return { state, message: `Hit the ${direct} with what?` };
    }

    const weapon = resolveItemByNoun(state, indirect);
    if (!weapon || !inventoryHas(state.player.inventory, weapon.id)) {
      return { state, message: "You aren't carrying that." };
    }
  }

  if (isBadgerAttachedToPlayer(state)) {
    return dislodgeAttachedBadger(state);
  }

  return {
    state,
    message: "You take a desperate swing, but the badger is already moving.",
  };
}
