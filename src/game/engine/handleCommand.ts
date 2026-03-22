import { ROOM_NAME_TOKEN_END, ROOM_NAME_TOKEN_START } from "@game/constants";
import {
  getEncounterActionGuard,
  getEncounterMoveGuard,
  initializeEncounterStateOnEnter,
} from "@game/encounters/retryableEncounters";
import { drainRadioQueuedLog } from "@game/helpers/conversationHelpers";
import { buildRoomItemsDescription } from "@game/helpers/descriptionHelpers";
import {
  drainAfterRoomDescription,
  movePlayerToRoom,
  runScriptedEvents,
  triggerPlayerDeath,
} from "@game/helpers/gameHelpers";
import { getRoomById } from "@game/helpers/itemHelpers";
import { SCRIPTED_EVENTS } from "@game/helpers/scriptedEvents";
import { inventoryHasAll } from "@game/rules/state";
import {
  getDeferredWorldChunkForEntryRoom,
  isWorldChunkLoaded,
} from "src/world/World";
import { ACTION_HANDLERS } from "../actions";
import { canMoveThroughExit, resolveDoorDestination } from "../rules/doors";
import { getDoorById, getDoorState } from "../selectors/doorSelectors";
import { getCurrentRoom } from "../selectors/roomSelectors";
import { useUIOverlayStore } from "../store/store";
import { buildRoomDescription } from "../text/roomDescription";
import type { GameState } from "../types/gameTypes";
import type { ParsedCommand } from "../types/parserTypes";
import { advanceTurn } from "./turn";

// Maximum number of log entries to keep in memory
// Older entries are pruned to prevent unbounded memory growth during long play sessions
const MAX_LOG_ENTRIES = 500;

export function appendLog(state: GameState, text: string): GameState {
  const newLog = [...state.log, text];

  // Prune old entries if we exceed the maximum
  const prunedLog =
    newLog.length > MAX_LOG_ENTRIES ? newLog.slice(-MAX_LOG_ENTRIES) : newLog;

  return { ...state, log: prunedLog };
}

type HandleCommandOptions = {
  skipEcho?: boolean;
};

