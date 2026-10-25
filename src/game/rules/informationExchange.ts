import { getNpcById } from "@game/npcRegistry";
import {
  getGossipSharedWithNpc,
  getSecretForNpc,
  isNpcSecretRevealed,
  revealNpcSecretIfEligible,
} from "@game/npcSecrets";
import {
  getItemsInScope,
  normalize,
  resolveConversationTarget,
} from "@game/rules/scope";
import type { ActionResult } from "@game/types/actionsTypes";
import type { GameState, JuicyTopic } from "@game/types/gameTypes";
import type { ConversationNpc } from "@game/types/npcTypes";
import type { ParsedCommand } from "@game/types/parserTypes";
import { buildLogNotification, enqueueNotification } from "@game/rules/notifications";

export function requiresExchangePayment(
  state: GameState,
  npcId: string,
): boolean {
  const config = getNpcById(npcId)?.informationExchange;
  return Boolean(
    config?.paymentTrigger &&
    !state.worldState.conditionalTriggers[config.paymentTrigger],
  );
}

export function exchangeRefusal(
  state: GameState,
  npcId: string,
): string | undefined {
  const refusals = getNpcById(npcId)?.informationExchange?.refusals;
  if (!refusals?.length || !requiresExchangePayment(state, npcId)) return;
  // Refusals do not advance moves, so choose anew for every interaction.
  return refusals[Math.floor(state.rng() * refusals.length)];
}

export function sharedGossipIds(state: GameState, npcId: string): string[] {
  return getGossipSharedWithNpc(state, npcId);
}

export function gossipEligibleForNpc(
  topic: JuicyTopic,
  npcId: string,
): boolean {
  return topic.sourceNpcId !== npcId;
}

export function resolveKnownGossip(
  state: GameState,
  reference: string,
): JuicyTopic[] {
  const needle = normalize(reference);
  const topics = state.player.spiltTea ?? [];
  const exact = topics.filter((topic) =>
    [topic.id, topic.title].some((value) => normalize(value) === needle),
  );
  if (exact.length) return exact;
  return needle
    ? topics.filter((topic) => normalize(topic.title).includes(needle))
    : [];
}

export type ExchangeLine = { speaker: "Player" | "npc"; text: string };

function gossipLines(npc: ConversationNpc, topic: JuicyTopic): ExchangeLine[] {
  const config = npc.informationExchange!;
  return [
    { speaker: "Player", text: topic.summary },
    {
      speaker: "npc",
      text: config.responses[topic.id] ?? config.fallbackResponse,
    },
  ];
}

function revelationLines(npc: ConversationNpc): ExchangeLine[] {
  const secret = getSecretForNpc(npc.id);
  return secret
    ? [
        { speaker: "npc", text: npc.informationExchange!.secretTransition },
        { speaker: "npc", text: secret.text },
      ]
    : [];
}

export function exchangeTranscript(
  state: GameState,
  npcId: string,
): ExchangeLine[] {
  const npc = getNpcById(npcId);
  if (!npc?.informationExchange) return [];
  const secret = getSecretForNpc(npcId);
  const lines: ExchangeLine[] = [];
  const ids = sharedGossipIds(state, npcId);
  for (const [index, id] of ids.entries()) {
    const topic = state.player.spiltTea?.find((topic) => topic.id === id);
    if (topic) lines.push(...gossipLines(npc, topic));
    if (
      secret &&
      index + 1 === secret.requiredGossipCount &&
      isNpcSecretRevealed(state, npcId)
    ) {
      lines.push(...revelationLines(npc));
    }
  }
  // Legacy saves could have revealed the secret at the former threshold.
  if (
    secret &&
    ids.length < secret.requiredGossipCount &&
    isNpcSecretRevealed(state, npcId)
  ) {
    lines.push(...revelationLines(npc));
  }
  return lines;
}

export function formatExchangeTranscript(npcId: string, lines: ExchangeLine[]): string {
  return lines.map(line => `${line.speaker === "Player" ? "You" : npcId}: ${line.text}`).join("\n\n");
}

/** Derived dialogue for a single accepted command, also used by text-only clients. */
export function exchangeTurnTranscript(before: GameState, after: GameState, npcId: string): ExchangeLine[] {
  const npc = getNpcById(npcId);
  if (!npc?.informationExchange) return [];
  const previousIds = sharedGossipIds(before, npcId);
  const addedIds = sharedGossipIds(after, npcId).filter(id => !previousIds.includes(id));
  if (!addedIds.length) return [];
  const lines = addedIds.flatMap(id => {
    const topic = after.player.spiltTea.find(topic => topic.id === id);
    return topic ? gossipLines(npc, topic) : [];
  });
  if (!isNpcSecretRevealed(before, npcId) && isNpcSecretRevealed(after, npcId)) {
    lines.push(...revelationLines(npc));
  }
  return lines;
}

/** Keep one ordinary journal entry; progress remains authoritative in gossipToldIds. */
export function recordInformationExchange(state: GameState, npcId: string, notify = true): GameState {
  const lines = exchangeTranscript(state, npcId);
  if (!lines.length) return state;
  const title = `Gossip exchange with ${npcId}`;
  const entries = state.player.log ?? [];
  const index = entries.findIndex(entry => entry.source === npcId && entry.title === title);
  const previous = entries[index];
  const body = formatExchangeTranscript(npcId, lines);
  if (previous?.body === body) return state;
  const entry = previous ? { ...previous, body }
    : { source: npcId, title, loggedAtTurn: state.moves, body };
  const log = previous ? entries.map((current, i) => i === index ? entry : current) : [...entries, entry];
  const next = { ...state, player: { ...state.player, log } };
  return !previous && notify
    ? enqueueNotification(next, buildLogNotification("You log the message for future reference."))
    : next;
}

