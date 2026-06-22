import type {
  GameState,
  ReactorConsensusState,
  ReactorLobeState,
  ReactorLobeStatus,
  StatusEffect,
} from "@game/types/gameTypes";
import { PLATFORM_PERCH_ROOM_ID } from "./reactorPlatform";

export const REACTOR_LOBE_COUNT = 25;
export const REACTOR_LOBE_TRANSITION_TURNS = 100;
export const REACTOR_GAME_OVER_CAUSE = "reactor containment collapse";
export const REACTOR_GAME_OVER_MESSAGE =
  "The reactor containment field has collapsed. The ship is gone. Type RESTART to begin again, or RESTORE to return to a saved game.";

export const REACTOR_BIG_BOARD_ROOM_IDS = new Set([
  "SupplyPlatform",
  "MaintenancePlatform",
  "ObservationPlatform",
  "ReactorPlatform",
  "WasteProcessingPlatform",
  "LobeStoragePlatform",
  "ReadingsPlatform",
  "HeatCoolantExchangePlatform",
  PLATFORM_PERCH_ROOM_ID,
]);

export type ReactorLobeCounts = Record<ReactorLobeStatus, number>;

function createLobe(index: number, status: ReactorLobeStatus): ReactorLobeState {
  return {
    id: `reactor-lobe-${String(index + 1).padStart(2, "0")}`,
    status,
  };
}

export function createInitialReactorConsensusState(): ReactorConsensusState {
  const lobes = Array.from({ length: REACTOR_LOBE_COUNT }, (_, index) => {
    if (index < 19) return createLobe(index, "harmonic");
    if (index === 19) return createLobe(index, "undecided");
    return createLobe(index, "dissonant");
  });

  return {
    hasExploded: false,
    lobes,
    nextContainmentWarning: 80,
    turnsUntilTransition: REACTOR_LOBE_TRANSITION_TURNS,
  };
}

export function getReactorConsensusState(
  state: GameState,
): ReactorConsensusState {
  return (
    state.worldState.reactorConsensus ?? createInitialReactorConsensusState()
  );
}

export function getReactorLobeCounts(
  consensus: ReactorConsensusState,
): ReactorLobeCounts {
  return consensus.lobes.reduce<ReactorLobeCounts>(
    (counts, lobe) => ({
      ...counts,
      [lobe.status]: counts[lobe.status] + 1,
    }),
    { harmonic: 0, undecided: 0, dissonant: 0, missing: 0 },
  );
}

export function getReactorContainmentIntegrity(
  consensus: ReactorConsensusState,
): number {
  const counts = getReactorLobeCounts(consensus);
  const consensusStrength = counts.harmonic + counts.undecided * 0.5;
  const consensusRatio = consensusStrength / REACTOR_LOBE_COUNT;
  return Math.round(Math.pow(consensusRatio, 0.75) * 100);
}

export function getReactorHeatLevel(consensus: ReactorConsensusState): number {
  const counts = getReactorLobeCounts(consensus);
  return (
    Math.round(
      (2 + counts.dissonant * 1.5 + counts.undecided * 0.5) * 10,
    ) / 10
  );
}

export function getReactorRadiationLevel(
  consensus: ReactorConsensusState,
): number {
  const heatLevel = getReactorHeatLevel(consensus);
  return Math.min(35, Math.max(3, Math.round(3 + (heatLevel - 8) * 0.8)));
}

export function getReactorPowerLevel(consensus: ReactorConsensusState): number {
  const { harmonic } = getReactorLobeCounts(consensus);
  return Math.round((harmonic / 19) * 0.01 * 1000) / 1000;
}

export function isReactorBigBoardVisible(roomId: string): boolean {
  return REACTOR_BIG_BOARD_ROOM_IDS.has(roomId);
}

export function setReactorLobeStatus(
  state: GameState,
  lobeId: string,
  status: ReactorLobeStatus,
): GameState {
  const consensus = getReactorConsensusState(state);
  const lobes = consensus.lobes.map((lobe) =>
    lobe.id === lobeId ? { ...lobe, status } : lobe,
  );

  return {
    ...state,
    worldState: {
      ...state.worldState,
      reactorConsensus: {
        ...consensus,
        lobes,
      },
    },
  };
}

