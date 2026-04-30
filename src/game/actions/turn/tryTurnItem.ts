import { GameState } from "../../types/gameTypes";
import { Item } from "../../types/itemTypes";

export function tryTurnItem(
  state: GameState,
  prep: string,
  item: Item,
): { state: GameState; message: string } {
  let next: GameState = state;

  if (item.overrides?.turn) {
    return { state, message: item.overrides.turn };
  }

  if (item.id === "PowerStationKey") {
    if (
      !state.itemState.containerContents["PowerStationKeyhole"]?.includes(
        "PowerStationKey",
      )
    ) {
      return { state, message: "The key isn't in anything." };
    }
    if (
      state.itemState.containerContents["PowerStationKeyhole"]?.includes(
        "PowerStationKey",
      ) &&
      state.worldState.powerRestoredSections["power-key-turned"]
    ) {
      return {
        state,
        message:
          "The key seems to be locked in place now, and you can't budge it.",
      };
    }
    const turnPowerKeyMsg =
      "You turn the key with a heavy click and it locks into place. The red button next to the keyhole begins to flash.";
    next = {
      ...next,
      worldState: {
        ...next.worldState,
        powerRestoredSections: {
          ...next.worldState.powerRestoredSections,
          ["power-key-turned"]: true,
        },
      },
    };
    return { state: next, message: turnPowerKeyMsg };
  }

  return {
    state: next,
    message: "You can't turn that.",
  };
}
