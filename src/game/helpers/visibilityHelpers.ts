import { isRoomAmbientlyLit, isRoomLitByRegisteredSource, isRoomPhysicallyLitByAmbient } from "@game/registries/roomLightRegistry";
import { isAnyFlashlightOn } from "./flashlightHelpers";
import type { GameState } from "../types/gameTypes";
import type { AmbientRoomLightLevel } from "../types/roomTypes";

/** Night vision changes perception; it does not illuminate a creature's room. */
export function isRoomPhysicallyLit(state: GameState, roomId: string): boolean {
  return Boolean(state.world.rooms.some((room) => room.id === roomId)) && (
    isRoomPhysicallyLitByAmbient(state, roomId) ||
    isRoomLitByRegisteredSource(state, roomId) ||
    (roomId === state.player.roomId && isAnyFlashlightOn(state))
  );
}

export function canPlayerSeeInRoom(state: GameState, roomId: string): boolean {
  const room = state.world.rooms.find((r) => r.id === roomId);
  if (!room) return false;

  const isDark = !isRoomAmbientlyLit(state, room.id);

  const nightVisionActive = state.player.statusEffects.some(
    (se) => se.id === "nightvision-active",
  );

  const flashlightOn = isAnyFlashlightOn(state);

  return (
    !isDark ||
    nightVisionActive ||
    flashlightOn ||
    isRoomLitByRegisteredSource(state, roomId)
  );
}

/** Effective ambient level, independent of perception aids and UI text styling. */
export function getRoomAmbientLightLevel(
  state: GameState,
  roomId: string,
): AmbientRoomLightLevel | "dark" {
  if (!isRoomAmbientlyLit(state, roomId)) return "dark";
  const room = state.world.rooms.find(candidate => candidate.id === roomId);
  return room?.resolveAmbientLightLevel?.(state, room) ?? room?.ambientLightLevel ?? "normal";
}

export function getRoomVisualLightLevel(
  state: GameState,
  roomId: string,
): AmbientRoomLightLevel | "dark" {
  const room = state.world.rooms.find((candidate) => candidate.id === roomId);
  if (!room) return "normal";

  const isDark = !isRoomAmbientlyLit(state, room.id);

  if (isDark && !canPlayerSeeInRoom(state, roomId)) {
    return "very-dim";
  }

  if (isDark) return "dark";
  return getRoomAmbientLightLevel(state, roomId);
}
