import { isRoomSpotlitByAviary } from "@game/engine/ticks/aviaryTick";
import { getAviaryNextSpotlitRoomId } from "src/world/Items/creatures/aviaryOrganisms";
import { isAnyFlashlightOn } from "./flashlightHelpers";
import type { GameState } from "../types/gameTypes";

export function canPlayerSeeInRoom(state: GameState, roomId: string): boolean {
  const room = state.world.rooms.find((r) => r.id === roomId);
  if (!room) return false;

  const isDark = Boolean(state.worldState.darkRooms[room.id]);

  const nightVisionActive = state.player.statusEffects.some(
    (se) => se.id === "nightvision-active",
  );

  const flashlightOn = isAnyFlashlightOn(state);

  return (
    !isDark ||
    nightVisionActive ||
    flashlightOn ||
    isRoomSpotlitByAviary(state, roomId) ||
    getAviaryNextSpotlitRoomId(state) === roomId
  );
}
