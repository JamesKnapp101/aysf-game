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

function getStartEmptyMessage(itemId: FlashlightItemId): string {
  return itemId === "damagedFlashlight"
    ? "The damaged flashlight sputters and goes out."
    : "The LED flashlight flickers weakly, then stays dark.";
}

function getDrainedMessage(itemId: FlashlightItemId): string {
  return itemId === "damagedFlashlight"
    ? "The damaged flashlight dies with a soft click."
    : "The LED flashlight dims and goes dark.";
}

function getLowPowerWarning(
  itemId: FlashlightItemId,
  currentCharge: number,
): string | undefined {
  if (itemId !== "damagedFlashlight") return undefined;
  if (currentCharge === 2) {
    return "The damaged flashlight starts to fade. It won't last much longer.";
  }
  if (currentCharge === 1) {
    return "The flashlight is barely holding on; one more turn at best.";
  }
  return undefined;
}

export function tickFlashlights(state: GameState): GameState {
  let next = state;

  for (const itemId of FLASHLIGHT_ITEM_IDS) {
    const settings = getFlashlightSettings(next, itemId);
    if (!settings) continue;

    if (settings.isOn) {
      if (settings.currentCharge <= 0) {
        next = appendLog(next, getStartEmptyMessage(itemId));
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

      const lowPowerWarning = getLowPowerWarning(itemId, currentCharge);
      if (lowPowerWarning) {
        next = appendLog(next, lowPowerWarning);
      } else if (currentCharge === 0) {
        next = appendLog(next, getDrainedMessage(itemId));
      }

      continue;
    }

    if (settings.currentCharge >= settings.maxCharge || settings.rechargeRate <= 0) {
      next = updateFlashlightState(next, itemId, settings);
      continue;
    }

    next = updateFlashlightState(
      next,
      itemId,
      buildFlashlightSettings(itemId, settings, {
        currentCharge: roundCharge(
          Math.min(settings.maxCharge, settings.currentCharge + settings.rechargeRate),
        ),
      }),
    );
  }

  return next;
}
