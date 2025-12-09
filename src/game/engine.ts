import type { ParsedCommand } from "../parse/parser";
import {
  getCurrentRoom,
  getDoorById,
  getDoorState,
  getItemById,
  getItemsInCurrentRoom,
  getItemsInInventory,
  resolveDoorByNoun,
  resolveItemByNoun,
} from "./selectors";
import type {
  DoorDefinition,
  DoorKind,
  DoorState,
  Exit,
  GameState,
  Item,
  ItemOverrideVerb,
  RoomExit,
  TeleportPadDefinition,
} from "../world/types";

export function appendLog(state: GameState, text: string): GameState {
  return { ...state, log: [...state.log, text] };
}

function describeActionResult(
  item: Item,
  verb: ItemOverrideVerb,
  fallback: string
): string {
  return item.overrides?.[verb] ?? fallback;
}
function isItemOpen(state: GameState, itemId: string): boolean {
  return !!state.openItems[itemId];
}

function setItemOpen(
  state: GameState,
  itemId: string,
  open: boolean
): GameState {
  return {
    ...state,
    openItems: {
      ...state.openItems,
      [itemId]: open,
    },
  };
}

// --- Items / inventory ------------------------------------------------------

function updateItemLocation(
  state: GameState,
  itemId: string,
  location: string
): GameState {
  return {
    ...state,
    world: {
      ...state.world,
      items: state.world.items.map((it) =>
        it.id === itemId ? { ...it, location } : it
      ),
    },
  };
}

function takeItem(state: GameState, noun: string): GameState {
  const itemsHere = getItemsInCurrentRoom(state, state.playerRoomId);
  const lower = noun.toLowerCase();

  const item = itemsHere.find(
    (i) => i.vocab.includes(lower) || i.name.toLowerCase() === lower
  );

  if (!item) {
    return appendLog(state, "You don't see that here.");
  }

  if (item.itemCategory === "scenery") {
    return appendLog(state, "You can’t take that.");
  }

  const next = updateItemLocation(state, item.id, "INVENTORY");
  return appendLog(next, "Taken.");
}

export function dropItem(state: GameState, noun: string): GameState {
  const inv = getItemsInInventory(state);
  const lower = noun.toLowerCase();

  const item = inv.find(
    (i) => i.name.toLowerCase() === lower || i.vocab.includes(lower)
  );
  if (!item) return appendLog(state, "You aren't carrying that.");

  const next = updateItemLocation(state, item.id, state.playerRoomId);
  return appendLog(next, "Dropped.");
}

function isItemOpenable(item: Item): boolean {
  // For now, treat containers as openable.
  // If you later add item.isOpenable, use that instead or in addition.
  return !!item.isContainer;
}

export function tryOpenItem(
  state: GameState,
  item: Item
): { state: GameState; message: string } {
  if (!isItemOpenable(item)) {
    return {
      state,
      message: "You can't open that.",
    };
  }

  if (isItemOpen(state, item.id)) {
    return {
      state,
      message: "It's already open.",
    };
  }

  // Mark the item as open
  const updatedState = setItemOpen(state, item.id, true);

  // Use override text if present, otherwise generic "Opened."
  const message = item.overrides?.open ?? "Opened.";

  return {
    state: updatedState,
    message,
  };
}

// --- Doors  ------------------------

function getVisibleDoorsInRoom(
  state: GameState,
  roomId: string
): DoorDefinition[] {
  const room = state.world.rooms.find((r) => r.id === roomId);
  if (!room) return [];

  const doorIds = room.exits
    .map((e) => e.doorId)
    .filter((id): id is string => Boolean(id));

  const uniqueDoorIds = [...new Set(doorIds)];

  return uniqueDoorIds
    .map((id) => state.world.doors.find((d) => d.id === id))
    .filter((d): d is DoorDefinition => Boolean(d));
}

// Movement only needs to know “if I’m in A, what’s on the other side?”
function resolveDoorDestination(
  doorDef: DoorDefinition,
  fromRoomId: string
): string | undefined {
  const { roomAId, roomBId } = doorDef.connects;

  if (fromRoomId === roomAId) return roomBId;
  if (fromRoomId === roomBId) return roomAId;

  return undefined;
}

