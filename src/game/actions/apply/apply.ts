import { tryUseItem } from "@game/actions/use/tryUseItem";
import { resolveItemByNoun } from "@game/rules/scope";
import type { ActionResult } from "@game/types/actionsTypes";
import type { GameState } from "@game/types/gameTypes";
import type { ParsedCommand, Preposition } from "@game/types/parserTypes";

type ApplyPrep = Extract<Preposition, "to" | "on">;

function normalizeApplyPrep(preposition?: Preposition): ApplyPrep | null {
  if (preposition === "to" || preposition === "on") return preposition;
  return null;
}

export function doApply(state: GameState, cmd: ParsedCommand): ActionResult {
  if (cmd.type !== "action" || cmd.verb !== "apply") {
    return { state, message: "You can't do that." };
  }

  const direct = cmd.direct?.trim();
  if (!direct) {
    return { state, message: "Apply what?" };
  }

  const prep = normalizeApplyPrep(cmd.preposition);
  if (!prep) {
    return { state, message: "Try: apply X to Y." };
  }

  const indirect = cmd.indirect?.trim();
  if (!indirect) {
    return { state, message: "Apply it to what?" };
  }

  const item = resolveItemByNoun(state, direct);
  if (!item) {
    return { state, message: "You don't see that here." };
  }

  if (!item.isUseable) {
    return { state, message: "You can't apply that." };
  }

  return tryUseItem(state, item, cmd);
}
