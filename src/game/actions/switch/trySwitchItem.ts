import {
  buildFlashlightSettings,
  getFlashlightSettings,
  isFlashlightItemId,
} from "@game/helpers/flashlightHelpers";
import { GameState } from "@game/types/gameTypes";
import { Item } from "@game/types/itemTypes";

type SwitchTargetState = "off" | "on";

export function trySwitchItem(
  state: GameState,
  item: Item,
  targetState?: SwitchTargetState,
  verb: "switch" | "turn" = "switch",
): { state: GameState; message: string } {
  if (!item.isSwitchable) {
    return { state, message: "You can't switch that." };
  }

  if (item.meta?.onSwitch) {
    return { state, message: item.meta.onSwitch };
  }

  const flashlightSettings = isFlashlightItemId(item.id)
    ? getFlashlightSettings(state, item.id)
    : undefined;
  const currentSettings = state.itemState.itemSettings[item.id];
  const currentlyOn =
    flashlightSettings?.isOn ?? (((currentSettings as any)?.isOn ?? item.isOn) === true);
  const newIsOn =
    targetState === "on"
      ? true
      : targetState === "off"
        ? false
        : !currentlyOn;

  if (targetState === "on" && currentlyOn) {
    return {
      state,
      message: `The ${item.name} is already on.`,
    };
  }

  if (targetState === "off" && !currentlyOn) {
    return {
      state,
      message: `The ${item.name} is already off.`,
    };
  }

  const nextSettings = isFlashlightItemId(item.id)
    ? buildFlashlightSettings(
        item.id,
        getFlashlightSettings(state, item.id),
        { isOn: newIsOn },
      )
    : {
        ...(state.itemState.itemSettings[item.id] as any),
        isOn: newIsOn,
      };

  let next: GameState = {
    ...state,
    itemState: {
      ...state.itemState,
      itemSettings: {
        ...state.itemState.itemSettings,
        [item.id]: nextSettings,
      },
    },
  };

  const baseMsg =
    item?.overrides?.switch ??
    `You ${verb} the ${item.name} ${newIsOn ? "on" : "off"}.`;

  return {
    state: next,
    message: baseMsg,
  };
}
