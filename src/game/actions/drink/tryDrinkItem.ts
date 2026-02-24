import { isItemConsumable, setItemDoses } from "@game/rules/items";
import { applyStatusEffectToPlayer } from "@game/rules/status";
import { GameState } from "@game/types/gameTypes";
import { Item } from "@game/types/itemTypes";

export function tryDrinkItem(
  state: GameState,
  item: Item,
): { state: GameState; message: string } {
  if (!isItemConsumable(item)) {
    return { state, message: "You can't drink that." };
  }

  const doses = item.doses ?? 0;
  if (doses <= 0) {
    const msg =
      item.meta?.consumable?.onEmpty
        ?.map((eff: { type: string; text: any }) =>
          eff.type === "message" ? String(eff.text) : "",
        )
        .filter(Boolean)
        .join(" ") || "It's empty.";
    return { state, message: msg };
  }

  let next = state;
  let baseMsg = "";

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

  return {
    state: next,
    message: baseMsg || "You take a drink.",
  };
}
