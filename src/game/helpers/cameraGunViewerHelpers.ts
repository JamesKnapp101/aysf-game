import { buildRoomDescription } from "@game/text/roomDescription";
import type { GameState } from "@game/types/gameTypes";

export function getCameraFeedDescription(
  state: GameState,
  roomId: string | undefined,
): string {
  const room = roomId
    ? state.world.rooms.find((candidate) => candidate.id === roomId)
    : undefined;
  if (!room || !roomId) return "NO SIGNAL.\n\nThe viewer shows only static.";

  const cameraState = {
    ...state,
    worldState: {
      ...state.worldState,
      darkRooms: {
        ...state.worldState.darkRooms,
        [roomId]: false,
      },
    },
  };

  return (
    buildRoomDescription(cameraState, roomId, {
      mode: "panel",
      forceFull: true,
    }).trim() || (room.name ?? "NO SIGNAL.").toString()
  );
}

function isRoomId(state: GameState, id: string | undefined): id is string {
  return Boolean(id && state.world.rooms.some((room) => room.id === id));
}

export function resolveCameraRoomId(
  state: GameState,
  itemId: string | undefined,
  seen = new Set<string>(),
): string | undefined {
  if (!itemId || seen.has(itemId)) return undefined;
  seen.add(itemId);

  if (itemId === "PLAYER" || itemId === "INVENTORY") {
    return state.player.roomId;
  }

  const attachedHostId = state.itemState.attachedTo[itemId];
  if (attachedHostId) {
    return resolveCameraRoomId(state, attachedHostId, seen);
  }

  const liveLocation = state.itemState.itemRoomId[itemId];
  if (isRoomId(state, liveLocation)) return liveLocation;
  if (liveLocation) return resolveCameraRoomId(state, liveLocation, seen);

  const seedLocation = state.world.items.find(item => item.id === itemId)?.location;
  if (isRoomId(state, seedLocation)) return seedLocation;
  if (seedLocation) return resolveCameraRoomId(state, seedLocation, seen);

  return undefined;
}

/** The browser sorts active flags and wraps its mounted index, even for stale cameras. */
export function cameraGunViewer(state: GameState, currentView: number) {
  const activeCameraIds = Object.keys(state.itemState.activeGelCameras ?? {})
    .filter(id => Boolean(state.itemState.activeGelCameras[id]))
    .sort((a, b) => a.localeCompare(b));
  const index = ((currentView % activeCameraIds.length) + activeCameraIds.length) % activeCameraIds.length;
  const selectedCameraId = activeCameraIds[index] ?? null;
  const item = state.world.items.find(item => item.id === selectedCameraId);
  const roomId = resolveCameraRoomId(state, item?.id);
  const room = state.world.rooms.find(room => room.id === roomId);
  const roomName = (room?.name ?? "UNKNOWN LOCATION").toString().toUpperCase();
  return {
    selectedCameraId,
    statusLine: selectedCameraId ? `CAM: ${selectedCameraId}  \u2022  ${roomName}` : "NO SIGNAL",
    description: getCameraFeedDescription(state, roomId),
    canView: activeCameraIds.length > 0,
  };
}
