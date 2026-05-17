import type { GameState } from "@game/types/gameTypes";
import type { Item } from "@game/types/itemTypes";
import {
  AQUARIUM_GOAL_ITEM_ID,
  triggerAquariumReturnChoke,
} from "src/world/Items/creatures/octopus";

type TakeItemEffectResult = {
  messageTail?: string;
  state: GameState;
};

type TakeItemEffectHandler = (
  state: GameState,
  item: Item,
) => TakeItemEffectResult | undefined;

const TAKE_ITEM_EFFECT_HANDLERS: TakeItemEffectHandler[] = [
  (state, item) => {
    if (item.id !== AQUARIUM_GOAL_ITEM_ID) return undefined;

    return {
      state: triggerAquariumReturnChoke(state),
      messageTail:
        "\n\nAs you wrench the control node free, the water outside the grotto convulses. A heavy tentacle surges through the lower trench and knots itself across the return run toward the lock.",
    };
  },
];

export function applyRegisteredTakeItemEffects(
  state: GameState,
  item: Item,
): TakeItemEffectResult {
  let next = state;
  const messageTails: string[] = [];

  for (const handler of TAKE_ITEM_EFFECT_HANDLERS) {
    const result = handler(next, item);
    if (!result) continue;

    next = result.state;
    if (result.messageTail) messageTails.push(result.messageTail);
  }

  return {
    state: next,
    messageTail: messageTails.join(""),
  };
}
