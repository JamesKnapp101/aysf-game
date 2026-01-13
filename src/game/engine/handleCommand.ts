import { ROOM_NAME_TOKEN_END, ROOM_NAME_TOKEN_START } from "@game/constants";
import { triggerPlayerDeath } from "@game/helpers/gameHelpers";
import { getRoomById } from "@game/helpers/itemHelpers";
import { AQUARIUM_ROOM_IDS } from "src/world/Items/creatures/octopus";
import { ACTION_HANDLERS } from "../actions";
import { canMoveThroughExit, resolveDoorDestination } from "../rules/doors";
import { getDoorById, getDoorState } from "../selectors/doorSelectors";
import { getCurrentRoom, getPlayerRoomId } from "../selectors/roomSelectors";
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

  // LOOK should always print the full description to the log, and NOT advance time.
  if (cmd.type === "look") {
    const desc = buildRoomDescription(state, state.player.roomId, {
      mode: "panel",
      forceFull: true,
    });
    return appendLog(state, desc);
  }

  let nextState = state;
  let message = "I don't understand that.";
  let consumesTurn = false;

  switch (cmd.type) {
    case "move": {
      consumesTurn = true;

      const exit = room.exits.find((e) => e.direction === cmd.direction);
      if (!exit) {
        message = "You can't go that way.";
        break;
      }

      // Aquarium special-case
      if (AQUARIUM_ROOM_IDS.has(getPlayerRoomId(state))) {
        if (
          state.worldState.octopusState.occupiedRoomIds.includes(
            exit.toRoomId ?? ""
          )
        ) {
          message =
            "A giant tentacle fills most of the passageway in that direction, you better steer clear.";

          if (
            state.worldState.octopusState.tipRoomIds.includes(
              exit.toRoomId ?? ""
            )
          ) {
            message =
              "You move through the murky water in that direction and run headlong into the groping end of a giant tentacle! You struggle as it wraps around you and jerks you off your feet, dragging you back toward the source in a chaos of flailing arms and ink-black water. You catch a glimpse of the creatures massive, bulbous head, eyes studying you, before it pulls you into a gaping, razor sharp beak...";
            nextState = triggerPlayerDeath(
              nextState,
              message,
              "aquarium octopus"
            );
            break; // we'll still echo below
          }
          break;
        }
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

      // Move player first
      const movedState: GameState = {
        ...state,
        player: { ...state.player, roomId: destinationRoomId },
      };

      // Mark visited before describing (keeps short/full logic consistent)
      const visitedRooms = movedState.worldState.visitedRooms ?? {};
      const nextVisitedRooms = { ...visitedRooms, [destinationRoomId]: true };

      nextState = {
        ...movedState,
        worldState: {
          ...movedState.worldState,
          visitedRooms: nextVisitedRooms,
        },
      };

      // We'll build the room description AFTER advanceTurn so ticks (spotlight/evict/etc)
      // are reflected in the log output.
      message = moveMessage.trim();
      break;
    }

    case "action": {
      // Most actions should consume time. If you have some that shouldn't,
      // teach the handler to return consumesTurn and honor it here.
      consumesTurn = true;

      const handler = ACTION_HANDLERS[cmd.verb];
      if (!handler) {
        message = "I don't understand that.";
        consumesTurn = false;
        break;
      }

      const result = handler(state, cmd);
      nextState = result.state;
      message = result.message ?? "";
      if (result.overlay) openOverlay(result.overlay as any);

      // If supported:
      // consumesTurn = result.consumesTurn ?? true;
      break;
    }

    case "inventory": {
      consumesTurn = false;
      // message = buildInventoryText(state);
      break;
    }

    case "unknown":
    default: {
      consumesTurn = false;
      message = "I don't understand that.";
      break;
    }
  }

  // --- IMPORTANT: ensure command echo/response is never "pre-dated" by tick logs ---
  // If the command consumes a turn, ticks may append log entries during advanceTurn().
  // We capture those entries and re-append them AFTER the command echo/response.
  let tickLogEntries: string[] = [];
  const logBeforeLen = (nextState as any).log?.length ?? 0;

  if (consumesTurn) {
    nextState = advanceTurn(nextState);

    const logAfter: string[] = (nextState as any).log ?? [];
    tickLogEntries = logAfter.slice(logBeforeLen);

    // Roll back log to the pre-advanceTurn state so we can append echo first.
    nextState = {
      ...nextState,
      log: logAfter.slice(0, logBeforeLen),
    } as any;
  }

  // If movement, append the destination room description from the UPDATED world state.
  if (cmd.type === "move") {
    const destRoomId = nextState.player.roomId;
    const roomDesc = buildRoomDescription(nextState, destRoomId, {
      mode: "log",
    });
    message = [message.trim(), roomDesc.trim()].filter(Boolean).join("\n");
  }
  const roomName = `${ROOM_NAME_TOKEN_START}${
    getRoomById(nextState, nextState.player.roomId)?.name
  }${ROOM_NAME_TOKEN_END}`;
  // Build echo block
  let logWithEcho = "";
  if (cmd.type === "move") {
    logWithEcho = `> ${cmd.direction}\n${roomName}\n${message}`;
  } else if (cmd.type === "inventory") {
    logWithEcho = `> inventory\n${message}`;
  } else if (cmd.type === "action") {
    logWithEcho = `> ${cmd.raw}\n${message}`;
  } else if (cmd.type === "unknown") {
    logWithEcho = `> ${cmd.raw ?? "?"}\n${message}`;
  } else {
    // fallback
    logWithEcho = message;
  }

  // Append echo/response FIRST
  nextState = appendLog(
    nextState,
    logWithEcho.trim() + (tickLogEntries.length === 0 ? "\n\n" : "")
  );

  // Then append any tick messages that happened during advanceTurn()
  for (const entry of tickLogEntries) {
    if (entry && entry.trim()) {
      nextState = appendLog(nextState, entry + "\n\n");
    }
  }

  return nextState;
}
