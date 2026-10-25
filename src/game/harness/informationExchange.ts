import { exchangeTurnTranscript, formatExchangeTranscript } from "../rules/informationExchange";
import { getNpcById } from "../npcRegistry";
import { isNpcSecretRevealed } from "../npcSecrets";
import type { GameState } from "../types/gameTypes";

/** Text clients still hear each reaction, without putting it in the main game log. */
export function informationExchangeCommandOutput(
  before: GameState,
  after: GameState,
  input: string,
  output: string[],
): string[] {
  for (const npcId of Object.keys(after.conversation?.npcs ?? {})) {
    const lines = exchangeTurnTranscript(before, after, npcId);
    if (!lines.length) continue;
    const dialogue = formatExchangeTranscript(npcId, lines);
    const index = output.findIndex(entry => entry.trim() === `> ${input}` || entry.startsWith(`> ${input}\n`));
    if (index < 0) return [...output, dialogue];
    const transition = !isNpcSecretRevealed(before, npcId) && isNpcSecretRevealed(after, npcId)
      ? getNpcById(npcId)?.informationExchange?.secretTransition : undefined;
    return output.map((entry, i) => {
      if (i !== index) return entry;
      let trailing = entry.slice(`> ${input}`.length).trimStart();
      if (transition && trailing.startsWith(transition)) trailing = trailing.slice(transition.length).trimStart();
      return `> ${input}\n${dialogue}${trailing ? `\n\n${trailing}` : ""}`;
    });
  }
  return output;
}
