import type { GameState } from "../types/gameTypes";
import type { Item, ItemOverrideVerb } from "../types/itemTypes";

export function describeActionResult(
  item: Item,
  verb: ItemOverrideVerb,
  fallback: string,
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
  location: string,
): GameState {
  return {
    ...state,
    world: {
      ...state.world,
      items: state.world.items.map((it) =>
        it.id === itemId ? { ...it, location } : it,
      ),
    },
    itemState: {
      ...state.itemState,
      itemRoomId: {
        ...state.itemState.itemRoomId,
        [itemId]: location,
      },
    },
  };
}

export function isItemOpenable(item: Item): boolean {
  return !!item.isContainer && item.isOpenable !== false;
}

export function isItemConsumable(item: Item): boolean {
  return !!item.meta?.consumable;
}

export function isItemUseable(item: Item): boolean {
  return item.isUseable ?? false;
}

export function setItemDoses(
  state: GameState,
  itemId: string,
  doses: number,
): GameState {
  return {
    ...state,
    world: {
      ...state.world,
      items: state.world.items.map((it) =>
        it.id === itemId ? { ...it, doses } : it,
      ),
    },
  };
}

export function describeScotchBottle(item: Item): string {
  const doses = item.doses ?? 0;

  if (doses === 17) {
    return `
A tall bottle with a clean label and an unbroken seal.
The glass is clear, the contents dark and untouched.
`;
  }

  if (doses > 12) {
    return `
The bottle has been opened.
Most of the scotch is still there, sloshing darkly inside.
`;
  }

  if (doses > 6) {
    return `
The bottle is noticeably lighter now.
The label is smudged, and the liquid sits below the midpoint.
`;
  }

  if (doses > 1) {
    return `
Only a few fingers of scotch remain.
You’d have to tip the bottle to get a proper drink.
`;
  }

  if (doses === 1) {
    return `
Just a swallow left at the bottom of the bottle.
The glass smells sharply of alcohol.
`;
  }

  return `
An empty bottle.
It smells faintly of scotch.
`;
}
