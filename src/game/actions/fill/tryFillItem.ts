import {
  getWaterSourcesInRoom,
} from "@game/selectors/itemSelectors";
import { addLiquidToFillableContainer } from "@game/rules/liquids";
import { GameState } from "@game/types/gameTypes";
import { Item } from "@game/types/itemTypes";
import { ParsedCommand } from "@game/types/parserTypes";

export function tryFillItem(
  state: GameState,
  item: Item,
  cmd: ParsedCommand,
): { state: GameState; message: string } {
  if (cmd.type !== "action") {
    return { state, message: "You can't do that." };
  }
  const preposition = cmd.preposition?.trim();
  const liquid2Get = cmd.indirect?.trim();
  const next = state;
  const baseMsg = "";

  if (preposition && preposition !== "with") {
    return { state, message: `I don't understand that.` };
  }

  if (!item.meta?.container?.holds?.includes("liquid")) {
    return {
      state,
      message: `The ${item.name} won't hold any sort of liquid.`,
    };
  }

  if (state.itemState.containerFilled[item.id]) {
    return {
      state,
      message: `The ${item.id} is already full of ${
        state.itemState.containerFilled[item.id][0]
      }.`,
    };
  }

  if (liquid2Get === "water") {
    const waterSourcesInRoom = getWaterSourcesInRoom(state);
    if (waterSourcesInRoom.length === 0) {
      return { state, message: "There isn't any good source of water here." };
    }
    const filled = addLiquidToFillableContainer(state, item, "water");
    if (filled === state) {
      return { state, message: "You don't have that container on you." };
    }

    return {
      state: filled,
      message: waterSourcesInRoom[0]?.meta?.watersource?.onTake
        ? `${waterSourcesInRoom[0]?.meta?.watersource?.onTake} using the ${item.name}`
        : "You scoop up some of the water",
    };
  }

  return {
    state: next,
    message: baseMsg,
  };
}
