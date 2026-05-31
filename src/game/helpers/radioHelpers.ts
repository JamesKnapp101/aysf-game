import type { GameState } from "@game/types/gameTypes";

export const DEFAULT_RADIO_FREQUENCY = 146.52;
export const RADIO_FREQUENCY_MIN = 136;
export const RADIO_FREQUENCY_MAX = 174;
export const RADIO_FREQUENCY_STEP = 0.005;

export function clampRadioFrequency(frequency: number): number {
  if (!Number.isFinite(frequency)) return DEFAULT_RADIO_FREQUENCY;

  const stepped =
    Math.round(frequency / RADIO_FREQUENCY_STEP) * RADIO_FREQUENCY_STEP;
  const clamped = Math.max(
    RADIO_FREQUENCY_MIN,
    Math.min(RADIO_FREQUENCY_MAX, stepped),
  );

  return Number(clamped.toFixed(3));
}

export function getCurrentRadioFrequency(state: GameState): number {
  return clampRadioFrequency(
    state.radio?.currentFrequency ?? DEFAULT_RADIO_FREQUENCY,
  );
}

export function formatRadioFrequency(frequency: number): string {
  return `${clampRadioFrequency(frequency).toFixed(3)} MHz`;
}

export function getCurrentRadioFrequencyDisplay(state: GameState): string {
  return formatRadioFrequency(getCurrentRadioFrequency(state));
}

export function setRadioFrequency(
  state: GameState,
  frequency: number,
): GameState {
  return {
    ...state,
    radio: {
      ...(state.radio ?? {}),
      currentFrequency: clampRadioFrequency(frequency),
    },
  };
}
