import type { ActionResult } from "@game/types/actionsTypes";
import type { GameState } from "@game/types/gameTypes";
import type { ParsedCommand } from "@game/types/parserTypes";
import { handleRegisteredOrderAction } from "@game/registries/actionInteractionRegistry";

export function doOrder(state: GameState, cmd: ParsedCommand): ActionResult {
  if (cmd.type !== "action" || cmd.verb !== "order") {
    return { state, message: "You can't do that." };
  }

  const direct = cmd.direct?.trim();
  if (!direct) {
    return { state, message: "Order what?" };
  }

  return (
    handleRegisteredOrderAction(state, direct) ?? {
      state,
      message: "No one here is taking orders.",
    }
  );
}
