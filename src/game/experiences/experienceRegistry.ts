import { movePlayerToRoom } from "@game/helpers/gameHelpers";
import { collectTeaResult, queueGossipNotification } from "@game/rules/gossip";
import { updateItemLocation } from "@game/rules/items";
import type {
  ActiveExperience,
  ExperienceKind,
  GameState,
  JuicyTopic,
} from "@game/types/gameTypes";

type ExperienceStageContext = {
  activeExperience: ActiveExperience;
  experienceId: string;
  stage: ExperienceStageDefinition;
  stageIndex: number;
};

type ExperienceStageEventContext = ExperienceStageContext & {
  elapsedTurns: number;
  turnsRemaining: number;
};

type ExperienceStageEventDefinition = {
  atElapsedTurns?: number;
  atTurnsRemaining?: number;
  id: string;
  message?:
    | string
    | ((
        state: GameState,
        ctx: ExperienceStageEventContext,
      ) => string | undefined);
  overheardTea?: JuicyTopic[];
  run?: (state: GameState, ctx: ExperienceStageEventContext) => GameState;
  when?: (state: GameState, ctx: ExperienceStageEventContext) => boolean;
};

type ExperienceStageDefinition = {
  durationTurns: number;
  entryMessage?: string;
  enter?: (state: GameState, ctx: ExperienceStageContext) => GameState;
  events?: ExperienceStageEventDefinition[];
  roomId: string;
};

type ExperienceDefinition = {
  abortMessage?: string;
  completeMessage?: string;
  id: string;
  kind: ExperienceKind;
  stages: ExperienceStageDefinition[];
  startMessage?: string;
  transitionMessage?: string;
};

const HALVED_CORPSE_MEMORY_ROOM_ID = "HalvedCorpseMemory";
const LIL_LILLY_MEMORY_NPC_ID = "LilLillyCorridorThree";
const SPIN_INSTRUCTOR_MEMORY_ROOM_ID = "SpinInstructorSpinStageMemory";
const SPIN_INSTRUCTOR_MEMORY_ITEM_ID = "SpinInstructor";
const CRUSHED_WEIGHTLIFTER_MEMORY_ROOM_ID = "CrushedWeightlifterGymMemory";
const CRUSHED_WEIGHTLIFTER_MEMORY_ITEM_ID = "CrushedWeightlifter";
const CRUSHED_WEIGHTLIFTER_MEMORY_SPOTBOT_ITEM_ID =
  "CrushedWeightlifterMemorySpotBot";
const BAR_BASEMENT_HEAD_MEMORY_ROOM_ID = "BarBasementHeadMemory";

const NURSERY_MISHAP_GOSSIP: JuicyTopic = {
  id: "nursery mishap",
  title: "Lil-Lilly Tendwick made a costly mistake at the Aquarium",
  summary:
    "Lil-Lilly Tendwick apparently set the water temperature incorrectly at the aquarium's octopus nursery, with unfortunate results.",
  tags: [],
  type: "gossip",
};

function setRoomDarkness(
  state: GameState,
  roomId: string,
  isDark: boolean,
): GameState {
  return {
    ...state,
    worldState: {
      ...state.worldState,
      darkRooms: {
        ...state.worldState.darkRooms,
        [roomId]: isDark,
      },
    },
  };
}

