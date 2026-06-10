import { overridePlayerBrainActivityLevel } from "@game/helpers/itemHelpers";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
  type SetStateAction,
} from "react";
import { parseCommand } from "../../parse/parser";
import { INITIAL_WORLD } from "../../world/World";
import { dispatchAction } from "../actions/dispatchAction";
import { handleCommand } from "../engine/handleCommand";
import { appendLog } from "../engine/log";
import { createInitialState } from "../gameInit";
import { getPendingConversationLogMessage } from "../helpers/conversationHelpers";
import {
  clearResumeSnapshot,
  restoreResumeSnapshot,
  saveResumeSnapshot,
} from "../persistence/resumeStorage";
import {
  flushGameplayEvents,
  installGameplayEventFlush,
  trackGameplayEvent,
  type GameplayEventPayload,
} from "../services/gameplayEvents";
import { useUIEffectsStore, useUIOverlayStore } from "../store/store";
import type { ActionRequest, ActionResult } from "../types/actionsTypes";
import type { GameState } from "../types/gameTypes";
import type { ParsedCommand } from "../types/parserTypes";
import type { Overlay } from "../types/uiTypes";

type UseGameSessionOptions = {
  onCometCommand: () => void;
  onInventoryCommand: () => void;
  onDiagnoseCommand: () => void;
};

type UseGameSessionResult = {
  dismissOpeningSplash: () => void;
  gs: GameState;
  isSessionReady: boolean;
  showOpeningSplash: boolean;
  stateRef: MutableRefObject<GameState>;
  updateState: (updater: (prev: GameState) => GameState) => GameState;
  enqueueCommand: (input: string) => void;
  runAction: (req: ActionRequest) => void;
  setGameState: (value: SetStateAction<GameState>) => void;
  setBrainActivityLevel: (value: number) => void;
};

type ResultLike = Pick<ActionResult, "state" | "message" | "overlay">;
const FIRST_RUN_HELP_HINT = "For instructions and other game info, type 'help'";

function roundedMetric(value: number): number {
  return Math.round(value * 10) / 10;
}

function getInventoryItemCount(state: GameState): number {
  const inventory = state.player.inventory;
  return (
    inventory.general.length + inventory.keys.length + inventory.badges.length
  );
}

function getVisitedRoomCount(state: GameState): number {
  return Object.keys(state.worldState.visitedRooms ?? {}).length;
}

function getActiveStatusEffectIds(state: GameState): string[] {
  return state.player.statusEffects
    .filter((effect) => effect.id !== "none")
    .map((effect) => effect.id);
}

function getCommandSummary(parsed: ParsedCommand): GameplayEventPayload {
  const summary: GameplayEventPayload = {
    commandType: parsed.type,
  };

  if (parsed.type === "move") {
    summary.direction = parsed.direction;
    return summary;
  }

  if (parsed.type === "action") {
    summary.verb = parsed.verb;
    summary.preposition = parsed.preposition;
  }

  return summary;
}

function getStateDeltaPayload(
  before: GameState,
  after: GameState,
): GameplayEventPayload {
  const beforeVitals = before.player.vitals;
  const afterVitals = after.player.vitals;

  return {
    brainActivity: roundedMetric(afterVitals.brainActivity),
    brainActivityDelta: roundedMetric(
      afterVitals.brainActivity - beforeVitals.brainActivity,
    ),
    health: roundedMetric(afterVitals.health),
    healthDelta: roundedMetric(afterVitals.health - beforeVitals.health),
    inventoryCount: getInventoryItemCount(after),
    moveDelta: after.moves - before.moves,
    moves: after.moves,
    oxygen: roundedMetric(afterVitals.oxygen),
    oxygenDelta: roundedMetric(afterVitals.oxygen - beforeVitals.oxygen),
    rating: after.rating,
    ratingDelta: after.rating - before.rating,
    score: after.score,
    scoreDelta: after.score - before.score,
    statusEffects: getActiveStatusEffectIds(after),
    temperature: roundedMetric(afterVitals.temperature),
    temperatureDelta: roundedMetric(
      afterVitals.temperature - beforeVitals.temperature,
    ),
  };
}

