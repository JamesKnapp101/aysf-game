import { movePlayerToRoom } from "@game/helpers/gameHelpers";
import type {
  ActiveExperience,
  ExperienceKind,
  GameState,
} from "@game/types/gameTypes";

type ExperienceStageDefinition = {
  durationTurns: number;
  entryMessage?: string;
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

const EXPERIENCE_DEFINITIONS: Record<string, ExperienceDefinition> = {
  fallen_corpse_memory: {
    abortMessage:
      "You seize the edge of the memory and pull yourself free. The stairwell snaps back into place around you.",
    completeMessage:
      "The memory collapses in a white flash, and the stairwell snaps back into place around you.",
    id: "fallen_corpse_memory",
    kind: "memory",
    stages: [{ durationTurns: 3, roomId: "FallenCorpseMemory" }],
    startMessage: `As the barrel drifts to the corpse's head the device emits a beep, then a tiny voice.\n\n"Subject deceased, extractor activated. Initiate tissue sample liquification..."\n\nA translucent beam flares from the scanner, making the skull light up from the inside like a flashbulb.\n\n"Viable topology found. Reconstructing memory..."\n\nThe stairwell peels away as the memory takes hold.`,
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

  const turnsRemaining = activeExperience.turnsRemaining - 1;
  if (turnsRemaining > 0) {
    return {
      state: setActiveExperience(state, {
        ...activeExperience,
        turnsRemaining,
      }),
    };
  }

  const nextStageIndex = activeExperience.currentStageIndex + 1;
  const nextStage = definition.stages[nextStageIndex];

  if (nextStage) {
    let next = movePlayerToRoom(state, nextStage.roomId, {
      fromRoomId: state.player.roomId,
      via: definition.kind,
    });
    next = setActiveExperience(next, {
      ...activeExperience,
      currentStageIndex: nextStageIndex,
      turnsRemaining: nextStage.durationTurns,
    });

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
