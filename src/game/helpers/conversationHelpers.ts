import { appendLog } from "@game/engine/handleCommand";
import {
  RADIO_DIALOG,
  RANGERBOT_DIALOG,
  resolveAskTopic,
} from "@game/npcDialog";
import { normalize, resolveConversationTarget } from "@game/rules/scope";
import { getClaudeResponse } from "@game/services/claudeClient";
import { ActionResult } from "@game/types/actionsTypes";
import { GameState } from "@game/types/gameTypes";
import { Item } from "@game/types/itemTypes";
import { ConversationHistoryEntry, RadioVoice } from "@game/types/npcTypes";
import { ParsedCommand } from "@game/types/parserTypes";

export function getActiveRadioVoice(state: GameState): RadioVoice | undefined {
  return state.conversation?.radio?.activeVoice;
}

export function getRadioTurnsRemaining(state: GameState): number | undefined {
  return state.conversation?.radio?.turnsRemaining;
}

export function getPendingConversationLogMessage(
  state: GameState,
  cmd: ParsedCommand,
): string | undefined {
  if (
    cmd.type !== "action" ||
    (cmd.verb !== "ask" && cmd.verb !== "tell") ||
    !cmd.direct?.trim()
  ) {
    return undefined;
  }

  const target = resolveConversationTarget(state, cmd.direct.trim());
  if (!target) return undefined;

  const voice =
    target.kind === "radioVoice"
      ? target.voice
      : isRadioTargetItem(target.item)
        ? getActiveRadioVoice(state)
        : undefined;

  if (!voice?.aiEnabled || !voice.characterProfile) {
    return undefined;
  }

  return `${voice.name} considers this...`;
}

function ensureConversation(state: GameState): GameState {
  if (state.conversation) return state;
  return { ...state, conversation: {} };
}

function ensureRadioConversation(state: GameState): GameState {
  state = ensureConversation(state);
  if (state.conversation!.radio) return state;
  return { ...state, conversation: { ...state.conversation, radio: {} } };
}

function setRadioConversation(
  state: GameState,
  nextRadio: NonNullable<NonNullable<GameState["conversation"]>["radio"]>,
): GameState {
  state = ensureConversation(state);
  return {
    ...state,
    conversation: { ...state.conversation, radio: nextRadio },
  };
}

export function startRadioCall(
  state: GameState,
  voice: RadioVoice,
  turnsRemaining: number,
  opts?: {
    incomingMessage?: string;
    beep?: boolean;
  },
): GameState {
  const beepPrefix = opts?.beep === false ? "" : `*pop*`;
  const incomingMessage =
    opts?.incomingMessage ??
    `${beepPrefix}"${voice.name}?" A voice crackles through the radio.`;

  const prevRadio = state.conversation?.radio ?? {};
  const prevQueue = prevRadio.queuedLog ?? [];

  const nextRadio = {
    ...prevRadio,
    activeVoice: voice,
    turnsRemaining: Math.max(0, Math.floor(turnsRemaining)),
    topicsUsed: {},
    queuedLog: [...prevQueue, incomingMessage],
  };

  return {
    ...state,
    conversation: {
      ...(state.conversation ?? {}),
      radio: nextRadio,
    },
  };
}

export function drainRadioQueuedLog(state: GameState): {
  state: GameState;
  entries: string[];
} {
  const radio = state.conversation?.radio;
  const entries = radio?.queuedLog ?? [];
  if (entries.length === 0) return { state, entries: [] };

  const nextRadio = { ...radio, queuedLog: [] };

  return {
    state: {
      ...state,
      conversation: {
        ...(state.conversation ?? {}),
        radio: nextRadio,
      },
    },
    entries,
  };
}

// End a call explicitly (and optionally supply a final message for the log system if you want)
export function endRadioCall(state: GameState): GameState {
  if (!state.conversation?.radio) return state;
  let next = state;
  const prev = state.conversation.radio;

  next = setRadioConversation(state, {
    ...prev,
    activeVoice: undefined,
    turnsRemaining: undefined,
    topicsUsed: undefined,
  });
  return appendLog(
    next,
    "*pop* " +
      (RADIO_DIALOG[state.conversation.radio.activeVoice?.id ?? ""]?.signOff ??
        "") +
      " *pop*",
  );
}

// Decrement the timer once per *turn* while a call is active.
// Call this from your central "after command" pipeline.
export function tickRadioConversation(state: GameState): {
  state: GameState;
  ended: boolean;
} {
  const radio = state.conversation?.radio;
  if (!radio?.activeVoice) return { state, ended: false };

  const remaining =
    typeof radio.turnsRemaining === "number" ? radio.turnsRemaining : 0;
  const nextRemaining = remaining - 1;

  if (nextRemaining > 0) {
    return {
      state: setRadioConversation(state, {
        ...radio,
        turnsRemaining: nextRemaining,
      }),
      ended: false,
    };
  }

  // Connection ends now.
  return { state: endRadioCall(state), ended: true };
}

export function isRadioTargetItem(item: Item): boolean {
  if (normalize(item.id) === "radio") return true;

  // Optional extra robustness: match vocab too
  const vocab = (item.vocab ?? []).map(normalize);
  return (
    vocab.includes("radio") || vocab.includes("walkie") || vocab.includes("cb")
  );
}

export function isRangerBotTargetItem(item: Item): boolean {
  if (normalize(item.id) === "RangerBot") return true;

  // Optional extra robustness: match vocab too
  const vocab = (item.vocab ?? []).map(normalize);
  return (
    vocab.includes("robot") ||
    vocab.includes("rangerbot") ||
    vocab.includes("parkbot") ||
    vocab.includes("bot")
  );
}