export async function handleCommand(
  state: GameState,
  cmd: ParsedCommand,
  options: HandleCommandOptions = {},
): Promise<GameState> {
  const { openOverlay } = useUIOverlayStore.getState();
  const DEATH_MARKER = "*** You have died ***";

  const room = getCurrentRoom(state);

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
      let moveMessage = "";

      if (state.worldState.conditionalExits[state.player.roomId]) {
        const conditionalExit =
          state.worldState.conditionalExits[state.player.roomId];
        if (conditionalExit.direction === cmd.direction) {
          const hasAllUnlockTriggers = inventoryHasAll(
            state.player.inventory,
            conditionalExit.unlockTriggers,
          );
          const hasAllConditionalTriggers = (
            conditionalExit.conditionalTriggers ?? []
          ).every(
            (triggerId) =>
              state.worldState.conditionalTriggers?.[triggerId] === true,
          );

          if (hasAllUnlockTriggers && hasAllConditionalTriggers) {
            // play the pass message
            moveMessage += conditionalExit.passMsg;
          } else {
            // play the block message and block
            message = conditionalExit.blockMsg;
            break;
          }
        }
      }

      let destinationRoomId: string | undefined;

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
          exit.direction,
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

      const encounterMoveGuard = getEncounterMoveGuard(state, {
        fromRoomId: state.player.roomId,
        direction: cmd.direction,
        destinationRoomId,
      });
      if (encounterMoveGuard) {
        if (encounterMoveGuard.kind === "death") {
          nextState = triggerPlayerDeath(
            state,
            encounterMoveGuard.deathMessage,
            encounterMoveGuard.deathCause,
          );
          message = encounterMoveGuard.deathMessage;
          consumesTurn = encounterMoveGuard.consumesTurn ?? false;
          break;
        }

        message = encounterMoveGuard.message;
        consumesTurn = encounterMoveGuard.consumesTurn ?? false;
        break;
      }

      if (
        !state.world.rooms.some(
          (candidate) => candidate.id === destinationRoomId,
        )
      ) {
        const requiredChunkId =
          getDeferredWorldChunkForEntryRoom(destinationRoomId);

        if (
          requiredChunkId &&
          !isWorldChunkLoaded(state.world, requiredChunkId)
        ) {
          const requestedChunkIds = Array.isArray(
            state.world.meta?.requestedChunkIds,
          )
            ? state.world.meta.requestedChunkIds
            : [];

          nextState = {
            ...state,
            world: {
              ...state.world,
              meta: {
                ...state.world.meta,
                requestedChunkIds: Array.from(
                  new Set([...requestedChunkIds, requiredChunkId]),
                ),
              },
            },
          };
        }

        message =
          requiredChunkId && !isWorldChunkLoaded(state.world, requiredChunkId)
            ? "The area beyond is still coming into focus. Give it a moment and try again."
            : "You can't go that way.";
        consumesTurn = false;
        break;
      }

      let next = movePlayerToRoom(state, destinationRoomId, {
        fromRoomId: state.player.roomId,
        via: cmd.direction,
      });

      if (destinationRoomId !== state.player.roomId) {
        next = runScriptedEvents(
          next,
          {
            kind: "onEnterRoom",
            roomId: destinationRoomId,
            fromRoomId: state.player.roomId,
          },
          SCRIPTED_EVENTS,
        );
      }

      const visitedRooms = next.worldState.visitedRooms ?? {};
      const nextVisitedRooms = { ...visitedRooms, [destinationRoomId]: true };
      next = {
        ...next,
        worldState: {
          ...next.worldState,
          visitedRooms: nextVisitedRooms,
        },
      };

      next = initializeEncounterStateOnEnter(next, destinationRoomId);

      nextState = next;
      message = moveMessage.trim();
      break;
    }

    case "action": {
      consumesTurn = true;

      const encounterActionGuard = getEncounterActionGuard(state, cmd);
      if (encounterActionGuard) {
        message = encounterActionGuard.message;
        consumesTurn = encounterActionGuard.consumesTurn;
        break;
      }

      const handler = ACTION_HANDLERS[cmd.verb];
      if (!handler) {
        message = "I don't understand that.";
        consumesTurn = false;
        break;
      }

      const result = await handler(state, cmd);
      nextState = result.state;
      message = result.message ?? "";
      consumesTurn = result.consumesTurn ?? true;
      if (result.overlay) openOverlay(result.overlay as any);
      break;
    }

    case "inventory": {
      consumesTurn = false;
      message = `You check your inventory.`;
      break;
    }

    case "diagnose": {
      consumesTurn = false;
      message = `You consult the bioreader.`;
      break;
    }

    case "comet": {
      consumesTurn = false;
      message = `You open Comet.`;
      break;
    }

    case "unknown":
    default: {
      consumesTurn = false;
      message = "I don't understand that.";
      break;
    }
  }

  if (
    cmd.type === "action" &&
    nextState.player.roomId !== state.player.roomId
  ) {
    nextState = runScriptedEvents(
      nextState,
      {
        kind: "onEnterRoom",
        roomId: nextState.player.roomId,
        fromRoomId: state.player.roomId,
      },
      SCRIPTED_EVENTS,
    );
  }

  if (cmd.type === "action") {
    nextState = runScriptedEvents(
      nextState,
      {
        kind: "onCommand",
        commandText: cmd.raw?.trim().toLowerCase(),
        commandVerb: cmd.verb,
        commandDirect: cmd.direct?.trim().toLowerCase(),
        roomId: nextState.player.roomId,
        fromRoomId: state.player.roomId,
      },
      SCRIPTED_EVENTS,
    );

    const visitedRooms = nextState.worldState.visitedRooms ?? {};
    nextState = {
      ...nextState,
      worldState: {
        ...nextState.worldState,
        visitedRooms: {
          ...visitedRooms,
          [nextState.player.roomId]: true,
        },
      },
    };
  }

  let tickLogEntries: string[] = [];
  let diedThisTurn = false;
  const logBeforeLen = (nextState as any).log?.length ?? 0;

  if (consumesTurn) {
    nextState = advanceTurn(nextState);

    const logAfter: string[] = (nextState as any).log ?? [];
    tickLogEntries = logAfter.slice(logBeforeLen);
    diedThisTurn = tickLogEntries.some((entry) => entry.includes(DEATH_MARKER));

    // Roll back log to the pre-advanceTurn state so we can append echo first.
    nextState = {
      ...nextState,
      log: logAfter.slice(0, logBeforeLen),
    } as any;

    nextState = runScriptedEvents(
      nextState,
      {
        kind: "onTurnEnd",
        roomId: nextState.player.roomId,
        fromRoomId: state.player.roomId,
        commandText:
          cmd.type === "action" || cmd.type === "unknown"
            ? cmd.raw.trim().toLowerCase()
            : undefined,
        commandVerb: cmd.type === "action" ? cmd.verb : undefined,
        commandDirect:
          cmd.type === "action" ? cmd.direct?.trim().toLowerCase() : undefined,
      },
      SCRIPTED_EVENTS,
    );
  }

  // If room changed, append destination room details from the UPDATED world state.
  if (nextState.player.roomId !== state.player.roomId && !diedThisTurn) {
    const destRoomId = nextState.player.roomId;
    const destRoomName = `${ROOM_NAME_TOKEN_START}${
      getRoomById(nextState, destRoomId)?.name
    }${ROOM_NAME_TOKEN_END}`;

    const roomDescNoItems = buildRoomDescription(nextState, destRoomId, {
      mode: "log",
      omitItems: true,
    });

    const drained = drainAfterRoomDescription(nextState);
    nextState = drained.state;

    const scripted = drained.lines.map((s) => s.trim()).filter(Boolean);

    const itemsDesc = buildRoomItemsDescription(nextState, destRoomId);

    if (cmd.type === "action") {
      message = [
        message.trim(),
        destRoomName,
        roomDescNoItems.trim(),
        ...scripted,
        itemsDesc.trim(),
      ]
        .filter(Boolean)
        .join("\n\n");
    } else {
      message = [
        message.trim(),
        roomDescNoItems.trim(),
        ...scripted,
        itemsDesc.trim(),
      ]
        .filter(Boolean)
        .join("\n\n");
    }
  }

  // Surface scripted narration queued by onCommand events even if no room change.
  if (
    cmd.type === "action" &&
    nextState.player.roomId === state.player.roomId
  ) {
    const drained = drainAfterRoomDescription(nextState);
    nextState = drained.state;

    if (drained.lines.length > 0) {
      message = [message.trim(), ...drained.lines.map((s) => s.trim())]
        .filter(Boolean)
        .join("\n\n");
    }
  }
  const roomName = `${ROOM_NAME_TOKEN_START}${
    getRoomById(nextState, nextState.player.roomId)?.name
  }${ROOM_NAME_TOKEN_END}`;

  // Build echo block
  let logWithEcho = "";
  if (options.skipEcho) {
    logWithEcho = message;
  } else if (cmd.type === "move") {
    if (nextState.player.roomId !== state.player.roomId) {
      if (diedThisTurn) {
        logWithEcho = [`> ${cmd.direction}`, message.trim()]
          .filter(Boolean)
          .join("\n");
      } else {
        logWithEcho = `> ${cmd.direction}\n${roomName}\n${message}`;
      }
    } else {
      logWithEcho = `> ${cmd.direction}\n${message}`;
    }
  } else if (cmd.type === "inventory") {
    logWithEcho = `> inventory\n${message}`;
  } else if (cmd.type === "action") {
    logWithEcho = `> ${cmd.raw}\n${message}`;
  } else if (cmd.type === "unknown") {
    logWithEcho = `> ${cmd.raw ?? "?"}\n${message}`;
  } else if (cmd.type === "diagnose") {
    logWithEcho = `> diagnose\n${message}`;
  } else if (cmd.type === "comet") {
    logWithEcho = `> comet\n${message}`;
  } else {
    // fallback
    logWithEcho = message;
  }

  // Append echo/response
  const finalLogText = logWithEcho.trim();
  if (finalLogText) {
    nextState = appendLog(
      nextState,
      finalLogText + (tickLogEntries.length === 0 ? "\n\n" : ""),
    );
  }

  {
    const drained = drainRadioQueuedLog(nextState);
    nextState = drained.state;
    for (const entry of drained.entries) {
      if (entry && entry.trim()) {
        nextState = appendLog(nextState, entry + "\n\n");
      }
    }
  }

  // append any tick messages that happened during advanceTurn()
  for (const entry of tickLogEntries) {
    if (entry && entry.trim()) {
      nextState = appendLog(nextState, entry + "\n\n");
    }
  }

  if (diedThisTurn) {
    const respawnRoomName = `${ROOM_NAME_TOKEN_START}${
      getRoomById(nextState, nextState.player.roomId)?.name
    }${ROOM_NAME_TOKEN_END}`;
    const respawnRoomDesc = buildRoomDescription(
      nextState,
      nextState.player.roomId,
      {
        mode: "log",
      },
    );

    nextState = appendLog(
      nextState,
      `${respawnRoomName}\n${respawnRoomDesc}`.trim() + "\n\n",
    );
  }

  return nextState;
}
