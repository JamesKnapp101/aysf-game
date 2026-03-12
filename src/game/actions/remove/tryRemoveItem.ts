import { refreshPlayerOxygenForEnvironment } from "@game/helpers/environmentHelpers";
import { GameState } from "@game/types/gameTypes";
import { Item } from "@game/types/itemTypes";

export function tryRemoveItem(
  state: GameState,
  item: Item,
): { state: GameState; message: string } {
  if (!item.isWearable || !item.clothingSlot) {
    return { state, message: "You can't remove that." };
  }

  if (state.itemState.wornByPlayer[item.clothingSlot] !== item.id) {
    return {
      state,
      message: `You aren't wearing the ${item.name}`,
    };
  }
  let next = state;
  const baseMsg =
    item?.meta?.clothing?.removeMessage ??
    item?.overrides?.remove ??
    `You remove the ${item.name}`;

  next = {
    ...next,
    itemState: {
      ...state.itemState,
      wornByPlayer: {
        ...state.itemState.wornByPlayer,
        [item.clothingSlot]: undefined,
      },
    },
  };

  return {
    state: refreshPlayerOxygenForEnvironment(next),
    message: baseMsg,
  };
}
