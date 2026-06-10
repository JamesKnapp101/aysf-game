import { appendLog } from "@game/engine/log";
import {
  getExitDestinationRoomId,
  moveItemToRoom as relocateItemToRoom,
} from "@game/helpers/itemHelpers";
import { stashItemInContainer } from "@game/helpers/itemPlacement";
import { hasParkEastPowerKeyBeenSnatched } from "@game/helpers/parkKeyHijack";
import { formatNameList } from "@game/rules/items";
import { getContainerContentsItems } from "@game/selectors/containerSelectors";
import { getItemsInRoom } from "@game/selectors/roomSelectors";
import { TickContext } from "@game/types/context";
import { GameState, TrashBotMode } from "@game/types/gameTypes";
import { Item } from "@game/types/itemTypes";
import { Exit } from "@game/types/roomTypes";

const TRASH_BOT_ID = "TrashBot";
const TRASH_BOT_BIN_ID = "TrashBotBin";
const PARK_DUMPSTER_ID = "ParkDumpster";
const PARK_MAINTENANCE_ROOM_ID = "ParkMaintenance";
const PARK_MAINTENANCE_INTERIOR_ROOM_ID = "ParkMaintenanceInterior";
const TRASH_BOT_MAINTENANCE_TRIGGER_ID = "TrashBotMaintenanceDoorOpen";
const TRASH_BOT_BIN_FULL_THRESHOLD = 3;

const TRASH_BOT_BIN_FULL_ANNOUNCEMENT =
  '"Trash collection bin full. Initiating bin emptying sequence."';
const TRASH_BOT_HIDDEN_DOOR_OPEN_TEXT =
  "With a soft mechanical whir, a hidden panel slides open, revealing a narrow passage into the concrete structure.";
const TRASH_BOT_HIDDEN_DOOR_CLOSE_TEXT =
  "The hidden panel slides shut again.";

function oppositeDir(dir: string): string {
  switch (dir) {
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
      return "nearby";
  }
}

function getTrashBotMode(state: GameState): TrashBotMode {
  return state.worldState.trashBot.mode ?? "wandering";
}

function setTrashBotState(
  state: GameState,
  patch: Partial<GameState["worldState"]["trashBot"]>,
): GameState {
  return {
    ...state,
    worldState: {
      ...state.worldState,
      trashBot: {
        ...state.worldState.trashBot,
        ...patch,
      },
    },
  };
}

function setMaintenanceDoorOpen(
  state: GameState,
  isOpen: boolean,
): GameState {
  return {
    ...state,
    worldState: {
      ...state.worldState,
      conditionalTriggers: {
        ...state.worldState.conditionalTriggers,
        [TRASH_BOT_MAINTENANCE_TRIGGER_ID]: isOpen,
      },
    },
  };
}

function logIfPlayerInRooms(
  state: GameState,
  roomIds: string[],
  text: string,
): GameState {
  if (!roomIds.includes(state.player.roomId)) return state;
  return appendLog(state, text);
}

function getDirectionBetweenRooms(
  state: GameState,
  fromRoomId: string,
  toRoomId: string,
): string | undefined {
  const room = state.world.rooms.find((candidate) => candidate.id === fromRoomId);
  if (!room) return undefined;

  return room.exits.find((exit) => {
    const dest = getExitDestinationRoomId(state, fromRoomId, exit);
    return dest === toRoomId;
  })?.direction;
}

function moveTrashBotToRoom(
  state: GameState,
  roomId: string,
): GameState {
  const moved = relocateItemToRoom(state, TRASH_BOT_ID, roomId);
  const movedIds = new Set([TRASH_BOT_ID, TRASH_BOT_BIN_ID]);

  return {
    ...moved,
    world: {
      ...moved.world,
      items: moved.world.items.map((it) =>
        movedIds.has(it.id) ? { ...it, location: roomId } : it,
      ),
    },
  };
}

