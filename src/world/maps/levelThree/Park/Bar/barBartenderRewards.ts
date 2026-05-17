import { updateItemLocation } from "@game/rules/items";
import { triggerScoreOnce } from "@game/rules/score";
import { addToInventory, inventoryHas } from "@game/rules/state";
import type { GameState } from "@game/types/gameTypes";

export const BAR_MEMORY_BOX_ID = "BarMemoryBox";
export const MANI_PEDI_VOUCHER_ID = "ManiPediVoucher";
export const BAR_TRIVIA_QUESTION =
  "How long before the Aeneas passes through Bufo Clutch A?";
export const BAR_TRIVIA_ANSWER = "391 years";
export const BAR_TRIVIA_SCORE_ID = "answered_bar_trivia";
export const BAR_MEMORY_BOX_MESSAGE = `The bartender reaches beneath the bar, retrieves a small metal box, and hands it to you. You take it, turning it over in your hands, but it doesn't look familiar.\n\n"You gave this to me once and said if you were ever in trouble, I should give it to you."`;
export const BAR_TRIVIA_PRIZE_MESSAGE = `The bartender's face shield lights up with a delighted smile.\n\n"Correct! Tonight's mystery prize is a free mani-pedi at Keratin Kindness. Try to act surprised if they ask."\n\nThe bartender hands you a nail salon voucher.`;

const BAR_BOT_NPC_ID = "BarBot";

const BAR_MEMORY_BOX_TOPIC_WORDS = new Set([
  "amnesia",
  "amnesiac",
  "blank",
  "blackout",
  "cataclysm",
  "catastrophe",
  "crash",
  "crashed",
  "crashing",
  "dead",
  "death",
  "died",
  "disaster",
  "emergency",
  "exploded",
  "explosion",
  "forget",
  "forgetting",
  "forgot",
  "forgotten",
  "incident",
  "meltdown",
  "memories",
  "memory",
  "outbreak",
  "remember",
  "remembered",
  "remembering",
  "help",
]);

const BAR_MEMORY_BOX_TOPIC_PHRASES = [
  "before everything",
  "everyone died",
  "everything happened",
  "lost memories",
  "memory loss",
  "missing memories",
  "no memories",
  "people died",
  "ship crash",
  "ship crashed",
  "what happened",
  "help me",
];

function normalizeBarTopic(topic: string): string {
  return topic
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .join(" ");
}

function containsTokenSequence(haystack: string[], needle: string[]): boolean {
  if (needle.length === 0) return false;
  if (needle.length === 1) return haystack.includes(needle[0]);

  for (let index = 0; index <= haystack.length - needle.length; index += 1) {
    const matches = needle.every(
      (token, needleIndex) => haystack[index + needleIndex] === token,
    );
    if (matches) return true;
  }

  return false;
}

export function isBarMemoryBoxTopic(topic: string): boolean {
  const normalizedTopic = normalizeBarTopic(topic);
  if (!normalizedTopic) return false;

  if (
    BAR_MEMORY_BOX_TOPIC_PHRASES.some((phrase) =>
      normalizedTopic.includes(phrase),
    )
  ) {
    return true;
  }

  return normalizedTopic
    .split(/\s+/)
    .some((token) => BAR_MEMORY_BOX_TOPIC_WORDS.has(token));
}

export function isCorrectBarTriviaAnswer(topic: string): boolean {
  const normalizedTopic = normalizeBarTopic(topic);
  if (!normalizedTopic) return false;

  const normalizedAnswer = normalizeBarTopic(BAR_TRIVIA_ANSWER);
  const topicTokens = normalizedTopic.split(/\s+/).filter(Boolean);
  const answerTokens = normalizedAnswer.split(/\s+/).filter(Boolean);
  const hasCorrectAnswer = containsTokenSequence(topicTokens, answerTokens);
  if (!hasCorrectAnswer) return false;

  const isBareAnswer = normalizedTopic === normalizedAnswer;
  const hasTriviaCue = topicTokens.some((token) =>
    ["answer", "trivia", "question"].includes(token),
  );

  return isBareAnswer || hasTriviaCue;
}

export function maybeAwardBarMemoryBox(
  state: GameState,
  npcId: string,
  topic: string,
): { state: GameState; message?: string } {
  if (npcId !== BAR_BOT_NPC_ID || !isBarMemoryBoxTopic(topic)) {
    return { state };
  }

  if (
    inventoryHas(state.player.inventory, BAR_MEMORY_BOX_ID) ||
    state.itemState.pickedUpByPlayer[BAR_MEMORY_BOX_ID] === true
  ) {
    return { state };
  }

  let next = updateItemLocation(state, BAR_MEMORY_BOX_ID, "INVENTORY");
  next = addToInventory(next, BAR_MEMORY_BOX_ID);

  return { state: next, message: BAR_MEMORY_BOX_MESSAGE };
}

export function maybeAwardBarTriviaPrize(
  state: GameState,
  npcId: string,
  topic: string,
): { state: GameState; message?: string } {
  if (npcId !== BAR_BOT_NPC_ID || !isCorrectBarTriviaAnswer(topic)) {
    return { state };
  }

  if (
    inventoryHas(state.player.inventory, MANI_PEDI_VOUCHER_ID) ||
    state.itemState.pickedUpByPlayer[MANI_PEDI_VOUCHER_ID] === true
  ) {
    return { state };
  }

  let next = triggerScoreOnce(state, BAR_TRIVIA_SCORE_ID);
  next = updateItemLocation(next, MANI_PEDI_VOUCHER_ID, "INVENTORY");
  next = addToInventory(next, MANI_PEDI_VOUCHER_ID);

  return { state: next, message: BAR_TRIVIA_PRIZE_MESSAGE };
}
