import { isRoomSpotlitByAviary } from "@game/engine/ticks/aviaryTick";
import type { GameState } from "@game/types/gameTypes";
import { getAviaryNextSpotlitRoomId } from "src/world/zoneRegistrations";

type RoomLightRule = (state: GameState, roomId: string) => boolean;

const ROOM_LIGHT_RULES: RoomLightRule[] = [
  (state, roomId) =>
    isRoomSpotlitByAviary(state, roomId) ||
    getAviaryNextSpotlitRoomId(state) === roomId,
];

export function isRoomLitByRegisteredSource(
  state: GameState,
  roomId: string,
): boolean {
  return ROOM_LIGHT_RULES.some((rule) => rule(state, roomId));
}
