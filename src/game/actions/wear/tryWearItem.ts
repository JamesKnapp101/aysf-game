import { refreshPlayerOxygenForEnvironment } from "@game/helpers/environmentHelpers";
import { GameState } from "@game/types/gameTypes";
import { Item } from "@game/types/itemTypes";

export function tryWearItem(
  state: GameState,
  item: Item,
): { state: GameState; message: string } {
  if (!item.isWearable || !item.clothingSlot) {
    return { state, message: "You can't wear that." };
  }
  const wearOverride = item.overrides?.wear;
  if (typeof wearOverride === "function") {
    return wearOverride({ state, item });
  }
  if (item.meta?.clothing?.tooSmall) {
    const art =
      item.clothingSlot === "feet" || item.clothingSlot === "legs"
        ? `they're`
        : `it's`;
    return { state, message: `Try as you might, ${art} just too small.` };
  }
  if (state.itemState.wornByPlayer[item.clothingSlot]) {
    return {
      state,
      message: `You're already wearing something on your ${item.clothingSlot}`,
    };
  }
  let next = state;
  const baseMsg =
    item?.meta?.clothing?.wearMessage ??
    (typeof wearOverride === "string" ? wearOverride : undefined) ??
    `You put on the ${item.name}`;

  next = {
    ...next,
    itemState: {
      ...state.itemState,
      wornByPlayer: {
        ...state.itemState.wornByPlayer,
        [item.clothingSlot]: item.id,
      },
    },
  };

  return {
    state: refreshPlayerOxygenForEnvironment(next),
    message: baseMsg,
  };
}
