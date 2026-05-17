import {
  PARK_EAST_POWER_KEY_TAKE_SNATCH_MESSAGE,
  shouldHijackParkEastPowerKeyTake,
  triggerParkEastPowerKeySnatch,
} from "@game/helpers/parkKeyHijack";
import { getItemById } from "@game/helpers/itemHelpers";
import { applyRegisteredTakeItemEffects } from "@game/registries/takeItemEffectRegistry";
import { isItemOpen } from "@game/rules/containers";
import { updateItemLocation } from "@game/rules/items";
import { RuleResult } from "@game/rules/result";
import { triggerScoreOnce } from "@game/rules/score";
import { addToInventory, inventoryHas } from "@game/rules/state";
import {
  GAME_PRESERVE_PRIZE_ID,
  handleGamePreservePrizeTaken,
} from "@game/preserve/preserveTrophies";
import {
  getContainerContentsIds,
  getContainerContentsItems,
  getSurfaceItems,
} from "@game/selectors/containerSelectors";
import { getWaterSourcesInRoom } from "@game/selectors/itemSelectors";
import {
  getCurrentRoom,
  getItemsInCurrentRoom,
} from "@game/selectors/roomSelectors";
import { GameState } from "@game/types/gameTypes";
import type { Item } from "@game/types/itemTypes";

type TakeOverrideResult = RuleResult | string | undefined;

function getTakeOverrideResult(
  state: GameState,
  item: Item,
): TakeOverrideResult {
  const override = item.overrides?.take;

  if (typeof override === "function") {
    return override({ state, item });
  }

  return override;
}

function isRuleResult(value: TakeOverrideResult): value is RuleResult {
  return typeof value === "object" && value !== null && "state" in value;
}

function getBlockingTakeMessage(
  state: GameState,
  item: Item,
  fallback: string,
): RuleResult {
  const override = getTakeOverrideResult(state, item);

  if (isRuleResult(override)) {
    return override;
  }

  return { state, message: typeof override === "string" ? override : fallback };
}

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

  const room = getCurrentRoom(state);
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
      return getBlockingTakeMessage(state, itemOnFloor, "You can't take that.");
    }
    if (
      itemOnFloor.itemCategory === "static" ||
      itemOnFloor.itemCategory === "animate"
    ) {
      return getBlockingTakeMessage(state, itemOnFloor, "You can't take that.");
    }

    const takeOverride = getTakeOverrideResult(state, itemOnFloor);
    if (isRuleResult(takeOverride)) {
      return takeOverride;
    }

    let next = updateItemLocation(state, itemOnFloor.id, "INVENTORY");
    next = addToInventory(next, itemOnFloor.id);
    const takeEffects = applyRegisteredTakeItemEffects(next, itemOnFloor);
    next = takeEffects.state;

    const scoreId = getItemById(next, itemOnFloor.id)?.scoreId ?? "";

    if (scoreId !== "" && next.worldState.scoresTriggered[scoreId] !== true) {
      next = triggerScoreOnce(
        next,
        getItemById(next, itemOnFloor.id)?.scoreId,
      );
    }

    if (itemOnFloor.id === GAME_PRESERVE_PRIZE_ID) {
      return handleGamePreservePrizeTaken(next, state.player.roomId);
    }

    const takeMessage =
      typeof takeOverride === "string" ? takeOverride : "Taken.";

    return {
      state: next,
      message: `${takeMessage}${takeEffects.messageTail ?? ""}`,
    };
  }

  const surfacesHere = state.world.items.filter(
    (i) =>
      i.isSurface &&
      ((state.itemState.itemRoomId[i.id] ?? i.location) === room.id ||
        inventoryHas(state.player.inventory, i.id)),
  );

  for (const surface of surfacesHere) {
    const surfaceItems = getSurfaceItems(state, surface);
    const found = surfaceItems.find((item) => nounMatchesItem(item));
    if (!found) continue;

    if (found.itemCategory === "scenery" || found.itemCategory === "static") {
      return getBlockingTakeMessage(state, found, "You can't take that.");
    }

    const takeOverride = getTakeOverrideResult(state, found);
    if (isRuleResult(takeOverride)) {
      return takeOverride;
    }

    const updatedSurfaceIds = (
      state.itemState.surfaceContents[surface.id] ?? []
    ).filter((id) => id !== found.id);

    let next: GameState = {
      ...state,
      itemState: {
        ...state.itemState,
        surfaceContents: {
          ...state.itemState.surfaceContents,
          [surface.id]: updatedSurfaceIds,
        },
      },
    };

    next = updateItemLocation(next, found.id, "INVENTORY");
    next = addToInventory(next, found.id);
    next = triggerScoreOnce(next, getItemById(next, found.id)?.scoreId);

    if (found.id === GAME_PRESERVE_PRIZE_ID) {
      return handleGamePreservePrizeTaken(next, state.player.roomId);
    }

    return {
      state: next,
      message: typeof takeOverride === "string" ? takeOverride : "Taken.",
    };
  }

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
      return getBlockingTakeMessage(state, found, "You can't take that.");
    }

    const takeOverride = getTakeOverrideResult(state, found);
    if (isRuleResult(takeOverride)) {
      return takeOverride;
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

    return {
      state: next,
      message: typeof takeOverride === "string" ? takeOverride : "Taken.",
    };
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
