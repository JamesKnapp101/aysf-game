import { removeFromAllBuckets } from "@game/rules/state";
import { updateItemLocation } from "@game/rules/items";
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

  const currentContents = state.itemState.containerContents[itemToLoad.id] ?? [];

  if (currentContents.length === itemToLoad.capacity) {
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

  next = updateItemLocation(state, itemLoadWith.id, itemToLoad.id);
  next = {
    ...next,
    player: {
      ...next.player,
      inventory: removeFromAllBuckets(next.player.inventory, itemLoadWith.id),
    },
    itemState: {
      ...next.itemState,
      containerContents: {
        ...next.itemState.containerContents,
        [itemToLoad.id]: [...currentContents, itemLoadWith.id],
      },
    },
  };

  return { state: next, message: msg };
}
