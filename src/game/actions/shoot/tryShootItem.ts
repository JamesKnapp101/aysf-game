import { moveItemToRoom } from "@game/helpers/itemHelpers";
import { isWornCatCollarTarget } from "@game/helpers/catHelpers";
import { startExperience } from "@game/experiences/experienceRegistry";
import { attachGelCameraToHost } from "@game/helpers/gelCameraHelpers";
import { useUIEffectsStore } from "@game/store/store";
import { GameState } from "@game/types/gameTypes";
import { ItemId } from "@game/types/ids";
import { Item } from "@game/types/itemTypes";

function isCorpseLikeItem(item: Item): boolean {
  if (item.meta?.corpse || item.meta?.isCorpse === true) return true;
  if (item.meta?.isAlive === true) return false;

  const corpseTerms = new Set([
    "body",
    "cadaver",
    "corpse",
    "remains",
    "skeleton",
  ]);

  if (item.vocab?.some((term) => corpseTerms.has(term.toLowerCase()))) {
    return true;
  }

  const name = item.name.toLowerCase();
  return [...corpseTerms].some((term) => name.includes(term));
}

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

    if (isCorpseLikeItem(shotAtItem)) {
      const corpseMeta = shotAtItem?.meta?.corpse;
      const hasIntactHead =
        corpseMeta?.hasIntactHead ?? shotAtItem?.meta?.hasIntactHead ?? true;
      const memoryExperienceId =
        corpseMeta?.memoryExperienceId ?? shotAtItem?.meta?.memoryExperienceId;

      if (!hasIntactHead || !memoryExperienceId) {
        return {
          state: next,
          message:
            "The scanner's hum thins into a flat diagnostic tone. There is not enough viable cerebral material to extract anything.",
        };
      }

      return startExperience(next, memoryExperienceId, {
        sourceId: shotAtItem.id,
      });
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
    const targetIsWornCatCollar = isWornCatCollarTarget(next, shotAtItem.id);
    const hostId = targetIsWornCatCollar ? "cat" : (shotAtItem.id as ItemId);

    next = attachGelCameraToHost(next, firedRoundId as ItemId, hostId);

    if (targetIsWornCatCollar) {
      msg += ` The sticky little projectile adheres to the cat's collar.`;
    } else if (hostId.toLowerCase() === "cat") {
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
