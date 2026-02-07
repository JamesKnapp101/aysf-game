import { appendLog } from "@game/engine/handleCommand";
import { RADIO_DIALOG, resolveAskTopic } from "@game/radioDialog";
import { normalize } from "@game/rules/scope";
import { ActionResult } from "@game/types/actionsTypes";
import { GameState } from "@game/types/gameTypes";
import { Item } from "@game/types/itemTypes";
import { RadioVoice } from "@game/types/npcTypes";

export function getActiveRadioVoice(state: GameState): RadioVoice | undefined {
  return state.conversation?.radio?.activeVoice;
}

export function getRadioTurnsRemaining(state: GameState): number | undefined {
  return state.conversation?.radio?.turnsRemaining;
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

// ----------------
// Radio behavior
// ----------------

export function askRadioDevice(state: GameState, topic: string): ActionResult {
  const voice = getActiveRadioVoice(state);
  if (!voice) return { state, message: "Only static answers." };
  return askRadioVoice(state, voice, topic);
}

export function tellRadioDevice(state: GameState, topic: string): ActionResult {
  const voice = getActiveRadioVoice(state);
  if (!voice) return { state, message: "Only static answers." };
  return tellRadioVoice(state, voice, topic);
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

export function askRadioVoice(
  state: GameState,
  voice: RadioVoice,
  topic: string,
): ActionResult {
  if (hasTopicBeenUsed(state, topic)) {
    return {
      state,
      message: `*pop* "I don't know anything more about that (cough)..." *pop*`,
    };
  }

  const nextState = markTopicUsed(state, topic);

  console.log("parsed topic is: ", topic);

  const line = `*pop* ${
    RADIO_DIALOG[voice.id]?.ask?.[resolveAskTopic(topic)] ??
    defaultRadioAskLine(voice, topic)
  } *pop*`;

  return { state: nextState, message: line };
}

export function tellRadioVoice(
  state: GameState,
  voice: RadioVoice,
  topic: string,
): ActionResult {
  if (hasTopicBeenUsed(state, `tell:${topic}`)) {
    return {
      state,
      message: `*pop* "I know (cough)...you (cough) told me..." *pop*`,
    };
  }

  const nextState = markTopicUsed(state, `tell:${topic}`);

  const line = `*pop* ${
    RADIO_DIALOG[voice.id]?.tell?.[resolveAskTopic(topic)] ??
    defaultRadioTellLine(voice, topic)
  } *pop*`;

  return { state: nextState, message: line };
}

export function askNpc(
  state: GameState,
  npc: Item,
  topic: string,
): ActionResult {
  return { state, message: `${npc.name} has nothing to say about that.` };
}

export function tellNpc(
  state: GameState,
  npc: Item,
  topic: string,
): ActionResult {
  return { state, message: `${npc.name} doesn't seem to care.` };
}

function defaultRadioAskLine(voice: RadioVoice, topic: string): string {
  return `*pop* "I (cough) don't really know anything about any ${topic}..." *pop*`;
}

function defaultRadioTellLine(voice: RadioVoice, topic: string): string {
  return `"Roger that (cough)..."`;
}
