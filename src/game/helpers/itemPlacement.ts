import { updateItemLocation } from "@game/rules/items";
import { removeFromInventory } from "@game/rules/state";
import type { GameState } from "@game/types/gameTypes";

export function removeItemFromPlacementLists(
  lists: Record<string, string[]> | undefined,
  itemId: string,
): Record<string, string[]> {
  if (!lists) return {};

  return Object.fromEntries(
    Object.entries(lists).map(([hostId, ids]) => [
      hostId,
      (ids ?? []).filter((id) => id !== itemId),
    ]),
  );
}

export function stashItemInContainer(
  state: GameState,
  itemId: string,
  containerId: string,
): GameState {
  const cleanedContainerContents = removeItemFromPlacementLists(
    state.itemState.containerContents,
    itemId,
  );

  let next = {
    ...state,
    itemState: {
      ...state.itemState,
      containerContents: cleanedContainerContents,
      surfaceContents: removeItemFromPlacementLists(
        state.itemState.surfaceContents,
        itemId,
      ),
      underContents: removeItemFromPlacementLists(
        state.itemState.underContents,
        itemId,
      ),
      searchableContents: removeItemFromPlacementLists(
        state.itemState.searchableContents,
        itemId,
      ),
    },
  };

  next = removeFromInventory(next, itemId);
  next = updateItemLocation(next, itemId, containerId);

  const currentContents = next.itemState.containerContents[containerId] ?? [];

  return {
    ...next,
    itemState: {
      ...next.itemState,
      containerContents: {
        ...next.itemState.containerContents,
        [containerId]: currentContents.includes(itemId)
          ? currentContents
          : [...currentContents, itemId],
      },
    },
  };
}