const EXPERIENCE_DEFINITIONS: Record<string, ExperienceDefinition> = {
  fallen_corpse_memory: {
    abortMessage:
      "You seize the edge of the memory and pull yourself free. The stairwell snaps back into place around you.",
    completeMessage: `"Shit, we're here," the man says, looking down.\n\nYou look down as well in time to see the floor rush up to meet you, then the memory collapses in a white flash, and the stairwell snaps back into place around you.`,
    id: "fallen_corpse_memory",
    kind: "memory",
    stages: [{ durationTurns: 3, roomId: "FallenCorpseMemory" }],
    startMessage: `As the barrel drifts to the corpse's head the device emits a beep, then a tiny voice.\n\n"Subject deceased, extractor activated. Initiate tissue sample liquification..."\n\nA translucent beam flares from the scanner, making the skull light up from the inside like a flashbulb and leaving a lingering, eggy smell in the air.\n\n"Viable topology found. Reconstructing memory..."\n\nThe stairwell peels away as the memory takes hold...`,
  },
  halved_corpse_memory: {
    abortMessage:
      "You seize the edge of the memory and pull yourself free. The hallway snaps back into place around you.",
    completeMessage: `In the dark, Lil-Lilly makes it only a few steps before something inside the room whips past you and you hear a wet crunch from near the doorway, a strangled cry cut short, then a second later the lights snap back on again. When your eyes adjust you can see the woman's torso laying in the hallway outside the door. It all happened in an instant. The memory collapses in a white flash and the hallway snaps back into place around you.`,
    id: "halved_corpse_memory",
    kind: "memory",
    stages: [
      {
        durationTurns: 3,
        enter: (state) => {
          let next = setRoomDarkness(
            state,
            HALVED_CORPSE_MEMORY_ROOM_ID,
            false,
          );
          next = updateItemLocation(
            next,
            LIL_LILLY_MEMORY_NPC_ID,
            HALVED_CORPSE_MEMORY_ROOM_ID,
          );
          return next;
        },
        events: [
          {
            atElapsedTurns: 1,
            id: "gossip",
            message: `\n"Just go," the man says, not moving from the doorway. "For your own safety, I'm begging you."\n\n"Is that a threat?" the woman asks, incredulous.\n\n"A warning," he says. "Lil, we're all in grave danger, leave now."\n\nThe woman's eyes narrow.\n\n"What are you hiding in there?" she asks.\n\n"Leave!" the man barks. "Just go, or...I'll tell Zoology you're the one who set the wrong temperature in the octopus nursery."\n\nThe woman's face turns pale, and her eyes begin to glisten.\n\n"That was an accident," she says, before backtracking. "I mean, I don't know what you're talking about."`,
            overheardTea: [NURSERY_MISHAP_GOSSIP],
          },
          {
            atElapsedTurns: 2,
            id: "blackout",
            message: `\nThe lights go out with a hard electrical snap. For one frozen second the living area is only afterimage and startled breathing. Somewhere close, you hear Lil-Lilly whisper to herself.\n\n"What is that?"\n\nYou hear her stumble for the doorway.`,
            run: (state) => {
              let next = setRoomDarkness(
                state,
                HALVED_CORPSE_MEMORY_ROOM_ID,
                true,
              );
              next = updateItemLocation(
                next,
                LIL_LILLY_MEMORY_NPC_ID,
                "NOWHERE",
              );
              return next;
            },
          },
        ],
        roomId: HALVED_CORPSE_MEMORY_ROOM_ID,
      },
    ],
    startMessage: `As the barrel drifts to the corpse's head the device emits a beep, then a tiny voice.\n\n"Subject deceased, extractor activated. Initiate tissue sample liquification..."\n\nA translucent beam flares from the scanner, making the skull light up from the inside like a flashbulb and leaving a lingering, eggy smell in the air.\n\n"Viable topology found. Reconstructing memory..."\n\nThe hallway peels away as the memory takes hold...`,
  },
  spin_corpse_memory: {
    abortMessage:
      "You seize the edge of the memory and pull yourself free. The gymnasium snaps back into place around you, and you're back up on the spin stage.",
    completeMessage: `As the instructor sits locked onto the electric bike with her eyes bulging, a thin thread of smoke begins to snake upward from the top of her head then the memory collapses in a white flash, and the gymnasium snaps back into place around you.`,
    id: "spin_corpse_memory",
    kind: "memory",
    stages: [
      {
        durationTurns: 3,
        enter: (state) =>
          updateItemLocation(
            state,
            SPIN_INSTRUCTOR_MEMORY_ITEM_ID,
            SPIN_INSTRUCTOR_MEMORY_ROOM_ID,
          ),
        roomId: SPIN_INSTRUCTOR_MEMORY_ROOM_ID,
        events: [
          {
            atElapsedTurns: 2,
            id: "incident-flashback",
            message: `\n\nA loud boom sounds, sending vibrations through the floor! You hear the clang of heavy weights slamming down on the mat, and screams, followed by a voice cutting in over a loudspeaker.\n\n"Warning," it states. "Electrical failure."\n\n"What was that?" someone shouts.`,
          },
        ],
      },
    ],
    startMessage: `As the barrel drifts to the corpse's head the device emits a beep, then a tiny voice.\n\n"Subject deceased, extractor activated. Initiate tissue sample liquification..."\n\nA translucent beam flares from the scanner, making the skull light up from the inside like a flashbulb and leaving a lingering, eggy smell in the air.\n\n"Viable topology found. Reconstructing memory..."\n\nThe stage, and the rest of the gymnasium, peel away as the memory takes hold...`,
  },
  barbell_corpse_memory: {
    abortMessage:
      "You seize the edge of the memory and pull yourself free. The gymnasium snaps back into place around you, and you're back among the racks of weights.",
    completeMessage: `"Sh-shit!" the man grunts, and his eyes turn scared.\n\nHis left leg buckles, just a little, but enough to bring everything down. His body folds, landing hard on his back with the barbell close behind. The bar crushes his ribcage as the huge weights crash down onto the floor, causing his eyes and neck veins to bulge.\n\n"You good, bro?" the robot asks, then the memory collapses in a white flash, and the gymnasium snaps back into place around you.`,
    id: "barbell_corpse_memory",
    kind: "memory",
    stages: [
      {
        durationTurns: 4,
        enter: (state) => {
          let next = updateItemLocation(
            state,
            CRUSHED_WEIGHTLIFTER_MEMORY_ITEM_ID,
            CRUSHED_WEIGHTLIFTER_MEMORY_ROOM_ID,
          );
          next = updateItemLocation(
            next,
            CRUSHED_WEIGHTLIFTER_MEMORY_SPOTBOT_ITEM_ID,
            CRUSHED_WEIGHTLIFTER_MEMORY_ROOM_ID,
          );
          return next;
        },
        events: [
          {
            atElapsedTurns: 1,
            id: "spotbot-check-one",
            message: `A loud boom from somewhere causes the floor to shake, and the many racks of weights to rattle. The lurch is just enough to put the man off his balance, and he quickly adjusts, keeping the massive weight over his head.\n\n"You got this, bro?" the robot asks.\n\nThe man nods, but keeps the barbell locked overhead, jaw clenched, breath coming in hard bursts, and you notice a pinhole in the back of his neck that has leaked a single drop of blood, tracing a red line down his sweaty back. In the background, you hear a commotion of some sort.`,
          },
          {
            atElapsedTurns: 2,
            id: "spotbot-check-two",
            message: `"Can't...move..." the man gasps, his eyes growing concerned as the commotion intensifies.\n\n"That's right, push it bro!" the robot says.\n\nThe man's arms and legs begin to shake, the bar wavering just enough to make the plates clink.\n\n"Something's messed up..." he implores the robot. "Get...Eegler..."`,
          },
          {
            atElapsedTurns: 3,
            id: "spotbot-check-three",
            message: `"Still with me, bro?" the robot asks.\n\nThe man is at the end of his rope now, face purple, veins bulging out as he fights to keep his balance.\n\n"Never...got to kill...Barry..." he laments.`,
          },
        ],
        roomId: CRUSHED_WEIGHTLIFTER_MEMORY_ROOM_ID,
      },
    ],
    startMessage: `As the barrel drifts to the corpse's head the device emits a beep, then a tiny voice.\n\n"Subject deceased, extractor activated. Initiate tissue sample liquification..."\n\nA translucent beam flares from the scanner, making the skull light up from the inside like a flashbulb and leaving a lingering, eggy smell in the air.\n\n"Viable topology found. Reconstructing memory..."\n\nThe racks of weights, and the rest of the gymnasium, peel away as the memory takes hold...`,
  },
  bar_basement_head_memory: {
    abortMessage:
      "You seize the edge of the memory and pull yourself free. The cellar snaps back into place around you.",
    completeMessage: `Something moves in the darkness at the base of the stairs. The man turns too late, a question still forming on his face. Heat and pain flare white, then the memory collapses in a flash, and the bar cellar snaps back into place around you.`,
    id: "bar_basement_head_memory",
    kind: "memory",
    stages: [
      {
        durationTurns: 3,
        events: [
          {
            atElapsedTurns: 1,
            id: "bar-call",
            message: `"Just grabbing another case," the man calls up toward the open hatch. The bar's music is muffled overhead, all bass thump and laughter through the floorboards.`,
          },
          {
            atElapsedTurns: 2,
            id: "cellar-darkness",
            message: `A light near the stairs flickers, then dies. In the sudden dark, glass clinks softly somewhere deeper in the cellar.`,
          },
        ],
        roomId: BAR_BASEMENT_HEAD_MEMORY_ROOM_ID,
      },
    ],
    startMessage: `As the barrel drifts to the head the device emits a beep, then a tiny voice.\n\n"Subject deceased, extractor activated. Initiate tissue sample liquification..."\n\nA translucent beam flares from the scanner, making the skull light up from the inside like a flashbulb and leaving a lingering, eggy smell in the air.\n\n"Viable topology found. Reconstructing memory..."\n\nThe cellar peels away as the memory takes hold...`,
  },
};

