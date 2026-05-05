import { Item } from "@game/types/itemTypes";
import type { GameState } from "../types/gameTypes";
import { applyStatusEffectToPlayer } from "./status";

export function inventoryHas(
  inv: GameState["player"]["inventory"],
  itemId: string,
): boolean {
  return (
    inv.general.includes(itemId) ||
    inv.badges.includes(itemId) ||
    inv.keys.includes(itemId)
  );
}

export function inventoryHasAll(
  inv: GameState["player"]["inventory"],
  itemIds: string[],
): boolean {
  for (const id of itemIds) {
    if (
      !(
        inv.general.includes(id) ||
        inv.badges.includes(id) ||
        inv.keys.includes(id)
      )
    ) {
      return false;
    }
  }
  return true;
}

export function bucketForItem(
  item: Item | undefined,
): "general" | "badges" | "keys" {
  const kind = item?.meta?.kind;
  if (kind === "security-badge") return "badges";
  if (kind === "key") return "keys";
  return "general";
}

export function removeFromAllBuckets(
  inv: GameState["player"]["inventory"],
  itemId: string,
): GameState["player"]["inventory"] {
  return {
    general: inv.general.filter((id) => id !== itemId),
    badges: inv.badges.filter((id) => id !== itemId),
    keys: inv.keys.filter((id) => id !== itemId),
  };
}

export function addToInventory(state: GameState, itemId: string): GameState {
  if (inventoryHas(state.player.inventory, itemId)) return state;

  let next = state;

  const itemToAdd = next.world.items.find((it) => it.id === itemId);
  if (itemToAdd?.isContagious && !next.itemState.pickedUpByPlayer[itemId]) {
    next = applyStatusEffectToPlayer(next, "syndrome x", 1, 2000);
  }

  const bucket = bucketForItem(itemToAdd);
  const prevInv = next.player.inventory;

  return {
    ...next,
    player: {
      ...next.player,
      inventory: {
        ...prevInv,
        [bucket]: prevInv[bucket].includes(itemId)
          ? prevInv[bucket]
          : [...prevInv[bucket], itemId],
      },
    },
    itemState: {
      ...next.itemState,
      pickedUpByPlayer: { ...next.itemState.pickedUpByPlayer, [itemId]: true },
    },
  };
}

export function removeFromInventory(
  state: GameState,
  itemId: string,
): GameState {
  if (!inventoryHas(state.player.inventory, itemId)) return state;

  return {
    ...state,
    player: {
      ...state.player,
      inventory: removeFromAllBuckets(state.player.inventory, itemId),
    },
  };
}
