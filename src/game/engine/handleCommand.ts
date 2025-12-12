import type { ParsedCommand } from "../../parse/parser";
import { tryPutItemInContainer } from "../rules/containers";
import {
  tryOpenDoor,
  tryCloseDoor,
  canMoveThroughExit,
  resolveDoorDestination,
} from "../rules/doors";
import { handleInject } from "../rules/injection";
import { dropItem, takeItem, tryCloseItem, tryOpenItem } from "../rules/items";
import { readReadable } from "../rules/read";
import { resolveDoorByNoun, resolveItemByNoun } from "../rules/scope";
import { getDoorById, getDoorState } from "../selectors/doorSelectors";
import { getCurrentRoom } from "../selectors/roomSelectors";
import { buildRoomDescription } from "../text/roomDescription";
import type { GameState } from "../types/gameTypes";
import { advanceTurn } from "./turn";

export function appendLog(state: GameState, text: string): GameState {
  return { ...state, log: [...state.log, text] };
}

export function handleCommand(state: GameState, cmd: ParsedCommand): GameState {
  const room = getCurrentRoom(state);

  // --- Free commands (no turn cost) -----------------------------------

  if (cmd.type === "look") {
    const desc = buildRoomDescription(state, state.player.roomId);
    return appendLog(state, desc);
  }

  if (cmd.type === "inventory") {
    if (state.player.inventory.length === 0) {
      return appendLog(state, "You are carrying nothing.");
    }

    const names = state.player.inventory
      .map(
        (id) => state.world.items.find((i) => i.id === id)?.name ?? "something"
      )
      .join(", ");

    return appendLog(state, "You are carrying: " + names);
  }

  // --- Turn-consuming commands ---------------------------------------

  let resultState: GameState = state;

  switch (cmd.type) {
    case "move": {
      const exit = room.exits.find((e) => e.direction === cmd.direction);
      let moveMessage = "";
      if (!exit) {
        resultState = appendLog(state, "You can't go that way.");
        break;
      }

      let destinationRoomId: string | undefined;

      if (exit.doorId) {
        const doorDef = getDoorById(state, exit.doorId);
        const doorState = getDoorState(state, exit.doorId);

        if (!doorDef) {
          resultState = appendLog(state, "You can't go that way.");
          break;
        }

        const { allowed, message } = canMoveThroughExit(
          state,
          exit as any,
          doorDef,
          doorState,
          exit.direction
        );

        if (!allowed) {
          resultState = appendLog(state, message ?? "You can't go that way.");
          break;
        }
        if (message) {
          moveMessage += message;
        }

        destinationRoomId = resolveDoorDestination(
          doorDef,
          state.player.roomId
        );
      } else if (exit.toRoomId) {
        destinationRoomId = exit.toRoomId;
      }

      if (!destinationRoomId) {
        resultState = appendLog(state, "You can't go that way.");
        break;
      }

      const movedState: GameState = {
        ...state,
        player: {
          ...state.player,
          roomId: destinationRoomId,
        },
      };
      moveMessage +=
        moveMessage === ""
          ? `You go ${cmd.direction}.`
          : `\nYou go ${cmd.direction}.`;

      resultState = appendLog(movedState, moveMessage);
      break;
    }

    case "action": {
      const verb = cmd.verb;
      const direct = cmd.direct?.trim();
      const indirect = cmd.indirect?.trim();

      switch (verb) {
        // EXAMINE / LOOK AT
        case "examine": {
          if (!direct) {
            resultState = appendLog(state, "Examine what?");
            break;
          }
          const item = resolveItemByNoun(state, direct);
          if (!item) {
            resultState = appendLog(state, "You don't see that here.");
            break;
          }
          const desc = item.description || "You see nothing special.";
          resultState = appendLog(state, desc);
          break;
        }

        // READ
        case "read": {
          if (!direct) {
            resultState = appendLog(state, "Read what?");
            break;
          }
          const readResult = readReadable(state, direct);
          resultState = appendLog(state, readResult);
          break;
        }

        // TAKE
        case "take": {
          if (!direct) {
            resultState = appendLog(state, "Take what?");
            break;
          }
          resultState = takeItem(state, direct);
          break;
        }

        // DROP
        case "drop": {
          if (!direct) {
            resultState = appendLog(state, "Drop what?");
            break;
          }
          resultState = dropItem(state, direct);
          break;
        }

        // OPEN
        case "open": {
          if (!direct) {
            resultState = appendLog(state, "Open what?");
            break;
          }

          // 1) Is this a door?
          const doorResult = resolveDoorByNoun(state, direct);

          if (doorResult) {
            const { def, state: doorState } = doorResult;

            const { state: withDoorUpdated, message } = tryOpenDoor(
              state,
              def,
              doorState
            );

            resultState = appendLog(withDoorUpdated, message);
            break;
          }

          // 2) Otherwise, try to open an item in scope
          const itemToOpen = resolveItemByNoun(state, direct);

          if (!itemToOpen) {
            resultState = appendLog(state, "You don't see that here.");
            break;
          }

          const { state: withItemUpdated, message } = tryOpenItem(
            state,
            itemToOpen
          );

          resultState = appendLog(withItemUpdated, message);
          break;
        }

        // CLOSE
        case "close": {
          if (!direct) {
            resultState = appendLog(state, "Close what?");
            break;
          }

          // 1) Is this a door?
          const doorResult = resolveDoorByNoun(state, direct);

          if (doorResult) {
            const { def, state: doorState } = doorResult;

            const { state: withDoorUpdated, message } = tryCloseDoor(
              state,
              def,
              doorState
            );

            resultState = appendLog(withDoorUpdated, message);
            break;
          }

          // 2) Otherwise, try to close an item in scope
          const itemToClose = resolveItemByNoun(state, direct);

          if (!itemToClose) {
            resultState = appendLog(state, "You don't see that here.");
            break;
          }

          const { state: withItemUpdated, message } = tryCloseItem(
            state,
            itemToClose
          );

          resultState = appendLog(withItemUpdated, message);
          break;
        }

        // INJECT
        case "inject": {
          resultState = handleInject(state, cmd);
          break;
        }

        // PUT
        case "put": {
          // "put" with no direct object
          if (!direct) {
            resultState = appendLog(state, "Put what?");
            break;
          }

          // We currently only support "put X in/into Y"
          if (cmd.preposition !== "in" && cmd.preposition !== "into") {
            resultState = appendLog(
              state,
              "You can only 'put' things *in* something right now."
            );
            break;
          }

          if (!indirect) {
            resultState = appendLog(state, "Put it where?");
            break;
          }

          // Resolve the item to put
          const item = resolveItemByNoun(state, direct);
          if (!item) {
            resultState = appendLog(state, "You don't see that here.");
            break;
          }

          // only allow putting things you’re carrying
          if (!state.player.inventory.includes(item.id)) {
            resultState = appendLog(state, "You aren't carrying that.");
            break;
          }

          // Resolve the container
          const container = resolveItemByNoun(state, indirect);
          if (!container) {
            resultState = appendLog(state, "You don't see that here.");
            break;
          }

          const opResult = tryPutItemInContainer(state, item.id, container.id);

          if (typeof opResult === "string") {
            resultState = appendLog(state, opResult);
          } else {
            resultState = appendLog(opResult, "Done.");
          }
          break;
        }

        default: {
          resultState = appendLog(state, "I don't understand that.");
          break;
        }
      }

      break;
    }

    case "unknown":
    default: {
      resultState = appendLog(state, "I don't understand that.");
      break;
    }
  }

  // One tick of time for any turn-consuming command
  return advanceTurn(resultState);
}
