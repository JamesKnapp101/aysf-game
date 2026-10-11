import { parseCommand } from "../../parse/parser";
import {
  DEFERRED_WORLD_CHUNK_IDS,
  isWorldChunkLoaded,
  loadWorldChunk,
} from "../../world/World";
import { FIRST_RUN_HELP_HINT, OPENING_SPLASH } from "../constants";
import { handleCommand } from "../engine/handleCommand";
import { appendLog } from "../engine/log";
import {
  createFreshGameState,
  FINAL_PLAYER_START_ROOM_ID,
  mergeWorldChunkIntoState,
} from "../gameInit";
import { getPendingConversationLogMessage } from "../helpers/conversationHelpers";
import { clearManualSnapshot, clearResumeSnapshot } from "../persistence/resumeStorage";
import { reconcileObjectives } from "../rules/objectives";
import { useUIEffectsStore, useUIOverlayStore } from "../store/store";
import { buildHelpText } from "../text/help";
import type { GameState } from "../types/gameTypes";
import {
  ADAPTER_REQUIRED,
  currentRoomPresentation,
  inventoryText,
  playerText,
  requiresGameplayAdapter,
  statusText,
} from "./playerView";
import { createTranscript, TRANSCRIPT_FAILED } from "./transcript";
import { informationText } from "./information";
import type { InformationView, Observation, SessionController, SessionOptions, TranscriptEntry } from "./types";

let sessionInUse = false;
const COMMAND_FAILED = "The command could not be completed. Reset the session to continue.";

async function hydrate(state: GameState): Promise<GameState> {
  let next = state;
  for (const chunkId of DEFERRED_WORLD_CHUNK_IDS) {
    if (isWorldChunkLoaded(next.world, chunkId)) continue;
    next = mergeWorldChunkIntoState(next, chunkId, await loadWorldChunk(chunkId));
  }
  return reconcileObjectives(state, next);
}

function clearSessionPresentation(): void {
  useUIOverlayStore.getState().closeOverlay();
  const effects = useUIEffectsStore.getState();
  effects.clearMindFlash();
  effects.clearSyndromeXSignal();
  effects.clearOrganismDeath();
  useUIEffectsStore.setState({ teleportFlashNonce: 0, screenShakeNonce: 0 });
}

