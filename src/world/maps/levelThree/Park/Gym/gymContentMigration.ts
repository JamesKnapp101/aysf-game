import { INITIAL_CONTAINER_CONTENTS } from "@game/containerContents";
import { updateItemLocation } from "@game/rules/items";
import { inventoryHas } from "@game/rules/state";
import type { GameState } from "@game/types/gameTypes";
import { gymExerciseBallItems } from "./gymExerciseBall";
import { gymAmenityItems } from "./gymAmenities";
import { gymSpinStageItems } from "./gymSpinStageItems";
import { gymTreadmillItems } from "./gymTreadmill";
import { gymWeightRoomItems } from "./gymWeightlifterPuzzle";

/** Refresh saved authored vocabulary, preserving item placement and puzzle progress. */
export function migrateGymContentSnapshot(state: GameState): GameState {
  if (!state.world.rooms.some(room => room.id === "Gym")) return state;
  const definitions = [
    ...gymExerciseBallItems.filter(item => item.id === "GymExerciseBallRack"),
    ...gymAmenityItems,
    ...gymSpinStageItems,
    ...gymTreadmillItems.filter(item => item.id === "GymGiantTreadmill"),
    ...gymWeightRoomItems.filter(item => !["RightSmartbell", "LeftSmartbell"].includes(item.id)),
  ];
  const authoredById = new Map(definitions.map(item => [item.id, item]));
  let next = {
    ...state,
    world: {
      ...state.world,
      items: state.world.items.map(item => {
        const authored = authoredById.get(item.id);
        return authored ? { ...item, ...authored, location: item.location } : item;
      }),
    },
  };
  // Older saves predate the tote. An existing (even emptied) contents entry wins.
  if (!Object.hasOwn(next.itemState.containerContents, "DuffelBag")) {
    const contents = INITIAL_CONTAINER_CONTENTS.DuffelBag.filter(id => {
      const location = next.itemState.itemRoomId[id];
      return !inventoryHas(next.player.inventory, id) &&
        (!location || location === "seeded" || location === "DuffelBag");
    });
    for (const id of contents) next = updateItemLocation(next, id, "DuffelBag");
    next = {
      ...next,
      itemState: {
        ...next.itemState,
        containerContents: { ...next.itemState.containerContents, DuffelBag: contents },
      },
    };
  }
  return next;
}
