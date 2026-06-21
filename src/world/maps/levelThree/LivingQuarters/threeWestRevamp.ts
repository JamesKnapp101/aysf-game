import { queueAfterRoomDescription, triggerPlayerDeath } from "@game/helpers/gameHelpers";
import type { DoorInteractionHook } from "@game/types/doorTypes";
import type { ScriptedEvent } from "@game/types/eventTypes";
import type { GameState } from "@game/types/gameTypes";
import type { DescriptionContext } from "@game/types/itemTypes";

export const THREE_WEST_FRONT_DOOR_ID = "DOOR3CW";
export const THREE_WEST_BATHROOM_DOOR_ID = "ThreeWestBDoor";
export const THREE_WEST_BEDROOM_DOOR_ID = "ThreeWestBedroomDoor";

export const THREE_WEST_BATHROOM_CLOSE_WARNING =
  "You'd have to reach into the dark room to do that, are you sure you want to do that?";

export const THREE_WEST_BATHROOM_DEATH_MESSAGE =
  "You reach into the dark room to grab the knob and pull the door shut, when something cold snags your wrist. Before you can pull away, it coils around your arm and yanks you across the threshold. Something slick and heavy folds over you in the dark.";

export const THREE_WEST_FRONT_DOOR_DEATH_MESSAGE =
  "You close the apartment's front door, turning the light from the hallway into a shrinking sliver before it disappears completely, leaving you in darkness. The moment that happens, you sense something move nearby, something large, then a beat later you feel something like cold nightcrawlers slapping down onto your back and neck.";

export const THREE_WEST_BEDROOM_DEATH_MESSAGE =
  "You pull the bedroom door shut. The last of the weak light from the living area narrows to a line and disappears, leaving you in darkness. The moment that happens, something large moves nearby. A beat later, something like cold nightcrawlers slaps down across your back and neck.";

export const THREE_WEST_FIRST_ENTRY_MESSAGE =
  "As you step into the living area, something large shifts in the bathroom with a soft, heavy scrape. The sound pulls your attention to the dark, open doorway to the south. You can't see anything beyond it, but you can sense something there, close to the threshold.";

const BATHROOM_CLOSE_WARNING_TRIGGER = "ThreeWestBathroomCloseWarned";

function setThreeWestDarkRooms(
  state: GameState,
  livingRoomIsDark: boolean,
  bedroomIsDark: boolean,
): GameState {
  return {
    ...state,
    worldState: {
      ...state.worldState,
      darkRooms: {
        ...state.worldState.darkRooms,
        LivingQuartersThreeWest: livingRoomIsDark,
        ThreeWestBath: true,
        ThreeWestBed: bedroomIsDark,
      },
    },
  };
}

export function syncThreeWestLighting(state: GameState): GameState {
  const frontDoorIsOpen =
    state.worldState.doors[THREE_WEST_FRONT_DOOR_ID]?.isOpen === true;
  const bedroomDoorIsOpen =
    state.worldState.doors[THREE_WEST_BEDROOM_DOOR_ID]?.isOpen === true;

  return setThreeWestDarkRooms(
    state,
    !frontDoorIsOpen,
    !frontDoorIsOpen || !bedroomDoorIsOpen,
  );
}

function markBathroomCloseWarning(state: GameState): GameState {
  return {
    ...state,
    worldState: {
      ...state.worldState,
      conditionalTriggers: {
        ...state.worldState.conditionalTriggers,
        [BATHROOM_CLOSE_WARNING_TRIGGER]: true,
      },
    },
  };
}

export const beforeThreeWestBathroomClose: DoorInteractionHook = (state) => {
  if (state.player.roomId !== "LivingQuartersThreeWest") return undefined;

  if (!state.worldState.conditionalTriggers[BATHROOM_CLOSE_WARNING_TRIGGER]) {
    return {
      state: markBathroomCloseWarning(state),
      message: THREE_WEST_BATHROOM_CLOSE_WARNING,
    };
  }

  return {
    state: triggerPlayerDeath(
      state,
      THREE_WEST_BATHROOM_DEATH_MESSAGE,
      "organism",
    ),
    message: THREE_WEST_BATHROOM_DEATH_MESSAGE,
  };
};

