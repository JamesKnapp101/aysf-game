import type { GameState } from "@game/types/gameTypes";
import type { Item } from "@game/types/itemTypes";
import type { ParsedCommand } from "@game/types/parserTypes";

export function tryBlowItem(
  state: GameState,
  item: Item,
  cmd?: ParsedCommand,
): { state: GameState; message: string } {
  const blowOverride = item.overrides?.blow;

  if (typeof blowOverride === "function") {
    const out = blowOverride({ state, item, cmd });

    if (typeof out === "string") {
      return { state, message: out };
    }

    return {
      state: out?.state ?? state,
      message: out?.message ?? "Nothing happens.",
    };
  }

  return {
    state,
    message:
      typeof blowOverride === "string" ? blowOverride : "You can't do that.",
  };
}
