import {
  getExitDestinationRoomId,
  getRoomExits,
} from "@game/helpers/itemHelpers";
import { canTraversePreserveExit } from "@game/preserve/preserveTraversal";
import type { GameState } from "@game/types/gameTypes";
import type { Direction } from "@game/types/roomTypes";
import type { PreserveTraversalActorId } from "./preserveTypes";
import {
  GAME_PRESERVE_STAGING_ROOM_ID,
  isGamePreserveRoomId,
} from "src/world/maps/levelFour/gamePreserveRules";

export type PreserveRouteInfo = {
  distance: number;
  firstDirection?: Direction;
  firstRoomId?: string;
  lastDirection?: Direction;
};

export function getOppositeDirection(
  direction: Direction,
): Direction | undefined {
  switch (direction) {
    case "north":
      return "south";
    case "south":
      return "north";
    case "east":
      return "west";
    case "west":
      return "east";
    case "northeast":
      return "southwest";
    case "northwest":
      return "southeast";
    case "southeast":
      return "northwest";
    case "southwest":
      return "northeast";
    case "up":
      return "down";
    case "down":
      return "up";
    case "in":
      return "out";
    case "out":
      return "in";
    default:
      return undefined;
  }
}

export function getShortestPreserveRoute(
  state: GameState,
  actorId: PreserveTraversalActorId,
  fromRoomId: string,
  toRoomId: string,
): PreserveRouteInfo | undefined {
  if (fromRoomId === toRoomId) {
    return { distance: 0 };
  }

  const queue: Array<{
    distance: number;
    firstDirection?: Direction;
    firstRoomId?: string;
    lastDirection?: Direction;
    roomId: string;
  }> = [{ distance: 0, roomId: fromRoomId }];
  const visited = new Set<string>([fromRoomId]);

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) break;

    for (const exit of getRoomExits(state, current.roomId)) {
      const destinationRoomId = getExitDestinationRoomId(
        state,
        current.roomId,
        exit,
      );

      if (
        !destinationRoomId ||
        destinationRoomId === GAME_PRESERVE_STAGING_ROOM_ID ||
        !isGamePreserveRoomId(destinationRoomId)
      ) {
        continue;
      }

      const traversal = canTraversePreserveExit(
        state,
        actorId,
        current.roomId,
        exit,
        destinationRoomId,
      );
      if (!traversal.allowed || visited.has(destinationRoomId)) {
        continue;
      }

      const nextRoute: PreserveRouteInfo = {
        distance: current.distance + 1,
        firstDirection: current.firstDirection ?? exit.direction,
        firstRoomId: current.firstRoomId ?? destinationRoomId,
        lastDirection: exit.direction,
      };

      if (destinationRoomId === toRoomId) {
        return nextRoute;
      }

      visited.add(destinationRoomId);
      queue.push({
        distance: nextRoute.distance,
        firstDirection: nextRoute.firstDirection,
        firstRoomId: nextRoute.firstRoomId,
        lastDirection: nextRoute.lastDirection,
        roomId: destinationRoomId,
      });
    }
  }

  return undefined;
}