export const afterThreeWestFrontDoorClose: DoorInteractionHook = (state) => {
  const next = syncThreeWestLighting(state);

  if (state.player.roomId !== "LivingQuartersThreeWest") {
    return { state: next };
  }

  return {
    state: triggerPlayerDeath(
      next,
      THREE_WEST_FRONT_DOOR_DEATH_MESSAGE,
      "organism",
    ),
    message: THREE_WEST_FRONT_DOOR_DEATH_MESSAGE,
  };
};

export const afterThreeWestFrontDoorOpen: DoorInteractionHook = (state) => ({
  state: syncThreeWestLighting(state),
  message:
    "The apartment's front door opens, allowing dim hallway light to spill into the living area and the bedroom beyond.",
});

export const afterThreeWestBedroomDoorClose: DoorInteractionHook = (state) => {
  const next = syncThreeWestLighting(state);

  if (state.player.roomId === "ThreeWestBed") {
    return {
      state: triggerPlayerDeath(
        next,
        THREE_WEST_BEDROOM_DEATH_MESSAGE,
        "organism",
      ),
      message: THREE_WEST_BEDROOM_DEATH_MESSAGE,
    };
  }

  if (state.player.roomId === "LivingQuartersThreeWest") {
    return {
      state: next,
      message:
        "You close the bedroom door. As the weak light is cut off, something large shifts on the other side with a slow scrape across the floor.",
    };
  }

  return { state: next };
};

export const afterThreeWestBedroomDoorOpen: DoorInteractionHook = (state) => {
  const next = syncThreeWestLighting(state);

  if (!next.worldState.darkRooms.ThreeWestBed) {
    return {
      state: next,
      message:
        "You open the bedroom door. Dim light reaches into the room, and whatever was moving inside becomes abruptly, unnaturally still.",
    };
  }

  return { state: next };
};

export function describeThreeWestBathroomDoor(
  state: GameState,
  ctx: DescriptionContext,
): string {
  const isOpen =
    state.worldState.doors[THREE_WEST_BATHROOM_DOOR_ID]?.isOpen === true;

  if (ctx.roomId !== "LivingQuartersThreeWest") {
    return isOpen
      ? "The open bathroom door leads north into the living area."
      : "The bathroom door is closed, with the living area on its other side.";
  }

  if (!isOpen) {
    return "The wooden bathroom door is closed. Whatever waits beyond it makes no sound.";
  }

  return "You peer through the open bathroom doorway, but it is too dark inside to see anything. Nevertheless, you can sense something is there, close by, waiting just beyond the threshold but unwilling to cross into the light, dim as it is.";
}

export function describeThreeWestBathroomDoorway(
  state: GameState,
  ctx: DescriptionContext,
): string {
  const isOpen =
    state.worldState.doors[THREE_WEST_BATHROOM_DOOR_ID]?.isOpen === true;

  if (ctx.roomId === "LivingQuartersThreeWest") {
    return isOpen
      ? "To the south, an open wooden door leads into a bathroom too dark to see."
      : "To the south is the closed bathroom door.";
  }

  return isOpen
    ? "The open bathroom door is to the north."
    : "The bathroom door is closed to the north.";
}

export function describeThreeWestBedroomDoorway(
  state: GameState,
  ctx: DescriptionContext,
): string {
  const isOpen =
    state.worldState.doors[THREE_WEST_BEDROOM_DOOR_ID]?.isOpen === true;

  if (ctx.roomId === "LivingQuartersThreeWest") {
    return isOpen
      ? "To the west, an open bedroom door leads into a dim room."
      : "The bedroom door to the west is closed.";
  }

  return isOpen
    ? "The open bedroom door is to the east."
    : "The bedroom door is closed to the east.";
}

export const threeWestScriptedEvents: ScriptedEvent[] = [
  {
    id: "living_quarters_three_west_first_entry",
    when: (_state, ctx) =>
      ctx.kind === "onEnterRoom" &&
      ctx.roomId === "LivingQuartersThreeWest" &&
      ctx.fromRoomId === "LevelThreeCorridorThree",
    run: (state) =>
      queueAfterRoomDescription(state, THREE_WEST_FIRST_ENTRY_MESSAGE),
  },
];
