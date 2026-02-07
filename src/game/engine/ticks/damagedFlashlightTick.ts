import { appendLog } from "@game/engine/handleCommand";
import { GameState } from "@game/types/gameTypes";

export function tickDamagedFlashlight(state: GameState): GameState {
  let next = state;

  const df = next.worldState.damagedFlashlight;
  if (!df) return next;

  const maxCharge = Math.max(0, df.maxCharge);
  const chargeRate = Math.max(0, df.chargeRate);
  let currentCharge = Math.min(Math.max(0, df.currentCharge), maxCharge);

  if (df.isOn) {
    if (currentCharge <= 0) {
      next = appendLog(next, "The damaged flashlight sputters and goes out.");
      next = {
        ...next,
        worldState: {
          ...next.worldState,
          damagedFlashlight: {
            ...df,
            isOn: false,
            currentCharge: 0,
          },
        },
      };
      return next;
    }

    // Consume 1 charge per turn while on.
    currentCharge = Math.max(0, currentCharge - 1);

    // Warnings at 2 and 1 *after* consumption for this turn (feels most intuitive in play).
    if (currentCharge === 2) {
      next = appendLog(
        next,
        "The damaged flashlight starts to fade. It won't last much longer.",
      );
    } else if (currentCharge === 1) {
      next = appendLog(
        next,
        "The flashlight is barely holding on—one more turn at best.",
      );
    } else if (currentCharge === 0) {
      // Hits 0: light goes out (and we auto-switch it off so it can recharge).
      next = appendLog(next, "The damaged flashlight dies with a soft click.");
      next = {
        ...next,
        itemState: {
          ...next.itemState,
          itemSettings: {
            ...next.itemState.itemSettings,
            damagedFlashlight: { kind: "flashlight", isOn: false },
          },
        },
        worldState: {
          ...next.worldState,
          damagedFlashlight: {
            ...df,
            isOn: false,
            currentCharge: 0,
          },
        },
      };
      return next;
    }

    next = {
      ...next,
      worldState: {
        ...next.worldState,
        damagedFlashlight: {
          ...df,
          maxCharge,
          chargeRate,
          currentCharge,
        },
      },
    };

    return next;
  }

  // Off => recharges
  if (currentCharge < maxCharge && chargeRate > 0) {
    currentCharge = Math.min(maxCharge, currentCharge + chargeRate);
    next = {
      ...next,
      worldState: {
        ...next.worldState,
        damagedFlashlight: {
          ...df,
          maxCharge,
          chargeRate,
          currentCharge,
        },
      },
    };
  } else {
    next = {
      ...next,
      worldState: {
        ...next.worldState,
        damagedFlashlight: {
          ...df,
          maxCharge,
          chargeRate,
          currentCharge,
        },
      },
    };
  }

  return next;
}
