import { movePlayerToRoom } from "@game/helpers/gameHelpers";
import type { MovementRuleContext, MovementRuleResult } from "@game/registries/movementRuleRegistry";
import type { ActionResult } from "@game/types/actionsTypes";
import type { GameState } from "@game/types/gameTypes";
import type { Item } from "@game/types/itemTypes";
import type { ParsedCommand } from "@game/types/parserTypes";

export const ELEVATOR_LOBBIES = [
  "LevelOneStairAccess", "LevelTwoStairAccess", "LevelThreeStairAccess",
  "LevelFourStairAccess", "LevelFiveStairAccess", "LevelSixStairAccess",
  "LevelSevenStairAccess",
] as const;

export const ELEVATOR_INTERIOR_DESCRIPTION =
  "You are standing inside an elevator car facing the open elevator door that looks out into the lobby. Mounted on the wall to the right of the door is a polished brass panel that runs vertically down the side, presenting a series of circular buttons labeled with the number of each floor.";
const CLOSED_DOORS = "There's an elevator door on the north wall, its heavy doors currently closed.";
const BUTTON_DESCRIPTION = "Mounted on the wall next to the elevator door is a polished brass panel with a single round button.";
export const ELEVATOR_UNPOWERED_MESSAGE = "You press the button a few times but nothing seems to happen. It looks like the power is out.";
export const ELEVATOR_CALL_MESSAGE = "You press the button and you hear a low hum, followed a moment later by a soft electronic chime as the elevator door slides open.";

function doorsOpenAt(state: GameState, lobbyId: string): boolean {
  return state.worldState.powerRestoredSections.elevators === true &&
    state.worldState.elevator.doorsOpen &&
    state.worldState.elevator.boardingLobbyId === lobbyId;
}

function resetDoors(state: GameState): GameState {
  return { ...state, worldState: { ...state.worldState, elevator: { doorsOpen: false } } };
}

function callElevator(state: GameState, lobbyId: string): ActionResult {
  if (!state.worldState.powerRestoredSections.elevators) {
    return { state: resetDoors(state), message: ELEVATOR_UNPOWERED_MESSAGE };
  }
  return {
    state: { ...state, worldState: { ...state.worldState,
      elevator: { doorsOpen: true, boardingLobbyId: lobbyId },
    } },
    message: ELEVATOR_CALL_MESSAGE,
  };
}

export function resolveElevatorMovement(state: GameState, ctx: MovementRuleContext): MovementRuleResult | undefined {
  if (ELEVATOR_LOBBIES.some((id) => id === ctx.fromRoomId)) {
    if (ctx.direction === "north") {
      if (!doorsOpenAt(state, ctx.fromRoomId)) {
        return { kind: "block", message: "The elevator doors are closed. Try pressing the call button." };
      }
      return { kind: "allow" };
    }
    // Walking away also ends the boarding opportunity.
    if (state.worldState.elevator.doorsOpen) {
      return { kind: "allow", state: resetDoors(state) };
    }
  }
  if (ctx.fromRoomId === "Elevator" && ctx.direction === "south") {
    const lobbyId = state.worldState.elevator.boardingLobbyId;
    if (!lobbyId || !ELEVATOR_LOBBIES.some((id) => id === lobbyId)) {
      return { kind: "block", message: "The elevator's lobby connection is unavailable." };
    }
    return { kind: "redirect", destinationRoomId: lobbyId, state: resetDoors(state),
      message: "You step out into the lobby. The elevator doors close behind you." };
  }
  return undefined;
}

export function handleElevatorFloorSelection(state: GameState, cmd: ParsedCommand): ActionResult | undefined {
  if (state.player.roomId !== "Elevator" || cmd.type !== "action" ||
      !["push", "pick"].includes(cmd.verb) || cmd.preposition || cmd.indirect) return undefined;
  const match = cmd.direct?.trim().match(/^(-?\d+)(?:\s+button)?[.!?]?$/);
  if (!match) return undefined;
  const floor = Number(match[1]);
  const lobbyId = ELEVATOR_LOBBIES[floor - 1];
  if (!lobbyId) return { state, message: "The elevator buttons are labeled 1 through 7. Choose one of those floors." };
  if (!state.worldState.powerRestoredSections.elevators) {
    return { state, message: "The floor buttons are dark. The elevator has no power; you can still step south into the lobby." };
  }
  return {
    state: movePlayerToRoom(resetDoors(state), lobbyId, { via: "elevator" }),
    message: `You tap the button labeled ${floor}, and the elevator hums for a moment before emitting an electronic chime, then the door opens and you step out into the lobby.`,
  };
}