function canMoveThroughExit(
  state: GameState,
  exit: Exit,
  doorDef?: DoorDefinition,
  doorState?: DoorState,
  direction?: string
): { allowed: boolean; message?: string } {
  if (!doorDef) {
    // No door associated with this exit: free to move
    return { allowed: true };
  }

  const kind: DoorKind = doorDef.kind ?? "normal";

  // --- Badge-locked automatic doors ---
  if (kind === "badgeScanner") {
    const badgeId = doorDef.badgeItemId;

    if (!badgeId || doorDef.checkBadgeOnDir !== direction) {
      // Misconfigured door; fail open rather than soft-locking the game
      return { allowed: true };
    }
    const inventoryItems = getItemsInInventory(state);
    const hasBadge = inventoryItems.some((item: Item) => item.id === badgeId);

    if (!hasBadge) {
      return {
        allowed: false,
        message:
          "The door refuses to open as you approach it.  The badge scanner emits a flat buzz and a red light on it's surface flashes.",
      };
    }

    // Player has the badge: door silently opens and allows passage.
    // We ignore doorState.isOpen/isLocked for these.
    return {
      allowed: true,
      message:
        "The badge scanner flashes a barely visible laser that flickers over you. It seems to find what it was looking for and emits a satisfied chirp, then the door opens with a hydrolic sigh as you pass through.",
    };
  }

  // --- Normal doors and anything else fall through to existing logic ---

  if (!doorState) {
    // No state tracked, treat as open/passable
    return { allowed: true };
  }

  if (!doorState.isOpen) {
    return { allowed: false, message: "The door is closed." };
  }

  // You can later branch on other kinds here (airlocks, scripted, etc.)
  return { allowed: true };
}

function updateDoor(state: GameState, updated: DoorDefinition): GameState {
  return {
    ...state,
    world: {
      ...state.world,
      doors: state.world.doors.map((d) => (d.id === updated.id ? updated : d)),
    },
  };
}

function playerHasBadge(state: GameState, badgeId: string): boolean {
  return state.inventory.includes(badgeId);
}

function upsertDoorState(state: GameState, updated: DoorState): GameState {
  const idx = state.doorStates.findIndex((ds) => ds.id === updated.id);
  if (idx === -1) {
    return {
      ...state,
      doorStates: [...state.doorStates, updated],
    };
  }

  const nextDoorStates = [...state.doorStates];
  nextDoorStates[idx] = updated;
  return {
    ...state,
    doorStates: nextDoorStates,
  };
}

// --- Advanced door logic (keyed / badges) using DoorDefinition/State -------
// These are *not* wired into movement yet, but the types are now consistent.

export function tryOpenDoor(
  state: GameState,
  doorDef: DoorDefinition,
  doorState: DoorState
): { state: GameState; message: string } {
  // already open
  if (doorState.isOpen) {
    return { state, message: "The door is already open." };
  }

  if (doorDef.badgeItemId) {
    if (!playerHasBadge(state, doorDef.badgeItemId)) {
      return {
        state,
        message: "The doors are automatic, just walk in that direction.",
      };
    }
  }
  // work with a copy, not the original
  let nextDoorState: DoorState = { ...doorState };
  let nextState: GameState = state;

  if (nextDoorState.isLocked) {
    switch (doorDef.kind) {
      case "keyed": {
        if (!doorDef.keyItemId) {
          return { state, message: "It's locked." };
        }

        const hasKey = nextState.inventory.includes(doorDef.keyItemId);
        if (!hasKey) {
          return {
            state,
            message: "It's locked. You don't have the right key.",
          };
        }

        // unlock
        nextDoorState.isLocked = false;
        break;
      }

      case "badgeScanner": {
        if (!doorDef.badgeItemId) {
          return { state, message: "The scanner flashes red." };
        }

        const hasBadge = nextState.inventory.includes(doorDef.badgeItemId);
        if (!hasBadge) {
          return {
            state,
            message: "The scanner glows red. Nothing happens.",
          };
        }

        nextDoorState.isLocked = false;
        break;
      }

      case "airlock":
      case "scripted":
        // placeholder until scripts are wired in
        return { state, message: "It's locked." };

      default:
        return { state, message: "It's locked." };
    }
  }

  // if we get here, it was unlocked or we just unlocked it
  nextDoorState.isOpen = true;
  nextState = upsertDoorState(nextState, nextDoorState);

  const openVerb = doorDef.openVerb ?? "opens";
  return {
    state: nextState,
    message: `The ${doorDef.name.toLowerCase()} ${openVerb}.`,
  };
}

