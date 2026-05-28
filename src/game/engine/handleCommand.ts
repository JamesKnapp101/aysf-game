import { ROOM_NAME_TOKEN_END, ROOM_NAME_TOKEN_START } from "@game/constants";
import {
  getEncounterActionGuard,
  getEncounterMoveGuard,
  initializeEncounterStateOnEnter,
} from "@game/encounters/retryableEncounters";
import { createFreshGameState, mergeWorldChunkIntoState } from "@game/gameInit";
import { drainRadioQueuedLog } from "@game/helpers/conversationHelpers";
import {
  drainAfterRoomDescription,
  movePlayerToRoom,
  runScriptedEvents,
  triggerPlayerDeath,
} from "@game/helpers/gameHelpers";
import { getRoomById } from "@game/helpers/itemHelpers";
import { removeItemFromPlacementLists } from "@game/helpers/itemPlacement";
import { SCRIPTED_EVENTS } from "@game/helpers/scriptedEvents";
import {
  clearManualSnapshot,
  clearResumeSnapshot,
  restoreManualSnapshot,
  saveManualSnapshot,
} from "@game/persistence/resumeStorage";
import { applyPreserveRoomEntryEffects } from "@game/preserve/preserveEffects";
import { updateItemLocation } from "@game/rules/items";
import { addToInventory, inventoryHasAll } from "@game/rules/state";
import {
  DEFERRED_WORLD_CHUNK_IDS,
  getDeferredWorldChunkForEntryRoom,
  isWorldChunkLoaded,
  loadWorldChunk,
} from "src/world/World";
import { ACTION_HANDLERS } from "../actions";
import { resolveRegisteredMovementRule } from "../registries/movementRuleRegistry";
import { canMoveThroughExit, resolveDoorDestination } from "../rules/doors";
import { getDoorById, getDoorState } from "../selectors/doorSelectors";
import { getCurrentRoom } from "../selectors/roomSelectors";
import { useUIOverlayStore } from "../store/store";
import { buildTranscriptRoomDescription } from "../text/roomDescription";
import type { GameState } from "../types/gameTypes";
import type { ParsedCommand } from "../types/parserTypes";
import { advanceTurn } from "./turn";

// Maximum number of log entries to keep in memory
// Older entries are pruned to prevent unbounded memory growth during long play sessions
const MAX_LOG_ENTRIES = 500;
const DEVELOPER_MODE_ITEM_IDS = [
  "MensLockerKey1",
  "ECigar",
  "ParkPass",
  "MindGun",
  "MindCap",
  "inframaroonbadge",
  "ultravioletbadge",
  "maroonbadge",
  "violetbadge",
  "bluebadge",
  "orangebadge",
  "greenbadge",
  "yellowbadge",
  "whitebadge",
  "flashlight",
  "AllPurposeAdhesive",
] as const;

function moveItemIntoPlayerInventory(
  state: GameState,
  itemId: string,
): GameState {
  let next = {
    ...state,
    itemState: {
      ...state.itemState,
      containerContents: removeItemFromPlacementLists(
        state.itemState.containerContents,
        itemId,
      ),
      surfaceContents: removeItemFromPlacementLists(
        state.itemState.surfaceContents,
        itemId,
      ),
      underContents: removeItemFromPlacementLists(
        state.itemState.underContents,
        itemId,
      ),
      searchableContents: removeItemFromPlacementLists(
        state.itemState.searchableContents,
        itemId,
      ),
      attachedTo: {
        ...state.itemState.attachedTo,
        [itemId]: undefined,
      },
    },
  };

  next = updateItemLocation(next, itemId, "INVENTORY");
  next = addToInventory(next, itemId);

  return next;
}