function getTrashBotBinContents(state: GameState): Item[] {
  const bin = state.world.items.find((candidate) => candidate.id === TRASH_BOT_BIN_ID);
  if (!bin) return [];
  return getContainerContentsItems(state, bin);
}

function dumpTrashBotBinIntoDumpster(state: GameState): {
  dumped: Item[];
  state: GameState;
} {
  const dumped = getTrashBotBinContents(state);
  let next = state;

  for (const item of dumped) {
    next = stashItemInContainer(next, item.id, PARK_DUMPSTER_ID);
  }

  return { dumped, state: next };
}

function collectTrashInRoom(state: GameState, roomId: string) {
  const canCollectPowerKey = hasParkEastPowerKeyBeenSnatched(state);

  const collectableItems = getItemsInRoom(state, roomId).filter((candidate) => {
    if (candidate.id === TRASH_BOT_ID || candidate.id === TRASH_BOT_BIN_ID) {
      return false;
    }
    if (candidate.itemCategory !== "collectable") return false;
    if (candidate.id === "PowerStationKey" && !canCollectPowerKey) return false;
    return true;
  });

  let next = state;
  for (const candidate of collectableItems) {
    next = stashItemInContainer(next, candidate.id, TRASH_BOT_BIN_ID);
  }

  return { state: next, collected: collectableItems };
}

function getReachableHomeExits(
  state: GameState,
  currentRoomId: string,
  home: Set<string>,
  getRoomExits: TickContext["getRoomExits"],
) {
  return getRoomExits(currentRoomId)
    .map((exit) => ({
      exit,
      toRoomId: getExitDestinationRoomId(state, currentRoomId, exit),
    }))
    .filter((entry): entry is { exit: Exit; toRoomId: string } => !!entry.toRoomId)
    .filter(({ toRoomId }) => home.has(toRoomId));
}

function getNextStepTowardRoom(
  state: GameState,
  currentRoomId: string,
  targetRoomId: string,
  home: Set<string>,
  getRoomExits: TickContext["getRoomExits"],
): { exit: Exit; toRoomId: string } | undefined {
  if (currentRoomId === targetRoomId) return undefined;

  const queue: Array<{
    firstStep?: { exit: Exit; toRoomId: string };
    roomId: string;
  }> = [{ roomId: currentRoomId }];
  const visited = new Set([currentRoomId]);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const exits = getReachableHomeExits(state, current.roomId, home, getRoomExits);

    for (const step of exits) {
      if (visited.has(step.toRoomId)) continue;

      const firstStep = current.firstStep ?? step;
      if (step.toRoomId === targetRoomId) {
        return firstStep;
      }

      visited.add(step.toRoomId);
      queue.push({
        firstStep,
        roomId: step.toRoomId,
      });
    }
  }

  return undefined;
}

function logTravel(
  state: GameState,
  currentRoomId: string,
  destRoomId: string,
  dir: string,
): GameState {
  const playerRoomId = state.player.roomId;
  const latestMove = state.player.recentMoves?.[0];
  const playerMovedThisTurn =
    latestMove?.atTurn === state.moves &&
    latestMove.toRoomId === playerRoomId;
  const playerHereAtStart = currentRoomId === playerRoomId;
  const playerHereAtEnd = destRoomId === playerRoomId;
  const isPassBy =
    playerHereAtStart &&
    playerMovedThisTurn &&
    latestMove?.fromRoomId === destRoomId &&
    latestMove?.toRoomId === currentRoomId;

  if (playerHereAtStart) {
    if (isPassBy) {
      return appendLog(
        state,
        "You pass the trashbot as it putters by, its wire bin rattling softly.",
      );
    }

    return appendLog(state, `The trashbot putters off to the ${dir}.`);
  }

  if (playerHereAtEnd) {
    return appendLog(
      state,
      `The trashbot putters in from the ${oppositeDir(dir)}.`,
    );
  }

  return state;
}