/** One private session per module/process. No state or debug port is returned. */
export function createHeadlessSession(options: SessionOptions = {}): SessionController {
  if (sessionInUse) throw new Error("Only one headless session can be open at a time.");
  const transcript = createTranscript(options.transcriptDirectory);
  sessionInUse = true;

  let state: GameState | undefined;
  let opening: Observation | undefined;
  let blocked: string | undefined;
  let lastRoomDescription: string | undefined;
  let sequence = 0;
  let episode = 0;
  let transcriptFailed = false;
  let queue: Promise<void> = Promise.resolve();
  let closing = false;
  let disposal: Promise<void> | undefined;
  async function record(
    kind: TranscriptEntry["kind"], text: string[], input?: string, event?: TranscriptEntry["event"],
  ): Promise<Observation> {
    const observation = Object.freeze({
      sequence: ++sequence,
      text: Object.freeze(text.map(playerText).filter(Boolean)),
    });
    try {
      await transcript.append({
        sessionId: transcript.sessionId,
        episodeId: `${transcript.sessionId}:${episode}`,
        timestamp: new Date().toISOString(),
        sequence,
        kind,
        ...(input === undefined ? {} : { input }),
        ...(event === undefined ? {} : { event }),
        observation,
      });
    } catch {
      transcriptFailed = true;
      return Object.freeze({ sequence, text: Object.freeze([TRANSCRIPT_FAILED]) });
    }
    return observation;
  }

  function enqueue<T>(operation: () => Promise<T>): Promise<T> {
    if (closing) return Promise.reject(new Error("This headless session is closed."));
    const result = queue.then(() => {
      if (transcriptFailed) throw new Error(TRANSCRIPT_FAILED);
      return operation();
    });
    // A failed operation must not poison cleanup or later queued requests.
    queue = result.then(() => undefined, () => undefined);
    return result;
  }

  async function initialize(kind: "start" | "reset"): Promise<Observation> {
    state = undefined;
    opening = undefined;
    blocked = undefined;
    lastRoomDescription = undefined;
    episode += 1;
    try {
      clearSessionPresentation();
      clearManualSnapshot();
      clearResumeSnapshot();
      const fresh = await createFreshGameState();
      if (fresh.player.roomId !== FINAL_PLAYER_START_ROOM_ID) {
        throw new Error("Production start unavailable.");
      }
      // Authored dialogue is an ordinary player setting; no external service
      // or alternate NPC implementation is required by this first milestone.
      state = await hydrate({
        ...fresh,
        uiState: { ...fresh.uiState, conversationMode: "authored" },
      });
      state = appendLog(state, FIRST_RUN_HELP_HINT);
      const room = currentRoomPresentation(state);
      lastRoomDescription = room.description;
      opening = await record(kind, [OPENING_SPLASH, FIRST_RUN_HELP_HINT, room.fullText]);
      return opening;
    } catch {
      state = undefined;
      blocked = "The game could not be initialized. Reset the session to try again.";
      return record(kind, [blocked]);
    }
  }

  async function command(input: string): Promise<Observation> {
    return enqueue(async () => {
      // Runtime callers do not necessarily obey TypeScript's input contract.
      if (typeof input !== "string") return record("command", ["Enter a command as text."]);
      const trimmed = input.trim();
      if (!trimmed) return record("command", [], trimmed);
      const parsed = parseCommand(trimmed);
      if (parsed.type === "developerMode") {
        return record("command", ["That command is unavailable to players."], trimmed);
      }
      if (blocked) return record("command", [blocked], trimmed);
      if (!state) return record("command", ["Start a game session first."], trimmed);

      try {
        if (requiresGameplayAdapter(state)) {
          blocked = ADAPTER_REQUIRED;
          return record("command", [blocked], trimmed);
        }
        const previous = state;
        const output: string[] = [];
        const pending = getPendingConversationLogMessage(previous, parsed);
        const current = pending
          ? appendLog(appendLog(previous, `> ${trimmed}`), pending)
          : previous;
        if (pending) output.push(`> ${trimmed}`, pending);
        const result = await handleCommand(current, parsed, {
          skipEcho: Boolean(pending),
          onOutput: (entries) => output.push(...entries),
        });
        state = reconcileObjectives(previous, result, {
          fromRoomId: previous.player.roomId,
          toRoomId: result.player.roomId,
        });

        if (parsed.type === "restart") {
          episode += 1;
          state = { ...state, uiState: { ...state.uiState, conversationMode: "authored" } };
        }
        if (parsed.type === "restart" || parsed.type === "restore") state = await hydrate(state);
        // Consume only informational output authorized by the engine. Reading
        // already applies logging, disposal and gossip acquisition in the action;
        // close notifications can be text without creating a UI lifecycle.
        const overlay = useUIOverlayStore.getState().overlay;
        if (overlay.kind === "reader" || overlay.kind === "help") {
          output.push(overlay.kind === "reader"
            ? `${overlay.title}\n\n${overlay.body}`
            : buildHelpText(state.uiState.conversationMode));
          useUIOverlayStore.getState().closeOverlay();
          if (overlay.postCloseMessage) {
            state = appendLog(state, overlay.postCloseMessage);
            output.push(overlay.postCloseMessage);
          }
          for (const notification of overlay.postCloseNotifications ?? []) output.push(notification.text);
        }
        for (const notification of state.uiState.notifications) {
          if (notification.id >= previous.uiState.nextNotificationId) output.push(notification.text);
        }
        if (requiresGameplayAdapter(state)) {
          blocked = ADAPTER_REQUIRED;
          return record("command", [...output, blocked], trimmed);
        }

        const room = currentRoomPresentation(state);
        const explicitLook = !previous.worldState.gameOver && parsed.type === "action" &&
          parsed.verb === "look" && !parsed.direct && !parsed.preposition;
        const needsDescription = explicitLook || state.player.roomId !== previous.player.roomId ||
          parsed.type === "restart" || parsed.type === "restore" || room.description !== lastRoomDescription;
        // Keep every engine/reader/notification message. Only the automatic
        // snapshot is conditional; first arrivals and look often narrate it
        // already, whereas revisits can narrate just the room's loose items.
        const alreadyNarrated = Boolean(room.description) && playerText(output.join("\n\n")).includes(room.description);
        lastRoomDescription = room.description;
        return record("command", [
          ...output,
          ...(parsed.type === "restart" ? [OPENING_SPLASH] : []),
          needsDescription && !alreadyNarrated ? room.fullText : room.summary,
          ...(!previous.worldState.gameOver && parsed.type === "inventory" ? [inventoryText(state)] : []),
          ...(!previous.worldState.gameOver && parsed.type === "diagnose" ? [statusText(state)] : []),
          ...(parsed.type === "comet"
            ? ["This prototype does not yet project that panel's information."]
            : []),
        ], trimmed, parsed.type === "restart" || parsed.type === "restore" ? parsed.type : undefined);
      } catch {
        // No exception, stack, internal identifier, or partial state reaches
        // the player. A reset is required after an uncertain engine failure.
        blocked = COMMAND_FAILED;
        return record("command", [blocked], trimmed);
      }
    });
  }

  async function information(view: InformationView, selection?: number): Promise<Observation> {
    return enqueue(async () => {
      if (!["log", "gossip", "dna", "objectives", "room", "history"].includes(view)) {
        return record("information", ["Available information views: log, gossip, dna, objectives, room, history."]);
      }
      const input = `:${view}${selection === undefined ? "" : typeof selection === "number" ? ` ${selection}` : " [invalid selection]"}`;
      if (blocked) return record("information", [blocked], input);
      if (!state) return record("information", ["Start a game session first."], input);
      if (requiresGameplayAdapter(state)) return record("information", [ADAPTER_REQUIRED], input);
      if (state.worldState.gameOver) {
        return record("information", ["That information is unavailable while the game is over. Restart or reset to continue."], input);
      }
      try {
        // No engine command, objective reconciliation, overlay, or file read is
        // needed for a free sidebar view. Only the observation is persisted.
        const text = informationText(state, view, selection);
        if (view === "room" && selection === undefined) lastRoomDescription = currentRoomPresentation(state).description;
        return record("information", [text], input);
      } catch {
        return record("information", ["That information could not be displayed."], input);
      }
    });
  }

  return Object.freeze({
    explorer: Object.freeze({ command, information }),
    start: () => enqueue(async () => opening ?? initialize("start")),
    reset: () => enqueue(() => initialize("reset")),
    transcript: transcript.info,
    dispose: () => {
      if (!disposal) {
        closing = true;
        disposal = queue.then(async () => {
          try {
            clearSessionPresentation();
            if (!transcriptFailed) await record("end", []);
          } finally {
            try {
              await transcript.close();
            } finally {
              state = undefined;
              sessionInUse = false;
            }
          }
          if (transcriptFailed) throw new Error(TRANSCRIPT_FAILED);
        });
      }
      return disposal;
    },
  });
}
