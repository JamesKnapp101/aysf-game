import { tryListen } from "@game/actions/listen/tryListen";
import type { ActionResult } from "../../types/actionsTypes";
import type { GameState } from "../../types/gameTypes";
import type { ParsedCommand } from "../../types/parserTypes";

export function doListen(state: GameState, cmd: ParsedCommand): ActionResult {
  if (cmd.type !== "action" || cmd.verb !== "listen") {
    return { state, message: "You can't do that." };
  }

  const direct = cmd.direct?.trim();
  const indirect = cmd.indirect?.trim();

  if (!direct && !indirect) {
    return { state, message: "Listen to what?" };
  }
  const listenee = direct ?? indirect ?? "unknown";

  return tryListen(state, listenee);
}
