import { GameState } from "@game/types/gameTypes";
import { Item } from "@game/types/itemTypes";

export function trySwitchItem(
  state: GameState,
  item: Item,
): { state: GameState; message: string } {
  if (!item.isSwitchable) {
    return { state, message: "You can't switch that." };
  }

  if (item.meta?.onSwitch) {
    return { state, message: item.meta.onSwitch };
  }

  const currentSettings = state.itemState.itemSettings[item.id];
  const currentlyOn = !!(currentSettings as any)?.isOn;
  const newIsOn = !currentlyOn;

  let next: GameState = {
    ...state,
    itemState: {
      ...state.itemState,
      itemSettings: {
        ...state.itemState.itemSettings,
        [item.id]: {
          ...(state.itemState.itemSettings[item.id] as any),
          isOn: newIsOn,
        },
      },
    },
  };

  if (item.id === "damagedFlashlight") {
    next = {
      ...next,
      worldState: {
        ...next.worldState,
        damagedFlashlight: {
          ...next.worldState.damagedFlashlight,
          isOn: newIsOn,
        },
      },
    };
  }
  const baseMsg =
    item?.overrides?.switch ??
    `You switch the ${item.name} ${newIsOn ? "on" : "off"}`;

  return {
    state: next,
    message: baseMsg,
  };
}
