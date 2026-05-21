import { queueAfterRoomDescription } from "@game/helpers/gameHelpers";
import {
  BAR_BOT_CELLAR_DEATH_RETURN_MESSAGE,
  acknowledgeBarBotReturnedFromCellarDeath,
  markBarBotSawPlayerEnterCellar,
  shouldBarBotAcknowledgeReturnedFromCellarDeath,
} from "@game/helpers/barBotAwareness";
import { movieTheaterScriptedEvents } from "src/world/maps/levelThree/Park/MovieTheater/movieTheaterEvents";
import {
  moveGymExerciseBallToRoom,
  playerHasGymExerciseBall,
} from "src/world/maps/levelThree/Park/Gym/gymExerciseBall";
import { GYM_ROOM_ID } from "src/world/maps/levelThree/Park/Gym/gymConstants";
import { moveItemToRoom } from "@game/helpers/itemHelpers";
import {
  armParkEastPowerKeySnatch,
  canTriggerParkEastPowerKeySnatch,
  isParkEastPowerKeySnatchArmed,
  PARK_EAST_POWER_KEY_DELAYED_SNATCH_MESSAGE,
  shouldArmParkEastPowerKeySnatch,
  triggerParkEastPowerKeySnatch,
} from "@game/helpers/parkKeyHijack";
import { ScriptedEvent } from "@game/types/eventTypes";

function runParkEastPowerKeySnatch(state: Parameters<ScriptedEvent["run"]>[0]) {
  let next = triggerParkEastPowerKeySnatch(state);
  next = queueAfterRoomDescription(
    next,
    PARK_EAST_POWER_KEY_DELAYED_SNATCH_MESSAGE,
  );
  return next;
}

