import type { GameState, JuicyTopic } from "@game/types/gameTypes";
import type { Item } from "@game/types/itemTypes";

export const GOSSIP_OBTAINED_MESSAGE = "[You obtained some salacious gossip!]";

export type TeaCollectionResult = {
  state: GameState;
  obtainedNewTea: boolean;
};

function getFreshTopics(
  currentTopics: JuicyTopic[],
  incomingTopics: JuicyTopic[],
): JuicyTopic[] {
  const seenTopicIds = new Set(currentTopics.map((topic) => topic.id));
  const freshTopics: JuicyTopic[] = [];

  for (const topic of incomingTopics) {
    if (!topic?.id || seenTopicIds.has(topic.id)) continue;

    seenTopicIds.add(topic.id);
    freshTopics.push(topic);
  }

  return freshTopics;
}

export function appendGossipNotice(
  message: string | undefined,
  obtainedNewTea: boolean,
): string | undefined {
  if (!obtainedNewTea) {
    return message;
  }

  const trimmedMessage = message?.trim();
  return trimmedMessage
    ? `${trimmedMessage}\n\n${GOSSIP_OBTAINED_MESSAGE}`
    : GOSSIP_OBTAINED_MESSAGE;
}

export function collectTeaResult(
  state: GameState,
  incomingTopics?: JuicyTopic[],
): TeaCollectionResult {
  if (!incomingTopics || incomingTopics.length === 0) {
    return { state, obtainedNewTea: false };
  }

  const currentTopics = state.player.spiltTea ?? [];
  const freshTopics = getFreshTopics(currentTopics, incomingTopics);

  if (freshTopics.length === 0) {
    return { state, obtainedNewTea: false };
  }

  return {
    state: {
      ...state,
      player: {
        ...state.player,
        spiltTea: [...currentTopics, ...freshTopics],
      },
    },
    obtainedNewTea: true,
  };
}

export function collectTea(
  state: GameState,
  incomingTopics?: JuicyTopic[],
): GameState {
  return collectTeaResult(state, incomingTopics).state;
}

export function collectTeaFromItem(
  state: GameState,
  item?: Pick<Item, "containsTea">,
): GameState {
  return collectTea(state, item?.containsTea);
}

export function collectTeaFromItemResult(
  state: GameState,
  item?: Pick<Item, "containsTea">,
): TeaCollectionResult {
  return collectTeaResult(state, item?.containsTea);
}
