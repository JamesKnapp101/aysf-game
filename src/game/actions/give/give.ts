import { handleRegisteredGiveAction } from "@game/registries/actionInteractionRegistry";
import type { RuleResult } from "@game/rules/result";
import { resolveItemByNoun } from "@game/rules/scope";
import { inventoryHas } from "@game/rules/state";
import type { ActionResult } from "@game/types/actionsTypes";
import type { GameState } from "@game/types/gameTypes";
import type { Item } from "@game/types/itemTypes";
import type { ParsedCommand } from "@game/types/parserTypes";

type GiveOverrideResult = RuleResult | string | undefined;

function getGiveOverrideResult(
  state: GameState,
  item: Item,
): GiveOverrideResult {
  const override = item.overrides?.give;

  if (typeof override === "function") {
    return override({ state, item });
  }

  return override;
}

function isRuleResult(value: GiveOverrideResult): value is RuleResult {
  return typeof value === "object" && value !== null && "state" in value;
}

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

  const giveOverride = getGiveOverrideResult(state, target);
  if (isRuleResult(giveOverride)) {
    return giveOverride;
  }
  if (typeof giveOverride === "string") {
    return { state, message: giveOverride };
  }

  const registered = handleRegisteredGiveAction({ state, item, target });
  if (registered) return registered;

  return {
    state,
    message: `${target.name} does not seem interested in the ${item.name}.`,
  };
}
