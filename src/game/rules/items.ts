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
import type { RuleResult } from "./result";
import { addToInventory, removeFromInventory } from "./state";
import { applyStatusEffectToPlayer } from "./status";

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

export function tryTakeItem(state: GameState, noun: string): RuleResult {
  const lower = noun.toLowerCase();
  const itemsHere = getItemsInCurrentRoom(state);
  const itemOnFloor = itemsHere.find(
    (i) => i.vocab.includes(lower) || i.name.toLowerCase() === lower
  );

  if (itemOnFloor) {
    if (itemOnFloor.itemCategory === "scenery") {
      return { state, message: "You can’t take that." };
    }

    let next = updateItemLocation(state, itemOnFloor.id, "INVENTORY");
    next = addToInventory(next, itemOnFloor.id);

    return { state: next, message: "Taken." };
  }

  const room = getCurrentRoom(state);
  const containersHere = state.world.items.filter(
    (i) => i.isContainer && i.location === room.id
  );

  for (const container of containersHere) {
    if (!isItemOpen(state, container.id)) continue;

    const contentsItems = getContainerContentsItems(state, container);
    const found = contentsItems.find(
      (i) => i.vocab.includes(lower) || i.name.toLowerCase() === lower
    );

    if (!found) continue;

    if (found.itemCategory === "scenery") {
      return { state, message: "You can’t take that." };
    }

    const seededIds = getContainerContentsIds(state, container);
    const updatedContentsIds = seededIds.filter((id) => id !== found.id);

    let next = updateItemLocation(state, found.id, "INVENTORY");
    next = addToInventory(next, found.id);

    next = {
      ...next,
      itemState: {
        ...next.itemState,
        containerContents: {
          ...next.itemState.containerContents,
          [container.id]: updatedContentsIds,
        },
      },
    };

    return { state: next, message: "Taken." };
  }
  return { state, message: "You don't see that here." };
}

export function tryDropItem(state: GameState, noun: string): RuleResult {
  const invItems = getItemsInInventory(state);
  const lower = noun.toLowerCase();

  const item = invItems.find(
    (i) => i.name.toLowerCase() === lower || i.vocab.includes(lower)
  );

  if (!item) {
    return { state, message: "You aren't carrying that." };
  }

  let next = updateItemLocation(state, item.id, state.player.roomId);
  next = removeFromInventory(next, item.id);

  return { state: next, message: "Dropped." };
}

export function isItemOpenable(item: Item): boolean {
  return !!item.isContainer;
}

export function tryOpenItem(
  state: GameState,
  item: Item
): { state: GameState; message: string } {
  if (!isItemOpenable(item)) {
    return { state, message: "You can't open that." };
  }
  if (isItemOpen(state, item.id)) {
    return { state, message: "It's already open." };
  }
  let next = setItemOpen(state, item.id, true);

  const contents = getContainerContentsItems(next, item);

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
  if (!isItemOpenable(item)) {
    return { state, message: "You can't close that." };
  }

  if (!isItemOpen(state, item.id)) {
    return { state, message: "It's already closed." };
  }

  let next = setItemClosed(state, item.id, true);

  const msg = item.overrides?.open ?? "You close the " + item.name;

  return {
    state: next,
    message: msg + ".",
  };
}

export function isItemConsumable(item: Item): boolean {
  return !!item.meta?.consumable;
}

function setItemDoses(
  state: GameState,
  itemId: string,
  doses: number
): GameState {
  return {
    ...state,
    world: {
      ...state.world,
      items: state.world.items.map((it) =>
        it.id === itemId ? { ...it, doses } : it
      ),
    },
  };
}

export function tryDrinkItem(
  state: GameState,
  item: Item
): { state: GameState; message: string } {
  if (!isItemConsumable(item)) {
    return { state, message: "You can't drink that." };
  }

  const doses = item.doses ?? 0;
  if (doses <= 0) {
    const msg =
      item.meta?.consumable?.onEmpty
        ?.map((eff: { type: string; text: any }) =>
          eff.type === "message" ? String(eff.text) : ""
        )
        .filter(Boolean)
        .join(" ") || "It's empty.";
    return { state, message: msg };
  }

  let next = state;
  let baseMsg = "";

  const perDoseEffects = item.meta?.consumable?.perDose || [];
  for (const effect of perDoseEffects) {
    if (effect.type === "status") {
      next = applyStatusEffectToPlayer(
        next,
        effect.id,
        effect.intensity ?? 0,
        effect.duration ?? 0
      );
    } else if (effect.type === "message") {
      baseMsg += String(effect.text);
    }
  }

  const newDoses = Math.max(0, doses - 1);
  next = setItemDoses(next, item.id, newDoses);

  return {
    state: next,
    message: baseMsg || "You take a drink.",
  };
}
