import { getItemsInInventory } from "../selectors/itemSelectors";
import type { DoorDefinition, DoorKind, DoorState } from "../types/doorTypes";
import type { GameState } from "../types/gameTypes";
import type { Item } from "../types/itemTypes";
import type { Exit } from "../types/roomTypes";

// Movement only needs to know “if I’m in A, what’s on the other side?”
export function resolveDoorDestination(
  doorDef: DoorDefinition,
  fromRoomId: string
): string | undefined {
  const { roomAId, roomBId } = doorDef.connects;

  if (fromRoomId === roomAId) return roomBId;
  if (fromRoomId === roomBId) return roomAId;

  return undefined;
}

export function canMoveThroughExit(
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
          "The door refuses to open as you approach it. The badge scanner emits a flat buzz and a red light on its surface flashes.",
      };
    }

    // Player has the badge: door silently opens and allows passage.
    // We ignore doorState.isOpen/isLocked for these.
    return {
      allowed: true,
      message:
        "The badge scanner flashes a barely visible laser that flickers over you. It seems to find what it was looking for and emits a satisfied chirp, then the door opens with a hydraulic sigh as you pass through.",
    };
  }

  // --- Normal doors and anything else fall through to existing logic ---

  if (!doorState) {
    // No state tracked, treat as open/passable
    return { allowed: true };
  }

  if (!doorState.isOpen) {
    if (!doorState.isLocked) {
      return { allowed: true, message: "You open the door and step through." };
    }
    return { allowed: false, message: "The door is closed." };
  }

  return { allowed: true };
}

export function playerHasBadge(state: GameState, badgeId: string): boolean {
  return state.player.inventory.includes(badgeId);
}

export function upsertDoorState(
  state: GameState,
  updated: DoorState
): GameState {
  return {
    ...state,
    worldState: {
      ...state.worldState,
      doors: {
        ...state.worldState.doors,
        [updated.id]: updated,
      },
    },
  };
}

// --- Advanced door logic (keyed / badges) -----------------------------------

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

  let nextDoorState: DoorState = { ...doorState };
  let nextState: GameState = state;

  if (nextDoorState.isLocked) {
    switch (doorDef.kind) {
      case "keyed": {
        if (!doorDef.keyItemId) {
          return { state, message: "It's locked." };
        }

        const hasKey = nextState.player.inventory.includes(doorDef.keyItemId);
        if (!hasKey) {
          return {
            state,
            message: "It's locked. You don't have the right key.",
          };
        }

        nextDoorState.isLocked = false;
        break;
      }

      case "badgeScanner": {
        if (!doorDef.badgeItemId) {
          return { state, message: "The scanner flashes red." };
        }

        const hasBadge = nextState.player.inventory.includes(
          doorDef.badgeItemId
        );
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
): { state: GameState; message: string } {
  if (!doorState.isOpen) {
    return { state, message: "It's already closed." };
  }

  const nextDoorState: DoorState = { ...doorState, isOpen: false };
  const nextState = upsertDoorState(state, nextDoorState);
  const closeVerb = doorDef.closeVerb ?? "closes";

  return {
    state: nextState,
    message: `The ${doorDef.name.toLowerCase()} ${closeVerb}.`,
  };
}
