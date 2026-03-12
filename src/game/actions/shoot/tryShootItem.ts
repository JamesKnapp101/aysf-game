import { moveItemToRoom } from "@game/helpers/itemHelpers";
import { removeFromAllBuckets } from "@game/rules/state";
import { useUIEffectsStore } from "@game/store/store";
import { GameState } from "@game/types/gameTypes";
import { ItemId } from "@game/types/ids";
import { Item } from "@game/types/itemTypes";

export function tryShootItem(
  state: GameState,
  shotAtItem: Item,
  shotWithItem: Item,
): { state: GameState; message: string } {
  let next = state;

  if (!shotWithItem.isShootable) {
    return {
      state: next,
      message: `The ${shotWithItem.name} isn't something you can shoot at things with.`,
    };
  }

  if (shotWithItem.id === "MindGun") {
    // The mind gun is a special case that overrides the others; it doesn't take ammo, or fire projectiles
    let next = state;

    if (next.itemState.wornByPlayer.head !== "MindCap") {
      return { state: next, message: shotWithItem?.meta?.onShootNoCap };
    }

    if (!shotAtItem?.meta?.isAlive) {
      return { state: next, message: shotWithItem?.meta?.onShootWithCap };
    }

    const targetMemories = shotAtItem?.meta?.memories;

    if (!targetMemories) {
      return {
        state: next,
        message: `${shotAtItem?.meta?.onShootWithCap} You feel dizzy for a moment, but nothing else happens.`,
      };
    }

    const msg = shotWithItem?.meta?.onLink ?? "Nothing happens.";

    useUIEffectsStore.getState().playMindFlash({
      memory:
        targetMemories[next.itemState.mindGunMemoryIndex?.[shotAtItem.id]],
      seed: Date.now(),
    });

    const prevIndex = next.itemState.mindGunMemoryIndex?.[shotAtItem.id] ?? -1;
    const newIndex = prevIndex + 1;

    next = {
      ...next,
      itemState: {
        ...next.itemState,
        mindGunMemoryIndex: {
          ...next.itemState.mindGunMemoryIndex,
          [shotAtItem.id]: newIndex,
        },
      },
    };

    return { state: next, message: msg };
  }

  const currentContents =
    next.itemState.containerContents[shotWithItem.id] ?? [];
  if (currentContents.length === 0) {
    return { state: next, message: `*Click*` };
  }

  const [firedRoundId, ...remaining] = currentContents;
  if (!firedRoundId) {
    return { state: next, message: `*Click*` };
  }

  let msg = shotWithItem?.meta?.onShoot ?? `You fire the ${shotWithItem.name}!`;

  next = {
    ...next,
    itemState: {
      ...next.itemState,
      containerContents: {
        ...next.itemState.containerContents,
        [shotWithItem.id]: remaining,
      },
    },
  };

  const targetRoomId =
    next.itemState.itemRoomId[shotAtItem.id] ?? next.player.roomId;

  next = moveItemToRoom(next, firedRoundId as ItemId, targetRoomId);

  if (shotWithItem.id === "CameraGun") {
    const hostId = shotAtItem.id as ItemId;

    // Bind the fired round to the host
    // IMPORTANT: inventory is now bucketed; remove the fired round from ALL buckets.
    const nextInventory = removeFromAllBuckets(
      next.player.inventory,
      firedRoundId,
    );

    next = {
      ...next,
      player: {
        ...next.player,
        inventory: nextInventory,
      },
      itemState: {
        ...next.itemState,
        attachedTo: {
          ...next.itemState.attachedTo,
          [firedRoundId as ItemId]: hostId,
        },
        itemRoomId: {
          ...next.itemState.itemRoomId,
          [firedRoundId]: hostId,
        },
      },
    };

    if (hostId.toLowerCase() === "cat") {
      msg += ` The cat looks momentarily startled as the sticky little projectile adheres to its fur.`;
    } else {
      msg += ` The sticky little projectile adheres to the ${shotAtItem.name}.`;
    }

    return {
      state: next,
      message: msg.endsWith(".") ? msg : msg + ".",
    };
  }

  msg += " The results of this action have not yet been implemented...";
  return {
    state: next,
    message: msg.endsWith(".") ? msg : msg + ".",
  };
}