async function hydrateDeveloperModeItemDefinitions(
  state: GameState,
): Promise<GameState> {
  let nextState = state;
  let knownItemIds = new Set(nextState.world.items.map((item) => item.id));

  if (DEVELOPER_MODE_ITEM_IDS.every((itemId) => knownItemIds.has(itemId))) {
    return nextState;
  }

  for (const chunkId of DEFERRED_WORLD_CHUNK_IDS) {
    if (isWorldChunkLoaded(nextState.world, chunkId)) {
      knownItemIds = new Set(nextState.world.items.map((item) => item.id));
      if (DEVELOPER_MODE_ITEM_IDS.every((itemId) => knownItemIds.has(itemId))) {
        break;
      }
      continue;
    }

    const missingItemIds = new Set(
      DEVELOPER_MODE_ITEM_IDS.filter((itemId) => !knownItemIds.has(itemId)),
    );
    const chunk = await loadWorldChunk(chunkId);

    if (
      !chunk.items.some((item) =>
        missingItemIds.has(item.id as (typeof DEVELOPER_MODE_ITEM_IDS)[number]),
      )
    ) {
      continue;
    }

    nextState = mergeWorldChunkIntoState(nextState, chunkId, chunk);
    knownItemIds = new Set(nextState.world.items.map((item) => item.id));
    if (DEVELOPER_MODE_ITEM_IDS.every((itemId) => knownItemIds.has(itemId))) {
      break;
    }
  }

  return nextState;
}