// ----------------
// Radio behavior
// ----------------

export async function askRadioDevice(
  state: GameState,
  topic: string,
): Promise<ActionResult> {
  const voice = getActiveRadioVoice(state);
  if (!voice) return { state, message: "Only static answers." };
  return await askRadioVoice(state, voice, topic);
}

export async function tellRadioDevice(
  state: GameState,
  topic: string,
): Promise<ActionResult> {
  const voice = getActiveRadioVoice(state);
  if (!voice) return { state, message: "Only static answers." };
  return await tellRadioVoice(state, voice, topic);
}

// Track used topics so repeated questions can get a different response
function markTopicUsed(state: GameState, topic: string): GameState {
  state = ensureRadioConversation(state);
  const radio = state.conversation!.radio!;
  const used = { ...(radio.topicsUsed ?? {}) };
  used[topic] = true;
  return setRadioConversation(state, { ...radio, topicsUsed: used });
}

function hasTopicBeenUsed(state: GameState, topic: string): boolean {
  return Boolean(state.conversation?.radio?.topicsUsed?.[topic]);
}

export async function askRadioVoice(
  state: GameState,
  voice: RadioVoice,
  topic: string,
): Promise<ActionResult> {
  // Try Claude AI if enabled
  if (voice.aiEnabled && voice.characterProfile) {
    const conversationHistory =
      state.conversation?.radio?.conversationHistory || [];

    try {
      const claudeResponse = await getClaudeResponse(
        voice.id,
        voice.characterProfile,
        conversationHistory,
        { type: "ask", topic },
      );

      if (claudeResponse) {
        // Add to conversation history
        const historyEntry: ConversationHistoryEntry = {
          turn: state.moves,
          type: "ask",
          topic,
          response: claudeResponse,
        };

        const nextState = {
          ...state,
          conversation: {
            ...state.conversation,
            radio: {
              ...state.conversation?.radio,
              conversationHistory: [...conversationHistory, historyEntry],
            },
          },
        };

        return {
          state: nextState,
          message: `*pop* ${claudeResponse} *pop*`,
        };
      }
      // Falls through to static dialog if Claude fails
    } catch (error) {
      console.warn("Claude integration error, using fallback:", error);
    }
  }

  // Static fallback (original implementation)
  if (hasTopicBeenUsed(state, topic)) {
    return {
      state,
      message: `*pop* "I don't know anything more about that (cough)..." *pop*`,
    };
  }
  const nextState = markTopicUsed(state, topic);
  const line = `*pop* ${
    RADIO_DIALOG[voice.id]?.ask?.[resolveAskTopic(topic)] ??
    defaultRadioAskLine(topic)
  } *pop*`;

  return { state: nextState, message: line };
}

export async function tellRadioVoice(
  state: GameState,
  voice: RadioVoice,
  topic: string,
): Promise<ActionResult> {
  // Try Claude AI if enabled
  if (voice.aiEnabled && voice.characterProfile) {
    const conversationHistory =
      state.conversation?.radio?.conversationHistory || [];

    try {
      const claudeResponse = await getClaudeResponse(
        voice.id,
        voice.characterProfile,
        conversationHistory,
        { type: "tell", topic },
      );

      if (claudeResponse) {
        // Add to conversation history
        const historyEntry: ConversationHistoryEntry = {
          turn: state.moves,
          type: "tell",
          topic,
          response: claudeResponse,
        };

        const nextState = {
          ...state,
          conversation: {
            ...state.conversation,
            radio: {
              ...state.conversation?.radio,
              conversationHistory: [...conversationHistory, historyEntry],
            },
          },
        };

        return {
          state: nextState,
          message: `*pop* ${claudeResponse} *pop*`,
        };
      }
      // Falls through to static dialog if Claude fails
    } catch (error) {
      console.warn("Claude integration error, using fallback:", error);
    }
  }

  // Static fallback (original implementation)
  if (hasTopicBeenUsed(state, `tell:${topic}`)) {
    return {
      state,
      message: `*pop* "I know (cough)...you (cough) told me..." *pop*`,
    };
  }

  const nextState = markTopicUsed(state, `tell:${topic}`);

  const line = `*pop* ${
    RADIO_DIALOG[voice.id]?.tell?.[resolveAskTopic(topic)] ??
    defaultRadioTellLine()
  } *pop*`;

  return { state: nextState, message: line };
}

export function askNpc(
  state: GameState,
  npc: Item,
  topic: string,
): ActionResult {
  if (npc.name === "Ranger Rick") {
    const line = `"${
      RANGERBOT_DIALOG[npc.id]?.ask?.[resolveAskTopic(topic)] ??
      defaultRangerAskLine()
    }"`;

    return { state, message: line };
  }
  return { state, message: `${npc.name} has nothing to say about that.` };
}

export function tellNpc(
  state: GameState,
  npc: Item,
  topic: string,
): ActionResult {
  if (npc.name === "Ranger Rick") {
    const line = `"${
      RANGERBOT_DIALOG[npc.id]?.tell?.[resolveAskTopic(topic)] ??
      defaultRangerTellLine()
    }"`;

    return { state, message: line };
  }
  return { state, message: `${npc.name} doesn't seem to care.` };
}

function defaultRadioAskLine(topic: string): string {
  return `*pop* "I (cough) don't really know anything about any ${topic}..." *pop*`;
}

function defaultRangerAskLine(): string {
  return `Does that relate in some way to a park pass?`;
}

function defaultRadioTellLine(): string {
  return `"Roger that (cough)..."`;
}

function defaultRangerTellLine(): string {
  return `Roger that, sir!`;
}
