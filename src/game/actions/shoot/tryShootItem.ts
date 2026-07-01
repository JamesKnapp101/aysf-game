import { moveItemToRoom } from "@game/helpers/itemHelpers";
import {
  tryHandleRegisteredProjectileShot,
  tryHandleRegisteredShootBeforeAmmo,
} from "@game/registries/shootItemRegistry";
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

  const registeredBeforeAmmoResult = tryHandleRegisteredShootBeforeAmmo({
    state: next,
    shotAtItem,
    shotWithItem,
  });
  if (registeredBeforeAmmoResult) return registeredBeforeAmmoResult;

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

  const registeredProjectileResult = tryHandleRegisteredProjectileShot({
    state: next,
    shotAtItem,
    shotWithItem,
    firedRoundId: firedRoundId as ItemId,
    message: msg,
  });
  if (registeredProjectileResult) return registeredProjectileResult;

  msg += " The results of this action have not yet been implemented...";
  return {
    state: next,
    message: msg.endsWith(".") ? msg : msg + ".",
  };
}
