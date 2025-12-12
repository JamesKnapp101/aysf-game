import { appendLog } from "../engine/handleCommand";
import type { GameState } from "../types/gameTypes";
import type { TeleportPadDefinition } from "../types/tpadTypes";

export function activateTeleportPad(
  state: GameState,
  pad: TeleportPadDefinition
): GameState {
  const ringPads = state.world.teleportPads
    .filter((p) => p.ringId === pad.ringId)
    .sort((a, b) => a.order - b.order);

  if (ringPads.length <= 1) {
    return appendLog(state, "Nothing happens.");
  }

  const index = ringPads.findIndex((p) => p.id === pad.id);
  const nextIndex = (index + 1) % ringPads.length;
  const dest = ringPads[nextIndex];

  const destRoom = state.world.rooms.find((r) => r.id === dest.roomId);
  const destName = destRoom?.name ?? "somewhere else";

  const newState: GameState = {
    ...state,
    player: {
      ...state.player,
      roomId: dest.roomId,
    },
  };

  return appendLog(
    newState,
    `You step onto the ${pad.label}. The world twists around you and you find yourself in ${destName}.`
  );
}