const scenery = { itemClass: "solid", itemCategory: "scenery", itemWeight: 100, itemSize: 100 } as const;

export const elevatorItems: Item[] = [
  ...ELEVATOR_LOBBIES.flatMap((lobbyId, index): Item[] => [
    {
      ...scenery, id: `ElevatorDoors${index + 1}`, name: "elevator doors", location: lobbyId,
      description: CLOSED_DOORS,
      describe: (state) => doorsOpenAt(state, lobbyId)
        ? "There's an elevator door on the north wall, its heavy doors open onto the elevator car."
        : CLOSED_DOORS,
      describeScenery: (state) => doorsOpenAt(state, lobbyId)
        ? "There's an elevator door on the north wall, its heavy doors open onto the elevator car."
        : CLOSED_DOORS,
      vocab: ["elevator", "elevators", "elevator door", "elevator doors"],
      overrides: { open: "Use the call button next to the elevator door." },
      meta: { sceneryDescriptionOrder: 10 },
    },
    {
      ...scenery, id: `ElevatorCallButton${index + 1}`, name: "elevator call button", location: lobbyId,
      description: BUTTON_DESCRIPTION,
      describe: (state) => BUTTON_DESCRIPTION + (state.worldState.powerRestoredSections.elevators
        ? " The button is lit with a glowing ring." : ""),
      describeScenery: (state) => BUTTON_DESCRIPTION + (state.worldState.powerRestoredSections.elevators
        ? " The button is lit with a glowing ring." : ""),
      vocab: ["elevator button", "call button", "button", "panel", "brass panel", "elevator panel", "call panel", "elevator call button"],
      isPushable: true,
      overrides: { push: ({ state }: { state: GameState }) => callElevator(state, lobbyId) },
      meta: { sceneryDescriptionOrder: 11 },
    },
  ]),
  {
    ...scenery, id: "ElevatorControlPanel", name: "elevator control panel", location: "Elevator",
    description: "The polished brass control panel has seven circular buttons labeled 1 through 7. Press a numbered button to choose a floor, or step south to return to the lobby.",
    vocab: ["panel", "control panel", "elevator panel", "brass panel", "buttons", "button", "floor buttons"],
  },
  ...ELEVATOR_LOBBIES.map((_, index): Item => ({
    ...scenery, id: `ElevatorFloorButton${index + 1}`, name: `${index + 1} button`, location: "Elevator",
    description: `A circular brass button labeled ${index + 1}.`,
    vocab: [`${index + 1}`, `${index + 1} button`, `button ${index + 1}`],
  })),
];

// Old snapshots serialize scenery definitions; discard the retired failure text.
const RETIRED_ITEMS = new Set(["levelTwoElevators", "levelThreeElevators", "LevelSixElevators", "levelTwoLCD", "levelThreeLCD"]);
export function migrateElevatorSnapshot(state: GameState): GameState {
  const elevator = state.worldState.elevator ?? { doorsOpen: false };
  return {
    ...state,
    world: { ...state.world, items: state.world.items.filter((item) => !RETIRED_ITEMS.has(item.id)).map((item) => {
      if (item.id === "levelThreeTerminalArchway" || item.id === "levelThreeTerminalSign") {
        return { ...item, sceneryDescription: item.sceneryDescription?.replace(/north(?!west)|south(?!east)/g, "southeast") };
      }
      if (item.id === "levelTwoSecurityDoor") {
        return { ...item, description: "The heavy western access door bears a notice warning of a potential explosive device." };
      }
      return item;
    }) },
    worldState: {
      ...state.worldState,
      powerRestoredSections: { ...state.worldState.powerRestoredSections,
        elevators: state.worldState.powerRestoredSections.elevators ?? false },
      elevator: state.player.roomId === "Elevator" && !elevator.boardingLobbyId
        ? { doorsOpen: false, boardingLobbyId: "LevelFiveStairAccess" } : elevator,
    },
  };
}
