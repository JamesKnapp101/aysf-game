import {
  addLiquidToFillableContainer,
  removeLiquidFromFillableContainer,
} from "@game/rules/liquids";
import { resolveItemInScopeByNoun } from "@game/rules/scope";
import { GameState } from "@game/types/gameTypes";
import { Item } from "@game/types/itemTypes";
import { ParsedCommand } from "@game/types/parserTypes";

export function tryEmptyItem(
  state: GameState,
  item: Item,
  cmd: ParsedCommand,
): { state: GameState; message: string } {
  if (cmd.type !== "action") {
    return { state, message: "You can't do that." };
  }
  const preposition = cmd.preposition?.trim();
  const indirect = cmd.indirect?.trim();
  let next = state;
  let baseMsg = "";
  const liquid2Empty = state.itemState.containerFilled[item.id];

  if (!item.meta?.container?.holds?.includes("liquid")) {
    return { state, message: "You can't do that." };
  }

  if (!liquid2Empty) {
    return { state, message: `The ${item.name} is already empty.` };
  }

  if (
    item.meta?.container?.holds?.includes("liquid") &&
    state.itemState.containerFilled[item.id]
  )
    if (!preposition && !indirect) {
      next = removeLiquidFromFillableContainer(state, item);
      baseMsg += `You empty the ${cmd.direct} out onto the floor.`;
    }
  if (preposition && !indirect) {
    return { state, message: `Empty it ${preposition} what?` };
  }

  if (indirect && indirect !== "") {
    const indirectItem = resolveItemInScopeByNoun(next, indirect);

    if (
      preposition === "on" ||
      preposition === "onto" ||
      preposition === "over"
    ) {
      next = removeLiquidFromFillableContainer(next, item);
      return {
        state: next,
        message: `You dump the ${liquid2Empty} out onto the ${indirect}, but it doesn't really accomplish anything.`,
      };
    }

    if (preposition === "in" || preposition === "into") {
      if (!indirectItem?.meta?.container?.holds?.includes("liquid")) {
        return { state, message: `The ${indirect} can't hold that.` };
      } else if (
        indirectItem?.meta?.container?.holds?.includes("liquid") &&
        state.itemState.containerFilled[indirectItem.id]
      ) {
        return {
          state,
          message: `The ${indirect} is already full of ${
            state.itemState.containerFilled[indirectItem.id]
          }.`,
        };
      } else if (
        indirectItem?.meta?.container?.holds?.includes("liquid") &&
        !state.itemState.containerFilled[indirectItem.id]
      ) {
        next = removeLiquidFromFillableContainer(next, item);
        next = addLiquidToFillableContainer(
          next,
          indirectItem,
          liquid2Empty[0],
        );
        baseMsg += `You carefully pour the ${liquid2Empty[0]} from the ${item.id} to the ${indirect}`;
      }
    } else {
      return { state, message: `That won't work.` };
    }
  }
  return {
    state: next,
    message: baseMsg,
  };
}
