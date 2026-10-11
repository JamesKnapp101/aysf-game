import { getStatusEffectById } from "../selectors/statusSelectors";
import type { GameState } from "../types/gameTypes";

export const TEMP_MIN = 89;
export const TEMP_MAX = 110;
export type BrainWaveLevel = 1 | 2 | 3 | 4 | 5 | 6;
export const BRAIN_WAVE_LABELS: Record<BrainWaveLevel, string> = {
  1: "Normal", 2: "Excited", 3: "Slowed", 4: "Altered", 5: "???", 6: "Foreign",
};

export function clampDisplayedBodyTemperature(value: number): number {
  return Math.max(TEMP_MIN, Math.min(TEMP_MAX, value));
}

export function buildStatusReadings(state: GameState, mindFlashActive = false): string[] {
  const vitals = state.player.vitals;
  const brain = (mindFlashActive ? 6 : vitals.brainActivity ?? 1) as BrainWaveLevel;
  return [
    `Health: ${Math.round(vitals.health)}%`,
    `Oxygen: ${Math.round(vitals.oxygen)}%`,
    `Temperature: ${clampDisplayedBodyTemperature(vitals.temperature).toFixed(1)}°F`,
    `Radiation: ${(getStatusEffectById(state, "radiation")[0]?.intensity ?? 0).toFixed(0)} mSv`,
    `Brain waves: ${BRAIN_WAVE_LABELS[brain] ?? "???"}`,
  ];
}
