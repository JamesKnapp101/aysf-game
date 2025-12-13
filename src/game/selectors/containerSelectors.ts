import type { GameState } from "../types/gameTypes";
import type { ItemId } from "../types/ids";
import type { Item } from "../types/itemTypes";
import { getItemById } from "./itemSelectors";

export function isSerumCartridge(item: Item): boolean {
  return !item.isContainer && item.isSyringeCartridge === true;
}

export function getContainerContentsIds(
  state: GameState,
  container: Item
): ItemId[] {
  return state.itemState.containerContents[container.id] ?? [];
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
