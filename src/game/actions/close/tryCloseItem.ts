import { isItemOpen, setItemClosed } from "@game/rules/containers";
import { isItemOpenable } from "@game/rules/items";
import { GameState } from "@game/types/gameTypes";
import { Item } from "@game/types/itemTypes";

export function tryCloseItem(
  state: GameState,
  item: Item,
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
