import type { GameState } from "../types/gameTypes";
import type { CoolerMode } from "../types/itemTypes";

export function getCoolerMode(state: GameState): CoolerMode {
  const setting = state.itemState.itemSettings["Cooler"];
  if (setting?.kind === "cooler") {
    return setting.mode;
  }
  return "off"; // default
}
