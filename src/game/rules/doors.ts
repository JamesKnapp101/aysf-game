import { getItemsInInventory } from "../selectors/itemSelectors";
import type { DoorDefinition, DoorKind, DoorState } from "../types/doorTypes";
import type { GameState } from "../types/gameTypes";
import type { Item } from "../types/itemTypes";
import type { Exit } from "../types/roomTypes";

export function resolveDoorDestination(
  doorDef: DoorDefinition,
  fromRoomId: string,
): string | undefined {
  const { roomAId, roomBId } = doorDef.connects;

  if (fromRoomId.trim() === roomAId.trim()) return roomBId;
  if (fromRoomId.trim() === roomBId.trim()) return roomAId;

  return undefined;
}

export function canMoveThroughExit(
  state: GameState,
  exit: Exit,
  doorDef?: DoorDefinition,
  doorState?: DoorState,
  direction?: string,
): { allowed: boolean; message?: string } {
  if (!doorDef) {
    return { allowed: true };
  }

  const kind: DoorKind = doorDef.kind ?? "normal";

  if (kind === "blocked") {
    return {
      allowed: false,
      message: doorDef?.blockMsg ?? `You can't get through`,
    };
  }
  if (kind === "airlock") {
    if (doorDef.id === "InnerDoor") {
      if (
        !state.worldState.doors["OuterDoor"] ||
        state.worldState.doors["OuterDoor"]?.isOpen === true
      ) {
        return {
          allowed: false,
          message: `You pull at the handle, but it won't budge.`,
        };
      }
    }
  }

  if (kind === "badgeScanner") {
    const badgeId = doorDef.badgeItemId;

    if (!badgeId || doorDef.checkBadgeOnDir !== direction) {
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

    return {
      allowed: true,
      message:
        "The badge scanner flashes a barely visible laser that flickers over you. It seems to find what it was looking for and emits a satisfied chirp, then the door opens with a hydraulic sigh as you pass through.\n",
    };
  }
  if (!doorState) {
    return { allowed: true };
  }

  if (!doorState.isOpen) {
    if (!doorState.isLocked) {
      if (doorState.id === "InnerDoor") {
        if (
          !state.worldState.doors["OuterDoor"] ||
          state.worldState.doors["OuterDoor"]?.isOpen === true
        ) {
          return {
            allowed: false,
            message: `You grab the door's handle and pull, but it won't budge.`,
          };
        }
      }
      return { allowed: true, message: "You open the door and step through." };
    }
    return { allowed: false, message: "The door is closed." };
  }

  return { allowed: true };
}

export function playerHasBadge(state: GameState, badgeId: string): boolean {
  return state.player.inventory.badges.includes(badgeId);
}

export function upsertDoorState(
  state: GameState,
  updated: DoorState,
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
  doorState: DoorState,
): { state: GameState; message: string } {
  if (doorState.isOpen) {
    return { state, message: "The door is already open." };
  }
  if (doorDef.id === "InnerDoor") {
    if (
      !state.worldState.doors["OuterDoor"] ||
      state.worldState.doors["OuterDoor"].isOpen === true
    ) {
      return { state, message: `You pull at the handle, but it won't budge.` };
    }
  }
  if (doorDef.badgeItemId) {
    if (!playerHasBadge(state, doorDef.badgeItemId)) {
      return {
        state,
        message: "The doors are automatic, just walk in that direction.",
      };
    }
  }

  const nextDoorState: DoorState = { ...doorState };
  let nextState: GameState = state;

  if (nextDoorState.isLocked) {
    switch (doorDef.kind) {
      case "keyed": {
        if (!doorDef.keyItemId) {
          return { state, message: "It's locked." };
        }

        const hasKey = nextState.player.inventory.keys.includes(
          doorDef.keyItemId,
        );
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

        const hasBadge = nextState.player.inventory.badges.includes(
          doorDef.badgeItemId,
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
  nextDoorState.isOpen = true;
  nextState = upsertDoorState(nextState, nextDoorState);

  const openVerb = doorDef.openVerb ?? "opens";
  const defaultMessage = `The ${doorDef.name.toLowerCase()} ${openVerb}.`;
  const afterOpen = doorDef.afterOpen?.(nextState, nextDoorState);

  if (afterOpen) {
    return {
      state: afterOpen.state,
      message: afterOpen.message ?? defaultMessage,
    };
  }

  return {
    state: nextState,
    message: defaultMessage,
  };
}

export function tryCloseDoor(
  state: GameState,
  doorDef: DoorDefinition,
  doorState: DoorState,
): { state: GameState; message: string } {
  if (!doorState.isOpen) {
    return { state, message: "It's already closed." };
  }

  const beforeClose = doorDef.beforeClose?.(state, doorState);
  if (beforeClose) {
    return {
      state: beforeClose.state,
      message: beforeClose.message ?? "You leave the door open.",
    };
  }

  const nextDoorState: DoorState = { ...doorState, isOpen: false };
  const nextState = upsertDoorState(state, nextDoorState);
  const closeVerb = doorDef.closeVerb ?? "closes";
  const defaultMessage = `The ${doorDef.name.toLowerCase()} ${closeVerb}.`;
  const afterClose = doorDef.afterClose?.(nextState, nextDoorState);

  if (afterClose) {
    return {
      state: afterClose.state,
      message: afterClose.message ?? defaultMessage,
    };
  }

  return {
    state: nextState,
    message: defaultMessage,
  };
}