function logNearbyFromDestination(
  state: GameState,
  currentRoomId: string,
  destRoomId: string,
): GameState {
  const playerRoomId = state.player.roomId;
  if (playerRoomId === currentRoomId || playerRoomId === destRoomId) {
    return state;
  }

  const dirFromPlayer = getDirectionBetweenRooms(state, playerRoomId, destRoomId);
  if (!dirFromPlayer) return state;
  const readableDir =
    dirFromPlayer === "out"
      ? "outside"
      : dirFromPlayer === "in"
        ? "inside"
        : dirFromPlayer;

  return appendLog(
    state,
    `The trashbot putters around off to the ${readableDir}.`,
  );
}

function beginMaintenanceRun(
  state: GameState,
  currentRoomId: string,
): GameState {
  let next = state;

  if (currentRoomId === state.player.roomId) {
    next = appendLog(next, TRASH_BOT_BIN_FULL_ANNOUNCEMENT);
  }

  if (currentRoomId === PARK_MAINTENANCE_ROOM_ID) {
    next = setMaintenanceDoorOpen(next, true);
    next = setTrashBotState(next, { mode: "door_open_for_entry" });
    return logIfPlayerInRooms(
      next,
      [PARK_MAINTENANCE_ROOM_ID, PARK_MAINTENANCE_INTERIOR_ROOM_ID],
      TRASH_BOT_HIDDEN_DOOR_OPEN_TEXT,
    );
  }

  return setTrashBotState(next, {
    mode: "returning_to_maintenance",
  });
}

