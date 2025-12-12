import { appendLog } from "../engine/handleCommand";
import {
  getContainerContentsIds,
  getContainerContentsItems,
} from "../selectors/containerSelectors";
import { getItemsInInventory } from "../selectors/itemSelectors";
import {
  getCurrentRoom,
  getItemsInCurrentRoom,
} from "../selectors/roomSelectors";
import type { GameState } from "../types/gameTypes";
import type { Item, ItemOverrideVerb } from "../types/itemTypes";
import { isItemOpen, setItemClosed, setItemOpen } from "./containers";

export function describeActionResult(
  item: Item,
  verb: ItemOverrideVerb,
  fallback: string
): string {
  return item.overrides?.[verb] ?? fallback;
}

export function formatNameList(names: string[]): string {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

export function updateItemLocation(
  state: GameState,
  itemId: string,
  location: string
): GameState {
  return {
    ...state,
    world: {
      ...state.world,
      items: state.world.items.map((it) =>
        it.id === itemId ? { ...it, location } : it
      ),
    },
  };
}

export function takeItem(state: GameState, noun: string): GameState {
  const lower = noun.toLowerCase();

  // --- 1) Try items on the room floor first --------------------------
  const itemsHere = getItemsInCurrentRoom(state);

  let item = itemsHere.find(
    (i) => i.vocab.includes(lower) || i.name.toLowerCase() === lower
  );

  if (item) {
    if (item.itemCategory === "scenery") {
      return appendLog(state, "You can’t take that.");
    }

    const withLocation = updateItemLocation(state, item.id, "INVENTORY");

    const next: GameState = {
      ...withLocation,
      player: {
        ...withLocation.player,
        inventory: withLocation.player.inventory.includes(item.id)
          ? withLocation.player.inventory
          : [...withLocation.player.inventory, item.id],
      },
    };

    return appendLog(next, "Taken.");
  }

  // --- 2) Not on floor: check open containers in the room ------------

  const room = getCurrentRoom(state);

  const containersHere = state.world.items.filter(
    (i) => i.isContainer && i.location === room.id
  );

  for (const container of containersHere) {
    // Only expose contents if container is open
    if (!isItemOpen(state, container.id)) continue;

    const contentsItems = getContainerContentsItems(state, container);

    const found = contentsItems.find(
      (i) => i.vocab.includes(lower) || i.name.toLowerCase() === lower
    );

    if (!found) continue;

    if (found.itemCategory === "scenery") {
      return appendLog(state, "You can’t take that.");
    }

    // Seed dynamic contents for this container, then remove the item
    const seededIds = getContainerContentsIds(state, container);
    const updatedContentsIds = seededIds.filter((id) => id !== found.id);

    const withLocation = updateItemLocation(state, found.id, "INVENTORY");

    const withInventory: GameState = {
      ...withLocation,
      player: {
        ...withLocation.player,
        inventory: withLocation.player.inventory.includes(found.id)
          ? withLocation.player.inventory
          : [...withLocation.player.inventory, found.id],
      },
    };

    const withContainerState: GameState = {
      ...withInventory,
      itemState: {
        ...withInventory.itemState,
        containerContents: {
          ...withInventory.itemState.containerContents,
          [container.id]: updatedContentsIds,
        },
      },
    };

    return appendLog(withContainerState, "Taken.");
  }

  // --- 3) Nowhere to be found ----------------------------------------
  return appendLog(state, "You don't see that here.");
}

export function dropItem(state: GameState, noun: string): GameState {
  const inv = getItemsInInventory(state);
  const lower = noun.toLowerCase();

  const item = inv.find(
    (i) => i.name.toLowerCase() === lower || i.vocab.includes(lower)
  );
  if (!item) return appendLog(state, "You aren't carrying that.");

  const withLocation = updateItemLocation(state, item.id, state.player.roomId);

  const next: GameState = {
    ...withLocation,
    player: {
      ...withLocation.player,
      inventory: withLocation.player.inventory.filter((id) => id !== item.id),
    },
  };

  return appendLog(next, "Dropped.");
}

export function isItemOpenable(item: Item): boolean {
  // For now, treat containers as openable.
  // If you later add item.isOpenable, use that instead or in addition.
  return !!item.isContainer;
}

export function tryOpenItem(
  state: GameState,
  item: Item
): { state: GameState; message: string } {
  // 1. Validate openable
  if (!isItemOpenable(item)) {
    return { state, message: "You can't open that." };
  }

  // 2. Already open?
  if (isItemOpen(state, item.id)) {
    return { state, message: "It's already open." };
  }

  // 3. Open the container
  let next = setItemOpen(state, item.id, true);

  // 4. Determine contents *after* opening
  const contents = getContainerContentsItems(next, item); // <- uses selector you already have

  // 5. Build reveal message
  const baseMsg = item.overrides?.open ?? "You open the " + item.name;

  let revealMsg = "";
  if (contents.length > 0) {
    const names = contents.map((c) => c.name);
    const joined =
      names.length === 1
        ? names[0]
        : names.length === 2
        ? `${names[0]} and ${names[1]}`
        : `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;

    revealMsg = `, revealing ${joined}`;
  } else {
    revealMsg = ", but it's empty";
  }

  return {
    state: next,
    message: baseMsg + revealMsg + ".",
  };
}

export function tryCloseItem(
  state: GameState,
  item: Item
): { state: GameState; message: string } {
  // 1. Validate openable
  if (!isItemOpenable(item)) {
    return { state, message: "You can't close that." };
  }

  // 2. Already closed?
  if (!isItemOpen(state, item.id)) {
    return { state, message: "It's already closed." };
  }

  // 3. Close the container
  let next = setItemClosed(state, item.id, true);

  const msg = item.overrides?.open ?? "You close the " + item.name;

  return {
    state: next,
    message: msg + ".",
  };
}
