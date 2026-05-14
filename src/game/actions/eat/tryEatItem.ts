import { isItemConsumable, setItemDoses } from "@game/rules/items";
import { removeFromInventory } from "@game/rules/state";
import { applyStatusEffectToPlayer } from "@game/rules/status";
import { GameState } from "@game/types/gameTypes";
import { Item } from "@game/types/itemTypes";

export function tryEatItem(
  state: GameState,
  item: Item,
): { state: GameState; message: string } {
  if (!isItemConsumable(item)) {
    return { state, message: "You can't eat that." };
  }

  const eatOverride = item.overrides?.eat;
  if (typeof eatOverride === "function") {
    const out = eatOverride({ state, item });

    if (typeof out === "string") {
      return { state, message: out };
    }

    return {
      state: out?.state ?? state,
      message: out?.message ?? "You take a bite.",
    };
  }

  if (typeof eatOverride === "string") {
    return { state, message: eatOverride };
  }

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
  if (newDoses === 0) {
    next = removeFromInventory(next, item.id);
  }

  return {
    state: next,
    message: baseMsg || "You take a bite.",
  };
}
