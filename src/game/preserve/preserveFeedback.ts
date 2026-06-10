import { appendLog } from "@game/engine/log";
import {
  getOppositeDirection,
  getShortestPreserveRoute,
} from "@game/preserve/preserveNavigation";
import {
  getPreserveActiveAnimalId,
  getPreserveActorRuntime,
  setPreserveActorRuntime,
} from "@game/preserve/preserveState";
import { getAnimalStatusRemainingTurns } from "./animalStatus";
import type { GameState } from "@game/types/gameTypes";
import type { Direction } from "@game/types/roomTypes";
import type { PreserveActorId } from "./preserveTypes";
import {
  GAME_PRESERVE_ANIMAL_PROFILES,
  GAME_PRESERVE_STAGING_ROOM_ID,
  isGamePreserveRoomId,
} from "src/world/maps/levelFour/gamePreserveRules";

const PROXIMITY_RADIUS: Record<PreserveActorId, number> = {
  badger: 1,
  barry: 2,
  bear: 1,
  boar: 1,
  bull: 3,
};

function didPlayerMoveThisTurn(state: GameState): boolean {
  const lastMove = state.player.recentMoves?.[0];
  return (
    lastMove?.atTurn === state.moves && lastMove.toRoomId === state.player.roomId
  );
}

function getDirectionalLocale(direction: Direction, distance: number): string {
  if (direction === "up") {
    return distance > 1 ? "somewhere above you" : "above you";
  }

  if (direction === "down") {
    return distance > 1 ? "somewhere below you" : "below you";
  }

  return distance > 1 ? `off to the ${direction}` : `to the ${direction}`;
}

function getTallGrassCue(
  direction: Direction,
  distance: number,
  movedCloser: boolean,
): string {
  const locale = getDirectionalLocale(direction, distance);
  return movedCloser
    ? `Something just went rustling through the tall grass ${locale}, headed in your direction!`
    : `Something is moving through the tall grass ${locale}, close enough to make the stems whip and sway.`;
}

function getActiveAnimalAggroMessage(actorId: PreserveActorId): string {
  switch (actorId) {
    case "bear":
      return "The bear turns on you at once, shoulders rolling forward as its full attention locks onto you.";
    case "boar":
      return "The boar wheels toward you with a sharp squeal, lowering its tusks your way. It has locked onto you.";
    case "badger":
      return "The badger freezes for half a beat, then fixes on you with raw, furious intent.";
    case "barry":
      return "Barry spots you, looks briefly relieved, and then starts coming at you with terrifying purpose.";
    case "bull":
    default:
      return "The bull jerks its head up the instant it sees you, squares itself to you, and paws hard at the ground. It has locked onto you.";
  }
}

function formatCue(template: string, locale: string): string {
  return template.replace("{locale}", locale);
}

function getGenericNearbyCue(
  actorId: PreserveActorId,
  direction: Direction,
  distance: number,
  movedCloser: boolean,
): string {
  const locale = getDirectionalLocale(direction, distance);
  const cues = GAME_PRESERVE_ANIMAL_PROFILES[actorId].soundCues;

  if (movedCloser) return formatCue(cues.approaching, locale);
  if (distance <= 1) return formatCue(cues.close, locale);
  return formatCue(cues.idle, locale);
}

function getPreserveProximityMessage(
  actorId: PreserveActorId,
  actorRoomId: string,
  direction: Direction,
  distance: number,
  movedCloser: boolean,
): string {
  if (actorRoomId === "TallGrass") {
    return getTallGrassCue(direction, distance, movedCloser);
  }

  return getGenericNearbyCue(actorId, direction, distance, movedCloser);
}

export function tickGamePreserveFeedback(state: GameState): GameState {
  if (!isGamePreserveRoomId(state.player.roomId)) return state;

  const activeAnimalId = getPreserveActiveAnimalId(state);
  if (!activeAnimalId) return state;

  if (state.itemState.attachedTo[activeAnimalId] === "PLAYER") {
    return state;
  }

  if (getAnimalStatusRemainingTurns(state, activeAnimalId, "stunned") > 0) {
    return state;
  }

  const activeAnimalRoomId = state.itemState.itemRoomId[activeAnimalId];
  if (
    !activeAnimalRoomId ||
    activeAnimalRoomId === GAME_PRESERVE_STAGING_ROOM_ID ||
    !isGamePreserveRoomId(activeAnimalRoomId)
  ) {
    return state;
  }

  let next = state;
  const actorRuntime = getPreserveActorRuntime(next, activeAnimalId);
  const previousAnimalRoomId = actorRuntime.memory.lastVisitedRoomId;
  const playerMovedThisTurn = didPlayerMoveThisTurn(next);

  let nextRuntime = actorRuntime;
  let cueText: string | undefined;

  if (
    activeAnimalRoomId === next.player.roomId &&
    (previousAnimalRoomId !== activeAnimalRoomId || playerMovedThisTurn)
  ) {
    cueText = getActiveAnimalAggroMessage(activeAnimalId);
    nextRuntime = {
      ...nextRuntime,
      memory: {
        ...nextRuntime.memory,
        lastKnownPlayerRoomId: next.player.roomId,
        lastKnownPlayerTurn: next.moves,
      },
    };
  } else {
    const pathInfo = getShortestPreserveRoute(
      next,
      "player",
      activeAnimalRoomId,
      next.player.roomId,
    );
    const previousPathInfo =
      previousAnimalRoomId && previousAnimalRoomId !== activeAnimalRoomId
        ? getShortestPreserveRoute(
            next,
            "player",
            previousAnimalRoomId,
            next.player.roomId,
          )
        : undefined;
    const approachDirection = pathInfo?.lastDirection
      ? getOppositeDirection(pathInfo.lastDirection)
      : undefined;

    if (
      pathInfo &&
      approachDirection &&
      pathInfo.distance > 0 &&
      pathInfo.distance <= PROXIMITY_RADIUS[activeAnimalId] &&
      (playerMovedThisTurn || previousAnimalRoomId !== activeAnimalRoomId)
    ) {
      const movedCloser =
        previousPathInfo != null && previousPathInfo.distance > pathInfo.distance;
      cueText = getPreserveProximityMessage(
        activeAnimalId,
        activeAnimalRoomId,
        approachDirection,
        pathInfo.distance,
        movedCloser,
      );
    }
  }

  nextRuntime = {
    ...nextRuntime,
    memory: {
      ...nextRuntime.memory,
      lastVisitedRoomId: activeAnimalRoomId,
    },
  };

  next = setPreserveActorRuntime(next, activeAnimalId, nextRuntime);

  if (cueText) {
    next = appendLog(next, cueText);
  }

  return next;
}
