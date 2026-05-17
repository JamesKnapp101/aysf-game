import { startExperience } from "@game/experiences/experienceRegistry";
import type { GameState } from "@game/types/gameTypes";
import type { Item } from "@game/types/itemTypes";

export const BAR_VISION_QUEST_EXPERIENCE_ID = "vision_quest";
export const BAR_VISION_QUEST_TRIGGER = "BarVisionQuestTriggered";
export const BAR_VISION_QUEST_DRINK_SEQUENCE = [
  "BarBangaloreSling",
  "BarWhiskeySweet",
  "BarHandStuffOnTheBeach",
  "BarGinFizz",
  "BarDurianColada",
  "BarFischermeisterShot",
] as const;

const BAR_VISION_QUEST_DRINK_LIMIT = BAR_VISION_QUEST_DRINK_SEQUENCE.length;

function doesRecentDrinkSequenceMatch(recentDrinkItemIds: readonly string[]) {
  if (recentDrinkItemIds.length !== BAR_VISION_QUEST_DRINK_LIMIT) {
    return false;
  }

  return BAR_VISION_QUEST_DRINK_SEQUENCE.every(
    (drinkId, index) => recentDrinkItemIds[index] === drinkId,
  );
}

function markVisionQuestTriggered(state: GameState): GameState {
  return {
    ...state,
    worldState: {
      ...state.worldState,
      conditionalTriggers: {
        ...state.worldState.conditionalTriggers,
        [BAR_VISION_QUEST_TRIGGER]: true,
      },
    },
  };
}

function clearDrunkStatus(state: GameState): GameState {
  if (!state.player.statusEffects.some((effect) => effect.id === "drunk")) {
    return state;
  }

  return {
    ...state,
    player: {
      ...state.player,
      statusEffects: state.player.statusEffects.filter(
        (effect) => effect.id !== "drunk",
      ),
      vitals: {
        ...state.player.vitals,
        brainActivity:
          state.player.vitals.brainActivity === 3
            ? 1
            : state.player.vitals.brainActivity,
        drunkenness: 0,
      },
    },
  };
}

export function recordConsumedDrinkAndMaybeStartVisionQuest(
  state: GameState,
  item: Item,
): { message?: string; state: GameState } {
  if (item.meta?.consumable?.kind !== "drink") {
    return { state };
  }

  const recentDrinkItemIds = [
    ...(state.player.recentDrinkItemIds ?? []),
    item.id,
  ].slice(-BAR_VISION_QUEST_DRINK_LIMIT);

  let next: GameState = {
    ...state,
    player: {
      ...state.player,
      recentDrinkItemIds,
    },
  };

  if (
    state.worldState.conditionalTriggers?.[BAR_VISION_QUEST_TRIGGER] ||
    state.worldState.activeExperience ||
    !doesRecentDrinkSequenceMatch(recentDrinkItemIds)
  ) {
    return { state: next };
  }

  next = markVisionQuestTriggered(next);
  next = clearDrunkStatus(next);
  return startExperience(next, BAR_VISION_QUEST_EXPERIENCE_ID, {
    sourceId: item.id,
  });
}
