import { GameState } from "@game/types/gameTypes";
import { Item } from "@game/types/itemTypes";

export function tryRideItem(
  state: GameState,
  item: Item,
): { state: GameState; message: string } {
  const baseMsg = "I'm not sure that's going to work.";
  const override = item.overrides?.ride;

  if (typeof override === "function") {
    const out = override({ state, item });

    if (typeof out === "string") {
      return { state, message: out };
    }

    return {
      state: out?.state ?? state,
      message: out?.message ?? baseMsg,
    };
  }

  if (typeof override === "string") {
    return { state, message: override };
  }

  return {
    state,
    message: baseMsg || "Whee!",
  };
}
