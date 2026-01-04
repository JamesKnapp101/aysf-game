import { GameState } from "@game/types/gameTypes";
import { playerMemoryMap, playerScoreMap } from "../constants";

export function getCurrentScore(state: GameState): number {
  let total = 0;

  for (const key of Object.keys(
    playerScoreMap
  ) as (keyof typeof playerScoreMap)[]) {
    if (state.worldState.scoresTriggered?.[key]) {
      total += playerScoreMap[key].value;
    }
  }

  return total;
}

export function getCurrentMemory(state: GameState): number {
  let total = 0;

  for (const key of Object.keys(
    playerMemoryMap
  ) as (keyof typeof playerMemoryMap)[]) {
    if (state.player.memoriesTriggered?.[key]) {
      total += playerMemoryMap[key].value;
    }
  }

  return total;
}
