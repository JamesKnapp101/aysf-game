import {
  isItemConsumable,
  setItemDoses,
  updateItemLocation,
} from "@game/rules/items";
import { recordConsumedDrinkAndMaybeStartVisionQuest } from "@game/helpers/barVisionQuest";
import { removeFromInventory } from "@game/rules/state";
import { applyStatusEffectToPlayer } from "@game/rules/status";
import { GameState } from "@game/types/gameTypes";
import { Item } from "@game/types/itemTypes";

function shouldApplyEmptyCleanup(
  state: GameState,
  cleanup: any,
): boolean {
  if (!cleanup) return false;

  if (Array.isArray(cleanup.rooms)) {
    return cleanup.rooms.includes(state.player.roomId);
  }

  return true;
}

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

  if (newDoses === 0) {
    const cleanup = item.meta?.consumable?.emptyCleanup;
    if (shouldApplyEmptyCleanup(next, cleanup)) {
      if (typeof cleanup.location === "string") {
        next = updateItemLocation(next, item.id, cleanup.location);
      }

      if (cleanup.removeFromInventory === true) {
        next = removeFromInventory(next, item.id);
      }

      if (typeof cleanup.message === "string" && cleanup.message.trim()) {
        baseMsg = [baseMsg, cleanup.message].filter(Boolean).join(" ");
      }
    }
  }

  const trackedDrink = recordConsumedDrinkAndMaybeStartVisionQuest(next, item);
  next = trackedDrink.state;

  if (trackedDrink.message) {
    baseMsg = [baseMsg, trackedDrink.message].filter(Boolean).join("\n\n");
  }

  return {
    state: next,
    message: baseMsg || "You take a drink.",
  };
}
