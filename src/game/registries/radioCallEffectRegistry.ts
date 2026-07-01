import type { GameState } from "@game/types/gameTypes";
import { handleGreenhouseRadioCall } from "src/world/zoneRegistrations";

export type RadioCallEffectContext = {
  frequency: number;
  frequencyDisplay: string;
};

type RadioCallEffectResult = {
  message?: string;
  state: GameState;
};

type RadioCallEffectHandler = (
  state: GameState,
  ctx: RadioCallEffectContext,
) => RadioCallEffectResult | undefined;

const RADIO_CALL_EFFECT_HANDLERS: RadioCallEffectHandler[] = [
  handleGreenhouseRadioCall,
];

export function applyRegisteredRadioCallEffects(
  state: GameState,
  ctx: RadioCallEffectContext,
): RadioCallEffectResult {
  let next = state;
  const messages: string[] = [];

  for (const handler of RADIO_CALL_EFFECT_HANDLERS) {
    const result = handler(next, ctx);
    if (!result) continue;

    next = result.state;
    if (result.message) messages.push(result.message);
  }

  return {
    state: next,
    message: messages.join(" "),
  };
}
