import { moveItemToRoom } from "@game/helpers/itemHelpers";
import { queueAfterRoomDescription } from "@game/helpers/gameHelpers";
import { useUIEffectsStore } from "@game/store/store";
import type { GameState } from "@game/types/gameTypes";
import {
  removePreserveRunItems,
  updatePreservePlayerRuntime,
} from "./preserveState";
import {
  GAME_PRESERVE_EXIT_RULES,
  GAME_PRESERVE_ROOM_RULES,
  isGamePreserveRoomId,
} from "src/world/maps/levelFour/gamePreserveRules";

export function applyPreserveRoomEntryEffects(
  state: GameState,
  roomId: string,
  ctx: { direction?: string; fromRoomId?: string } = {},
): GameState {
  if (!isGamePreserveRoomId(roomId)) {
    if (!ctx.fromRoomId || !isGamePreserveRoomId(ctx.fromRoomId)) return state;
    useUIEffectsStore.getState().triggerTeleportFlash();
    return removePreserveRunItems(state);
  }

  if (!state.worldState.gamePreserve.run) return state;

  const roomRule = GAME_PRESERVE_ROOM_RULES[roomId];
  if (!roomRule) return state;

  let next = state;

  const exitRuleId =
    ctx.fromRoomId && ctx.direction
      ? next.world.rooms
          .find((room) => room.id === ctx.fromRoomId)
          ?.exits.find((exit) => exit.direction === ctx.direction)
          ?.preserveRuleId
      : undefined;
  const exitEntryMessage = exitRuleId
    ? GAME_PRESERVE_EXIT_RULES[exitRuleId]?.entryMessage
    : undefined;

  if (exitEntryMessage) {
    next = queueAfterRoomDescription(next, exitEntryMessage);
  }

  if (roomRule.entryMessage) {
    next = queueAfterRoomDescription(next, roomRule.entryMessage);
  }

  if (roomRule.masksPlayerScentTurns) {
    next = updatePreservePlayerRuntime(next, (playerRuntime) => ({
      ...playerRuntime,
      scentMaskedTurns: Math.max(
        playerRuntime.scentMaskedTurns,
        roomRule.masksPlayerScentTurns ?? 0,
      ),
    }));
  }

  for (const actorId of roomRule.dislodgeAttachedActors ?? []) {
    if (next.itemState.attachedTo[actorId] !== "PLAYER") continue;

    next = {
      ...next,
      itemState: {
        ...next.itemState,
        attachedTo: {
          ...next.itemState.attachedTo,
          [actorId]: undefined,
        },
      },
    };

    if (next.itemState.itemRoomId[actorId]) {
      next = moveItemToRoom(next, actorId, roomId);
      continue;
    }

    next = {
      ...next,
      itemState: {
        ...next.itemState,
        itemRoomId: {
          ...next.itemState.itemRoomId,
          [actorId]: roomId,
        },
      },
    };
  }

  return next;
}
