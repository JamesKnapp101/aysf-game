import { ACTION_HANDLERS } from "../actions";
import { canMoveThroughExit, resolveDoorDestination } from "../rules/doors";
import { getDoorById, getDoorState } from "../selectors/doorSelectors";
import { getCurrentRoom } from "../selectors/roomSelectors";
import { useUIOverlayStore } from "../store/store";
import { buildRoomDescription } from "../text/roomDescription";
import type { GameState } from "../types/gameTypes";
import type { ParsedCommand } from "../types/parserTypes";
import { advanceTurn } from "./turn";

export function appendLog(state: GameState, text: string): GameState {
  return { ...state, log: [...state.log, text] };
}

export function handleCommand(state: GameState, cmd: ParsedCommand): GameState {
  const { openOverlay } = useUIOverlayStore.getState();

  const room = getCurrentRoom(state);

  if (cmd.type === "look") {
    const desc = buildRoomDescription(state, state.player.roomId);
    return appendLog(state, desc);
  }

  let nextState = state;
  let message = "I don't understand that.";

  switch (cmd.type) {
    case "move": {
      const exit = room.exits.find((e) => e.direction === cmd.direction);
      if (!exit) {
        message = "You can't go that way.";
        break;
      }
      let destinationRoomId: string | undefined;
      let moveMessage = "";

      if (exit.doorId) {
        const doorDef = getDoorById(state, exit.doorId);
        const doorState = getDoorState(state, exit.doorId);

        if (!doorDef) {
          message = "You can't go that way.";
          break;
        }

        const { allowed, message: gateMsg } = canMoveThroughExit(
          state,
          exit as any,
          doorDef,
          doorState,
          exit.direction
        );

        if (!allowed) {
          message = gateMsg ?? "You can't go that way.";
          break;
        }

        if (gateMsg) moveMessage += gateMsg;

        destinationRoomId = resolveDoorDestination(doorDef, room.id);
      } else if (exit.toRoomId) {
        destinationRoomId = exit.toRoomId;
      }

      if (!destinationRoomId) {
        message = "You can't go that way.";
        break;
      }

      nextState = {
        ...state,
        player: {
          ...state.player,
          roomId: destinationRoomId,
        },
      };
      message = "";
      break;
    }

    case "action": {
      const verb = cmd.verb;

      const handler = ACTION_HANDLERS[verb];
      if (!handler) {
        message = "I don't understand that.";
        break;
      }

      const result = handler(state, cmd);
      nextState = result.state;
      message = result.message ?? "";
      if (result.overlay) {
        openOverlay(result.overlay as any);
      }
      break;
    }

    case "unknown":
    default: {
      message = "I don't understand that.";
      break;
    }
  }

  let logWithEcho = "";
  if (cmd.type === "move") {
    logWithEcho = `> ${cmd.direction}\n${message}`;
  } else if (cmd.type === "inventory") {
    logWithEcho = `> inventory\n${message}`;
  } else if (cmd.type === "action") {
    logWithEcho = `> ${cmd.raw}\n${message}`;
  }
  console.log("logWithEcho: ", logWithEcho + "Z");
  nextState = appendLog(nextState, logWithEcho.trim());
  return advanceTurn(nextState);
}