export const SCRIPTED_EVENTS: ScriptedEvent[] = [
  ...movieTheaterScriptedEvents,
  {
    id: "barbot_saw_cellar_entry",
    once: false,
    when: (_state, ctx) =>
      ctx.kind === "onEnterRoom" &&
      ctx.fromRoomId === "Bar" &&
      ctx.roomId === "BarBasement",
    run: (state) => markBarBotSawPlayerEnterCellar(state),
  },
  {
    id: "barbot_cellar_death_return_ack",
    once: false,
    when: (state, ctx) =>
      ctx.kind === "onEnterRoom" &&
      ctx.roomId === "Bar" &&
      shouldBarBotAcknowledgeReturnedFromCellarDeath(state),
    run: (state) => {
      const next = acknowledgeBarBotReturnedFromCellarDeath(state);
      return queueAfterRoomDescription(
        next,
        BAR_BOT_CELLAR_DEATH_RETURN_MESSAGE,
      );
    },
  },
  {
    id: "park_key_snatch_arm",
    once: false,
    when: (state, ctx) =>
      ctx.kind === "onEnterRoom" &&
      shouldArmParkEastPowerKeySnatch(state, ctx.roomId),
    run: (state) => armParkEastPowerKeySnatch(state),
  },
  {
    id: "park_key_snatch_on_command",
    once: false,
    when: (state, ctx) =>
      ctx.kind === "onCommand" &&
      isParkEastPowerKeySnatchArmed(state) &&
      canTriggerParkEastPowerKeySnatch(state) &&
      (ctx.roomId === "ParkEast" || ctx.fromRoomId === "ParkEast"),
    run: (state) => runParkEastPowerKeySnatch(state),
  },
  {
    id: "park_key_snatch_on_turn_end",
    once: false,
    when: (state, ctx) =>
      ctx.kind === "onTurnEnd" &&
      isParkEastPowerKeySnatchArmed(state) &&
      canTriggerParkEastPowerKeySnatch(state) &&
      ctx.fromRoomId === "ParkEast",
    run: (state) => runParkEastPowerKeySnatch(state),
  },
  {
    id: "living_quarters_three_east_memory",
    when: (state, ctx) =>
      ctx.kind === "onEnterRoom" && ctx.roomId === "LivingQuartersThreeEast",
    run: (state) => {
      let next = state;
      next = queueAfterRoomDescription(
        next,
        `As you step through the door you catch a series of familiar smells, including the faint scent of a perfume that your brain latches onto. You've been here before.`,
      );
      next = {
        ...next,
        player: {
          ...next.player,
          memoriesTriggered: {
            ...next.player.memoriesTriggered,
            found_own_quarters: true,
          },
        },
      };
      return next;
    },
  },
  {
    id: "cat_meet",
    when: (state, ctx) =>
      ctx.kind === "onEnterRoom" && ctx.roomId === "LevelThreeCorridorSeven",
    run: (state, ctx) => {
      const roomId = ctx.roomId!;
      let next = state;

      next = queueAfterRoomDescription(
        next,
        "As you enter the room, you see a small, black and white short-haired cat come squirming out from the small opening to the north. It shakes its head rapidly, scatting dust, then looks up at you.",
      );

      next = moveItemToRoom(next, "cat", roomId);
      return {
        ...next,
        worldState: {
          ...next.worldState,
          catState: {
            ...next.worldState.catState,
            settleTurns: 1,
            suppressRoomListOnce: true,
          },
        },
      };
    },
  },
  {
    id: "parkbot_meet",
    when: (state, ctx) =>
      ctx.kind === "onEnterRoom" && ctx.roomId === "ParkEntrance",
    run: (state) => {
      let next = state;

      next = queueAfterRoomDescription(
        next,
        `As you approach the entrance, a figure standing absolutely still in front of the doors suddenly moves. It's a humanoid robot, a little shorter than you, with a stocky chassis, and dressed in the uniform of a Park Ranger. The robot lifts its head, revealing only smooth glass where the face would be, then it flickers, and a man's face appears. The face smiles, and the robot raises one arm to give you a wave.\n\n"Hey, friend! Come to enjoy the park?" it asks. "No charge, you'll just need a valid park pass to enter."`,
      );
      return next;
    },
  },
  {
    id: "l3warehouse_visit",
    when: (state, ctx) =>
      ctx.kind === "onEnterRoom" && ctx.roomId === "L3Warehouse",
    run: (state) => {
      let next = state;

      next = queueAfterRoomDescription(
        next,
        `When you first step into the room you hear something stir off toward the east side of the warehouse, followed by a soft click, then silence again.`,
      );
      return next;
    },
  },
  {
    id: "l3warehouse_whistle",
    when: (state, ctx) =>
      ctx.kind === "onCommand" &&
      ctx.commandVerb === "blow" &&
      Boolean(
        ctx.commandDirect?.includes("whistle") ||
        ctx.commandDirect?.includes("robot"),
      ) &&
      ctx.roomId === "L3Warehouse",
    run: (state) => {
      let next = state;
      next = {
        ...next,
        worldState: {
          ...next.worldState,
          conditionalTriggers: {
            ...next.worldState.conditionalTriggers,
            RobotRefugeAccess: true,
          },
        },
      };
      next = queueAfterRoomDescription(
        next,
        `Something heard it though, because a second later you hear an electronic beep from the east side of the warehouse. A thump follows, then, on the east wall behind the lowest storage rack, a hidden panel slides up to reveal a two meter high doorway that leads to a dimly lit room.`,
      );
      return next;
    },
  },
  {
    id: "nailsalon_whistle",
    once: false,
    when: (state, ctx) =>
      ctx.kind === "onCommand" &&
      ctx.commandVerb === "blow" &&
      Boolean(
        ctx.commandDirect?.includes("whistle") ||
        ctx.commandDirect?.includes("robot"),
      ) &&
      ctx.roomId === "NailSalon",
    run: (state) => {
      let next = state;
      next = queueAfterRoomDescription(
        next,
        `The robot perks up, its rendered face smiling.`,
      );
      return next;
    },
  },
  {
    id: "spider_escape_warning",
    once: false,
    when: (state, ctx) =>
      ctx.kind === "onTurnEnd" &&
      state.worldState.hydroponicsCocoonPuzzle.resolved &&
      state.worldState.hydroponicsCocoonPuzzle.graceTurnsRemaining > 0 &&
      !state.worldState.conditionalTriggers.EscapedWithYellowBadge,
    run: (state) => {
      let next = state;
      const turnsRemaining =
        next.worldState.hydroponicsCocoonPuzzle.graceTurnsRemaining;

      const warningText =
        turnsRemaining >= 3
          ? "Somewhere overhead, taut strands of web begin snapping one by one. Each sharp report ricochets through the silo as the metal frame starts to creak."
          : turnsRemaining === 2
            ? "The web canopy convulses above you. Silk lashes through the air and the surrounding frame groans under a shifting, impossible weight."
            : "A violent series of cracks tears through the chamber. Webs whip across the passages, the metal shrieks, and whatever is above you is coming loose right now.";

      next = queueAfterRoomDescription(next, warningText);
      return next;
    },
  },
  {
    id: "spider_escape",
    when: (state, ctx) =>
      ctx.kind === "onTurnEnd" &&
      ctx.roomId === "HydroponicsPlatform" &&
      state.worldState.conditionalTriggers.EscapedWithYellowBadge,
    run: (state) => {
      let next = state;
      next = queueAfterRoomDescription(
        next,
        `Just as you reach the top platform, thick strands of silk give way with a series of loud snaps. A metallic groan echoes in the silo, then more strands give way, setting off a chain reaction until the massive spider drops several meters, crashing down into its own web and causing the entire structure to shake. Safe at the top, you stare down through the grate as the spider cringes, long legs curling inward as if in pain, as its huge, swollen abdomen quivers.\n\nAs you watch, the abdomen bursts apart like an overinflated balloon, flinging away sheets of leathery scraps as a loud boom reverberates through the air. The creature's eight legs spasm in that instant, then relax but don't completely stop moving as the contents of her abdomen spill out. Millions of offspring, each the size of a human hand, erupt in waves, crawling over each other and spreading outward in a mad attempt to escape the heap.`,
      );
      return next;
    },
  },
  {
    id: "gym_exercise_ball_drop_on_exit",
    once: false,
    when: (state, ctx) =>
      ctx.kind === "onTurnEnd" &&
      ctx.fromRoomId === GYM_ROOM_ID &&
      ctx.roomId !== GYM_ROOM_ID &&
      playerHasGymExerciseBall(state),
    run: (state) => {
      let next = moveGymExerciseBallToRoom(state, GYM_ROOM_ID);
      next = queueAfterRoomDescription(
        next,
        "The exercise ball is too bulky to carry through the doorway gracefully. You let it drop before leaving, and it rebounds once before rolling back into the gym.",
      );
      return next;
    },
  },
];
