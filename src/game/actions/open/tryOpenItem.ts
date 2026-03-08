import { triggerPlayerDeath } from "@game/helpers/gameHelpers";
import { isItemOpen, setItemOpen } from "@game/rules/containers";
import { isItemOpenable } from "@game/rules/items";
import { getContainerContentsItems } from "@game/selectors/containerSelectors";
import { GameState } from "@game/types/gameTypes";
import { Item } from "@game/types/itemTypes";

export function tryOpenItem(
  state: GameState,
  item: Item,
): { state: GameState; message: string } {
  const openOverride = item.overrides?.open;

  if (typeof openOverride === "function") {
    const out = openOverride({ item, state });

    if (typeof out === "string") {
      return { state, message: out };
    }

    let next = out?.state ?? state;
    if (out?.deathMessage) {
      next = triggerPlayerDeath(
        next,
        out.deathMessage,
        out.deathCause ?? `${item.id} open`,
      );
    }

    return {
      state: next,
      message: (out?.message ?? out?.deathMessage ?? "Nothing happens.").trim(),
    };
  }

  if (!isItemOpenable(item)) {
    return { state, message: typeof openOverride === "string" ? openOverride : "You can't open that." };
  }
  if (item.meta?.isUnopenableDoor) {
    return {
      state,
      message: typeof openOverride === "string" ? openOverride : `It won't budge.`,
    };
  }
  if (isItemOpen(state, item.id)) {
    return { state, message: "It's already open." };
  }
  let next = setItemOpen(state, item.id, true);

  const contents = getContainerContentsItems(next, item);

  const baseMsg =
    typeof openOverride === "string" ? openOverride : "You open the " + item.name;

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
    revealMsg = typeof openOverride === "string" ? "" : ", but it's empty";
  }

  return {
    state: next,
    message: baseMsg + revealMsg + ".",
  };
}