function tickTrashBot({
  state,
  item,
  rng,
  getRoomExits,
}: TickContext): GameState | void {
  const currentRoomId = state.itemState.itemRoomId[item.id] ?? item.location;
  const playerRoomId = state.player.roomId;
  const homeRooms = new Set((item.meta?.homeRegion ?? []) as string[]);
  const activeRooms = new Set([
    ...homeRooms,
    PARK_MAINTENANCE_INTERIOR_ROOM_ID,
  ]);

  if (!currentRoomId || !activeRooms.has(playerRoomId)) return;

  let next = state;
  let mode = getTrashBotMode(next);

  if (mode === "wandering" && getTrashBotBinContents(next).length >= TRASH_BOT_BIN_FULL_THRESHOLD) {
    next = beginMaintenanceRun(next, currentRoomId);
    mode = getTrashBotMode(next);
    if (mode === "door_open_for_entry") {
      return next;
    }
  }

  if (mode === "wandering" && (next.worldState.trashBot?.cooldownTurns ?? 0) > 0) {
    return {
      ...next,
      worldState: {
        ...next.worldState,
        trashBot: {
          ...next.worldState.trashBot,
          cooldownTurns: Math.max(
            0,
            (next.worldState.trashBot?.cooldownTurns ?? 0) - 1,
          ),
        },
      },
    };
  }

  switch (mode) {
    case "door_open_for_entry": {
      next = setMaintenanceDoorOpen(next, true);
      next = moveTrashBotToRoom(next, PARK_MAINTENANCE_INTERIOR_ROOM_ID);

      if (playerRoomId === PARK_MAINTENANCE_ROOM_ID) {
        next = appendLog(
          next,
          "The trashbot putters through the hidden opening and disappears inside the concrete structure.",
        );
      } else if (playerRoomId === PARK_MAINTENANCE_INTERIOR_ROOM_ID) {
        next = appendLog(
          next,
          "The trashbot putters in through the opening and rolls toward the dumpster.",
        );
      }

      return setTrashBotState(next, { mode: "inside_waiting_to_dump" });
    }
    case "inside_waiting_to_dump": {
      const dumped = dumpTrashBotBinIntoDumpster(next);
      next = dumped.state;

      if (playerRoomId === PARK_MAINTENANCE_INTERIOR_ROOM_ID) {
        if (dumped.dumped.length > 0) {
          next = appendLog(
            next,
            `The trashbot tips ${formatNameList(
              dumped.dumped.map((item) => item.name),
            )} out of its wire bin and into the dumpster.`,
          );
        } else {
          next = appendLog(
            next,
            "The trashbot rattles its wire bin over the dumpster, but nothing falls out.",
          );
        }
      }

      next = setMaintenanceDoorOpen(next, false);
      next = logIfPlayerInRooms(
        next,
        [PARK_MAINTENANCE_ROOM_ID, PARK_MAINTENANCE_INTERIOR_ROOM_ID],
        TRASH_BOT_HIDDEN_DOOR_CLOSE_TEXT,
      );
      return setTrashBotState(next, { mode: "inside_waiting_to_exit" });
    }
    case "inside_waiting_to_exit": {
      next = setMaintenanceDoorOpen(next, true);
      next = logIfPlayerInRooms(
        next,
        [PARK_MAINTENANCE_ROOM_ID, PARK_MAINTENANCE_INTERIOR_ROOM_ID],
        TRASH_BOT_HIDDEN_DOOR_OPEN_TEXT,
      );
      return setTrashBotState(next, { mode: "door_open_for_exit" });
    }
    case "door_open_for_exit": {
      next = setMaintenanceDoorOpen(next, true);
      next = moveTrashBotToRoom(next, PARK_MAINTENANCE_ROOM_ID);

      if (playerRoomId === PARK_MAINTENANCE_INTERIOR_ROOM_ID) {
        next = appendLog(
          next,
          "The trashbot putters back out through the opening.",
        );
      } else if (playerRoomId === PARK_MAINTENANCE_ROOM_ID) {
        next = appendLog(
          next,
          "The trashbot putters out from the hidden opening.",
        );
      }

      return setTrashBotState(next, { mode: "outside_waiting_to_close" });
    }
    case "outside_waiting_to_close": {
      next = setMaintenanceDoorOpen(next, false);
      next = logIfPlayerInRooms(
        next,
        [PARK_MAINTENANCE_ROOM_ID, PARK_MAINTENANCE_INTERIOR_ROOM_ID],
        TRASH_BOT_HIDDEN_DOOR_CLOSE_TEXT,
      );
      return setTrashBotState(next, { mode: "wandering" });
    }
    default:
      break;
  }

  if (mode === "wandering" && !homeRooms.has(currentRoomId)) {
    const safeRoomId = Array.from(homeRooms)[0];
    if (!safeRoomId) return next;
    return moveTrashBotToRoom(next, safeRoomId);
  }

  const acts = mode === "wandering" ? rng() >= 0.6 : true;
  if (!acts) {
    return next;
  }

  let chosen: { exit: Exit; toRoomId: string } | undefined;

  if (mode === "returning_to_maintenance") {
    chosen = getNextStepTowardRoom(
      next,
      currentRoomId,
      PARK_MAINTENANCE_ROOM_ID,
      homeRooms,
      getRoomExits,
    );
  } else {
    const exits = getReachableHomeExits(next, currentRoomId, homeRooms, getRoomExits);
    if (exits.length > 0) {
      chosen = exits[Math.floor(rng() * exits.length)];
    }
  }

  if (!chosen) return next;
  const destRoomId = chosen.toRoomId;
  const dir = chosen.exit.direction;
  const playerHereAtEnd = destRoomId === playerRoomId;

  next = logTravel(next, currentRoomId, destRoomId, dir);
  next = moveTrashBotToRoom(next, destRoomId);

  if (destRoomId !== PARK_MAINTENANCE_INTERIOR_ROOM_ID) {
    const collected = collectTrashInRoom(next, destRoomId);
    next = collected.state;

    if (playerHereAtEnd && collected.collected.length > 0) {
      next = appendLog(
        next,
        `The trashbot's brushes whisk ${formatNameList(
          collected.collected.map((candidate) => candidate.name),
        )} into its wire bin.`,
      );
    } else {
      next = logNearbyFromDestination(next, currentRoomId, destRoomId);
    }

    if (
      mode === "wandering" &&
      getTrashBotBinContents(next).length >= TRASH_BOT_BIN_FULL_THRESHOLD
    ) {
      if (playerHereAtEnd) {
        next = appendLog(next, TRASH_BOT_BIN_FULL_ANNOUNCEMENT);
      }

      if (destRoomId === PARK_MAINTENANCE_ROOM_ID) {
        next = setMaintenanceDoorOpen(next, true);
        next = setTrashBotState(next, { mode: "door_open_for_entry" });
        return logIfPlayerInRooms(
          next,
          [PARK_MAINTENANCE_ROOM_ID, PARK_MAINTENANCE_INTERIOR_ROOM_ID],
          TRASH_BOT_HIDDEN_DOOR_OPEN_TEXT,
        );
      }

      return setTrashBotState(next, { mode: "returning_to_maintenance" });
    }
  } else {
    next = logNearbyFromDestination(next, currentRoomId, destRoomId);
  }

  if (mode === "returning_to_maintenance" && destRoomId === PARK_MAINTENANCE_ROOM_ID) {
    next = setMaintenanceDoorOpen(next, true);
    next = setTrashBotState(next, { mode: "door_open_for_entry" });
    return logIfPlayerInRooms(
      next,
      [PARK_MAINTENANCE_ROOM_ID, PARK_MAINTENANCE_INTERIOR_ROOM_ID],
      TRASH_BOT_HIDDEN_DOOR_OPEN_TEXT,
    );
  }

  return next;
}

