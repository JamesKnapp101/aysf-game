import type { GameState } from "../types/gameTypes";
import type { CoolerMode } from "../types/itemTypes";

export function getCoolerMode(state: GameState): CoolerMode {
  const setting = state.itemState.itemSettings["Cooler"];
  if (setting?.kind === "cooler") {
    return setting.mode;
  }
  return "off"; // default
}

export function getCameraGunCurrentIndex(state: GameState): number {
  const setting = state.itemState.itemSettings["CameraGun"];
  if (setting?.kind === "camera-gun-viewer") {
    return setting.currentViewIndex;
  }
  return 0; // default
}
