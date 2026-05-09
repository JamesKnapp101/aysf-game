import { movePlayerToRoom } from "@game/helpers/gameHelpers";
import { updateItemLocation } from "@game/rules/items";
import type {
  ActiveExperience,
  ExperienceKind,
  GameState,
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
    startMessage: `As the barrel drifts to the corpse's head the device emits a beep, then a tiny voice.\n\n"Subject deceased, extractor activated. Initiate tissue sample liquification..."\n\nA translucent beam flares from the scanner, making the skull light up from the inside like a flashbulb and leaving a lingering, eggy smell in the air.\n\n"Viable topology found. Reconstructing memory..."\n\nThe stairwell peels away as the memory takes hold.`,
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
            atElapsedTurns: 2,
            id: "blackout",
            message:
              "\nThe lights go out with a hard electrical snap. For one frozen second the living area is only afterimage and startled breathing. Somewhere close, Lil-Lilly swears, then you hear her stumble for the doorway.",
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
    startMessage: `As the barrel drifts to the corpse's head the device emits a beep, then a tiny voice.\n\n"Subject deceased, extractor activated. Initiate tissue sample liquification..."\n\nA translucent beam flares from the scanner, making the skull light up from the inside like a flashbulb and leaving a lingering, eggy smell in the air.\n\n"Viable topology found. Reconstructing memory..."\n\nThe hallway peels away as the memory takes hold.`,
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
