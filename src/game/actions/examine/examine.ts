import {
  collectTeaFromItemResult,
  getPostCloseGossipNotifications,
  queueGossipNotification,
} from "@game/rules/gossip";
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
  const teaResult = collectTeaFromItemResult(state, item);
  const next = applyExamineSideEffects(teaResult.state, item);
  const postCloseNotifications = getPostCloseGossipNotifications(
    teaResult.obtainedNewTea,
  );
  const withImmediateGossip = (resultState: GameState) =>
    queueGossipNotification(resultState, teaResult.obtainedNewTea);

  const context = {
    item,
    state: next,
    postCloseNotifications,
    withImmediateGossip,
  };

  return (
    tryHandleSpecialExamine(context) ?? buildGenericExamineResult(context)
  );
}
