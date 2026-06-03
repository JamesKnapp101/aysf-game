import { updateItemLocation } from "@game/rules/items";
import { addToInventory, inventoryHas } from "@game/rules/state";
import type { GameState } from "@game/types/gameTypes";

type SnapshotMigration = (state: GameState) => GameState;

function getInventoryItemIds(state: GameState): string[] {
  return [
    ...state.player.inventory.general,
    ...state.player.inventory.badges,
    ...state.player.inventory.keys,
  ];
}

function normalizeInventoryItemLocations(state: GameState): GameState {
  return getInventoryItemIds(state).reduce(
    (next, itemId) => updateItemLocation(next, itemId, "INVENTORY"),
    state,
  );
}

function addRestoredInventoryItem(state: GameState, itemId: string): GameState {
  if (inventoryHas(state.player.inventory, itemId)) {
    return updateItemLocation(state, itemId, "INVENTORY");
  }

  const next = updateItemLocation(state, itemId, "INVENTORY");
  return addToInventory(next, itemId);
}

function preserveLegacyBadgeSwapProgress(state: GameState): GameState {
  let next = state;
  const gymWeightlifterMoved =
    next.worldState.conditionalTriggers.GymWeightlifterMoved === true;
  const hydroponicsCocoonResolved =
    next.worldState.hydroponicsCocoonPuzzle.resolved === true ||
    next.worldState.conditionalTriggers.EscapedWithOrangeBadge === true;

  if (
    gymWeightlifterMoved &&
    inventoryHas(next.player.inventory, "orangebadge") &&
    !inventoryHas(next.player.inventory, "yellowbadge")
  ) {
    next = addRestoredInventoryItem(next, "yellowbadge");
  }

  if (
    hydroponicsCocoonResolved &&
    inventoryHas(next.player.inventory, "yellowbadge") &&
    !inventoryHas(next.player.inventory, "orangebadge")
  ) {
    next = addRestoredInventoryItem(next, "orangebadge");
  }

  return next;
}

const SNAPSHOT_MIGRATIONS: SnapshotMigration[] = [
  normalizeInventoryItemLocations,
  preserveLegacyBadgeSwapProgress,
];

export function applySnapshotMigrations(state: GameState): GameState {
  return SNAPSHOT_MIGRATIONS.reduce(
    (next, migration) => migration(next),
    state,
  );
}
