import { applyPlayerDamage } from "@game/rules/damage";
import type { GameState } from "@game/types/gameTypes";
import type { Item } from "@game/types/itemTypes";
import type { ParsedCommand } from "@game/types/parserTypes";
import { isGymExerciseBallInRack } from "./gymExerciseBall";
import {
  GYM_ROOM_ID,
  GYM_SPIN_STAGE_ROOM_ID,
  GYM_TREADMILL_ID,
} from "./gymConstants";

export { SPIN_STAGE_SPEED_DIAL_PASSWORD } from "./gymConstants";

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

function parseSetNumber(cmd?: ParsedCommand): number | undefined {
  if (cmd?.type !== "action") return undefined;

  const valueText = cmd.indirect?.trim() ?? "";
  const match = valueText.match(/-?\d+/);
  if (!match) return undefined;

  const value = Number.parseInt(match[0], 10);
  return Number.isFinite(value) ? value : undefined;
}

function setGymTreadmillAngleDial(
  state: GameState,
  cmd?: ParsedCommand,
): { message: string; state: GameState } {
  const value = parseSetNumber(cmd);
  if (value == null) {
    return { state, message: "Set the angle dial to what?" };
  }

  if (value < -20 || value > 20) {
    return {
      state,
      message: "The angle dial only runs from -20 to 20.",
    };
  }

  return {
    state: setGymTreadmillAngle(state, value),
    message:
      value === 0
        ? "You set the treadmill angle dial to 0. The broad black surface settles completely level."
        : value > 0
          ? `You set the treadmill angle dial to ${value}. The broad black surface slopes upward.`
          : `You set the treadmill angle dial to ${value}. The broad black surface slopes downward.`,
  };
}

