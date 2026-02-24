import { isItemOpen, setItemOpen } from "@game/rules/containers";
import { isItemOpenable } from "@game/rules/items";
import { getContainerContentsItems } from "@game/selectors/containerSelectors";
import { GameState } from "@game/types/gameTypes";
import { Item } from "@game/types/itemTypes";

export function tryOpenItem(
  state: GameState,
  item: Item,
): { state: GameState; message: string } {
  if (!isItemOpenable(item)) {
    return { state, message: "You can't open that." };
  }
  if (item.meta?.isUnopenableDoor) {
    return { state, message: item.overrides?.open ?? `It won't budge.` };
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
    revealMsg = item.overrides?.open ? "" : ", but it's empty";
  }

  return {
    state: next,
    message: baseMsg + revealMsg + ".",
  };
}
