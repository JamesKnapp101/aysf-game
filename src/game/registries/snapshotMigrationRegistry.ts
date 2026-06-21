import { updateItemLocation } from "@game/rules/items";
import { addToInventory, inventoryHas } from "@game/rules/state";
import {
  createPlayerHuskMeta,
  getPlayerHuskMeta,
  getPlayerHuskNumberVocab,
  getPlayerHuskPlateDescription,
  INITIAL_PLAYER_HUSK_NUMBER,
} from "@game/helpers/playerHuskHelpers";
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

function migrateLegacyPlayerHusks(state: GameState): GameState {
  let playerHuskCount = Math.max(
    state.worldState.playerHuskCount ?? INITIAL_PLAYER_HUSK_NUMBER,
    INITIAL_PLAYER_HUSK_NUMBER,
  );

  const items = state.world.items.map((item) => {
    const existingMeta = getPlayerHuskMeta(item);
    if (existingMeta) {
      playerHuskCount = Math.max(playerHuskCount, existingMeta.number);
      return item;
    }

    if (!item.id.startsWith("playerRegenHusk")) return item;

    playerHuskCount += 1;
    return {
      ...item,
      description: `${item.description.trim()} ${getPlayerHuskPlateDescription(playerHuskCount)}`,
      vocab: Array.from(
        new Set([
          ...item.vocab,
          ...getPlayerHuskNumberVocab(playerHuskCount),
        ]),
      ),
      meta: {
        ...item.meta,
        playerHusk: createPlayerHuskMeta(playerHuskCount),
      },
    };
  });

  return {
    ...state,
    world: { ...state.world, items },
    worldState: { ...state.worldState, playerHuskCount },
  };
}

const SNAPSHOT_MIGRATIONS: SnapshotMigration[] = [
  normalizeInventoryItemLocations,
  preserveLegacyBadgeSwapProgress,
  migrateLegacyPlayerHusks,
];

export function applySnapshotMigrations(state: GameState): GameState {
  return SNAPSHOT_MIGRATIONS.reduce(
    (next, migration) => migration(next),
    state,
  );
}