export function tryCloseDoor(
  state: GameState,
  doorDef: DoorDefinition,
  doorState: DoorState
): string {
  if (!doorState.isOpen) {
    return "It's already closed.";
  }
  doorState.isOpen = false;
  const closeVerb = doorDef.closeVerb ?? "closes";
  return `The ${doorDef.name.toLowerCase()} ${closeVerb}.`;
}

function getDoorDescriptionForRoom(
  doorDef: DoorDefinition,
  roomId: string
): string | undefined {
  const { connects } = doorDef;

  if (roomId === connects.roomAId) {
    return doorDef.descriptionFromA ?? doorDef.description;
  }

  if (roomId === connects.roomBId) {
    return doorDef.descriptionFromB ?? doorDef.description;
  }

  // If the room isn't one of the endpoints, just fall back
  return doorDef.description;
}

export function buildRoomDescription(state: GameState, roomId: string): string {
  const room = state.world.rooms.find((room) => room.id === roomId);
  if (!room) return "You are nowhere. (Bug: room not found.)";

  const itemsHere = getItemsInCurrentRoom(state, roomId);
  const sceneryItems = itemsHere.filter(
    (item) => item.itemCategory === "scenery"
  );
  const nonSceneryItems = itemsHere.filter(
    (item) => item.itemCategory !== "scenery"
  );

  const doorsHere = getVisibleDoorsInRoom(state, roomId);

  const parts: string[] = [];

  // 1) Base room description
  parts.push(`${room.description.trim()}`);

  // 2) Scenery item descriptions (these are your “room dressing” lines)
  if (sceneryItems.length > 0) {
    const sceneryText = sceneryItems
      .map((item) => item.sceneryDescription?.trim())
      .filter(Boolean)
      .join("\n\n");
    if (sceneryText) {
      parts.push(sceneryText);
    }
  }

  // 3) Door descriptions
  if (doorsHere.length > 0) {
    const doorText = doorsHere
      .map((door) => getDoorDescriptionForRoom(door, roomId))
      .filter((t): t is string => Boolean(t && t.trim()))
      .join("\n\n");

    if (doorText) {
      parts.push(doorText);
    }
  }

  // 4) Non-scenery items list

  if (nonSceneryItems.length > 0) {
    const names = nonSceneryItems.map((item) => item.name).join(", ");
    parts.push(`You can also see ${names}.`);
  }

  return parts.join("\n\n");
}

function getTeleportPadsInCurrentRoom(
  state: GameState
): TeleportPadDefinition[] {
  return state.world.teleportPads.filter(
    (pad) => pad.roomId === state.playerRoomId
  );
}

function describeTeleportPads(state: GameState): string[] {
  const padsHere = state.world.teleportPads.filter(
    (pad) => pad.roomId === state.playerRoomId
  );

  return padsHere.map((pad) => `A ${pad.label} glows faintly on the floor.`);
}

export function activateTeleportPad(
  state: GameState,
  pad: TeleportPadDefinition
): GameState {
  const ringPads = state.world.teleportPads
    .filter((p) => p.ringId === pad.ringId)
    .sort((a, b) => a.order - b.order);

  if (ringPads.length <= 1) {
    return appendLog(state, "Nothing happens.");
  }

  const index = ringPads.findIndex((p) => p.id === pad.id);
  const nextIndex = (index + 1) % ringPads.length;
  const dest = ringPads[nextIndex];

  const destRoom = state.world.rooms.find((r) => r.id === dest.roomId);
  const destName = destRoom?.name ?? "somewhere else";

  const newState: GameState = {
    ...state,
    playerRoomId: dest.roomId,
  };

  return appendLog(
    newState,
    `You step onto the ${pad.label}. The world twists around you and you find yourself in ${destName}.`
  );
}

