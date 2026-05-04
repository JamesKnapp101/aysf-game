import { removeItemFromPlacementLists } from "@game/helpers/itemPlacement";
import { removeFromAllBuckets } from "@game/rules/state";
import type { GameState } from "@game/types/gameTypes";
import type { ItemId } from "@game/types/ids";

export const GEL_ROUND_IDS = ["GelRound1", "GelRound2", "GelRound3"] as const;

export function isGelRoundId(itemId: string): boolean {
  return GEL_ROUND_IDS.includes(itemId as (typeof GEL_ROUND_IDS)[number]);
}

export function attachGelCameraToHost(
  state: GameState,
  gelRoundId: ItemId,
  hostId: ItemId,
): GameState {
  return {
    ...state,
    player: {
      ...state.player,
      inventory: removeFromAllBuckets(state.player.inventory, gelRoundId),
    },
    itemState: {
      ...state.itemState,
      activeGelCameras: {
        ...state.itemState.activeGelCameras,
        [gelRoundId]: true,
      },
      attachedTo: {
        ...state.itemState.attachedTo,
        [gelRoundId]: hostId,
      },
      containerContents: removeItemFromPlacementLists(
        state.itemState.containerContents,
        gelRoundId,
      ),
      surfaceContents: removeItemFromPlacementLists(
        state.itemState.surfaceContents,
        gelRoundId,
      ),
      underContents: removeItemFromPlacementLists(
        state.itemState.underContents,
        gelRoundId,
      ),
      searchableContents: removeItemFromPlacementLists(
        state.itemState.searchableContents,
        gelRoundId,
      ),
      itemRoomId: {
        ...state.itemState.itemRoomId,
        [gelRoundId]: hostId,
      },
    },
  };
}
