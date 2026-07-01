import { appendLog } from "@game/engine/log";
import {
  buildFlashlightSettings,
  FLASHLIGHT_ITEM_IDS,
  type FlashlightItemId,
  type FlashlightSettings,
  getFlashlightSettings,
} from "@game/helpers/flashlightHelpers";
import type { GameState } from "@game/types/gameTypes";

function roundCharge(value: number) {
  return Math.round(value * 100) / 100;
}

function updateFlashlightState(
  state: GameState,
  itemId: FlashlightItemId,
  nextSettings: FlashlightSettings,
): GameState {
  return {
    ...state,
    itemState: {
      ...state.itemState,
      itemSettings: {
        ...state.itemState.itemSettings,
        [itemId]: nextSettings,
      },
    },
  };
}

function getStartEmptyMessage(): string {
  return "The LED flashlight flickers weakly, then stays dark.";
}

function getDrainedMessage(): string {
  return "The LED flashlight dims and goes dark.";
}

export function tickFlashlights(state: GameState): GameState {
  let next = state;

  for (const itemId of FLASHLIGHT_ITEM_IDS) {
    const settings = getFlashlightSettings(next, itemId);
    if (!settings) continue;

    if (settings.isOn) {
      if (settings.currentCharge <= 0) {
        next = appendLog(next, getStartEmptyMessage());
        next = updateFlashlightState(
          next,
          itemId,
          buildFlashlightSettings(itemId, settings, {
            isOn: false,
            currentCharge: 0,
          }),
        );
        continue;
      }

      const currentCharge = roundCharge(
        Math.max(0, settings.currentCharge - settings.drainRate),
      );
      const nextSettings = buildFlashlightSettings(itemId, settings, {
        currentCharge,
        isOn: currentCharge > 0,
      });

      next = updateFlashlightState(next, itemId, nextSettings);

      if (currentCharge === 0) {
        next = appendLog(next, getDrainedMessage());
      }

      continue;
    }

    if (
      settings.currentCharge >= settings.maxCharge ||
      settings.rechargeRate <= 0
    ) {
      next = updateFlashlightState(next, itemId, settings);
      continue;
    }

    next = updateFlashlightState(
      next,
      itemId,
      buildFlashlightSettings(itemId, settings, {
        currentCharge: roundCharge(
          Math.min(
            settings.maxCharge,
            settings.currentCharge + settings.rechargeRate,
          ),
        ),
      }),
    );
  }

  return next;
}
