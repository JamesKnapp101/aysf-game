import type { GameState } from "@game/types/gameTypes";
import type { Exit } from "@game/types/roomTypes";
import type { PreserveTraversalActorId } from "./preserveTypes";
import { isPreserveActorId } from "./preserveTypes";
import {
  GAME_PRESERVE_EXIT_RULES,
  GAME_PRESERVE_ROOM_RULES,
  isGamePreserveRoomId,
} from "src/world/maps/levelFour/gamePreserveRules";

type PreserveTraversalResult = {
  allowed: boolean;
  message?: string;
};

function actorAllowed(
  actorId: PreserveTraversalActorId,
  allowedActors?: PreserveTraversalActorId[],
  blockedActors?: PreserveTraversalActorId[],
): boolean {
  if (allowedActors && !allowedActors.includes(actorId)) {
    return false;
  }

  if (blockedActors?.includes(actorId)) {
    return false;
  }

  return true;
}

function getDefaultPreserveBlockMessage(exit: Exit): string {
  switch (exit.preserveRuleId) {
    case "observation-tower-ladder":
      return "That climb only works for you, or for something with the bear's reach.";
    case "dead-oak-climb":
      return "The dead oak can be climbed, but only by you or something like the bear.";
    case "drainage-pipe-crawl":
      return "The drainage pipe is far too cramped to take that route.";
    case "ruined-wall-breach":
      return "The cracked wall still blocks the way into the drainage pipe.";
    default:
      return "You can't go that way.";
  }
}

export function getPreserveTraversalActorId(
  itemId: string,
): PreserveTraversalActorId | undefined {
  return isPreserveActorId(itemId) ? itemId : undefined;
}

export function canTraversePreserveExit(
  state: GameState,
  actorId: PreserveTraversalActorId,
  fromRoomId: string,
  exit: Exit,
  destinationRoomId: string,
): PreserveTraversalResult {
  if (
    !isGamePreserveRoomId(fromRoomId) &&
    !isGamePreserveRoomId(destinationRoomId)
  ) {
    return { allowed: true };
  }

  if (exit.preserveRuleId) {
    const exitRule = GAME_PRESERVE_EXIT_RULES[exit.preserveRuleId];
    if (
      exitRule &&
      !actorAllowed(actorId, exitRule.allowedActors, exitRule.blockedActors)
    ) {
      return {
        allowed: false,
        message: exitRule.blockMessage ?? getDefaultPreserveBlockMessage(exit),
      };
    }

    if (exitRule?.structureGate) {
      const structureValue =
        state.worldState.gamePreserve.run?.structures[
          exitRule.structureGate.structureId
        ];

      if (structureValue !== exitRule.structureGate.mustEqual) {
        return {
          allowed: false,
          message: exitRule.blockMessage ?? "You can't go that way.",
        };
      }
    }
  }

  const roomRule = GAME_PRESERVE_ROOM_RULES[destinationRoomId];
  if (
    roomRule &&
    !actorAllowed(actorId, roomRule.allowedActors, roomRule.blockedActors)
  ) {
    return {
      allowed: false,
      message: getDefaultPreserveBlockMessage(exit),
    };
  }

  return { allowed: true };
}

export function getGamePreserveMoveGuard(
  state: GameState,
  ctx: {
    fromRoomId: string;
    direction: string;
    destinationRoomId?: string;
  },
):
  | {
      kind: "block";
      message: string;
      consumesTurn?: boolean;
    }
  | undefined {
  if (!ctx.destinationRoomId) return undefined;

  if (
    !isGamePreserveRoomId(ctx.fromRoomId) &&
    !isGamePreserveRoomId(ctx.destinationRoomId)
  ) {
    return undefined;
  }

  const room = state.world.rooms.find((candidate) => candidate.id === ctx.fromRoomId);
  const exit = room?.exits.find((candidate) => candidate.direction === ctx.direction);
  if (!exit) return undefined;

  const result = canTraversePreserveExit(
    state,
    "player",
    ctx.fromRoomId,
    exit,
    ctx.destinationRoomId,
  );

  if (result.allowed) return undefined;

  return {
    kind: "block",
    message: result.message ?? "You can't go that way.",
    consumesTurn: false,
  };
}
