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
import {
  mapInformationLabel,
  type MapInformationOptions,
} from "../map/shipMapText";
import {
  clearManualSnapshot,
  clearResumeSnapshot,
} from "../persistence/resumeStorage";
import { reconcileObjectives } from "../rules/objectives";
import { subscribeAiConversationFailures, type AiConversationFailure } from "../services/conversationDiagnostics";
import { useUIEffectsStore, useUIOverlayStore } from "../store/store";
import { buildHelpText } from "../text/help";
import type { GameState } from "../types/gameTypes";
import { cameraGunCommand, cameraGunPresentation } from "./cameraGun";
import { missingCapabilityDiagnostic } from "./capabilityDiagnostics";
import { informationText } from "./information";
import { consumeMindFlashSequence } from "./memorySequence";
import { createMessageMachineAdapter } from "./messageMachine";
import { consumeOrganismDeathSequence } from "./organismDeathSequence";
import {
  ADAPTER_REQUIRED,
  currentRoomPresentation,
  inventoryText,
  playerText,
  requiresGameplayAdapter,
  statusText,
} from "./playerView";
import {
  simpleOverlayCommand,
  simpleOverlayPresentation,
  supportsSimpleOverlay,
} from "./simpleOverlays";
import {
  createTerminalOverlayAdapter,
  supportsTerminalOverlay,
} from "./terminalOverlays";
import { createTranscript, TRANSCRIPT_FAILED } from "./transcript";
import {
  evaluateScenario, prepareScenario, runtimeSnapshot, scenarioMetadata, ScenarioError,
  summarizeState, validateScenario, playerIsAlive,
} from "./scenario";
import type { DeathEvent, GoalEvaluation, HostStatus, ScenarioMetadata, StateSummary } from "./scenario";
import type {
  ActionExplanation,
  InformationView,
  MissingCapabilityDiagnostic,
  Observation,
  SessionController,
  SessionEndOptions,
  SessionOptions,
  TranscriptEntry,
} from "./types";

let sessionInUse = false;
const COMMAND_FAILED =
  "The command could not be completed. Reset the session to continue.";