function getExperienceDefinition(
  experienceId: string,
): ExperienceDefinition | undefined {
  return EXPERIENCE_DEFINITIONS[experienceId];
}

function getSafeRoomId(state: GameState, roomId: string): string {
  return state.world.rooms.some((room) => room.id === roomId)
    ? roomId
    : "PowerGrid";
}

function setActiveExperience(
  state: GameState,
  activeExperience: ActiveExperience | undefined,
): GameState {
  return {
    ...state,
    worldState: {
      ...state.worldState,
      activeExperience,
    },
  };
}

function getExperienceEventKey(
  activeExperience: ActiveExperience,
  event: ExperienceStageEventDefinition,
): string {
  return `${activeExperience.currentStageIndex}:${event.id}`;
}

function getExperienceStageContext(
  activeExperience: ActiveExperience,
  stage: ExperienceStageDefinition,
): ExperienceStageContext {
  return {
    activeExperience,
    experienceId: activeExperience.experienceId,
    stage,
    stageIndex: activeExperience.currentStageIndex,
  };
}

function enterExperienceStage(
  state: GameState,
  activeExperience: ActiveExperience,
  stage: ExperienceStageDefinition,
): GameState {
  if (!stage.enter) return state;
  return stage.enter(state, getExperienceStageContext(activeExperience, stage));
}

