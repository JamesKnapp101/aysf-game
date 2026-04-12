import {
  PARK_EAST_POWER_KEY_TAKE_SNATCH_MESSAGE,
  shouldHijackParkEastPowerKeyTake,
  triggerParkEastPowerKeySnatch,
} from "@game/helpers/parkKeyHijack";
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
import {
  AQUARIUM_GOAL_ITEM_ID,
  triggerAquariumReturnChoke,
} from "src/world/Items/creatures/octopus";

export function tryTakeItem(state: GameState, noun: string): RuleResult {
  const lower = noun.toLowerCase();
  const nounWords = lower.split(/\s+/).filter(Boolean);
  const nounMatchesItem = (item: ReturnType<typeof getItemById>): boolean => {
    if (!item) return false;

    const named = (item.named?.(state) ?? item.name).toLowerCase();
    if (named === lower) return true;
    if (item.vocab.some((entry) => entry.toLowerCase() === lower)) return true;

    const nameTokens = new Set(named.split(/\s+/).filter(Boolean));
    if (nounWords.every((word) => nameTokens.has(word))) return true;

    const vocabTokens = new Set(
      item.vocab.map((entry) => entry.toLowerCase().trim()).filter(Boolean),
    );
    return nounWords.every((word) => vocabTokens.has(word));
  };

  if (
    nounWords.includes("key") &&
    shouldHijackParkEastPowerKeyTake(state, "PowerStationKey")
  ) {
    return {
      state: triggerParkEastPowerKeySnatch(state),
      message: PARK_EAST_POWER_KEY_TAKE_SNATCH_MESSAGE,
    };
  }

  const itemsHere = getItemsInCurrentRoom(state);
  const itemOnFloor = itemsHere.find((item) => nounMatchesItem(item));

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
      const msg = itemOnFloor.overrides?.take ?? "You can't take that.";
      return { state, message: msg };
    }
    if (
      itemOnFloor.itemCategory === "static" ||
      itemOnFloor.itemCategory === "animate"
    ) {
      const msg = itemOnFloor.overrides?.take ?? "You can't take that.";
      return {
        state,
        message: msg,
      };
    }

    let next = updateItemLocation(state, itemOnFloor.id, "INVENTORY");
    next = addToInventory(next, itemOnFloor.id);

    const scoreId = getItemById(next, itemOnFloor.id)?.scoreId ?? "";
    const aquariumGoalTaken = itemOnFloor.id === AQUARIUM_GOAL_ITEM_ID;
    if (aquariumGoalTaken) {
      next = triggerAquariumReturnChoke(next);
    }

    const aquariumGoalTail = aquariumGoalTaken
      ? "\n\nAs you wrench the control node free, the water outside the grotto convulses. A heavy tentacle surges through the lower trench and knots itself across the return run toward the lock."
      : "";

    if (scoreId !== "" && next.worldState.scoresTriggered[scoreId] !== true) {
      next = triggerScoreOnce(
        next,
        getItemById(next, itemOnFloor.id)?.scoreId,
      );
    }

    return { state: next, message: `Taken.${aquariumGoalTail}` };
  }

  const room = getCurrentRoom(state);
  const containersHere = state.world.items.filter(
    (i) =>
      i.isContainer &&
      ((state.itemState.itemRoomId[i.id] ?? i.location) === room.id ||
        inventoryHas(state.player.inventory, i.id)),
  );

  for (const container of containersHere) {
    const canReachInside =
      !(
        container.meta?.contentsAccessibleWhenClosed === false &&
        state.itemState.openItems?.[container.id] !== true
      ) && isItemOpen(state, container.id);
    if (!canReachInside) continue;

    const contentsItems = getContainerContentsItems(state, container);
    const found = contentsItems.find((item) => nounMatchesItem(item));

    if (!found) continue;

    if (found.itemCategory === "scenery" || found.itemCategory === "static") {
      const msg = found.overrides?.take ?? "You can't take that.";
      return { state, message: msg };
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

  for (const container of containersHere) {
    if (container.meta?.contentsAccessibleWhenClosed !== false) continue;

    const contentsItems = getContainerContentsItems(state, container);
    const found = contentsItems.find((item) => nounMatchesItem(item));
    if (!found) continue;

    return {
      state,
      message:
        container.meta?.contentsAccessMessage ??
        "You can see it, but you can't get at it from here.",
    };
  }

  return { state, message: "You don't see that here." };
}
