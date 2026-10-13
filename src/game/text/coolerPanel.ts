import type { CoolerMode } from "../types/itemTypes";

export const COOLER_MODES: CoolerMode[] = ["off", "cool", "cold", "freeze"];

export function coolerModeTemperature(mode: CoolerMode): number {
  return { off: 70, cool: 55, cold: 40, freeze: 0 }[mode];
}
