import { tryRideItem } from "@game/actions/ride/tryRideItem";
import { resolveItemByNoun } from "@game/rules/scope";
import { ActionResult } from "@game/types/actionsTypes";
import { GameState } from "@game/types/gameTypes";
import { ParsedCommand } from "@game/types/parserTypes";

export function doRide(state: GameState, cmd: ParsedCommand): ActionResult {
  if (cmd.type !== "action" || cmd.verb !== "ride") {
    return { state, message: "You can't do that." };
  }

  const direct = cmd.direct?.trim();
  if (!direct) {
    return { state, message: "Ride what?" };
  }

  const item = resolveItemByNoun(state, direct);
  if (!item) {
    return { state, message: "There's nothing to ride." };
  }

  return tryRideItem(state, item);
}