function refreshReactorRadiationExposure(state: GameState): GameState {
  if (!isReactorBigBoardVisible(state.player.roomId)) return state;

  const intensity = getReactorRadiationLevel(getReactorConsensusState(state));
  const existingIndex = state.player.statusEffects.findIndex(
    (effect) => effect.id === "radiation",
  );
  let statusEffects: StatusEffect[];

  if (existingIndex === -1) {
    statusEffects = [
      ...state.player.statusEffects,
      {
        id: "radiation",
        intensity,
        remainingTurns: 2,
        source: "reactor-lobes",
        startedAtMove: state.moves,
      },
    ];
  } else {
    statusEffects = state.player.statusEffects.map((effect, index) =>
      index === existingIndex
        ? {
            ...effect,
            intensity: Math.max(effect.intensity, intensity),
            remainingTurns: Math.max(effect.remainingTurns ?? 0, 2),
          }
        : effect,
    );
  }

  return {
    ...state,
    player: {
      ...state.player,
      statusEffects,
    },
  };
}

function pickHarmonicLobeIndex(
  state: GameState,
  lobes: ReactorLobeState[],
): number | undefined {
  const candidates = lobes
    .map((lobe, index) => ({ index, status: lobe.status }))
    .filter((candidate) => candidate.status === "harmonic");

  if (candidates.length === 0) return undefined;

  const pickedIndex = Math.min(
    candidates.length - 1,
    Math.floor(state.rng() * candidates.length),
  );
  return candidates[pickedIndex]?.index;
}

function collectContainmentWarnings(
  previousIntegrity: number,
  nextIntegrity: number,
  startingThreshold: number,
): { messages: string[]; nextThreshold: number } {
  const messages: string[] = [];
  let threshold = startingThreshold;

  while (
    threshold >= 0 &&
    previousIntegrity > threshold &&
    nextIntegrity <= threshold
  ) {
    messages.push(
      `Reactor containment integrity has degraded to ${threshold}%`,
    );
    threshold -= 10;
  }

  return { messages, nextThreshold: threshold };
}

export function tickReactorConsensus(state: GameState): {
  messages: string[];
  state: GameState;
} {
  const current = getReactorConsensusState(state);
  const stateWithConsensus = state.worldState.reactorConsensus
    ? state
    : {
        ...state,
        worldState: {
          ...state.worldState,
          reactorConsensus: current,
        },
      };

  if (current.hasExploded || state.worldState.gameOver) {
    return { state: stateWithConsensus, messages: [] };
  }

  if (current.turnsUntilTransition > 1) {
    const next = {
      ...stateWithConsensus,
      worldState: {
        ...stateWithConsensus.worldState,
        reactorConsensus: {
          ...current,
          turnsUntilTransition: current.turnsUntilTransition - 1,
        },
      },
    };

    return { state: refreshReactorRadiationExposure(next), messages: [] };
  }

  const previousIntegrity = getReactorContainmentIntegrity(current);
  const lobes = current.lobes.map((lobe) =>
    lobe.status === "undecided"
      ? { ...lobe, status: "dissonant" as const }
      : lobe,
  );
  const nextHarmonicIndex = pickHarmonicLobeIndex(state, lobes);

  if (nextHarmonicIndex !== undefined) {
    lobes[nextHarmonicIndex] = {
      ...lobes[nextHarmonicIndex],
      status: "undecided",
    };
  }

  const allLobesDissonant = lobes.every(
    (lobe) => lobe.status === "dissonant",
  );
  const provisionalConsensus: ReactorConsensusState = {
    ...current,
    hasExploded: allLobesDissonant,
    lobes,
    turnsUntilTransition: REACTOR_LOBE_TRANSITION_TURNS,
  };
  const nextIntegrity = getReactorContainmentIntegrity(provisionalConsensus);
  const warnings = collectContainmentWarnings(
    previousIntegrity,
    nextIntegrity,
    current.nextContainmentWarning,
  );
  const reactorConsensus = {
    ...provisionalConsensus,
    nextContainmentWarning: warnings.nextThreshold,
  };

  let next: GameState = {
    ...stateWithConsensus,
    worldState: {
      ...stateWithConsensus.worldState,
      reactorConsensus,
    },
  };

  if (allLobesDissonant) {
    next = {
      ...next,
      player: {
        ...next.player,
        vitals: {
          ...next.player.vitals,
          health: 0,
        },
      },
      worldState: {
        ...next.worldState,
        gameOver: {
          atMove: state.moves,
          cause: REACTOR_GAME_OVER_CAUSE,
          message: REACTOR_GAME_OVER_MESSAGE,
        },
      },
    };

    return {
      state: next,
      messages: [
        ...warnings.messages,
        "The last lobe turns red. The containment field folds inward, and the reactor tears the ship apart.\n\n*** GAME OVER ***\n\nType RESTART to begin again, or RESTORE to return to a saved game.",
      ],
    };
  }

  return {
    state: refreshReactorRadiationExposure(next),
    messages: warnings.messages,
  };
}
