import { updateItemLocation } from "@game/rules/items";
import { inventoryHas, removeFromInventory } from "@game/rules/state";
import type { GameState } from "@game/types/gameTypes";
import type { Item } from "@game/types/itemTypes";

/** Follow placement hosts, rather than mistaking a carried container for a room. */
export function getItemPlacementContext(
  state: GameState,
  itemId: string | undefined,
  seen = new Set<string>(),
): { roomId?: string; containers: Item[]; concealed: boolean } {
  const containers: Item[] = [];
  let concealed = false;
  let id = itemId;
  while (id && !seen.has(id)) {
    seen.add(id);
    if (id === "PLAYER" || id === "INVENTORY" || inventoryHas(state.player.inventory, id)) {
      return { roomId: state.player.roomId, containers, concealed };
    }
    if (state.world.rooms.some((room) => room.id === id)) {
      return { roomId: id, containers, concealed };
    }
    const attachedHost = state.itemState.attachedTo[id];
    if (attachedHost) {
      id = attachedHost;
      continue;
    }
    let parent: string | undefined;
    for (const [kind, lists] of [
      ["container", state.itemState.containerContents],
      ["surface", state.itemState.surfaceContents],
      ["under", state.itemState.underContents],
      ["searchable", state.itemState.searchableContents],
    ] as const) {
      parent = Object.keys(lists).find((hostId) => lists[hostId]?.includes(id!));
      if (!parent) continue;
      if (kind === "container") {
        const container = state.world.items.find((item) => item.id === parent);
        if (container) containers.push(container);
      }
      if (kind === "under" || kind === "searchable") concealed = true;
      break;
    }
    if (parent) {
      id = parent;
      continue;
    }
    const item = state.world.items.find((candidate) => candidate.id === id);
    const location = state.itemState.itemRoomId[id] ?? item?.location;
    // Legacy placements sometimes record only the immediate container ID.
    const container = state.world.items.find((candidate) => candidate.id === location && candidate.isContainer);
    if (container) containers.push(container);
    id = location;
  }
  return { containers, concealed };
}

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