function getSessionPayload(
  state: GameState,
  restored: boolean,
): GameplayEventPayload {
  return {
    health: roundedMetric(state.player.vitals.health),
    inventoryCount: getInventoryItemCount(state),
    moves: state.moves,
    oxygen: roundedMetric(state.player.vitals.oxygen),
    restored,
    roomId: state.player.roomId,
    score: state.score,
    statusEffects: getActiveStatusEffectIds(state),
    visitedRoomCount: getVisitedRoomCount(state),
  };
}

function findNewDeath(
  before: GameState,
  after: GameState,
): { cause: string; roomId: string } | null {
  const previousDeaths = before.worldState.playerDeaths ?? {};

  for (const [roomId, death] of Object.entries(
    after.worldState.playerDeaths ?? {},
  )) {
    if (Object.prototype.hasOwnProperty.call(previousDeaths, roomId)) continue;

    return {
      cause: death?.cause ?? "unknown",
      roomId,
    };
  }

  return null;
}

function getOpenedOverlayKind(before: Overlay, after: Overlay): string | null {
  if (after.kind === "none") return null;
  if (before.kind === after.kind) return null;

  return after.kind;
}

function getExperienceTransitionPayload(
  before: GameState,
  after: GameState,
): GameplayEventPayload | null {
  const beforeExperience = before.worldState.activeExperience;
  const afterExperience = after.worldState.activeExperience;

  if (!beforeExperience && afterExperience) {
    return {
      experienceId: afterExperience.experienceId,
      experienceKind: afterExperience.kind,
      roomId: after.player.roomId,
      transition: "started",
    };
  }

  if (beforeExperience && !afterExperience) {
    return {
      experienceId: beforeExperience.experienceId,
      experienceKind: beforeExperience.kind,
      roomId: after.player.roomId,
      transition: "ended",
    };
  }

  if (
    beforeExperience &&
    afterExperience &&
    beforeExperience.experienceId !== afterExperience.experienceId
  ) {
    return {
      experienceId: afterExperience.experienceId,
      experienceKind: afterExperience.kind,
      previousExperienceId: beforeExperience.experienceId,
      roomId: after.player.roomId,
      transition: "changed",
    };
  }

  return null;
}

function trackStateTransitions(
  before: GameState,
  after: GameState,
  source: GameplayEventPayload,
): void {
  const roomChanged = before.player.roomId !== after.player.roomId;
  const death = findNewDeath(before, after);
  const experienceTransition = getExperienceTransitionPayload(before, after);

  if (roomChanged) {
    trackGameplayEvent("room_change", {
      ...source,
      fromRoomId: before.player.roomId,
      toRoomId: after.player.roomId,
    });
  }

  if (death) {
    trackGameplayEvent("death", {
      ...source,
      cause: death.cause,
      deathRoomId: death.roomId,
      respawnRoomId: after.player.roomId,
    });
  }

  if (experienceTransition) {
    trackGameplayEvent("experience", {
      ...source,
      ...experienceTransition,
    });
  }
}

function trackActionResult(
  before: GameState,
  req: ActionRequest,
  result: ActionResult,
): void {
  const after = result.state;
  const actionSourcePayload: GameplayEventPayload = {
    actionVerb: req.verb,
    mode: req.payload.mode,
    source: "ui_action",
    trackId: req.payload.trackId,
  };

  trackGameplayEvent("ui_action", {
    ...actionSourcePayload,
    ...getStateDeltaPayload(before, after),
    consumesTurn: result.consumesTurn,
    fromRoomId: before.player.roomId,
    messageId: req.payload.messageId,
    overlayKind: result.overlay?.kind,
    roomChanged: before.player.roomId !== after.player.roomId,
    speed: req.payload.speed,
    toRoomId: after.player.roomId,
  });
  trackStateTransitions(before, after, actionSourcePayload);

  if (result.overlay && result.overlay.kind !== "none") {
    trackGameplayEvent("overlay_opened", {
      ...actionSourcePayload,
      kind: result.overlay.kind,
      roomId: after.player.roomId,
    });
  }
}

