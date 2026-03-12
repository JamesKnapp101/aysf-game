import { isItemUseable, setItemDoses } from "@game/rules/items";
import { applyStatusEffectToPlayer } from "@game/rules/status";
import { GameState } from "@game/types/gameTypes";
import { Item } from "@game/types/itemTypes";
import type { ParsedCommand } from "@game/types/parserTypes";

export function tryUseItem(
  state: GameState,
  item: Item,
  cmd?: ParsedCommand,
): { state: GameState; message: string } {
  if (!isItemUseable(item)) {
    return { state, message: "You can't use that." };
  }

  const itemUseOverride = item.overrides?.use;
  if (typeof itemUseOverride === "function") {
    return itemUseOverride({
      state,
      item,
      cmd,
    });
  }

  let next = state;
  let baseMsg = "";
  // This is for things that are usable and also have doses, like the vape pen
  if (item.doses) {
    const doses = item.doses ?? 0;
    if (doses <= 0) {
      const msg =
        item.meta?.consumable?.onEmpty
          ?.map((eff: { type: string; text: any }) =>
            eff.type === "message" ? String(eff.text) : "",
          )
          .filter(Boolean)
          .join(" ") || `That's the last of the ${item.name}`;
      return { state, message: msg };
    }

    const perDoseEffects = item.meta?.consumable?.perDose || [];
    for (const effect of perDoseEffects) {
      if (effect.type === "status") {
        next = applyStatusEffectToPlayer(
          next,
          effect.id,
          effect.intensity ?? 0,
          effect.duration ?? 0,
        );
      } else if (effect.type === "message") {
        baseMsg += String(effect.text);
      }
    }

    const newDoses = Math.max(0, doses - 1);
    next = setItemDoses(next, item.id, newDoses);
  }

  return {
    state: next,
    message: baseMsg || "You have a fiddle.",
  };
}
