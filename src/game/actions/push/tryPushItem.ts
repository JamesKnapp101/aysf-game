import "../../../styles/layout.css";
import { GameState } from "../../types/gameTypes";
import { Item } from "../../types/itemTypes";

export function tryPushItem(
  state: GameState,
  item: Item
): { state: GameState; message: string } {
  let next: GameState = state;

  if (!item.isPushable) {
    return { state, message: "You can't push that." };
  }
  let pushMsg = "";
  if (item.id === "PowerStationButton") {
    if (
      !state.itemState.containerContents["PowerStationKeyhole"]?.includes(
        "PowerStationKey"
      ) ||
      !state.worldState.powerRestoredSections["power-key-turned"]
    ) {
      return {
        state,
        message:
          "You push the red button with a firm click, but nothing happens.",
      };
    }
    pushMsg +=
      "You push the flashing red button with a firm click, and you hear a loud snap from inside the panel. A beat later you hear a heavy clunk, then a fan somewhere inside the station begins to wind up, and the whole thing thrums to life. A series of lights blink on all across the surface of the panel, and from the shadows around the room until the entire chamber is bathed in a flickering electric glow. The viewscreen mounted above the keyboard flashes then blinks on, and the button now remains solidly lit.";
    next = {
      ...next,
      worldState: {
        ...next.worldState,
        powerRestoredSections: {
          ...next.worldState.powerRestoredSections,
          ["power-initialized"]: true,
        },
        roomAudioLevel: {
          ...next.worldState.roomAudioLevel,
          PowerGrid: 3,
        },
      },
    };
    return { state: next, message: pushMsg };
  }

  return {
    state: next,
    message: pushMsg,
  };
}
