import { anyIn, movePlayerToRoom } from "../../helpers/gameHelpers";
import { prepareRoomForTravel } from "../../helpers/roomChunkTravel";
import { updateItemLocation } from "../../rules/items";
import { useUIEffectsStore } from "../../store/store";
import type { ActionResult } from "../../types/actionsTypes";
import { GameState } from "../../types/gameTypes";
import { Item } from "../../types/itemTypes";
import type { ParsedCommand } from "../../types/parserTypes";

export async function tryStandItem(
  state: GameState,
  prep: string,
  item: Item,
  cmd?: ParsedCommand,
): Promise<ActionResult> {
  let next: GameState = state;
  if (prep === "on") {
    if (!item.isSurface) {
      return { state, message: "You can't stand on that." };
    }
    const standOverride = item.overrides?.stand;
    if (typeof standOverride === "string") {
      return { state, message: standOverride };
    }
    if (typeof standOverride === "function" && cmd?.type === "action") {
      const out = standOverride({ state, item, cmd });
      if (typeof out === "string") {
        return { state, message: out };
      }

      return {
        state: out?.state ?? state,
        message: out?.message ?? "Nothing happens.",
      };
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
        const destination = await prepareRoomForTravel(next, nextDisk.location);
        if (!destination.roomExists) {
          return {
            state,
            message: "You stand on the disk, but nothing happens.",
          };
        }

        next = destination.state;
        if (destination.roomId !== nextDisk.location) {
          next = updateItemLocation(next, nextDisk.id, destination.roomId);
        }

        teleportMsg += `You stand on the disk and feel a tingle of energy at your scalp, which then travels down the length of your body before your vision warps. For just a second everything seems to turn inside out and then snaps back, only you are no longer standing where you used to be.`;
        next = movePlayerToRoom(next, destination.roomId);
        useUIEffectsStore.getState().triggerTeleportFlash();

        return { state: next, message: teleportMsg };
      }

      return {
        state,
        message: "You stand on the disk, but nothing happens.",
      };
    }
  }

  const baseMsg = ``;

  return {
    state: next,
    message: baseMsg,
  };
}
