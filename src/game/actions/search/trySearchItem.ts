import { getItemById } from "@game/helpers/itemHelpers";
import { bucketForItem, inventoryHas } from "@game/rules/state";
import { GameState } from "@game/types/gameTypes";
import { Item } from "@game/types/itemTypes";

export function trySearchItem(
  state: GameState,
  item: Item,
): { state: GameState; message: string } {
  if (!item.isSearchable) {
    return { state, message: "You don't see anything that isn't obvious." };
  }

  const foundIds = state.itemState.searchableContents[item.id];
  if (!foundIds || foundIds.length === 0) {
    return {
      state,
      message: `You look the ${item.name} over but you don't find anything interesting.`,
    };
  }

  let baseMsg = "";
  for (const foundId of foundIds) {
    const itemData = getItemById(state, foundId);
    baseMsg += itemData?.meta?.onFind ?? "";
  }

  // Add found items to inventory buckets (deduping)
  const nextInv = { ...state.player.inventory };
  for (const foundId of foundIds) {
    if (inventoryHas(nextInv, foundId)) continue;

    const foundItem = getItemById(state, foundId);
    const bucket = bucketForItem(foundItem);
    nextInv[bucket] = [...nextInv[bucket], foundId];
  }

  const next: GameState = {
    ...state,
    player: {
      ...state.player,
      inventory: nextInv,
    },
    itemState: {
      ...state.itemState,
      searchableContents: {
        ...state.itemState.searchableContents,
        [item.id]: [],
      },
    },
    worldState: {
      ...state.worldState,
      conditionalTriggers: {
        ...state.worldState.conditionalTriggers,
        [`searched-${item.id}`]: true,
      },
    },
  };

  return { state: next, message: baseMsg };
}
