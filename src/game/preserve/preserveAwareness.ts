import type { GameState } from "@game/types/gameTypes";
import type { Direction } from "@game/types/roomTypes";
import { canPreserveRoomSeeRoom } from "./preserveDetection";
import { getShortestPreserveRoute } from "./preserveNavigation";
import {
  GAME_PRESERVE_ANIMAL_PROFILES,
  GAME_PRESERVE_STAGING_ROOM_ID,
  isGamePreserveRoomId,
} from "src/world/maps/levelFour/gamePreserveRules";

function getVisibleLocale(
  direction: Direction | undefined,
  distance: number | undefined,
): string {
  if (!direction || distance == null) return "somewhere in the preserve";
  if (direction === "up") return distance > 1 ? "somewhere above you" : "above you";
  if (direction === "down") return distance > 1 ? "somewhere below you" : "below you";
  return distance > 1 ? `off to the ${direction}` : `to the ${direction}`;
}

export function getVisiblePreserveAnimalDescription(
  state: GameState,
  roomId: string,
): string | undefined {
  const run = state.worldState.gamePreserve.run;
  if (!run || !isGamePreserveRoomId(roomId)) return undefined;

  const actorId = run.activeAnimalId;
  const actorRoomId = state.itemState.itemRoomId[actorId];
  if (
    !actorRoomId ||
    actorRoomId === roomId ||
    actorRoomId === GAME_PRESERVE_STAGING_ROOM_ID ||
    !isGamePreserveRoomId(actorRoomId)
  ) {
    return undefined;
  }

  if (!canPreserveRoomSeeRoom(roomId, actorRoomId)) return undefined;

  const route = getShortestPreserveRoute(state, "player", roomId, actorRoomId);
  const locale = getVisibleLocale(route?.firstDirection, route?.distance);
  const profile = GAME_PRESERVE_ANIMAL_PROFILES[actorId];

  return `You can see ${profile.visibleDescription} ${locale}.`;
}
