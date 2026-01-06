import type { GameState } from "../types/gameTypes";
import type { RuleResult } from "./result";

import { getItemById } from "../selectors/itemSelectors";
import { tryPutItemInContainer } from "./containers";

type PutPrep = "in" | "into" | "on";

export function tryPut(
  state: GameState,
  args: {
    itemId: string;
    hostId: string;
    preposition: PutPrep;
  }
): RuleResult {
  const { itemId, hostId, preposition } = args;

  const item = getItemById(state, itemId);
  const host = getItemById(state, hostId);

  if (!item || !host) {
    return { state, message: "You don't see that here." };
  }

  if (itemId === hostId) {
    return { state, message: "That doesn't make sense." };
  }

  if (preposition === "in" || preposition === "into") {
    const result = tryPutItemInContainer(state, itemId, hostId);

    if (typeof result === "string") {
      return { state, message: result };
    }

    return { state: result, message: host.meta?.onInsertKey ?? "Done." };
  }

  if (preposition === "on") {
    if (!host.isSurface) {
      return { state, message: "You can't put things on that." };
    }

    const nextInventory = state.player.inventory.filter((id) => id !== itemId);
    const current = state.itemState.surfaceContents?.[hostId] ?? [];
    const updated = current.includes(itemId) ? current : [...current, itemId];

    const next: GameState = {
      ...state,
      player: {
        ...state.player,
        inventory: nextInventory,
      },
      itemState: {
        ...state.itemState,
        surfaceContents: {
          ...state.itemState.surfaceContents,
          [hostId]: updated,
        },
      },
      world: {
        ...state.world,
        items: state.world.items.map((it) =>
          it.id === itemId ? { ...it, location: host.location } : it
        ),
      },
    };

    return { state: next, message: "Done." };
  }
  return { state, message: "You can't seem to put that there." };
}
