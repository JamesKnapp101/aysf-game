import { tryShootItem } from "@game/actions/shoot/tryShootItem";
import { isGelRoundId } from "@game/helpers/gelCameraHelpers";
import { resolveDoorDestination } from "@game/rules/doors";
import { resolveItemByVocabulary } from "@game/rules/scope";
import { inventoryHas } from "@game/rules/state";
import { getDoorById } from "@game/selectors/doorSelectors";
import type { ActionResult } from "@game/types/actionsTypes";
import type { ItemCommandOverrideContext } from "@game/types/itemTypes";

export function shootCameraThroughHydroponicsGap({
  state, item, cmd,
}: ItemCommandOverrideContext): ActionResult {
  const door = getDoorById(state, "HydroponicsDoor");
  const roomId = door && resolveDoorDestination(door, state.player.roomId);
  if (!door || state.player.roomId !== door.connects.roomAId ||
      (state.itemState.itemRoomId[item.id] ?? item.location) !== state.player.roomId ||
      !roomId || !state.world.rooms.some(room => room.id === roomId)) {
    return { state, message: "You can't shoot through that." };
  }

  const gun = state.world.items.find(candidate => candidate.id === "CameraGun");
  const noun = cmd.direct?.trim().replace(/^(?:the|a|an)\s+/i, "");
  if (noun && noun !== "camera" && (!gun || !resolveItemByVocabulary([gun], noun))) {
    return { state, message: "That doesn't make any sense." };
  }
  if (!gun || !inventoryHas(state.player.inventory, gun.id)) {
    return { state, message: "There's nothing to shoot." };
  }

  const roundId = state.itemState.containerContents[gun.id]?.[0];
  // Loading already enforces the allowed ammunition. Never redeploy an active
  // camera or turn a stale/invalid placement into a free projectile.
  if (roundId && (!isGelRoundId(roundId) ||
      !state.world.items.some(candidate => candidate.id === roundId) ||
      state.itemState.itemRoomId[roundId] !== gun.id ||
      state.itemState.activeGelCameras[roundId])) {
    return { state, message: "*Click*" };
  }

  return tryShootItem(state, item, gun, {
    roomId,
    message: "The camera projectile slips through the narrow gap. You hear it strike something inside, followed by a faint clatter as it comes to rest. Something large shifts in the darkness beyond.",
  });
}
