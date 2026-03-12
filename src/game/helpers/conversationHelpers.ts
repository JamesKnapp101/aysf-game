import { appendLog } from "@game/engine/handleCommand";
import { getCharacterProfile } from "@game/npcProfiles";
import { NPC_DIALOG, resolveAskTopic } from "@game/npcDialog";
import { getNpcById } from "@game/npcRegistry";
import { normalize, resolveConversationTarget } from "@game/rules/scope";
import { getClaudeResponse } from "@game/services/claudeClient";
import type { ActionResult } from "@game/types/actionsTypes";
import type { GameState } from "@game/types/gameTypes";
import type { Item } from "@game/types/itemTypes";
import type {
  ConversationHistoryEntry,
  ConversationNpc,
  NpcConversationState,
  RadioState,
} from "@game/types/npcTypes";
import type { ParsedCommand } from "@game/types/parserTypes";

export function getActiveRadioNpc(
  state: GameState,
): ConversationNpc | undefined {
  return getNpcById(state.radio?.activeNpcId);
}

export function getRadioTurnsRemaining(state: GameState): number | undefined {
  return state.radio?.turnsRemaining;
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

  const npc =
    target.kind === "npc"
      ? target.npc
      : isRadioTargetItem(target.item)
        ? getActiveRadioNpc(state)
        : undefined;

  const profile = getCharacterProfile(npc?.characterProfileId);
  if (!npc?.aiEnabled || !profile) {
    return undefined;
  }

  return `${npc.name} considers this...`;
}

function ensureConversation(state: GameState): GameState {
  if (state.conversation) return state;
  return { ...state, conversation: {} };
}

function getNpcConversationState(
  state: GameState,
  npcId: string,
): NpcConversationState | undefined {
  return state.conversation?.npcs?.[npcId];
}

function setNpcConversationState(
  state: GameState,
  npcId: string,
  nextNpcConversation: NpcConversationState,
): GameState {
  state = ensureConversation(state);
  return {
    ...state,
    conversation: {
      ...state.conversation,
      npcs: {
        ...(state.conversation?.npcs ?? {}),
        [npcId]: nextNpcConversation,
      },
    },
  };
}

function setRadioState(state: GameState, nextRadio: RadioState): GameState {
  return {
    ...state,
    radio: nextRadio,
  };
}

function resetNpcTopicUsage(state: GameState, npcId: string): GameState {
  const prevConversation = getNpcConversationState(state, npcId) ?? {};
  return setNpcConversationState(state, npcId, {
    ...prevConversation,
    topicsUsed: {},
  });
}

function markNpcTopicUsed(
  state: GameState,
  npcId: string,
  topic: string,
): GameState {
  const prevConversation = getNpcConversationState(state, npcId) ?? {};
  const used = { ...(prevConversation.topicsUsed ?? {}) };
  used[topic] = true;

  return setNpcConversationState(state, npcId, {
    ...prevConversation,
    topicsUsed: used,
  });
}

function hasNpcTopicBeenUsed(
  state: GameState,
  npcId: string,
  topic: string,
): boolean {
  return Boolean(getNpcConversationState(state, npcId)?.topicsUsed?.[topic]);
}

function getNpcConversationHistory(
  state: GameState,
  npcId: string,
): ConversationHistoryEntry[] {
  return getNpcConversationState(state, npcId)?.conversationHistory ?? [];
}

function appendNpcConversationHistory(
  state: GameState,
  npcId: string,
  historyEntry: ConversationHistoryEntry,
): GameState {
  const prevConversation = getNpcConversationState(state, npcId) ?? {};
  const conversationHistory = prevConversation.conversationHistory ?? [];

  return setNpcConversationState(state, npcId, {
    ...prevConversation,
    conversationHistory: [...conversationHistory, historyEntry],
  });
}

export function startRadioCall(
  state: GameState,
  npcId: string,
  turnsRemaining: number,
  opts?: {
    incomingMessage?: string;
    beep?: boolean;
  },
): GameState {
  const npc = getNpcById(npcId);
  if (!npc) return state;

  const beepPrefix = opts?.beep === false ? "" : `*pop*`;
  const incomingMessage =
    opts?.incomingMessage ??
    `${beepPrefix}"${npc.name}?" A voice crackles through the radio.`;

  const prevRadio = state.radio ?? {};
  const prevQueue = prevRadio.queuedLog ?? [];

  const nextState = resetNpcTopicUsage(state, npcId);
  return setRadioState(nextState, {
    ...prevRadio,
    activeNpcId: npcId,
    turnsRemaining: Math.max(0, Math.floor(turnsRemaining)),
    queuedLog: [...prevQueue, incomingMessage],
  });
}

export function drainRadioQueuedLog(state: GameState): {
  state: GameState;
  entries: string[];
} {
  const radio = state.radio;
  const entries = radio?.queuedLog ?? [];
  if (entries.length === 0) return { state, entries: [] };

  return {
    state: setRadioState(state, {
      ...(radio ?? {}),
      queuedLog: [],
    }),
    entries,
  };
}

export function endRadioCall(state: GameState): GameState {
  const radio = state.radio;
  const activeNpcId = radio?.activeNpcId;
  if (!radio || !activeNpcId) return state;

  const nextState = setRadioState(state, {
    ...radio,
    activeNpcId: undefined,
    turnsRemaining: undefined,
  });

  const signOff = NPC_DIALOG[activeNpcId]?.signOff;
  if (!signOff) return nextState;

  return appendLog(nextState, `*pop* ${signOff} *pop*`);
}

