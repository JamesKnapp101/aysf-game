import { getItemById } from "@game/helpers/itemHelpers";
import { applyRegisteredTakeItemEffects } from "@game/registries/takeItemEffectRegistry";
import { updateItemLocation } from "@game/rules/items";
import { RuleResult } from "@game/rules/result";
import { triggerScoreOnce } from "@game/rules/score";
import { addToInventory } from "@game/rules/state";
import {
  getContainerContentsIds,
  getContainerContentsItems,
  getSurfaceItems,
} from "@game/selectors/containerSelectors";
import { getWaterSourcesInRoom } from "@game/selectors/itemSelectors";
import { getItemsInCurrentRoom } from "@game/selectors/roomSelectors";
import { GameState } from "@game/types/gameTypes";
import type { Item } from "@game/types/itemTypes";
import { canReachContainerContents, getTakeHolders } from "./takeScope";

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

// An exact target lets bulk TAKE avoid ambiguous names without changing noun resolution.
export function tryTakeItem(
  state: GameState,
  noun: string | { itemId: string },
): RuleResult {
  const lower = typeof noun === "string" ? noun.toLowerCase() : "";
  const nounWords = lower.split(/\s+/).filter(Boolean);
  const nounMatchesItem = (item: ReturnType<typeof getItemById>): boolean => {
    if (!item) return false;
    if (typeof noun !== "string") return item.id === noun.itemId;

    const named = (item.named?.(state, item) ?? item.name).toLowerCase();
    if (named === lower) return true;
    if (item.vocab.some((entry) => entry.toLowerCase() === lower)) return true;

    const nameTokens = new Set(named.split(/\s+/).filter(Boolean));
    if (nounWords.every((word) => nameTokens.has(word))) return true;

    const vocabTokens = new Set(
      item.vocab.map((entry) => entry.toLowerCase().trim()).filter(Boolean),
    );
    return nounWords.every((word) => vocabTokens.has(word));
  };

  const itemsHere = getItemsInCurrentRoom(state);
  const itemOnFloor = itemsHere.find((item) => nounMatchesItem(item));

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
    const takeEffects = applyRegisteredTakeItemEffects(next, itemOnFloor, {
      fromRoomId: state.player.roomId,
    });
    next = takeEffects.state;

    const scoreId = getItemById(next, itemOnFloor.id)?.scoreId ?? "";

    if (scoreId !== "" && next.worldState.scoresTriggered[scoreId] !== true) {
      next = triggerScoreOnce(
        next,
        getItemById(next, itemOnFloor.id)?.scoreId,
      );
    }

    const takeMessage =
      typeof takeOverride === "string" ? takeOverride : "Taken.";

    if (takeEffects.message) {
      return {
        state: next,
        message: takeEffects.message,
      };
    }

    return {
      state: next,
      message: `${takeMessage}${takeEffects.messageTail ?? ""}`,
    };
  }

  const surfacesHere = getTakeHolders(state, "isSurface");

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

    const takeEffects = applyRegisteredTakeItemEffects(next, found, {
      fromRoomId: state.player.roomId,
    });
    next = takeEffects.state;

    if (takeEffects.message) {
      return {
        state: next,
        message: takeEffects.message,
      };
    }

    return {
      state: next,
      message: `${typeof takeOverride === "string" ? takeOverride : "Taken."}${takeEffects.messageTail ?? ""}`,
    };
  }

  const containersHere = getTakeHolders(state, "isContainer");

  for (const container of containersHere) {
    if (!canReachContainerContents(state, container)) continue;

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

    const takeEffects = applyRegisteredTakeItemEffects(next, found, {
      fromRoomId: state.player.roomId,
    });
    next = takeEffects.state;

    if (takeEffects.message) {
      return {
        state: next,
        message: takeEffects.message,
      };
    }

    return {
      state: next,
      message: `${typeof takeOverride === "string" ? takeOverride : "Taken."}${takeEffects.messageTail ?? ""}`,
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
