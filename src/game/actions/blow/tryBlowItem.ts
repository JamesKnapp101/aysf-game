import { GameState } from "@game/types/gameTypes";
import { Item } from "@game/types/itemTypes";

export function tryBlowItem(
  state: GameState,
  item: Item,
): { state: GameState; message: string } {
  if (item.id !== "RobotWhistle") {
    return { state, message: "You can't do that." };
  }

  let next = state;
  let baseMsg =
    "You blow into the little whistle but it doesn't make any noise, at least not one you can hear.";

  return {
    state: next,
    message: baseMsg || "It doesn't make any noise.",
  };
}
