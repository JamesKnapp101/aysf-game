import { collectDiscoveries } from "@game/rules/discoveries";
import { enqueueNotifications } from "@game/rules/notifications";
import {
  applyExamineSideEffects,
  buildGenericExamineResult,
  resolveExamineTarget,
  tryHandleSpecialExamine,
} from "./examineHelpers";
import type { ActionResult } from "../../types/actionsTypes";
import type { GameState } from "../../types/gameTypes";
import type { ParsedCommand } from "../../types/parserTypes";

export function doExamine(state: GameState, cmd: ParsedCommand): ActionResult {
  if (cmd.type !== "action" || cmd.verb !== "examine") {
    return { state, message: "You can't do that." };
  }

  const direct = cmd.direct?.trim();
  if (!direct) {
    return { state, message: "Examine what?" };
  }

  const target = resolveExamineTarget(state, direct);
  if (target.kind === "result") {
    return target.result;
  }

  const { item } = target;
  const discovered = collectDiscoveries(state, item);
  const next = applyExamineSideEffects(discovered.state, item);
  const postCloseNotifications = discovered.notifications;
  const withImmediateDiscoveries = (resultState: GameState) =>
    enqueueNotifications(resultState, postCloseNotifications);

  const context = {
    item,
    state: next,
    postCloseNotifications,
    withImmediateDiscoveries,
  };

  return (
    tryHandleSpecialExamine(context) ?? buildGenericExamineResult(context)
  );
}
