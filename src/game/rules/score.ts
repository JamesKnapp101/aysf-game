import { GameState } from "@game/types/gameTypes";

export function triggerScoreOnce(
  state: GameState,
  scoreId?: keyof NonNullable<GameState["worldState"]["scoresTriggered"]>
): GameState {
  if (!scoreId) return state;

  const already = state.worldState.scoresTriggered?.[scoreId] === true;
  if (already) return state;

  return {
    ...state,
    worldState: {
      ...state.worldState,
      scoresTriggered: {
        ...(state.worldState.scoresTriggered ?? {}),
        [scoreId]: true,
      },
    },
  };
}

export function triggerMemoryOnce(
  state: GameState,
  memoryId?: keyof NonNullable<GameState["player"]["memoriesTriggered"]>
): GameState {
  if (!memoryId) return state;

  const already = state.player.memoriesTriggered?.[memoryId] === true;
  if (already) return state;

  return {
    ...state,
    player: {
      ...state.player,
      memoriesTriggered: {
        ...(state.player.memoriesTriggered ?? {}),
        [memoryId]: true,
      },
    },
  };
}
