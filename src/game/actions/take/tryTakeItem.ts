import { playerScoreMap } from "@game/constants";
import { getItemById } from "@game/helpers/itemHelpers";
import { isItemOpen } from "@game/rules/containers";
import { updateItemLocation } from "@game/rules/items";
import { RuleResult } from "@game/rules/result";
import { triggerScoreOnce } from "@game/rules/score";
import { addToInventory, inventoryHas } from "@game/rules/state";
import {
  getContainerContentsIds,
  getContainerContentsItems,
} from "@game/selectors/containerSelectors";
import { getWaterSourcesInRoom } from "@game/selectors/itemSelectors";
import {
  getCurrentRoom,
  getItemsInCurrentRoom,
} from "@game/selectors/roomSelectors";
import { GameState } from "@game/types/gameTypes";

export function tryTakeItem(
  state: GameState,
  noun: string,
  indirect: string,
): RuleResult {
  const lower = noun.toLowerCase();
  const itemsHere = getItemsInCurrentRoom(state);
  const itemOnFloor = itemsHere.find(
    (i) =>
      i.vocab.includes(lower) ||
      (i.named?.(state) ?? i.name.toLowerCase()) === lower,
  );

  if (itemOnFloor?.id === "PowerStationKey") {
    if (
      state.itemState.containerContents["PowerStationKeyhole"]?.includes(
        "PowerStationKey",
      ) &&
      state.worldState.powerRestoredSections["power-key-turned"]
    ) {
      return {
        state,
        message:
          "The key appears to be locked in place now, you can't pull it free again.",
      };
    }
  }

  if (noun === "water") {
    const waterSourcesInRoom = getWaterSourcesInRoom(state);
    if (waterSourcesInRoom.length === 0) {
      return { state, message: "There isn't any good source of water here." };
    }
    return {
      state,
      message: `You can't just scoop it up with your hands, you'll need to find something to fill with it.`,
    };
  }

  if (itemOnFloor) {
    if (itemOnFloor.itemCategory === "scenery") {
      return { state, message: "You can’t take that." };
    }
    if (
      itemOnFloor.itemCategory === "static" ||
      itemOnFloor.itemCategory === "animate"
    ) {
      return {
        state,
        message: itemOnFloor.meta?.onTake ?? "You can’t take that.",
      };
    }

    let next = updateItemLocation(state, itemOnFloor.id, "INVENTORY");
    next = addToInventory(next, itemOnFloor.id);

    const scoreId = getItemById(next, itemOnFloor.id)?.scoreId ?? "";
    if (scoreId === "") {
      return { state: next, message: "Taken." };
    } else {
      let msg = `Taken.`;
      if (next.worldState.scoresTriggered[scoreId] !== true) {
        next = triggerScoreOnce(
          next,
          getItemById(next, itemOnFloor.id)?.scoreId,
        );
        msg += `\n\nYour score has just went up by ${
          playerScoreMap[scoreId]?.value ?? 0
        } points!`;
      }
      return { state: next, message: msg };
    }
  }

  const room = getCurrentRoom(state);
  const containersHere = state.world.items.filter(
    (i) =>
      i.isContainer &&
      (i.location === room.id || inventoryHas(state.player.inventory, i.id)),
  );

  for (const container of containersHere) {
    if (!isItemOpen(state, container.id)) continue;

    const contentsItems = getContainerContentsItems(state, container);
    const found = contentsItems.find(
      (i) =>
        i.vocab.includes(lower) ||
        (i.named?.(state) ?? i.name.toLowerCase()) === lower,
    );

    if (!found) continue;

    if (found.itemCategory === "scenery" || found.itemCategory === "static") {
      return { state, message: "You can’t take that." };
    }

    const seededIds = getContainerContentsIds(state, container);
    const updatedContentsIds = seededIds.filter((id) => id !== found.id);

    let next = updateItemLocation(state, found.id, "INVENTORY");
    next = addToInventory(next, found.id);
    next = triggerScoreOnce(next, getItemById(next, found.id)?.scoreId);
    next = {
      ...next,
      itemState: {
        ...next.itemState,
        containerContents: {
          ...next.itemState.containerContents,
          [container.id]: updatedContentsIds,
        },
      },
    };

    return { state: next, message: "Taken." };
  }
  return { state, message: "You don't see that here." };
}
