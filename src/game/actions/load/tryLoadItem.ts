import { removeFromAllBuckets } from "@game/rules/state";
import { GameState } from "@game/types/gameTypes";
import { Item } from "@game/types/itemTypes";

export function tryLoadItem(
  state: GameState,
  itemToLoad: Item,
  itemLoadWith: Item,
): { state: GameState; message: string } {
  let next = state;

  if (!itemToLoad.isShootable) {
    return {
      state: next,
      message: `The ${itemToLoad.name} isn't something you can load with rounds.`,
    };
  }

  if (
    state.itemState.containerContents[itemToLoad.id]?.length ===
    itemToLoad.capacity
  ) {
    return {
      state: next,
      message: `The ${itemToLoad.name} is already fully loaded.`,
    };
  }

  if (!itemToLoad.allowedContentsIds?.includes(itemLoadWith.id)) {
    return {
      state: next,
      message: `You can't load the ${itemToLoad.name} with that.`,
    };
  }

  const msg =
    itemToLoad?.meta?.onLoad ??
    `You load the ${itemLoadWith.name} into the ${itemToLoad.name}`;

  next = {
    ...state,
    player: {
      ...state.player,
      inventory: removeFromAllBuckets(state.player.inventory, itemLoadWith.id),
    },
    itemState: {
      ...state.itemState,
      containerContents: {
        ...state.itemState.containerContents,
        [itemToLoad.id]: [
          ...((state.itemState.containerContents[itemToLoad.id] as any) ?? []),
          itemLoadWith.id,
        ],
      },
    },
  };

  return { state: next, message: msg };
}
