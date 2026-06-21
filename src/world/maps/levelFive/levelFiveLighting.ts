import { isAnyFlashlightOn } from "@game/helpers/flashlightHelpers";
import type { GameState } from "@game/types/gameTypes";
import type { AmbientRoomLightLevel } from "@game/types/roomTypes";

export function resolveLevelFiveSpillLight(
  state: GameState,
  lightsOutLevel: Exclude<AmbientRoomLightLevel, "normal">,
): AmbientRoomLightLevel {
  const levelLightsOn =
    state.worldState.powerRestoredSections["lights-level-five"] === true;

  return levelLightsOn || isAnyFlashlightOn(state)
    ? "normal"
    : lightsOutLevel;
}