/** Older saves already contain the accepted IDs; backfill their journal silently. */
export function migrateInformationExchangeLogs(state: GameState): GameState {
  return Object.keys(state.conversation?.npcs ?? {}).reduce(
    (next, npcId) => recordInformationExchange(next, npcId, false), state,
  );
}

export function shareGossip(
  state: GameState,
  npcId: string,
  gossipId: string,
): ActionResult {
  const npc = getNpcById(npcId);
  const present = getItemsInScope(state).some(
    (item) =>
      item.id === npcId &&
      state.itemState.itemRoomId[item.id] === state.player.roomId,
  );
  if (!npc?.informationExchange || !present)
    return {
      state,
      message: "That gossip partner isn't here.",
      consumesTurn: false,
    };
  const refusal = exchangeRefusal(state, npcId);
  if (refusal) return { state, message: refusal, consumesTurn: false };
  const topic = state.player.spiltTea?.find((topic) => topic.id === gossipId);
  if (!topic)
    return {
      state,
      message: "You haven't collected that gossip.",
      consumesTurn: false,
    };
  if (!gossipEligibleForNpc(topic, npcId))
    return {
      state,
      message: "That secret came from this NPC. Find someone else to tell.",
      consumesTurn: false,
    };
  const ids = sharedGossipIds(state, npcId);
  if (ids.includes(gossipId))
    return {
      state,
      message: "You've already shared that gossip.",
      consumesTurn: false,
    };
  const previous = state.conversation?.npcs?.[npcId];
  let next: GameState = {
    ...state,
    conversation: {
      ...state.conversation,
      npcs: {
        ...state.conversation?.npcs,
        [npcId]: { ...previous, gossipToldIds: [...ids, gossipId] },
      },
    },
  };
  const revealed = isNpcSecretRevealed(next, npcId);
  next = revealNpcSecretIfEligible(next, npcId);
  const newlyRevealed = !revealed && isNpcSecretRevealed(next, npcId);
  next = recordInformationExchange(next, npcId);
  return {
    state: next,
    message: newlyRevealed ? npc.informationExchange.secretTransition : undefined,
  };
}

/** Explicit SHARE commands resolve authored knowledge, never model interpretations. */
export function shareKnownGossip(
  state: GameState,
  npc: ConversationNpc,
  reference: string,
): ActionResult | undefined {
  if (!npc.informationExchange) return;
  const refusal = exchangeRefusal(state, npc.id);
  if (refusal) return { state, message: refusal, consumesTurn: false };
  const matches = resolveKnownGossip(state, reference);
  if (matches.length !== 1) {
    return {
      state,
      message: matches.length
        ? "Which gossip do you mean? Use its full title or ID."
        : "Share gossip you've collected: use share gossip to see your topics.",
      consumesTurn: false,
    };
  }
  return shareGossip(state, npc.id, matches[0].id);
}

export function exchangeListing(state: GameState, npcId: string): string {
  const ids = sharedGossipIds(state, npcId);
  const topics = state.player.spiltTea ?? [];
  const listing = topics.map((topic) => {
    const status = ids.includes(topic.id)
      ? " (already shared)"
      : !gossipEligibleForNpc(topic, npcId)
        ? " (their own secret)"
        : "";
    return `- ${topic.title}${status}`;
  });
  return [
    `Gossip exchange with ${npcId}`,
    topics.length
      ? listing.join("\n")
      : "You don't really have anything salacious to share yet, maybe if you explore around you can uncover something juicy.",
    `Use share <topic title> with ${npcId.toLowerCase()} to share an entry.`,
  ].join("\n\n");
}

export function doShareGossip(
  state: GameState,
  cmd: ParsedCommand,
): ActionResult {
  if (cmd.type !== "action") return { state, consumesTurn: false };
  const target = cmd.indirect
    ? resolveConversationTarget(state, cmd.indirect)
    : undefined;
  const candidates = getItemsInScope(state).flatMap((item) => {
    const npc = getNpcById(item.id);
    return npc?.informationExchange &&
      state.itemState.itemRoomId[item.id] === state.player.roomId
      ? [npc]
      : [];
  });
  const npc = cmd.indirect
    ? target?.kind === "npc" &&
      target.via === "direct" &&
      target.npc.informationExchange
      ? target.npc
      : undefined
    : candidates.length === 1
      ? candidates[0]
      : undefined;
  if (!npc) {
    return {
      state,
      message:
        candidates.length > 1 && !cmd.indirect
          ? "Who would you like to share gossip with? Use share gossip with <name>."
          : "There's no one here to exchange gossip with.",
      consumesTurn: false,
    };
  }
  const refusal = exchangeRefusal(state, npc.id);
  if (refusal) return { state, message: refusal, consumesTurn: false };
  if (!["gossip", "tea"].includes(normalize(cmd.direct ?? ""))) {
    return shareKnownGossip(state, npc, cmd.direct ?? "")!;
  }
  return openInformationExchange(state, npc.id);
}

/** Opening the selector never submits information, repairs progress, or writes a log. */
export function openInformationExchange(state: GameState, npcId: string): ActionResult {
  const npc = getNpcById(npcId);
  const present = getItemsInScope(state).some(item =>
    item.id === npcId && state.itemState.itemRoomId[item.id] === state.player.roomId,
  );
  if (!npc?.informationExchange || !present) {
    return { state, message: "That gossip partner isn't here.", consumesTurn: false };
  }
  const refusal = exchangeRefusal(state, npcId);
  if (refusal) return { state, message: refusal, consumesTurn: false };
  return {
    state,
    overlay: { kind: "information-exchange", npcId },
    consumesTurn: false,
  };
}