export function useGameSession({
  onCometCommand,
  onInventoryCommand,
  onDiagnoseCommand,
}: UseGameSessionOptions): UseGameSessionResult {
  const [gs, setGs] = useState<GameState>(() =>
    createInitialState(INITIAL_WORLD),
  );
  const [isSessionReady, setIsSessionReady] = useState(false);
  const [showOpeningSplash, setShowOpeningSplash] = useState(false);
  const [shouldSeedFirstRunHelpHint, setShouldSeedFirstRunHelpHint] =
    useState(false);
  const stateRef = useRef(gs);
  const commandQueueRef = useRef<Promise<void>>(Promise.resolve());
  const isUnmountingRef = useRef(false);
  const openOverlay = useUIOverlayStore.getState().openOverlay;

  const replaceState = useCallback((next: GameState) => {
    stateRef.current = next;
    setGs(next);
  }, []);

  const updateState = useCallback(
    (updater: (prev: GameState) => GameState): GameState => {
      const next = updater(stateRef.current);
      replaceState(next);
      return next;
    },
    [replaceState],
  );

  useEffect(() => {
    stateRef.current = gs;
  }, [gs]);

  useEffect(() => installGameplayEventFlush(), []);

  useEffect(() => {
    let cancelled = false;

    const initializeSession = async () => {
      let restored = false;

      try {
        const savedSession = await restoreResumeSnapshot();
        if (cancelled) return;

        if (savedSession) {
          replaceState(savedSession);
          restored = true;
        }
      } catch (error) {
        console.error("Failed to initialize saved session.", error);
        clearResumeSnapshot();
      } finally {
        if (!cancelled) {
          setShowOpeningSplash(!restored);
          setShouldSeedFirstRunHelpHint(!restored);
          useUIOverlayStore.getState().closeOverlay();
          const uiEffects = useUIEffectsStore.getState();
          uiEffects.clearMindFlash();
          uiEffects.clearSyndromeXSignal();
          uiEffects.clearOrganismDeath();
          trackGameplayEvent(
            "session_start",
            getSessionPayload(stateRef.current, restored),
          );
          setIsSessionReady(true);
        }
      }
    };

    void initializeSession();

    return () => {
      cancelled = true;
    };
  }, [replaceState]);

  useEffect(() => {
    if (!isSessionReady) return;
    saveResumeSnapshot(stateRef.current);
  }, [gs, isSessionReady]);

  const dismissOpeningSplash = useCallback(() => {
    if (shouldSeedFirstRunHelpHint) {
      replaceState(appendLog(stateRef.current, FIRST_RUN_HELP_HINT));
      setShouldSeedFirstRunHelpHint(false);
    }

    trackGameplayEvent("splash_continue", {
      firstRunHelpSeeded: shouldSeedFirstRunHelpHint,
      roomId: stateRef.current.player.roomId,
    });
    setShowOpeningSplash(false);
  }, [replaceState, shouldSeedFirstRunHelpHint]);

  const executeCommand = useCallback(
    async (input: string) => {
      const trimmed = input.trim();
      if (!trimmed) return;

      let current = stateRef.current;
      const parsed = parseCommand(trimmed);
      const pendingConversationLog = getPendingConversationLogMessage(
        current,
        parsed,
      );

      if (pendingConversationLog) {
        current = appendLog(
          appendLog(current, `> ${trimmed}`),
          pendingConversationLog,
        );
        replaceState(current);
      }

      const before = current;
      const overlayBefore = useUIOverlayStore.getState().overlay;
      const nextState = await handleCommand(current, parsed, {
        skipEcho: Boolean(pendingConversationLog),
      });
      const overlayAfter = useUIOverlayStore.getState().overlay;
      const openedOverlayKind = getOpenedOverlayKind(
        overlayBefore,
        overlayAfter,
      );
      const commandSourcePayload: GameplayEventPayload = {
        commandType: parsed.type,
        direction: parsed.type === "move" ? parsed.direction : undefined,
        source: "command",
        verb: parsed.type === "action" ? parsed.verb : undefined,
      };

      trackGameplayEvent("command", {
        ...getCommandSummary(parsed),
        ...getStateDeltaPayload(before, nextState),
        fromRoomId: before.player.roomId,
        overlayKind: openedOverlayKind ?? undefined,
        roomChanged: before.player.roomId !== nextState.player.roomId,
        toRoomId: nextState.player.roomId,
      });
      trackStateTransitions(before, nextState, commandSourcePayload);

      if (openedOverlayKind) {
        trackGameplayEvent("overlay_opened", {
          ...commandSourcePayload,
          kind: openedOverlayKind,
          roomId: nextState.player.roomId,
        });
      }

      if (
        parsed.type === "save" ||
        parsed.type === "restore" ||
        parsed.type === "restart"
      ) {
        trackGameplayEvent("progress_command", {
          ...commandSourcePayload,
          moves: nextState.moves,
          roomId: nextState.player.roomId,
          score: nextState.score,
        });
      }

      if (parsed.type === "inventory") {
        onInventoryCommand();
      }

      if (parsed.type === "diagnose") {
        onDiagnoseCommand();
      }

      if (parsed.type === "comet") {
        onCometCommand();
      }

      replaceState(nextState);

      if (parsed.type === "restart") {
        setShowOpeningSplash(true);
      }
    },
    [onCometCommand, onDiagnoseCommand, onInventoryCommand, replaceState],
  );

  const enqueueCommand = useCallback(
    (input: string) => {
      const trimmed = input.trim();
      if (!trimmed) return;

      commandQueueRef.current = commandQueueRef.current
        .catch((error) => {
          console.error("Previous command failed:", error);
        })
        .then(async () => {
          try {
            await executeCommand(trimmed);
          } catch (error) {
            console.error("Failed to process command.", error);
          }
        });
    },
    [executeCommand],
  );

  const applyResult = useCallback(
    (result: ResultLike) => {
      let next = result.state;

      if (result.message) {
        next = appendLog(next, result.message);
      }

      replaceState(next);

      if (result.overlay) {
        openOverlay(result.overlay);
      }
    },
    [openOverlay, replaceState],
  );

  const runAction = useCallback(
    (req: ActionRequest) => {
      if (req.verb === "command") {
        enqueueCommand(req.payload.input ?? "");
        return;
      }

      const current = stateRef.current;
      void dispatchAction(current, req)
        .then((result) => {
          trackActionResult(current, req, result);
          applyResult(result);
        })
        .catch((error) => {
          console.error(`Failed to dispatch action "${req.verb}"`, error);
        });
    },
    [applyResult, enqueueCommand],
  );

  const setGameState = useCallback(
    (value: SetStateAction<GameState>) => {
      if (typeof value === "function") {
        updateState(value as (prev: GameState) => GameState);
        return;
      }

      replaceState(value);
    },
    [replaceState, updateState],
  );

  const setBrainActivityLevel = useCallback(
    (value: number) => {
      replaceState(overridePlayerBrainActivityLevel(stateRef.current, value));
    },
    [replaceState],
  );

  // Cleanup: Wait for pending commands to finish before unmounting
  useEffect(() => {
    return () => {
      isUnmountingRef.current = true;
      flushGameplayEvents({ useBeacon: true });

      // Allow any pending commands to complete gracefully
      // This prevents state updates after unmount
      void commandQueueRef.current.catch(() => {
        // Silently handle any errors during cleanup
      });
    };
  }, []);

  return {
    dismissOpeningSplash,
    gs,
    isSessionReady,
    showOpeningSplash,
    stateRef,
    updateState,
    enqueueCommand,
    runAction,
    setGameState,
    setBrainActivityLevel,
  };
}