async function grantDeveloperModeItems(state: GameState): Promise<GameState> {
  const stateWithItemDefinitions =
    await hydrateDeveloperModeItemDefinitions(state);

  return DEVELOPER_MODE_ITEM_IDS.reduce(
    (nextState, itemId) => moveItemIntoPlayerInventory(nextState, itemId),
    stateWithItemDefinitions,
  );
}

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
  let forceRoomDescription = false;

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

      const movementRule = resolveRegisteredMovementRule(state, {
        destinationRoomId,
        direction: cmd.direction,
        fromRoomId: state.player.roomId,
      });

      if (movementRule?.kind === "block") {
        nextState = movementRule.state ?? state;
        message = [moveMessage.trim(), movementRule.message]
          .filter(Boolean)
          .join("\n\n");
        break;
      }

      if (movementRule?.message) {
        moveMessage = [moveMessage.trim(), movementRule.message]
          .filter(Boolean)
          .join("\n\n");
      }

      const stateBeforeMove = movementRule?.state ?? state;

      let next = movePlayerToRoom(stateBeforeMove, destinationRoomId, {
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
      next = applyPreserveRoomEntryEffects(next, destinationRoomId, {
        direction: cmd.direction,
        fromRoomId: state.player.roomId,
      });

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

    case "help": {
      consumesTurn = false;
      openOverlay({ kind: "help" });
      message = "You open the help screen.";
      break;
    }

    case "save": {
      consumesTurn = false;
      message = saveManualSnapshot(state)
        ? "Progress saved."
        : "Unable to save your progress right now.";
      break;
    }

    case "restore": {
      consumesTurn = false;
      const restored = await restoreManualSnapshot();

      if (!restored) {
        message = "You don't have a saved game to restore.";
        break;
      }

      nextState = restored;
      message = "Progress restored.";
      break;
    }

    case "restart": {
      consumesTurn = false;
      nextState = await createFreshGameState();
      clearManualSnapshot();
      clearResumeSnapshot();
      forceRoomDescription = true;
      message = "Game restarted.";
      break;
    }

    case "developerMode": {
      consumesTurn = false;
      nextState = await grantDeveloperModeItems(state);
      message = "Developer mode enabled. Test items granted.";
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
    nextState = initializeEncounterStateOnEnter(
      nextState,
      nextState.player.roomId,
    );
    nextState = applyPreserveRoomEntryEffects(
      nextState,
      nextState.player.roomId,
      {
        fromRoomId: state.player.roomId,
      },
    );
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
  let preRoomTickLogEntries: string[] = [];
  let diedThisTurn = false;
  const logBeforeLen = (nextState as any).log?.length ?? 0;

  if (consumesTurn) {
    const roomIdBeforeTurn = nextState.player.roomId;
    const activeExperienceBeforeTurn = Boolean(
      nextState.worldState.activeExperience,
    );

    nextState = advanceTurn(nextState);

    const logAfter: string[] = (nextState as any).log ?? [];
    tickLogEntries = logAfter.slice(logBeforeLen);
    diedThisTurn = tickLogEntries.some((entry) => entry.includes(DEATH_MARKER));
    const experienceTickMovedRoom =
      activeExperienceBeforeTurn &&
      nextState.player.roomId !== roomIdBeforeTurn;

    if (experienceTickMovedRoom && !diedThisTurn) {
      preRoomTickLogEntries = tickLogEntries;
      tickLogEntries = [];
    }

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
  if (
    (nextState.player.roomId !== state.player.roomId || forceRoomDescription) &&
    !diedThisTurn
  ) {
    const destRoomId = nextState.player.roomId;
    const wasVisitedBeforeCommand = forceRoomDescription
      ? false
      : Boolean((state.worldState.visitedRooms ?? {})[destRoomId]);
    const destRoomName = `${ROOM_NAME_TOKEN_START}${
      getRoomById(nextState, destRoomId)?.name
    }${ROOM_NAME_TOKEN_END}`;
    const roomTranscriptDesc = buildTranscriptRoomDescription(
      nextState,
      destRoomId,
      {
        isFirstVisit: !wasVisitedBeforeCommand,
      },
    );
    const roomEntryBlock = roomTranscriptDesc.trim()
      ? `${destRoomName}\n${roomTranscriptDesc.trim()}`
      : destRoomName;

    const drained = drainAfterRoomDescription(nextState);
    nextState = drained.state;

    const scripted = drained.lines.map((s) => s.trim()).filter(Boolean);

    const preRoomTickLines = preRoomTickLogEntries
      .map((entry) => entry.trim())
      .filter(Boolean);

    message = [message.trim(), ...preRoomTickLines, roomEntryBlock, ...scripted]
      .filter(Boolean)
      .join("\n\n");

    if (nextState.worldState.catState.suppressRoomListOnce) {
      nextState = {
        ...nextState,
        worldState: {
          ...nextState.worldState,
          catState: {
            ...nextState.worldState.catState,
            suppressRoomListOnce: false,
          },
        },
      };
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
      const scriptedLines = drained.lines.map((s) => s.trim()).filter(Boolean);
      const trimmedMessage = message.trim();

      if (
        trimmedMessage === "You don't see that here." &&
        scriptedLines.length > 0
      ) {
        message = scriptedLines.join("\n\n");
      } else {
        message = [trimmedMessage, ...scriptedLines]
          .filter(Boolean)
          .join("\n\n");
      }
    }
  }
  // Build echo block
  let logWithEcho = "";
  if (options.skipEcho) {
    logWithEcho = message;
  } else if (cmd.type === "move") {
    logWithEcho = `> ${cmd.direction}\n${message}`;
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
  } else if (cmd.type === "help") {
    logWithEcho = `> help\n${message}`;
  } else if (cmd.type === "save") {
    logWithEcho = `> save\n${message}`;
  } else if (cmd.type === "restore") {
    logWithEcho = `> restore\n${message}`;
  } else if (cmd.type === "restart") {
    logWithEcho = `> restart\n${message}`;
  } else if (cmd.type === "developerMode") {
    logWithEcho = `> ${cmd.raw}\n${message}`;
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
    const wasRespawnRoomVisitedBeforeCommand = Boolean(
      (state.worldState.visitedRooms ?? {})[nextState.player.roomId],
    );
    const respawnRoomName = `${ROOM_NAME_TOKEN_START}${
      getRoomById(nextState, nextState.player.roomId)?.name
    }${ROOM_NAME_TOKEN_END}`;
    const respawnRoomDesc = buildTranscriptRoomDescription(
      nextState,
      nextState.player.roomId,
      {
        isFirstVisit: !wasRespawnRoomVisitedBeforeCommand,
      },
    );

    nextState = appendLog(
      nextState,
      [respawnRoomName, respawnRoomDesc].filter(Boolean).join("\n").trim() +
        "\n\n",
    );
  }

  return nextState;
}