function resolveTeleportPadByNoun(
  state: GameState,
  noun: string | null
): TeleportPadDefinition | null {
  const padsHere = getTeleportPadsInCurrentRoom(state);
  if (!padsHere.length) return null;

  if (!noun) {
    // Allow bare "step" if there's only one pad here
    return padsHere.length === 1 ? padsHere[0] : null;
  }

  const lower = noun.toLowerCase();

  return (
    padsHere.find((p) => p.label.toLowerCase() === lower) ??
    padsHere.find((p) => p.label.toLowerCase().includes(lower)) ??
    null
  );
}

function readReadable(state: GameState, noun: string): string {
  const item = resolveItemByNoun(state, noun);
  if (!item?.isReadable) {
    return `There's nothing to read.`;
  }
  return `You read the ${item.name}...\n\n    "${item.readableText}"`;
}

// --- Command handling -------------------------------------------------------

export function handleCommand(state: GameState, cmd: ParsedCommand): GameState {
  const room = getCurrentRoom(state);

  switch (cmd.type) {
    case "look": {
      const desc = buildRoomDescription(state, state.playerRoomId);
      return appendLog(state, desc);
    }
    case "read": {
      const readResult = readReadable(state, cmd.noun);
      return appendLog(state, readResult);
    }
    case "inventory": {
      if (state.inventory.length === 0) {
        return appendLog(state, "You are carrying nothing.");
      }

      const names = state.inventory
        .map(
          (id) =>
            state.world.items.find((i) => i.id === id)?.name ?? "something"
        )
        .join(", ");

      return appendLog(state, "You are carrying: " + names);
    }

    case "move": {
      const exit = room.exits.find((e) => e.direction === cmd.direction);
      let moveMessage = "";
      if (!exit) {
        return appendLog(state, "You can't go that way.");
      }

      let destinationRoomId: string | undefined;

      // Exit guarded by a door
      if (exit.doorId) {
        const doorDef = getDoorById(state, exit.doorId);
        const doorState = getDoorState(state, exit.doorId);

        if (!doorDef) {
          return appendLog(state, "You can't go that way.");
        }

        const { allowed, message } = canMoveThroughExit(
          state,
          exit as any,
          doorDef,
          doorState,
          exit.direction
        );

        if (!allowed) {
          return appendLog(state, message ?? "You can't go that way.");
        }
        if (message) {
          moveMessage += message;
        }

        destinationRoomId = resolveDoorDestination(doorDef, state.playerRoomId);
      } else if (exit.toRoomId) {
        destinationRoomId = exit.toRoomId;
      }

      if (!destinationRoomId) {
        return appendLog(state, "You can't go that way.");
      }

      const newState: GameState = {
        ...state,
        playerRoomId: destinationRoomId,
      };
      moveMessage +=
        moveMessage === ""
          ? `You go ${cmd.direction}.`
          : `\nYou go ${cmd.direction}.`;
      return appendLog(newState, moveMessage);
    }

    case "examine": {
      const item = resolveItemByNoun(state, cmd.noun);
      if (!item) return appendLog(state, "You don't see that here.");
      const desc = item.description || "You see nothing special.";
      return appendLog(state, desc);
    }

    case "take": {
      return takeItem(state, cmd.noun);
    }

    case "drop": {
      return dropItem(state, cmd.noun);
    }

    case "open": {
      // 1) Is this a door?
      const doorResult = resolveDoorByNoun(state, cmd.noun);

      if (doorResult) {
        const { def, state: doorState } = doorResult;

        const { state: withDoorUpdated, message } = tryOpenDoor(
          state,
          def,
          doorState
        );

        return appendLog(withDoorUpdated, message);
      }

      // 2) Otherwise, try to open an item
      const itemToOpen = getItemById(state, cmd.noun);

      if (!itemToOpen) {
        return appendLog(state, "You don't see that here.");
      }

      const { state: withItemUpdated, message } = tryOpenItem(
        state,
        itemToOpen
      );

      return appendLog(withItemUpdated, message);
    }

    case "unknown":
    default:
      return appendLog(state, "I don't understand that.");
  }
}
