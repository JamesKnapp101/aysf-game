import { anyIn, movePlayerToRoom } from "../../helpers/gameHelpers";
import { useUIEffectsStore } from "../../store/store";
import { GameState } from "../../types/gameTypes";
import { Item } from "../../types/itemTypes";

export function tryStandItem(
  state: GameState,
  prep: string,
  item: Item,
): { state: GameState; message: string } {
  let next: GameState = state;
  if (prep === "on") {
    if (!item.isSurface) {
      return { state, message: "You can't stand on that." };
    }
    if (item.meta?.teleport) {
      let teleportMsg = "";
      const ringId = item.meta.teleport.ring;
      const section = item.meta.teleport
        .section as keyof typeof state.worldState.powerRestoredSections;
      const alwaysOn = item.meta.teleport.alwaysOn === true;
      const currentOrder = item.meta.teleport.order ?? 1;
      const disksInRing = state.world.items.filter(
        (it: Item) => it.meta?.teleport?.ring === ringId,
      );
      const nextDisk =
        disksInRing.find(
          (disk: Item) => disk.meta?.teleport?.order === currentOrder + 1,
        ) ?? disksInRing.find((disk: Item) => disk.meta?.teleport?.order === 1);

      const isPowered = alwaysOn || (section ? state.worldState.powerRestoredSections[section] : false);
      if (!isPowered) {
        return {
          state,
          message: "You stand on the disk, but nothing happens.",
        };
      }
      const required = item.meta?.teleport?.requires ?? [];
      const inventoryIds = [
        ...state.player.inventory.general,
        ...state.player.inventory.badges,
        ...state.player.inventory.keys,
      ];
      if (required.length > 0 && !anyIn(inventoryIds, required)) {
        return {
          state,
          message: `You stand on the disk and feel a tingle of energy at your scalp before a buzzer sounds, followed by a deep electronic voice.\n\n"Unauthorized."`,
        };
      }

      if (nextDisk?.location) {
        teleportMsg += `You stand on the disk and feel a tingle of energy at your scalp, which then travels down the length of your body before your vision warps. For just a second everything seems to turn inside out and then snaps back, only you are no longer standing where you used to be.`;
        next = movePlayerToRoom(next, nextDisk.location);
        useUIEffectsStore.getState().triggerTeleportFlash();

        return { state: next, message: teleportMsg };
      }
    }
  }

  const baseMsg = ``;

  return {
    state: next,
    message: baseMsg,
  };
}
