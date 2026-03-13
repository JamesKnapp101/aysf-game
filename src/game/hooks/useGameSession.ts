import { overridePlayerBrainActivityLevel } from "@game/helpers/itemHelpers";
import { useCallback, useEffect, useRef, useState, type MutableRefObject, type SetStateAction } from "react";
import { parseCommand } from "../../parse/parser";
import { INITIAL_WORLD } from "../../world/World";
import { dispatchAction } from "../actions/dispatchAction";
import { appendLog, handleCommand } from "../engine/handleCommand";
import { createInitialState } from "../gameInit";
import { getPendingConversationLogMessage } from "../helpers/conversationHelpers";
import { useUIOverlayStore } from "../store/store";
import type { ActionRequest, ActionResult } from "../types/actionsTypes";
import type { GameState } from "../types/gameTypes";

type UseGameSessionOptions = {
  onInventoryCommand: () => void;
  onDiagnoseCommand: () => void;
};

type UseGameSessionResult = {
  gs: GameState;
  stateRef: MutableRefObject<GameState>;
  updateState: (updater: (prev: GameState) => GameState) => GameState;
  enqueueCommand: (input: string) => void;
  runAction: (req: ActionRequest) => void;
  setGameState: (value: SetStateAction<GameState>) => void;
  setBrainActivityLevel: (value: number) => void;
};

type ResultLike = Pick<ActionResult, "state" | "message" | "overlay">;

export function useGameSession({
  onInventoryCommand,
  onDiagnoseCommand,
}: UseGameSessionOptions): UseGameSessionResult {
  const [gs, setGs] = useState<GameState>(() => createInitialState(INITIAL_WORLD));
  const stateRef = useRef(gs);
  const commandQueueRef = useRef<Promise<void>>(Promise.resolve());
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

      replaceState(nextState);
    },
    [onDiagnoseCommand, onInventoryCommand, replaceState],
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

  return {
    gs,
    stateRef,
    updateState,
    enqueueCommand,
    runAction,
    setGameState,
    setBrainActivityLevel,
  };
}
