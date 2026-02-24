import {
  addLiquidToFillableContainer,
  removeLiquidFromFillableContainer,
} from "@game/rules/liquids";
import { resolveItemInScopeByNoun } from "@game/rules/scope";
import { getPlayerLiquidContainers } from "@game/selectors/itemSelectors";
import { GameState } from "@game/types/gameTypes";
import { Item } from "@game/types/itemTypes";
import { ParsedCommand } from "@game/types/parserTypes";

export function tryPourItem(
  state: GameState,
  item: Item,
  cmd: ParsedCommand,
): { state: GameState; message: string } {
  if (cmd.type !== "action") {
    return { state, message: "You can't do that." };
  }
  const direct = cmd?.direct?.trim();
  const preposition = cmd.preposition?.trim();
  const indirect = cmd.indirect?.trim();
  let next = state;
  let baseMsg = "";

  if (direct === "water") {
    const playerLiquidContainers = getPlayerLiquidContainers(state);
    const waterContainer = playerLiquidContainers.filter(
      (lc) => state.itemState.containerFilled[lc.id]?.[0] === "water",
    );
    if (!waterContainer) {
      return { state, message: `You're not carrying any water at the minute.` };
    }
    if (!preposition) {
      return { state, message: `Pour it where, or on what?` };
    }
    if (preposition && !indirect) {
      return { state, message: `I don't understand that.` };
    }
    if (preposition && indirect) {
      const indirectItem = resolveItemInScopeByNoun(state, indirect);
      if (!indirectItem) {
        return { state, message: `You don't see any ${indirect} here.` };
      }
      if (
        preposition === "on" ||
        preposition === "over" ||
        preposition === "onto"
      ) {
        next = removeLiquidFromFillableContainer(state, waterContainer[0]);
        baseMsg += `You pour the water ${preposition} the ${indirect}, but it doesn't really accomplish much.`;
      }
      if (preposition === "in" || preposition === "into") {
        if (!indirectItem?.meta?.container?.holds?.includes("liquid")) {
          return { state: next, message: `The ${indirect} can't hold that.` };
        } else if (
          indirectItem?.meta?.container?.holds?.includes("liquid") &&
          state.itemState.containerFilled[indirectItem.id]
        ) {
          return {
            state: next,
            message: `The ${indirect} is already full of ${
              state.itemState.containerFilled[indirectItem.id]
            }.`,
          };
        } else if (
          indirectItem?.meta?.container?.holds?.includes("liquid") &&
          !state.itemState.containerFilled[indirectItem.id]
        ) {
          next = removeLiquidFromFillableContainer(next, waterContainer[0]);
          next = addLiquidToFillableContainer(next, indirectItem, "water");
          baseMsg += `You carefully pour the water from the ${item.id} to the ${indirect}`;
        }
      }
    }
  }

  return {
    state: next,
    message: baseMsg,
  };
}