export const trashBotItems: Item[] = [
  {
    id: "TrashBot",
    name: "The little trash bot",
    itemCategory: "animate",
    initialDescription: `A little robot with treads putters around nearby.`,
    description: `This robot has a cylindrical body atop a pair of treads that it uses to get around. In front it has a pair of brushes that scour the dirt and grass, flicking any foreign objects toward the chute between them.`,
    location: "ParkMaintenance",
    vocab: [
      "trash",
      "robot",
      "bot",
      "trashbot",
      "little robot",
      "sweeper",
      "sweepbot",
    ],
    meta: {
      isAlive: true,
      canMove: true,
      canOpenDoors: false,
      vision: "dark",
      hostility: "neutral",
      homeRegion: [
        "ParkEast",
        "ParkSouth",
        "ParkWest",
        "ParkNorth",
        "ParkMaintenance",
        "ParkCenter",
      ],
    },
    itemClass: "solid",
    itemWeight: 2,
    itemSize: 2,
    overrides: {
      tick: (ctx: TickContext) => tickTrashBot(ctx),
    },
  },
  {
    id: "TrashBotBin",
    name: "trash bot bin",
    itemCategory: "scenery",
    sceneryDescription: `On the back of the robot is a wire bin.`,
    description: `The wire bin is cubical in shape and made from sturdy wire mesh, making it easy to see anything caught inside while leaving no obvious way to reach in.`,
    describeLookThrough: (state, item) => {
      const contents = getContainerContentsItems(state, item);
      if (contents.length === 0) {
        return "Through the wire mesh you can see that the trash bot's bin is empty.";
      }

      return `Through the wire mesh you can see ${formatNameList(
        contents.map((candidate) => candidate.name),
      )}.`;
    },
    location: "ParkMaintenance",
    vocab: ["trash", "bin", "bucket"],
    itemClass: "solid",
    isContainer: true,
    isOpenable: false,
    itemWeight: 2,
    itemSize: 2,
    meta: {
      transparentContainer: true,
      contentsAccessibleWhenClosed: false,
      contentsAccessMessage:
        "You can see through the wire mesh, but you can't get at anything inside the trash bot's bin.",
    },
    overrides: {
      open: "The wire bin is fixed to the trashbot, and there's no obvious way to open it.",
    },
  },
];
