import { takeDNASample } from "@game/rules/dnaReader";
import { resolveItemByNoun } from "@game/rules/scope";
import { inventoryHas } from "@game/rules/state";
import { GameState } from "@game/types/gameTypes";
import { Item } from "@game/types/itemTypes";
import { ParsedCommand } from "@game/types/parserTypes";

export function tryTouchItem(
  state: GameState,
  item: Item,
  cmd: ParsedCommand,
): { state: GameState; message: string } {
  let next = state;
  let baseMsg = "";

  const preposition = "preposition" in cmd ? cmd.preposition : undefined;
  const indirect = "indirect" in cmd ? cmd.indirect : undefined;

  if (preposition && !indirect) {
    return { state: next, message: `I don't understand that.` };
  }
  if (preposition) {
    if (!indirect) {
      return { state: next, message: `I don't understand that.` };
    }
    if (preposition === "with") {
      const indirectItem = resolveItemByNoun(next, indirect);
      if (!indirectItem) {
        return {
          state: next,
          message: `You aren't carrying that.`,
        };
      }
      if (indirectItem.id === "DNAReader") {
        if (!inventoryHas(state.player.inventory, "DNAReader")) {
          return { state: next, message: `You aren't carrying that.` };
        }
        const { updatedState, formattedResult } = takeDNASample(next, item);
        next = updatedState;
        baseMsg += `The wand lets out a sharp electronic beep, and a result appears on the little screen: ${formattedResult}`;
      }
    } else {
      return { state: next, message: `I don't understand that.` };
    }
  }

  return {
    state: next,
    message: baseMsg,
  };
}
