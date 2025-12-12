import type { GameState } from "../types/gameTypes";
import type { TeleportPadDefinition } from "../types/tpadTypes";

export function getTeleportPadsInCurrentRoom(
  state: GameState
): TeleportPadDefinition[] {
  return state.world.teleportPads.filter(
    (pad) => pad.roomId === state.player.roomId
  );
}

export function describeTeleportPads(state: GameState): string[] {
  const padsHere = getTeleportPadsInCurrentRoom(state);
  return padsHere.map((pad) => `A ${pad.label} glows faintly on the floor.`);
}
