import type { GameState } from "@game/types/gameTypes";

export type RoomVisualTone = "default" | "reactor-core-hot";

type RoomVisualRule = (
  state: GameState,
  roomId: string,
) => RoomVisualTone | undefined;

const ROOM_VISUAL_RULES: RoomVisualRule[] = [
  (_state, roomId) =>
    roomId === "ReactorCore" ? "reactor-core-hot" : undefined,
];

export function getRegisteredRoomVisualTone(
  state: GameState,
  roomId: string,
): RoomVisualTone {
  for (const rule of ROOM_VISUAL_RULES) {
    const tone = rule(state, roomId);
    if (tone) return tone;
  }
  return "default";
}
