import type { GameState } from "@game/types/gameTypes";
import type { Item } from "@game/types/itemTypes";
import {
  GAME_PRESERVE_PRIZE_ID,
  handleGamePreservePrizeTaken,
} from "@game/preserve/preserveTrophies";
import {
  AQUARIUM_GOAL_ITEM_ID,
  triggerAquariumReturnChoke,
} from "src/world/Items/creatures/octopus";
import { handleReactorSmartbellTaken } from "src/world/maps/levelFive/reactorPlatform";

type TakeItemEffectContext = {
  fromRoomId: string;
};

type TakeItemEffectResult = {
  message?: string;
  messageTail?: string;
  state: GameState;
};

type TakeItemEffectHandler = (
  state: GameState,
  item: Item,
  ctx: TakeItemEffectContext,
) => TakeItemEffectResult | undefined;

const TAKE_ITEM_EFFECT_HANDLERS: TakeItemEffectHandler[] = [
  (state, item) => handleReactorSmartbellTaken(state, item),
  (state, item) => {
    if (item.id !== AQUARIUM_GOAL_ITEM_ID) return undefined;

    return {
      state: triggerAquariumReturnChoke(state),
      messageTail:
        "\n\nAs you wrench the control node free, the water outside the grotto convulses. A heavy tentacle surges through the lower trench and knots itself across the return run toward the lock.",
    };
  },
  (state, item, ctx) => {
    if (item.id !== GAME_PRESERVE_PRIZE_ID) return undefined;

    return handleGamePreservePrizeTaken(state, ctx.fromRoomId);
  },
];

export function applyRegisteredTakeItemEffects(
  state: GameState,
  item: Item,
  ctx: TakeItemEffectContext,
): TakeItemEffectResult {
  let next = state;
  let message: string | undefined;
  const messageTails: string[] = [];

  for (const handler of TAKE_ITEM_EFFECT_HANDLERS) {
    const result = handler(next, item, ctx);
    if (!result) continue;

    next = result.state;
    if (result.message) message = result.message;
    if (result.messageTail) messageTails.push(result.messageTail);
  }

  return {
    state: next,
    message,
    messageTail: messageTails.join(""),
  };
}