export function tickRadioConversation(state: GameState): {
  state: GameState;
  ended: boolean;
} {
  const radio = state.radio;
  if (!radio?.activeNpcId) return { state, ended: false };

  const remaining =
    typeof radio.turnsRemaining === "number" ? radio.turnsRemaining : 0;
  const nextRemaining = remaining - 1;

  if (nextRemaining > 0) {
    return {
      state: setRadioState(state, {
        ...radio,
        turnsRemaining: nextRemaining,
      }),
      ended: false,
    };
  }

  return { state: endRadioCall(state), ended: true };
}

export function isRadioTargetItem(item: Item): boolean {
  if (normalize(item.id) === "radio") return true;

  const vocab = (item.vocab ?? []).map(normalize);
  return (
    vocab.includes("radio") || vocab.includes("walkie") || vocab.includes("cb")
  );
}

async function getNpcAiResponse(
  state: GameState,
  npc: ConversationNpc,
  playerInput: { type: "ask" | "tell"; topic: string },
): Promise<{ state: GameState; response: string | null }> {
  const profile = getCharacterProfile(npc.characterProfileId);
  if (!npc.aiEnabled || !profile) {
    return { state, response: null };
  }

  const conversationHistory = getNpcConversationHistory(state, npc.id);

  try {
    const claudeResponse = await getClaudeResponse(
      npc.id,
      profile,
      conversationHistory,
      playerInput,
    );

    if (!claudeResponse) {
      return { state, response: null };
    }

    const historyEntry: ConversationHistoryEntry = {
      turn: state.moves,
      type: playerInput.type,
      topic: playerInput.topic,
      response: claudeResponse,
    };

    return {
      state: appendNpcConversationHistory(state, npc.id, historyEntry),
      response: claudeResponse,
    };
  } catch (error) {
    console.warn("Claude integration error, using fallback:", error);
    return { state, response: null };
  }
}

function wrapRadioLine(text: string): string {
  return `*pop* ${text} *pop*`;
}

async function askRadioNpc(
  state: GameState,
  npc: ConversationNpc,
  topic: string,
): Promise<ActionResult> {
  const aiResult = await getNpcAiResponse(state, npc, { type: "ask", topic });
  if (aiResult.response) {
    return {
      state: aiResult.state,
      message: wrapRadioLine(aiResult.response),
    };
  }

  if (hasNpcTopicBeenUsed(state, npc.id, topic)) {
    return {
      state,
      message: wrapRadioLine(`"I don't know anything more about that (cough)..."`),
    };
  }

  const nextState = markNpcTopicUsed(state, npc.id, topic);
  const line =
    NPC_DIALOG[npc.id]?.ask?.[resolveAskTopic(topic)] ??
    defaultRadioAskLine(topic);

  return { state: nextState, message: wrapRadioLine(line) };
}

async function tellRadioNpc(
  state: GameState,
  npc: ConversationNpc,
  topic: string,
): Promise<ActionResult> {
  const aiResult = await getNpcAiResponse(state, npc, {
    type: "tell",
    topic,
  });
  if (aiResult.response) {
    return {
      state: aiResult.state,
      message: wrapRadioLine(aiResult.response),
    };
  }

  const topicKey = `tell:${topic}`;
  if (hasNpcTopicBeenUsed(state, npc.id, topicKey)) {
    return {
      state,
      message: wrapRadioLine(`"I know (cough)...you (cough) told me..."`),
    };
  }

  const nextState = markNpcTopicUsed(state, npc.id, topicKey);
  const line =
    NPC_DIALOG[npc.id]?.tell?.[resolveAskTopic(topic)] ?? defaultRadioTellLine();

  return { state: nextState, message: wrapRadioLine(line) };
}

export async function askRadioDevice(
  state: GameState,
  topic: string,
): Promise<ActionResult> {
  const npc = getActiveRadioNpc(state);
  if (!npc) return { state, message: "Only static answers." };
  return askRadioNpc(state, npc, topic);
}

export async function tellRadioDevice(
  state: GameState,
  topic: string,
): Promise<ActionResult> {
  const npc = getActiveRadioNpc(state);
  if (!npc) return { state, message: "Only static answers." };
  return tellRadioNpc(state, npc, topic);
}

export async function askNpc(
  state: GameState,
  npc: ConversationNpc,
  topic: string,
  via: "radio" | "direct" = "direct",
): Promise<ActionResult> {
  if (via === "radio") {
    return askRadioNpc(state, npc, topic);
  }

  const aiResult = await getNpcAiResponse(state, npc, { type: "ask", topic });
  if (aiResult.response) {
    return {
      state: aiResult.state,
      message: `"${aiResult.response}"`,
    };
  }

  if (npc.id === "RangerBot") {
    const line =
      NPC_DIALOG[npc.id]?.ask?.[resolveAskTopic(topic)] ?? defaultRangerAskLine();
    return { state, message: `"${line}"` };
  }

  return { state, message: `${npc.name} has nothing to say about that.` };
}

export async function tellNpc(
  state: GameState,
  npc: ConversationNpc,
  topic: string,
  via: "radio" | "direct" = "direct",
): Promise<ActionResult> {
  if (via === "radio") {
    return tellRadioNpc(state, npc, topic);
  }

  const aiResult = await getNpcAiResponse(state, npc, {
    type: "tell",
    topic,
  });
  if (aiResult.response) {
    return {
      state: aiResult.state,
      message: `"${aiResult.response}"`,
    };
  }

  if (npc.id === "RangerBot") {
    const line =
      NPC_DIALOG[npc.id]?.tell?.[resolveAskTopic(topic)] ??
      defaultRangerTellLine();
    return { state, message: `"${line}"` };
  }

  return { state, message: `${npc.name} doesn't seem to care.` };
}

function defaultRadioAskLine(topic: string): string {
  return `"I (cough) don't really know anything about any ${topic}..."`;
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