function setSpinStageSpeedDial(
  state: GameState,
  cmd?: ParsedCommand,
): {
  message: string;
  overlay?: { kind: "spin-stage-speed-password"; targetSpeed: number };
  state: GameState;
} {
  const value = parseSetNumber(cmd);
  if (value == null) {
    return { state, message: "Set the speed dial to what?" };
  }

  if (value < 0 || value > 100) {
    return {
      state,
      message: "The speed dial only runs from 0 to 100.",
    };
  }

  return {
    state,
    message:
      "The instructor speed dial flashes 'Password Required' and waits for input.",
    overlay: {
      kind: "spin-stage-speed-password",
      targetSpeed: value,
    },
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

export const gymTreadmillItems: Item[] = [
  {
    id: GYM_TREADMILL_ID,
    name: "giant treadmill",
    description:
      "The broad black surface is a giant treadmill of sorts, wide enough to accommodate a whole group of cyclists on bikes.",
    describe: (state) =>
      [
        "On closer inspection, the flat black surface is a giant treadmill, wide enough to accommodate a group of cyclists on bikes.",
        getGymTreadmillAngleDescription(state),
        getGymTreadmillSpeedDescription(state),
      ].join(" "),
    describeScenery: (state) =>
      `To the west, the entire floor is covered with a flat black surface that emits a constant hum. Past it, the spin instructor bike is visible on its podium with a woman's body lying beside it. ${getGymTreadmillAngleDescription(
        state,
      )} ${getGymTreadmillSpeedDescription(state)}`,
    location: GYM_ROOM_ID,
    vocab: [
      "giant treadmill",
      "flat black surface",
      "black surface",
      "surface",
      "moving conveyor",
      "conveyor",
    ],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1000,
    itemSize: 20,
    meta: {
      sceneryDescriptionOrder: 2,
    },
  },
  {
    id: "GymTreadmillAngleDial",
    name: "angle dial",
    description: `The dial is marked from -20 to 20. It controls the incline of the giant treadmill.`,
    describe: (state) => {
      const { angle } = getGymTreadmillSettings(state);
      return `The dial is marked from -20 to 20, and is currently set to ${angle}. It controls the incline of the giant treadmill.`;
    },
    sceneryDescription:
      "A sturdy angle dial is mounted near the edge of the giant treadmill.",
    location: GYM_ROOM_ID,
    vocab: ["angle", "dial", "angle dial", "incline", "incline dial"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 5,
    itemSize: 2,
    isSettable: true,
    meta: {
      sceneryDescriptionOrder: 3,
    },
    overrides: {
      set: ({ state, cmd }: { cmd?: ParsedCommand; state: GameState }) =>
        setGymTreadmillAngleDial(state, cmd),
    },
  },
  {
    id: "GymTreadmillSpeedDial",
    name: "speed dial",
    description:
      "The dial is marked from 0 to 100, but the display above it flashes 'Instructor Override.'",
    sceneryDescription:
      "Beside it is a dial that controls the treadmill's speed.",
    location: GYM_ROOM_ID,
    vocab: ["speed", "dial", "speed dial", "override"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 5,
    itemSize: 2,
    isSettable: true,
    meta: {
      sceneryDescriptionOrder: 4,
    },
    overrides: {
      set: "The speed dial flashes 'Instructor Override' and refuses to accept input.",
    },
  },
  {
    id: "GymLightweightBicycleRack",
    name: "lightweight bicycles",
    description:
      "The bikes are light-framed, narrow-tired, and indicate that they'll only work on the treadmill, but it looks like they're all locked down right now.",
    sceneryDescription:
      "On the eastern side is a rack of lightweight bicycles.",
    location: GYM_ROOM_ID,
    vocab: ["lightweight", "bicycle", "bicycles", "bike", "bikes", "rack"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 120,
    itemSize: 7,
    meta: {
      sceneryDescriptionOrder: 5,
    },
  },
  {
    id: "SpinStagePodium",
    name: "podium",
    description:
      "The podium is just tall enough to put an instructor above a class, with the giant treadmill spread out below.",
    sceneryDescription:
      "Atop the podium sits a fancy-looking electronic stationary bike facing toward the east side of the gym, allowing an instructor to face a group of clients on the moving conveyor.",
    location: GYM_SPIN_STAGE_ROOM_ID,
    vocab: ["podium", "stage", "platform"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 300,
    itemSize: 10,
    meta: {
      sceneryDescriptionOrder: 1,
    },
  },
  {
    id: "SpinStageBike",
    name: "instructor bike",
    description:
      "The stationary bike is sleek, with a reinforced frame, clipped pedals, and a console angled toward the rider. The console has shorted out, leaving the screen warped and dark. A scorched label under the console reads:\n\nPW: YX34-D\n\nThe rest is burned away.",
    sceneryDescription:
      "The instructor bike is fixed in place and looks like it shorted out, with visible scorch marks and its console warped and dark. There's a label stuck on the bottom of the console that reads: PW: YX34-D but the rest is burned away.",
    location: GYM_SPIN_STAGE_ROOM_ID,
    vocab: ["bike", "bicycle", "stationary", "stationary bike", "instructor"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 120,
    itemSize: 6,
    meta: {
      sceneryDescriptionOrder: 2,
    },
  },
  {
    id: "SpinStageSpeedDial",
    name: "instructor speed dial",
    description: "The instructor speed dial is marked from 0 to 100.",
    describe: (state) => {
      const { speed } = getGymTreadmillSettings(state);
      return `The instructor speed dial is marked from 0 to 100, and is currently set to ${speed}.`;
    },
    describeScenery: (state) => {
      const { speed } = getGymTreadmillSettings(state);
      return speed === 100
        ? "A second speed dial is mounted beside the instructor bike, currently pegged at 100."
        : `A second speed dial is mounted beside the instructor bike, currently set to ${speed}.`;
    },
    location: GYM_SPIN_STAGE_ROOM_ID,
    vocab: ["speed", "dial", "speed dial", "instructor", "instructor dial"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 5,
    itemSize: 2,
    isSettable: true,
    meta: {
      sceneryDescriptionOrder: 3,
    },
    overrides: {
      set: ({ state, cmd }: { cmd?: ParsedCommand; state: GameState }) =>
        setSpinStageSpeedDial(state, cmd),
    },
  },
  {
    id: "SpinStageCyclistCorpse",
    name: "cyclist's body",
    description:
      "The woman is dressed in black bike shorts, a green sports bra, and white sneakers. She lies still beside the stationary bike, beginning to smell of decay.",
    sceneryDescription:
      "[[newline]]The body of a woman dressed in black bike shorts, a green sports bra, and white sneakers lies on the floor next to the stationary bike, unmoving and beginning to smell of decay.",
    location: GYM_SPIN_STAGE_ROOM_ID,
    vocab: ["body", "corpse", "woman", "cyclist", "shorts", "sports bra"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 65,
    itemSize: 7,
    meta: {
      corpse: {
        hasIntactHead: true,
        memoryExperienceId: "spin_corpse_memory",
      },
      sceneryDescriptionOrder: 4,
    },
  },
];