function shouldRunExperienceEvent(
  state: GameState,
  event: ExperienceStageEventDefinition,
  ctx: ExperienceStageEventContext,
): boolean {
  const hasElapsedTrigger = typeof event.atElapsedTurns === "number";
  const hasRemainingTrigger = typeof event.atTurnsRemaining === "number";
  const hasBuiltInTrigger = hasElapsedTrigger || hasRemainingTrigger;

  if (!hasBuiltInTrigger && !event.when) return false;
  if (hasElapsedTrigger && ctx.elapsedTurns !== event.atElapsedTurns) {
    return false;
  }
  if (hasRemainingTrigger && ctx.turnsRemaining !== event.atTurnsRemaining) {
    return false;
  }
  if (event.when && !event.when(state, ctx)) return false;

  return true;
}

function getExperienceEventMessage(
  state: GameState,
  event: ExperienceStageEventDefinition,
  ctx: ExperienceStageEventContext,
): string | undefined {
  if (typeof event.message === "function") return event.message(state, ctx);
  return event.message;
}

function markExperienceEventFired(
  state: GameState,
  eventKey: string,
): GameState {
  const activeExperience = state.worldState.activeExperience;
  if (!activeExperience) return state;

  return setActiveExperience(state, {
    ...activeExperience,
    firedEventIds: {
      ...activeExperience.firedEventIds,
      [eventKey]: true,
    },
  });
}

function runExperienceStageEvents(
  state: GameState,
  stage: ExperienceStageDefinition,
): { message?: string; state: GameState } {
  let next = state;
  const messages: string[] = [];

  for (const event of stage.events ?? []) {
    const activeExperience = next.worldState.activeExperience;
    if (!activeExperience) break;

    const eventKey = getExperienceEventKey(activeExperience, event);
    if (activeExperience.firedEventIds?.[eventKey]) continue;

    const ctx: ExperienceStageEventContext = {
      ...getExperienceStageContext(activeExperience, stage),
      elapsedTurns: stage.durationTurns - activeExperience.turnsRemaining,
      turnsRemaining: activeExperience.turnsRemaining,
    };

    if (!shouldRunExperienceEvent(next, event, ctx)) continue;

    if (event.run) next = event.run(next, ctx);
    if (event.overheardTea?.length) {
      const teaResult = collectTeaResult(next, event.overheardTea);
      next = queueGossipNotification(teaResult.state, teaResult.obtainedNewTea);
    }

    const message = getExperienceEventMessage(next, event, ctx);
    if (message?.trim()) messages.push(message.trim());

    next = markExperienceEventFired(next, eventKey);
  }

  return {
    state: next,
    message: messages.length > 0 ? messages.join("\n\n") : undefined,
  };
}

