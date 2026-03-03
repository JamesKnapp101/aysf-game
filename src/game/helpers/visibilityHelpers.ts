import { isRoomSpotlitByAviary } from "@game/engine/ticks/aviaryTick";
import { inventoryHas } from "@game/rules/state";
import { getAviaryNextSpotlitRoomId } from "src/world/Items/creatures/aviaryOrganisms";
import type { GameState } from "../types/gameTypes";

export function canPlayerSeeInRoom(state: GameState, roomId: string): boolean {
  const room = state.world.rooms.find((r) => r.id === roomId);
  if (!room) return false;

  const isDark = Boolean(state.worldState.darkRooms[room.id]);

  const nightVisionActive = state.player.statusEffects.some(
    (se) => se.id === "nightvision-active",
  );

  const flashlightOn = (() => {
    if (!inventoryHas(state.player.inventory, "flashlight")) return false;
    const fs = state.itemState.itemSettings["flashlight"];
    return Boolean(fs && "isOn" in fs && fs.isOn === true);
  })();

  const damagedFlashlightOn = (() => {
    if (!inventoryHas(state.player.inventory, "damagedFlashlight"))
      return false;
    const fs = state.itemState.itemSettings["damagedFlashlight"];
    return Boolean(
      fs &&
        "isOn" in fs &&
        fs.isOn === true &&
        state.worldState.damagedFlashlight.currentCharge > 1,
    );
  })();

  return (
    !isDark ||
    nightVisionActive ||
    flashlightOn ||
    damagedFlashlightOn ||
    isRoomSpotlitByAviary(state, roomId) ||
    getAviaryNextSpotlitRoomId(state) === roomId
  );
}
