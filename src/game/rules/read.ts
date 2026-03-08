import type { GameState } from "../types/gameTypes";
import { resolveItemByNoun } from "./scope";

export function readReadable(state: GameState, noun: string): string {
  const item = resolveItemByNoun(state, noun);
  if (!item?.isReadable) {
    return "There's nothing to read.";
  }
  const readableText =
    typeof item.readableText === "function"
      ? item.readableText(state, item)
      : item.readableText;
  return `You read the ${item.name}...\n\n    "${readableText}"`;
}