export function startExperience(
  state: GameState,
  experienceId: string,
  opts: { sourceId?: string } = {},
): { message: string; state: GameState } {
  if (state.worldState.activeExperience) {
    return {
      state,
      message:
        "The scanner emits a confused buzz. Something is already holding your attention.",
    };
  }

  const definition = getExperienceDefinition(experienceId);
  const firstStage = definition?.stages[0];

  if (!definition || !firstStage) {
    return {
      state,
      message:
        "The scanner searches for a memory, but there is not enough viable cerebral material to extract anything.",
    };
  }

  const activeExperience: ActiveExperience = {
    currentStageIndex: 0,
    experienceId,
    kind: definition.kind,
    returnRoomId: state.player.roomId,
    sourceId: opts.sourceId,
    startedAtMove: state.moves,
    turnsRemaining: firstStage.durationTurns,
  };

  let next = movePlayerToRoom(state, firstStage.roomId, {
    fromRoomId: state.player.roomId,
    via: definition.kind,
  });
  next = setActiveExperience(next, activeExperience);
  next = enterExperienceStage(next, activeExperience, firstStage);

  return {
    state: next,
    message:
      definition.startMessage ??
      firstStage.entryMessage ??
      "The world drops away around you.",
  };
}

export function abortActiveExperience(state: GameState): {
  message: string;
  state: GameState;
} {
  const activeExperience = state.worldState.activeExperience;

  if (!activeExperience) {
    return { state, message: "Abort what, Major Tom?" };
  }

  const definition = getExperienceDefinition(activeExperience.experienceId);
  const returnRoomId = getSafeRoomId(state, activeExperience.returnRoomId);

  let next = setActiveExperience(state, undefined);
  next = movePlayerToRoom(next, returnRoomId, {
    fromRoomId: state.player.roomId,
    via: "abort",
  });

  return {
    state: next,
    message:
      definition?.abortMessage ??
      "You force the experience to end, and the real world rushes back.",
  };
}

export function tickActiveExperience(state: GameState): {
  message?: string;
  state: GameState;
} {
  const activeExperience = state.worldState.activeExperience;
  if (!activeExperience) return { state };

  if (activeExperience.startedAtMove === state.moves) {
    return { state };
  }

  const definition = getExperienceDefinition(activeExperience.experienceId);
  if (!definition) {
    const returnRoomId = getSafeRoomId(state, activeExperience.returnRoomId);
    let next = setActiveExperience(state, undefined);
    next = movePlayerToRoom(next, returnRoomId, {
      fromRoomId: state.player.roomId,
      via: "experience",
    });
    return {
      state: next,
      message:
        "The experience loses coherence and drops you back into yourself.",
    };
  }

  const currentStage = definition.stages[activeExperience.currentStageIndex];
  if (!currentStage) {
    const returnRoomId = getSafeRoomId(state, activeExperience.returnRoomId);
    let next = setActiveExperience(state, undefined);
    next = movePlayerToRoom(next, returnRoomId, {
      fromRoomId: state.player.roomId,
      via: "experience",
    });
    return {
      state: next,
      message:
        "The experience loses coherence and drops you back into yourself.",
    };
  }

  const turnsRemaining = activeExperience.turnsRemaining - 1;
  if (turnsRemaining > 0) {
    const nextActiveExperience = {
      ...activeExperience,
      turnsRemaining,
    };
    const next = setActiveExperience(state, nextActiveExperience);
    return runExperienceStageEvents(next, currentStage);
  }

  const nextStageIndex = activeExperience.currentStageIndex + 1;
  const nextStage = definition.stages[nextStageIndex];

  if (nextStage) {
    const nextActiveExperience = {
      ...activeExperience,
      currentStageIndex: nextStageIndex,
      turnsRemaining: nextStage.durationTurns,
    };
    let next = movePlayerToRoom(state, nextStage.roomId, {
      fromRoomId: state.player.roomId,
      via: definition.kind,
    });
    next = setActiveExperience(next, nextActiveExperience);
    next = enterExperienceStage(next, nextActiveExperience, nextStage);

    return {
      state: next,
      message:
        definition.transitionMessage ??
        nextStage.entryMessage ??
        "The experience shifts around you.",
    };
  }

  const returnRoomId = getSafeRoomId(state, activeExperience.returnRoomId);
  let next = setActiveExperience(state, undefined);
  next = movePlayerToRoom(next, returnRoomId, {
    fromRoomId: state.player.roomId,
    via: definition.kind,
  });

  return {
    state: next,
    message:
      definition.completeMessage ??
      "The experience ends, and the real world rushes back.",
  };
}