async function hydrate(state: GameState): Promise<GameState> {
  let next = state;
  for (const chunkId of DEFERRED_WORLD_CHUNK_IDS) {
    if (isWorldChunkLoaded(next.world, chunkId)) continue;
    next = mergeWorldChunkIntoState(
      next,
      chunkId,
      await loadWorldChunk(chunkId),
    );
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
export function createHeadlessSession(
  options: SessionOptions = {},
): SessionController {
  if (sessionInUse)
    throw new Error("Only one headless session can be open at a time.");
  if (options.scenario) validateScenario(options.scenario);
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
  let initialState: StateSummary | undefined;
  let metadata: ScenarioMetadata | undefined;
  let evaluation: GoalEvaluation | undefined;
  let gameTurns = 0;
  let lastMoves = 0;
  let deaths = 0;
  let lastHuskCount = 0;
  let lastDeaths: GameState["worldState"]["playerDeaths"] = {};
  let lastAlive = true;
  const deathEvents: DeathEvent[] = [];
  let recoveryAttempts = 0;
  let awaitingRecovery = false;
  const hostStatus = (): HostStatus | undefined => state && initialState ? {
    conversationMode: state.uiState.conversationMode,
    ...(metadata ? { scenario: metadata } : {}), initial: initialState,
    final: summarizeState(state), gameTurns, deaths, deathEvents: [...deathEvents], recoveryAttempts,
    ...(evaluation ? { evaluation } : {}),
    ...(metadata ? { finalGameState: runtimeSnapshot(state) } : {}),
  } : undefined;
  const messageMachine = createMessageMachineAdapter();
  const terminals = createTerminalOverlayAdapter();
  const capabilityDiagnostics: MissingCapabilityDiagnostic[] = [];
  const aiConversationFailures: AiConversationFailure[] = [];
  const unsubscribeFailures = subscribeAiConversationFailures((failure) => {
    aiConversationFailures.push(failure);
    options.onAiConversationFailure?.(failure);
  });

  function blockUnsupported(input: string | null, executed: boolean): void {
    if (state && capabilityDiagnostics.length === 0) {
      const diagnostic = missingCapabilityDiagnostic(state, input, executed);
      if (diagnostic) capabilityDiagnostics.push(diagnostic);
    }
    blocked = ADAPTER_REQUIRED;
  }
  async function recordEntry(
    kind: TranscriptEntry["kind"],
    text: string[],
    input?: string,
    event?: TranscriptEntry["event"],
    finalAgentMessage?: string,
    explanation?: ActionExplanation,
    agentSummary?: SessionEndOptions["agentSummary"],
    completedAction = false,
  ): Promise<Observation> {
    let deathEvent: DeathEvent | undefined;
    let recoveryAttempt: number | undefined;
    if (awaitingRecovery && (kind === "command" || kind === "information")) {
      recoveryAttempt = ++recoveryAttempts;
      awaitingRecovery = false;
    }
    if (kind === "command" && state) {
      if (event !== "restart" && event !== "restore") gameTurns += Math.max(0, state.moves - lastMoves);
      lastMoves = state.moves;
      const alive = playerIsAlive(state);
      const changedDeaths = Object.entries(state.worldState.playerDeaths).filter(([room, death]) => death !== lastDeaths[room]);
      // Husk deltas count repeated deaths in one room; death records also cover
      // encounters that regenerate without creating a husk. Never count echoes.
      const deathCount = event === "restart" || event === "restore" ? 0 : Math.max(
        0, state.worldState.playerHuskCount - lastHuskCount, changedDeaths.length, lastAlive && !alive ? 1 : 0,
      );
      const died = deathCount > 0;
      if (died) {
        deaths += deathCount;
        deathEvent = { sequence: sequence + 1, move: state.moves, count: deathCount, totalDeaths: deaths,
          deathRoomIds: changedDeaths.map(([room]) => room), roomId: state.player.roomId, regenerated: alive };
        deathEvents.push(deathEvent);
        awaitingRecovery = alive;
        if (options.scenario) {
          const room = currentRoomPresentation(state);
          const roomName = state.world.rooms.find(room => room.id === state!.player.roomId)?.name ?? "an unfamiliar location";
          text = [...text, `Death ${deaths}: ${alive ? `You died and regenerated. You are now in ${roomName}.` : "You died and have not regenerated."}`,
            ...(alive ? [room.fullText, inventoryText(state), statusText(state)] : [])];
        }
      }
      lastHuskCount = state.worldState.playerHuskCount;
      lastDeaths = state.worldState.playerDeaths;
      lastAlive = alive;
      // All command paths converge here after engine turns and automatic reveals.
      if (options.scenario && !blocked && completedAction) evaluation = evaluateScenario(options.scenario, state);
      if (died && evaluation && options.scenario?.success?.length) evaluation = { ...evaluation, verified: false, reason: "Player died during the resolved action (the game may already have regenerated the player)." };
    }
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
        ...(kind === "command" || kind === "information" ? explanation : {}),
        ...(kind === "command" && aiConversationFailures.length
          ? { aiConversationFailures: aiConversationFailures.splice(0) } : {}),
        ...(kind === "end" && finalAgentMessage !== undefined ? { finalAgentMessage } : {}),
        ...((kind === "start" || kind === "reset") && metadata ? { scenario: metadata, initialState } : {}),
        ...(kind === "end" && agentSummary ? { agentSummary } : {}),
        ...(deathEvent ? { deathEvent } : {}),
        ...(recoveryAttempt === undefined ? {} : { recoveryAttempt }),
      });
    } catch {
      transcriptFailed = true;
      return Object.freeze({
        sequence,
        text: Object.freeze([TRANSCRIPT_FAILED]),
      });
    }
    return observation;
  }

  function createActionRecorder(explanation?: ActionExplanation, leadingText: string[] = [], completedAction = () => false) {
    // Snapshot only public strings before queuing; callers cannot add state or mutate a pending record.
    const details: ActionExplanation = {
      ...(typeof explanation?.goal === "string" ? { goal: explanation.goal } : {}),
      ...(typeof explanation?.reason === "string" ? { reason: explanation.reason } : {}),
    };
    return (kind: "command" | "information", text: string[], input?: string, event?: TranscriptEntry["event"]) =>
      recordEntry(kind, [...leadingText, ...text], input, event, undefined, details, undefined, completedAction());
  }

  function enqueue<T>(operation: () => Promise<T>): Promise<T> {
    if (closing)
      return Promise.reject(new Error("This headless session is closed."));
    const result = queue.then(() => {
      if (transcriptFailed) throw new Error(TRANSCRIPT_FAILED);
      return operation();
    });
    // A failed operation must not poison cleanup or later queued requests.
    queue = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }

  async function initialize(kind: "start" | "reset"): Promise<Observation> {
    state = undefined;
    opening = undefined;
    blocked = undefined;
    lastRoomDescription = undefined;
    messageMachine.reset();
    terminals.reset();
    capabilityDiagnostics.length = 0;
    aiConversationFailures.length = 0;
    initialState = undefined;
    metadata = undefined;
    evaluation = undefined;
    gameTurns = 0;
    deaths = 0;
    deathEvents.length = 0;
    recoveryAttempts = 0;
    awaitingRecovery = false;
    episode += 1;
    try {
      clearSessionPresentation();
      clearManualSnapshot();
      clearResumeSnapshot();
      const fresh = await createFreshGameState();
      if (fresh.player.roomId !== FINAL_PLAYER_START_ROOM_ID) {
        throw new Error("Production start unavailable.");
      }
      // Preserve the existing session's NPC conversation setting.
      state = await hydrate({
        ...fresh,
        uiState: { ...fresh.uiState, conversationMode: "ai" },
      });
      if (options.scenario) {
        state = prepareScenario(state, options.scenario);
        metadata = scenarioMetadata(options.scenario, state);
        // Starting at a goal cannot bypass hazards: wait for a completed action.
        evaluation = options.scenario.success?.length
          ? { verified: false, checks: [], reason: "Awaiting a completed player action before verification." }
          : evaluateScenario(options.scenario, state);
      }
      initialState = summarizeState(state);
      lastMoves = state.moves;
      lastHuskCount = state.worldState.playerHuskCount;
      lastDeaths = state.worldState.playerDeaths;
      lastAlive = playerIsAlive(state);
      state = appendLog(state, FIRST_RUN_HELP_HINT);
      const room = currentRoomPresentation(state);
      lastRoomDescription = room.description;
      opening = await recordEntry(kind, [
        OPENING_SPLASH,
        FIRST_RUN_HELP_HINT,
        room.fullText,
      ]);
      return opening;
    } catch (error) {
      state = undefined;
      if (error instanceof ScenarioError) throw error;
      blocked =
        "The game could not be initialized. Reset the session to try again.";
      return recordEntry(kind, [blocked]);
    }
  }

  async function command(input: string, explanation?: ActionExplanation): Promise<Observation> {
    const leadingText: string[] = [];
    let completedAction = false;
    const record = createActionRecorder(explanation, leadingText, () => completedAction);
    return enqueue(async () => {
      // Runtime callers do not necessarily obey TypeScript's input contract.
      if (typeof input !== "string")
        return record("command", ["Enter a command as text."]);
      const trimmed = input.trim();
      if (!trimmed) return record("command", [], trimmed);
      let parsed = parseCommand(trimmed);
      if (parsed.type === "developerMode") {
        return record(
          "command",
          ["That command is unavailable to players."],
          trimmed,
        );
      }
      if (blocked) return record("command", [blocked], trimmed);
      if (!state)
        return record("command", ["Start a game session first."], trimmed);

      try {
        // An automatic reveal may already be pending when a request arrives.
        // Settle it before checking UI gates or executing another game action.
        const pendingDeath = consumeOrganismDeathSequence();
        leadingText.push(...pendingDeath.fragments);
        if (pendingDeath.completed) lastRoomDescription = undefined;
        if (requiresGameplayAdapter(state)) {
          blockUnsupported(null, false);
          return record("command", [ADAPTER_REQUIRED], trimmed);
        }
        const mountedOverlay = useUIOverlayStore.getState().overlay;
        if (mountedOverlay.kind === "camera-gun-viewer") {
          const control = await cameraGunCommand(
            state,
            mountedOverlay,
            trimmed,
          );
          state = control.state;
          if (!control.wait) {
            completedAction = true;
            const death = consumeOrganismDeathSequence();
            return record(
              "command",
              [...control.text, ...death.fragments, currentRoomPresentation(state).summary],
              trimmed,
            );
          }
          // Like OverlayHost's onRunCommand("wait"), use the normal engine path.
          // The transcript retains the requested WATCH control and its explanation.
          parsed = parseCommand("wait");
        }
        if (supportsTerminalOverlay(mountedOverlay.kind)) {
          // Reactor credentials are case/whitespace sensitive. Preserve supplied
          // form values while retaining the ordinary parser's existing behavior.
          const interfaceInput =
            mountedOverlay.kind === "reactor-control-terminal"
              ? input.trimStart()
              : trimmed;
          const previous = state;
          const result = await terminals.command(
            state,
            mountedOverlay,
            interfaceInput,
          );
          state = result.state;
          completedAction = true;
          const death = consumeOrganismDeathSequence();
          if (requiresGameplayAdapter(state)) {
            blockUnsupported(interfaceInput, true);
            return record(
              "command",
              [...result.text, ...death.fragments, ADAPTER_REQUIRED],
              interfaceInput,
            );
          }
          const room = currentRoomPresentation(state);
          const needsDescription =
            death.completed ||
            state.player.roomId !== previous.player.roomId ||
            room.description !== lastRoomDescription;
          const alreadyNarrated =
            Boolean(room.description) &&
            playerText(result.text.join("\n\n")).includes(room.description);
          lastRoomDescription = room.description;
          return record(
            "command",
            [
              ...result.text,
              ...death.fragments,
              needsDescription && !alreadyNarrated
                ? room.fullText
                : room.summary,
            ],
            interfaceInput,
          );
        }
        if (supportsSimpleOverlay(mountedOverlay.kind)) {
          const result = await simpleOverlayCommand(
            state,
            mountedOverlay,
            trimmed,
          );
          state = result.state;
          completedAction = true;
          const death = consumeOrganismDeathSequence();
          return record(
            "command",
            [...result.text, ...death.fragments, currentRoomPresentation(state).summary],
            trimmed,
          );
        }
        if (mountedOverlay.kind === "message-machine") {
          const result = await messageMachine.command(
            state,
            mountedOverlay,
            trimmed,
          );
          state = result.state;
          completedAction = true;
          if (result.closed) useUIOverlayStore.getState().closeOverlay();
          const death = consumeOrganismDeathSequence();
          return record(
            "command",
            [...result.text, ...death.fragments, currentRoomPresentation(state).summary],
            trimmed,
          );
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
        completedAction = parsed.type !== "unknown" && parsed.type !== "restart" && parsed.type !== "restore";
        state = reconcileObjectives(previous, result, {
          fromRoomId: previous.player.roomId,
          toRoomId: result.player.roomId,
        });

        if (parsed.type === "restart") {
          episode += 1;
          state = {
            ...state,
            uiState: { ...state.uiState, conversationMode: "ai" },
          };
        }
        if (parsed.type === "restart" || parsed.type === "restore")
          state = await hydrate(state);
        // Consume only informational output authorized by the engine. Reading
        // already applies logging, disposal and gossip acquisition in the action;
        // close notifications can be text without creating a UI lifecycle.
        let overlay = useUIOverlayStore.getState().overlay;
        if (overlay.kind === "reader" || overlay.kind === "help") {
          output.push(
            overlay.kind === "reader"
              ? `${overlay.title}\n\n${overlay.body}`
              : buildHelpText(state.uiState.conversationMode),
          );
          useUIOverlayStore.getState().closeOverlay();
          if (overlay.postCloseMessage) {
            state = appendLog(state, overlay.postCloseMessage);
            output.push(overlay.postCloseMessage);
          }
          for (const notification of overlay.postCloseNotifications ?? [])
            output.push(notification.text);
        }
        // Automatic fragments are one presentation operation inside this queued
        // command. No intervening player action or extra game turn is possible.
        const memory = consumeMindFlashSequence();
        output.push(...memory.fragments);
        const death = consumeOrganismDeathSequence();
        output.push(...death.fragments);
        // Completion callbacks can change the mounted interface.
        overlay = useUIOverlayStore.getState().overlay;
        if (supportsTerminalOverlay(overlay.kind))
          state = terminals.open(state, overlay);
        for (const notification of state.uiState.notifications) {
          if (notification.id >= previous.uiState.nextNotificationId)
            output.push(notification.text);
        }
        if (requiresGameplayAdapter(state)) {
          blockUnsupported(trimmed, true);
          return record("command", [...output, ADAPTER_REQUIRED], trimmed);
        }
        if (overlay.kind === "message-machine")
          output.push(messageMachine.presentation(state, overlay));
        if (supportsSimpleOverlay(overlay.kind))
          output.push(simpleOverlayPresentation(state, overlay));
        if (supportsTerminalOverlay(overlay.kind))
          output.push(terminals.presentation(state, overlay));
        if (overlay.kind === "camera-gun-viewer")
          output.push(cameraGunPresentation(state, overlay));

        const room = currentRoomPresentation(state);
        const explicitLook =
          !previous.worldState.gameOver &&
          parsed.type === "action" &&
          parsed.verb === "look" &&
          !parsed.direct &&
          !parsed.preposition;
        const needsDescription =
          memory.completed || death.completed ||
          explicitLook ||
          state.player.roomId !== previous.player.roomId ||
          parsed.type === "restart" ||
          parsed.type === "restore" ||
          room.description !== lastRoomDescription;
        // Keep every engine/reader/notification message. Only the automatic
        // snapshot is conditional; first arrivals and look often narrate it
        // already, whereas revisits can narrate just the room's loose items.
        const alreadyNarrated =
          !memory.completed && !death.completed &&
          Boolean(room.description) &&
          playerText(output.join("\n\n")).includes(room.description);
        lastRoomDescription = room.description;
        return record(
          "command",
          [
            ...output,
            ...(parsed.type === "restart" ? [OPENING_SPLASH] : []),
            needsDescription && !alreadyNarrated ? room.fullText : room.summary,
            ...(!previous.worldState.gameOver && parsed.type === "inventory"
              ? [inventoryText(state)]
              : []),
            ...(!previous.worldState.gameOver && parsed.type === "diagnose"
              ? [statusText(state)]
              : []),
            ...(parsed.type === "comet"
              ? [
                  "This prototype does not yet project that panel's information.",
                ]
              : []),
          ],
          trimmed,
          parsed.type === "restart" || parsed.type === "restore"
            ? parsed.type
            : undefined,
        );
      } catch {
        // No exception, stack, internal identifier, or partial state reaches
        // the player. A reset is required after an uncertain engine failure.
        blocked = COMMAND_FAILED;
        return record("command", [blocked], trimmed);
      }
    });
  }

  async function information(
    view: InformationView,
    selection?: number | MapInformationOptions,
    explanation?: ActionExplanation,
  ): Promise<Observation> {
    const leadingText: string[] = [];
    const record = createActionRecorder(explanation, leadingText);
    return enqueue(async () => {
      if (
        ![
          "log",
          "gossip",
          "dna",
          "objectives",
          "room",
          "history",
          "map",
        ].includes(view)
      ) {
        return record("information", [
          "Available information views: log, gossip, dna, objectives, room, history, map.",
        ]);
      }
      const input =
        view === "map"
          ? mapInformationLabel(selection)
          : `:${view}${selection === undefined ? "" : typeof selection === "number" ? ` ${selection}` : " [invalid selection]"}`;
      if (blocked) return record("information", [blocked], input);
      if (!state)
        return record("information", ["Start a game session first."], input);
      try {
        const pendingDeath = consumeOrganismDeathSequence();
        leadingText.push(...pendingDeath.fragments);
        if (pendingDeath.completed) lastRoomDescription = undefined;
        if (requiresGameplayAdapter(state)) {
          blockUnsupported(null, false);
          return record("information", [ADAPTER_REQUIRED], input);
        }
        if (state.worldState.gameOver && view !== "map") {
          return record(
            "information",
            [
              "That information is unavailable while the game is over. Restart or reset to continue.",
            ],
            input,
          );
        }
        // No engine command, objective reconciliation, overlay, or file read is
        // needed for a free sidebar view. Only the observation is persisted.
        const text = informationText(state, view, selection);
        if (view === "room" && selection === undefined)
          lastRoomDescription = currentRoomPresentation(state).description;
        return record("information", [text], input);
      } catch {
        return record(
          "information",
          ["That information could not be displayed."],
          input,
        );
      }
    });
  }

  return Object.freeze({
    ...(options.scenario ? { scenario: {
      id: options.scenario.id, objective: options.scenario.objective,
      maxDeaths: options.scenario.maxDeaths,
      budgets: options.scenario.budgets && { ...options.scenario.budgets },
    } } : {}),
    explorer: Object.freeze({ command, information }),
    start: () => enqueue(async () => opening ?? initialize("start")),
    reset: () => enqueue(() => initialize("reset")),
    transcript: transcript.info,
    capabilityDiagnostics: () => Object.freeze([...capabilityDiagnostics]),
    hostStatus: () => {
      const status = hostStatus();
      return status && structuredClone(status);
    },
    dispose: (end: SessionEndOptions = {}) => {
      if (!disposal) {
        const finalAgentMessage = end.finalAgentMessage;
        const agentSummary = end.agentSummary;
        closing = true;
        disposal = queue.then(async () => {
          try {
            clearSessionPresentation();
            if (!transcriptFailed) await recordEntry("end", [], undefined, undefined, finalAgentMessage, undefined, agentSummary);
          } finally {
            try {
              await transcript.close();
            } finally {
              state = undefined;
              messageMachine.reset();
              terminals.reset();
              sessionInUse = false;
              unsubscribeFailures();
            }
          }
          if (transcriptFailed) throw new Error(TRANSCRIPT_FAILED);
        });
      }
      return disposal;
    },
  });
}
