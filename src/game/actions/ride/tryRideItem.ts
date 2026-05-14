import { movePlayerToRoom } from "@game/helpers/gameHelpers";
import { GameState } from "@game/types/gameTypes";
import { Item } from "@game/types/itemTypes";

export function tryRideItem(
  state: GameState,
  item: Item,
): { state: GameState; message: string } {
  let next = state;
  const baseMsg = "I'm not sure that's going to work.";
  const override = item.overrides?.ride;

  if (typeof override === "function") {
    const out = override({ state, item });

    if (typeof out === "string") {
      return { state, message: out };
    }

    return {
      state: out?.state ?? state,
      message: out?.message ?? baseMsg,
    };
  }

  if (typeof override === "string") {
    return { state, message: override };
  }

  if (state.player.roomId === "RobotRefuge" && item.id === "Conveyor") {
    next = movePlayerToRoom(next, "Storage");
    return { state: next, message: `You ride the belt to the end.` };
  }
  if (state.player.roomId === "Storage" && item.id === "Conveyor2") {
    next = movePlayerToRoom(next, "RobotRefuge");
    return { state: next, message: `You ride the belt to the end.` };
  }

  return {
    state: next,
    message: baseMsg || "Whee!",
  };
}
