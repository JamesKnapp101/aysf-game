import { GameState } from "../../types/gameTypes";
import { Item } from "../../types/itemTypes";

export function tryTurnItem(
  state: GameState,
  prep: string,
  item: Item,
): { state: GameState; message: string } {
  const turnOverride = item.overrides?.turn;
  if (typeof turnOverride === "function") {
    const out = turnOverride({ state, item, prep });

    if (typeof out === "string") {
      return { state, message: out };
    }

    return {
      state: out?.state ?? state,
      message: out?.message ?? "Nothing happens.",
    };
  }

  if (typeof turnOverride === "string") {
    return { state, message: turnOverride };
  }

  return {
    state,
    message: "You can't turn that.",
  };
}
