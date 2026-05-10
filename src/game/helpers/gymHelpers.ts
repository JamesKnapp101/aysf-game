import { removeItemFromPlacementLists } from "@game/helpers/itemPlacement";
import { applyPlayerDamage } from "@game/rules/damage";
import { updateItemLocation } from "@game/rules/items";
import { triggerScoreOnce } from "@game/rules/score";
import {
  addToInventory,
  inventoryHas,
  removeFromAllBuckets,
} from "@game/rules/state";
import type { GameState, StatusId } from "@game/types/gameTypes";

export const GYM_ROOM_ID = "Gym";
export const GYM_SPIN_STAGE_ROOM_ID = "SpinStage";
export const GYM_WEIGHT_ROOM_ID = "GymWeightRoom";
export const GYM_EXERCISE_BALL_ID = "GymExerciseBall";
export const GYM_EXERCISE_BALL_RACK_ID = "GymExerciseBallRack";
export const GYM_ORANGE_BADGE_ID = "orangebadge";
export const GYM_TREADMILL_ID = "GymGiantTreadmill";
export const GYM_WEIGHTLIFTER_MOVED_TRIGGER = "GymWeightlifterMoved";
export const SPIN_STAGE_SPEED_DIAL_PASSWORD = "YX34-D940-6";

export type GymTreadmillSettings = {
  angle: number;
  kind: "gym-treadmill";
  speed: number;
};

export function getGymTreadmillSettings(
  state: GameState,
): GymTreadmillSettings {
  const settings = state.itemState.itemSettings[GYM_TREADMILL_ID];

  if (settings?.kind === "gym-treadmill") {
    return settings;
  }

  return {
    angle: 0,
    kind: "gym-treadmill",
    speed: 100,
  };
}

export function setGymTreadmillAngle(
  state: GameState,
  angle: number,
): GameState {
  const current = getGymTreadmillSettings(state);

  return {
    ...state,
    itemState: {
      ...state.itemState,
      itemSettings: {
        ...state.itemState.itemSettings,
        [GYM_TREADMILL_ID]: {
          ...current,
          angle,
        },
      },
    },
  };
}

export function setGymTreadmillSpeed(
  state: GameState,
  speed: number,
): GameState {
  const current = getGymTreadmillSettings(state);

  return {
    ...state,
    itemState: {
      ...state.itemState,
      itemSettings: {
        ...state.itemState.itemSettings,
        [GYM_TREADMILL_ID]: {
          ...current,
          speed,
        },
      },
    },
  };
}

export function getGymTreadmillAngleDescription(state: GameState): string {
  const { angle } = getGymTreadmillSettings(state);

  if (angle === 0) {
    return "The surface is completely level.";
  }

  return angle > 0
    ? `The surface slopes up ${angle} degrees.`
    : `The surface slopes down ${Math.abs(angle)} degrees.`;
}

export function getGymTreadmillSpeedDescription(state: GameState): string {
  const { speed } = getGymTreadmillSettings(state);

  if (speed === 0) {
    return "The belt is motionless.";
  }

  if (speed === 100) {
    return "The belt is pegged at 100, moving so fast the broad black surface blurs.";
  }

  return `The belt speed is set to ${speed}.`;
}

export function moveGymExerciseBallToRoom(
  state: GameState,
  roomId: string,
): GameState {
  let next: GameState = {
    ...state,
    player: {
      ...state.player,
      inventory: removeFromAllBuckets(
        state.player.inventory,
        GYM_EXERCISE_BALL_ID,
      ),
    },
    itemState: {
      ...state.itemState,
      containerContents: removeItemFromPlacementLists(
        state.itemState.containerContents,
        GYM_EXERCISE_BALL_ID,
      ),
      surfaceContents: removeItemFromPlacementLists(
        state.itemState.surfaceContents,
        GYM_EXERCISE_BALL_ID,
      ),
      underContents: removeItemFromPlacementLists(
        state.itemState.underContents,
        GYM_EXERCISE_BALL_ID,
      ),
      searchableContents: removeItemFromPlacementLists(
        state.itemState.searchableContents,
        GYM_EXERCISE_BALL_ID,
      ),
    },
  };

  next = updateItemLocation(next, GYM_EXERCISE_BALL_ID, roomId);

  return next;
}

export function playerHasGymExerciseBall(state: GameState): boolean {
  const inv = state.player.inventory;
  return (
    inv.general.includes(GYM_EXERCISE_BALL_ID) ||
    inv.badges.includes(GYM_EXERCISE_BALL_ID) ||
    inv.keys.includes(GYM_EXERCISE_BALL_ID)
  );
}

export function isGymExerciseBallInRack(state: GameState): boolean {
  return Boolean(
    state.itemState.containerContents[GYM_EXERCISE_BALL_RACK_ID]?.includes(
      GYM_EXERCISE_BALL_ID,
    ),
  );
}

export function isGymWeightlifterPinningBadge(state: GameState): boolean {
  return (
    state.worldState.conditionalTriggers[GYM_WEIGHTLIFTER_MOVED_TRIGGER] !==
    true
  );
}

function playerHasStatusEffect(state: GameState, statusId: StatusId): boolean {
  return state.player.statusEffects.some((effect) => effect.id === statusId);
}

