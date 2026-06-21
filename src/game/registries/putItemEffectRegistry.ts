import { handleGamePreserveTrophySubmission } from "@game/preserve/preserveTrophies";
import type { RuleResult } from "@game/rules/result";
import type { GameState } from "@game/types/gameTypes";
import { handleReactorCargoPut } from "src/world/maps/levelFive/reactorPlatform";

type PutItemEffectContext = {
  hostId: string;
  itemId: string;
  preposition: "in" | "into" | "on";
};

type PutItemEffectHandler = (
  state: GameState,
  ctx: PutItemEffectContext,
) => RuleResult | undefined;

const PUT_ITEM_EFFECT_HANDLERS: PutItemEffectHandler[] = [
  (state, ctx) => handleReactorCargoPut(state, ctx),
  (state, ctx) => {
    if (ctx.preposition !== "on") return undefined;
    return handleGamePreserveTrophySubmission(state, ctx);
  },
];

export function applyRegisteredPutItemEffects(
  state: GameState,
  ctx: PutItemEffectContext,
): RuleResult | undefined {
  for (const handler of PUT_ITEM_EFFECT_HANDLERS) {
    const result = handler(state, ctx);
    if (result) return result;
  }

  return undefined;
}
