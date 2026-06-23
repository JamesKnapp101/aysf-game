import type { GameState } from "@game/types/gameTypes";

export const DEFAULT_EXTERNAL_ROOM_TEMPERATURE_F = 72;
export const MIN_EXTERNAL_ROOM_TEMPERATURE_F = -60;
export const MAX_EXTERNAL_ROOM_TEMPERATURE_F = 108;

const LEGACY_ROOM_TEMPERATURES_F: Record<string, number> = {
  freezing: 0,
  cold: 38,
  cool: 62,
  temperate: DEFAULT_EXTERNAL_ROOM_TEMPERATURE_F,
  warm: 88,
  hot: 101,
  scorching: MAX_EXTERNAL_ROOM_TEMPERATURE_F,
};

export function clampExternalRoomTemperatureF(temperature: number): number {
  if (!Number.isFinite(temperature)) return DEFAULT_EXTERNAL_ROOM_TEMPERATURE_F;
  return Math.max(
    MIN_EXTERNAL_ROOM_TEMPERATURE_F,
    Math.min(MAX_EXTERNAL_ROOM_TEMPERATURE_F, temperature),
  );
}

export function getExternalRoomTemperatureF(
  state: GameState,
  roomId = state.player.roomId,
): number {
  const raw = (state.worldState.roomTemp as Record<string, unknown> | undefined)
    ?.[roomId];

  if (typeof raw === "number") {
    return clampExternalRoomTemperatureF(raw);
  }

  if (typeof raw === "string") {
    return clampExternalRoomTemperatureF(
      LEGACY_ROOM_TEMPERATURES_F[raw] ?? DEFAULT_EXTERNAL_ROOM_TEMPERATURE_F,
    );
  }

  return DEFAULT_EXTERNAL_ROOM_TEMPERATURE_F;
}

export function setExternalRoomTemperatureF(
  state: GameState,
  roomId: string,
  temperature: number,
): GameState {
  return {
    ...state,
    worldState: {
      ...state.worldState,
      roomTemp: {
        ...state.worldState.roomTemp,
        [roomId]: clampExternalRoomTemperatureF(temperature),
      },
    },
  };
}
