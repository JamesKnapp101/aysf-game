import { GameState } from "../../types/gameTypes";
import { Item } from "../../types/itemTypes";
import type { ParsedCommand } from "../../types/parserTypes";

export function tryPushItem(
  state: GameState,
  item: Item,
  cmd?: ParsedCommand,
): { state: GameState; message: string } {
  if (!item.isPushable) {
    return { state, message: "You can't push that." };
  }

  const pushOverride = item.overrides?.push;

  if (typeof pushOverride === "function") {
    const out = pushOverride({ state, item, cmd });

    if (typeof out === "string") {
      return { state, message: out };
    }

    return {
      state: out?.state ?? state,
      message: out?.message ?? "Nothing happens.",
    };
  }

  if (typeof pushOverride === "string") {
    return { state, message: pushOverride };
  }

  return {
    state,
    message: "Nothing happens.",
  };
}
