import { setItemDoses, updateItemLocation } from "@game/rules/items";
import {
  addToInventory,
  inventoryHas,
  removeFromAllBuckets,
} from "@game/rules/state";
import type { GameState } from "@game/types/gameTypes";
import type { Item } from "@game/types/itemTypes";

export const BAR_SNAP_OUT_CHEWABLE_ID = "BarSnapOutChewable";

export function dispenseSnapOutChewable(state: GameState): {
  state: GameState;
  message: string;
} {
  if (inventoryHas(state.player.inventory, BAR_SNAP_OUT_CHEWABLE_ID)) {
    return { state, message: "You already have one" };
  }

  let next = updateItemLocation(state, BAR_SNAP_OUT_CHEWABLE_ID, "INVENTORY");
  next = setItemDoses(next, BAR_SNAP_OUT_CHEWABLE_ID, 1);
  next = addToInventory(next, BAR_SNAP_OUT_CHEWABLE_ID);

  return {
    state: next,
    message:
      "You turn the crank. The machine clunks, then drops a brick-shaped chewable through the little chute and into your hand.",
  };
}

export function consumeSnapOutChewable(
  state: GameState,
  item: Item,
): { state: GameState; message: string } {
  const doses = item.doses ?? 0;
  if (doses <= 0) {
    return { state, message: "That's the last of the chewable." };
  }

  const wasDrunk = state.player.statusEffects.some(
    (effect) => effect.id === "drunk",
  );

  let next = setItemDoses(state, item.id, 0);
  next = {
    ...next,
    player: {
      ...next.player,
      inventory: removeFromAllBuckets(next.player.inventory, item.id),
      statusEffects: next.player.statusEffects.filter(
        (effect) => effect.id !== "drunk",
      ),
      vitals: {
        ...next.player.vitals,
        brainActivity: wasDrunk ? 1 : next.player.vitals.brainActivity,
        drunkenness: wasDrunk ? 0 : next.player.vitals.drunkenness,
      },
    },
  };

  return {
    state: next,
    message:
      "You chew the Snap out of It! tablet. It collapses into a sharp citrus foam that seems to scrape the fog right off your thoughts.",
  };
}