export function liftGymWeightlifterBarbell(state: GameState): {
  message: string;
  state: GameState;
} {
  if (!playerHasStatusEffect(state, "stronger")) {
    return {
      state,
      message:
        "You squat down, grip the barbell, and strain until your shoulders shake, but you can't move it an inch.",
    };
  }

  let next: GameState = {
    ...state,
    worldState: {
      ...state.worldState,
      conditionalTriggers: {
        ...state.worldState.conditionalTriggers,
        [GYM_WEIGHTLIFTER_MOVED_TRIGGER]: true,
      },
    },
    itemState: {
      ...state.itemState,
      containerContents: removeItemFromPlacementLists(
        state.itemState.containerContents,
        GYM_ORANGE_BADGE_ID,
      ),
      surfaceContents: removeItemFromPlacementLists(
        state.itemState.surfaceContents,
        GYM_ORANGE_BADGE_ID,
      ),
      underContents: removeItemFromPlacementLists(
        state.itemState.underContents,
        GYM_ORANGE_BADGE_ID,
      ),
      searchableContents: removeItemFromPlacementLists(
        state.itemState.searchableContents,
        GYM_ORANGE_BADGE_ID,
      ),
    },
  };

  if (!inventoryHas(next.player.inventory, GYM_ORANGE_BADGE_ID)) {
    next = updateItemLocation(next, GYM_ORANGE_BADGE_ID, "INVENTORY");
    next = addToInventory(next, GYM_ORANGE_BADGE_ID);
    next = triggerScoreOnce(
      next,
      next.world.items.find((item) => item.id === GYM_ORANGE_BADGE_ID)?.scoreId,
    );
  }

  return {
    state: next,
    message:
      "You plant your feet, take hold of the barbell, and lift. The bar rises just enough for you to hook the orange badge out from beneath the body. You grab it, then ease the weight back down before your grip gives out.",
  };
}

type GymTreadmillMovementContext = {
  destinationRoomId: string;
  direction: string;
  fromRoomId: string;
};

type GymTreadmillMovementResult =
  | {
      kind: "allow";
      message: string;
      state?: GameState;
    }
  | {
      kind: "block";
      message: string;
      state: GameState;
    };

export function resolveGymTreadmillMovement(
  state: GameState,
  ctx: GymTreadmillMovementContext,
): GymTreadmillMovementResult | undefined {
  const isCrossingWest =
    ctx.fromRoomId === GYM_ROOM_ID &&
    ctx.direction === "west" &&
    ctx.destinationRoomId === GYM_SPIN_STAGE_ROOM_ID;
  const isCrossingEast =
    ctx.fromRoomId === GYM_SPIN_STAGE_ROOM_ID &&
    ctx.direction === "east" &&
    ctx.destinationRoomId === GYM_ROOM_ID;

  if (!isCrossingWest && !isCrossingEast) {
    return undefined;
  }

  const { angle, speed } = getGymTreadmillSettings(state);

  if (speed <= 80) {
    return {
      kind: "allow",
      message:
        "The treadmill is still moving fast, but you time it, run hard, and scramble across before it can pull your feet out from under you.",
    };
  }

  if (isCrossingEast) {
    const ballText = isGymExerciseBallInRack(state)
      ? " You hit the stored exercise ball just right, rebound off it, and let the belt fling you back across the room."
      : " The belt does most of the work, flinging you back across the room before you can do anything graceful about it.";

    return {
      kind: "allow",
      message: `The treadmill is moving too fast to cross cleanly.${ballText}`,
    };
  }

  const launchStart =
    "The treadmill is pegged at top speed. As you step onto it, the moving surface pulls your feet out from under you, slams you down onto the belt, and launches you eastward.";

  if (angle >= 0) {
    return {
      kind: "block",
      state,
      message: `${launchStart} The force sends you tumbling across the floor and you stagger back to your feet.`,
    };
  }

  if (angle >= -20 && angle <= -15) {
    return {
      kind: "block",
      state: applyPlayerDamage(state, 5),
      message: `${launchStart} With the treadmill pitched downward like it is, you fall forward and slam down on your chest, only to be launched at an angle through the air! You fly weightless for a moment only to The downward slope sends you into the air across the room, straight into the wall over the wire bin. You hit hard and fall to the floor.`,
    };
  }

  if (angle === -10) {
    if (isGymExerciseBallInRack(state)) {
      return {
        kind: "allow",
        message: `${launchStart} The downward slope sends you arcing straight into the wire bin!\n\nYou slam into the exercise ball which absorbs the impact, then launches you back into the air in the opposite direction! You sail over the moving treadmill, arms and legs pedaling, and crash down onto the spin stage.`,
      };
    }

    return {
      kind: "block",
      state: applyPlayerDamage(state, 5),
      message: `${launchStart} With the treadmill angled downward like it is, you fall forward and slam down on your chest, only to be launched through the air! You fly weightless for a moment only to The downward slope sends you into the air across the room, straight into the empty wire bin.`,
    };
  }

  if (angle >= -9 && angle <= -1) {
    return {
      kind: "block",
      state,
      message: `${launchStart} You slip and fall down on your chest! With the downward slope the treadmill pops you into the air, but not far enough to clear the room. You tumble across the floor, bruised in spirit more than body.`,
    };
  }

  return {
    kind: "block",
    state,
    message: `${launchStart} The downward slope throws you into an awkward arc, but not the useful one. You hit the matting, skid, and come to a stop still on the cardio side.`,
  };
}
