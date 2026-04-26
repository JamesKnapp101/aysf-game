import type { GameState } from "@game/types/gameTypes";
import type { PreserveActorId, PreserveSense } from "./preserveTypes";
import { getShortestPreserveRoute } from "./preserveNavigation";
import {
  GAME_PRESERVE_ANIMAL_PROFILES,
  GAME_PRESERVE_ROOM_RULES,
  isGamePreserveRoomId,
} from "src/world/maps/levelFour/gamePreserveRules";

export function canPreserveRoomSeeRoom(
  observerRoomId: string,
  targetRoomId: string,
): boolean {
  if (observerRoomId === targetRoomId) return true;
  if (!isGamePreserveRoomId(observerRoomId)) return false;
  if (!isGamePreserveRoomId(targetRoomId)) return false;

  if (
    observerRoomId === "GamePreserveEntrance" ||
    targetRoomId === "GamePreserveEntrance"
  ) {
    return false;
  }

  if (observerRoomId === "DrainagePipe" || targetRoomId === "DrainagePipe") {
    return false;
  }

  if (observerRoomId === "TrophyRoom" || targetRoomId === "TrophyRoom") {
    return (
      observerRoomId === "ObservationTowerTop" ||
      targetRoomId === "ObservationTowerTop"
    );
  }

  return true;
}

export function getPlayerPreserveConcealment(
  state: GameState,
): PreserveSense[] {
  if (!isGamePreserveRoomId(state.player.roomId)) return [];

  const concealed = new Set<PreserveSense>(
    GAME_PRESERVE_ROOM_RULES[state.player.roomId]?.concealsPlayerFromSenses ??
      [],
  );

  if ((state.worldState.gamePreserve.run?.playerRuntime.scentMaskedTurns ?? 0) > 0) {
    concealed.add("scent");
  }

  return [...concealed];
}

export function canPreserveActorDetectPlayer(
  state: GameState,
  actorId: PreserveActorId,
  sense: PreserveSense,
  actorRoomId = state.itemState.itemRoomId[actorId],
): boolean {
  const profile = GAME_PRESERVE_ANIMAL_PROFILES[actorId];
  if (!profile.senses.includes(sense)) return false;
  if (!actorRoomId || !isGamePreserveRoomId(actorRoomId)) return false;
  if (!isGamePreserveRoomId(state.player.roomId)) return false;
  if (getPlayerPreserveConcealment(state).includes(sense)) return false;

  if (sense === "sight") {
    if (!canPreserveRoomSeeRoom(actorRoomId, state.player.roomId)) return false;

    if (profile.sightRadius != null) {
      const route = getShortestPreserveRoute(
        state,
        "player",
        actorRoomId,
        state.player.roomId,
      );
      return route != null && route.distance <= profile.sightRadius;
    }
  }

  return true;
}
