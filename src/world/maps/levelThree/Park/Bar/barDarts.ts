import { updateItemLocation } from "@game/rules/items";
import { triggerScoreOnce } from "@game/rules/score";
import { inventoryHas, removeFromAllBuckets } from "@game/rules/state";
import type { GameState } from "@game/types/gameTypes";

const BAR_DARTBOARD_ITEM_ID = "BarDartboard";
const BAR_DART_ITEM_ID = "Dart";
const BAR_RETURNED_DART_SCORE_ID = "returned_red_dart";

const BAR_DART_HIT_MESSAGES = [
  "Bullseye!",
  "The dart lands in the outer ring with a neat little thunk.",
  "The dart wobbles into the twenty, which feels pretty official.",
  "The dart clips the wire and sticks at an awkward angle.",
  "The dart buries itself just outside the bullseye.",
  "The dart hits low, but it sticks. That counts for something.",
];

function removeItemFromSurface(
  state: GameState,
  surfaceId: string,
  itemId: string,
): GameState {
  const current = state.itemState.surfaceContents?.[surfaceId] ?? [];

  return {
    ...state,
    itemState: {
      ...state.itemState,
      surfaceContents: {
        ...state.itemState.surfaceContents,
        [surfaceId]: current.filter((candidate) => candidate !== itemId),
      },
    },
  };
}

export function barDartboardHasDart(state: GameState): boolean {
  return (
    state.itemState.surfaceContents[BAR_DARTBOARD_ITEM_ID]?.includes(
      BAR_DART_ITEM_ID,
    ) === true
  );
}

export function throwDartAtBarDartboard(state: GameState): {
  state: GameState;
  message: string;
} {
  if (state.player.roomId !== "Bar") {
    return { state, message: "You don't see a dartboard here." };
  }

  if (!inventoryHas(state.player.inventory, BAR_DART_ITEM_ID)) {
    return { state, message: "You need to be holding the dart first." };
  }

  const currentDarts =
    state.itemState.surfaceContents[BAR_DARTBOARD_ITEM_ID] ?? [];
  if (currentDarts.includes(BAR_DART_ITEM_ID)) {
    return {
      state,
      message: "The dart is already stuck in the dartboard.",
    };
  }

  const idx = Math.floor(state.rng() * BAR_DART_HIT_MESSAGES.length);
  const hitMessage =
    BAR_DART_HIT_MESSAGES[
      Math.max(0, Math.min(BAR_DART_HIT_MESSAGES.length - 1, idx))
    ];

  let next: GameState = {
    ...state,
    player: {
      ...state.player,
      inventory: removeFromAllBuckets(state.player.inventory, BAR_DART_ITEM_ID),
    },
    itemState: {
      ...state.itemState,
      surfaceContents: {
        ...state.itemState.surfaceContents,
        [BAR_DARTBOARD_ITEM_ID]: [...currentDarts, BAR_DART_ITEM_ID],
      },
    },
  };
  next = updateItemLocation(next, BAR_DART_ITEM_ID, "Bar");

  return {
    state: next,
    message: `You throw the dart at the dartboard. ${hitMessage}`,
  };
}

export function giveDartToBarBartender(state: GameState): {
  state: GameState;
  message: string;
} {
  if (state.player.roomId !== "Bar") {
    return { state, message: "The bartender isn't here." };
  }

  if (!inventoryHas(state.player.inventory, BAR_DART_ITEM_ID)) {
    return { state, message: "You need to be holding the dart first." };
  }

  let next: GameState = {
    ...state,
    player: {
      ...state.player,
      inventory: removeFromAllBuckets(state.player.inventory, BAR_DART_ITEM_ID),
    },
  };

  next = removeItemFromSurface(next, BAR_DARTBOARD_ITEM_ID, BAR_DART_ITEM_ID);
  next = updateItemLocation(next, BAR_DART_ITEM_ID, "Bar");
  next = triggerScoreOnce(next, BAR_RETURNED_DART_SCORE_ID);

  return {
    state: next,
    message: `"Hey, you found one of the darts! That's great!"`,
  };
}
