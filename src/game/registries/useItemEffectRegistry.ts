import type { RuleResult } from "@game/rules/result";
import type { GameState } from "@game/types/gameTypes";
import type { Item } from "@game/types/itemTypes";
import type { ParsedCommand } from "@game/types/parserTypes";
import { applyMovieTheaterVapeUseEffect } from "src/world/zoneRegistrations";

type UseItemEffectContext = {
  baseMessage: string;
  cmd?: ParsedCommand;
  preUseState: GameState;
};

type UseItemEffectHandler = (
  state: GameState,
  item: Item,
  ctx: UseItemEffectContext,
) => RuleResult | undefined;

const USE_ITEM_EFFECT_HANDLERS: UseItemEffectHandler[] = [
  (state, item, ctx) => applyMovieTheaterVapeUseEffect(state, item, ctx),
];

export function applyRegisteredUseItemEffects(
  state: GameState,
  item: Item,
  ctx: UseItemEffectContext,
): RuleResult | undefined {
  for (const handler of USE_ITEM_EFFECT_HANDLERS) {
    const result = handler(state, item, ctx);
    if (result) return result;
  }

  return undefined;
}
