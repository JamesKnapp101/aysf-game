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
