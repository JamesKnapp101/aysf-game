import { isRoomSpotlitByAviary } from "@game/engine/ticks/aviaryTick";
import type { GameState } from "@game/types/gameTypes";
import { getAviaryNextSpotlitRoomId, getSpaAmbientLight } from "src/world/zoneRegistrations";

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

// Visibility and biological illumination can differ for a registered ambient
// source. Defaults preserve the behavior of every unregistered room.
type AmbientLighting = { visible: boolean; physical: boolean };
const AMBIENT_LIGHT_RULES: ((state: GameState, roomId: string) => AmbientLighting | undefined)[] = [
  (state, roomId) => getSpaAmbientLight(state, roomId),
];

function getAmbientLighting(state: GameState, roomId: string): AmbientLighting {
  for (const rule of AMBIENT_LIGHT_RULES) {
    const lighting = rule(state, roomId);
    if (lighting !== undefined) return lighting;
  }
  const lit = !state.worldState.darkRooms[roomId];
  return { visible: lit, physical: lit };
}

export function isRoomAmbientlyLit(state: GameState, roomId: string): boolean {
  return getAmbientLighting(state, roomId).visible;
}

export function isRoomPhysicallyLitByAmbient(state: GameState, roomId: string): boolean {
  return getAmbientLighting(state, roomId).physical;
}
