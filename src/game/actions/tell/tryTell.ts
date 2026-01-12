import "../../../styles/layout.css";
import { GameState } from "../../types/gameTypes";
import { Item } from "../../types/itemTypes";

export function tryTell(
  state: GameState,
  item: Item
): { state: GameState; message: string } {
  let next: GameState = state;

  const baseMsg = ``;

  return {
    state: next,
    message: baseMsg,
  };
}
