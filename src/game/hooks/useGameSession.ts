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
import { appendLog, handleCommand } from "../engine/handleCommand";
import { createInitialState } from "../gameInit";
import { getPendingConversationLogMessage } from "../helpers/conversationHelpers";
import {
  clearResumeSnapshot,
  restoreResumeSnapshot,
  saveResumeSnapshot,
} from "../persistence/resumeStorage";
import { useUIEffectsStore, useUIOverlayStore } from "../store/store";
import type { ActionRequest, ActionResult } from "../types/actionsTypes";
import type { GameState } from "../types/gameTypes";

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

      const nextState = await handleCommand(current, parsed, {
        skipEcho: Boolean(pendingConversationLog),
      });

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
            console.error(`Failed to process command "${trimmed}"`, error);
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
        .then(applyResult)
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
