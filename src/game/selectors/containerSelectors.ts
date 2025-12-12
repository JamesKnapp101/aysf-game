import type { GameState } from "../types/gameTypes";
import type { Item } from "../types/itemTypes";
import { getItemById } from "./itemSelectors";

export function isSerumCartridge(item: Item): boolean {
  return !item.isContainer && item.isSyringeCartridge === true;
}

export function getContainerContentsIds(
  state: GameState,
  container: Item
): string[] {
  // 1) If we’ve already got dynamic contents, use that as source of truth
  const fromState = state.itemState.containerContents[container.id];
  if (fromState) {
    return fromState;
  }

  // 2) Otherwise, seed from:
  //    - items whose location === container.id
  //    - static container.contains (if you use it)
  const fromLocation = state.world.items
    .filter((it) => it.location === container.id)
    .map((it) => it.id);

  const fromStatic = container.contains ?? [];

  const merged = Array.from(new Set([...fromLocation, ...fromStatic]));

  return merged;
}

export function getContainerContentsItems(
  state: GameState,
  container: Item
): Item[] {
  const ids = getContainerContentsIds(state, container);
  return ids
    .map((id) => getItemById(state, id))
    .filter((it): it is Item => Boolean(it));
}
