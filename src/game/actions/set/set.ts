import { resolveItemByNoun } from "../../rules/scope";
import { isPreserveActorId } from "../../preserve/preserveTypes";
import {
  setGymTreadmillAngle,
  setGymTreadmillSpeed,
} from "@game/helpers/gymHelpers";
import type { ActionResult } from "../../types/actionsTypes";
import type { GameState } from "../../types/gameTypes";
import type { ParsedCommand } from "../../types/parserTypes";

function parseSetNumber(cmd: ParsedCommand): number | undefined {
  if (cmd.type !== "action") return undefined;

  const valueText = cmd.indirect?.trim() ?? "";
  const match = valueText.match(/-?\d+/);
  if (!match) return undefined;

  const value = Number.parseInt(match[0], 10);
  return Number.isFinite(value) ? value : undefined;
}

export function doSet(state: GameState, cmd: ParsedCommand): ActionResult {
  if (cmd.type !== "action" || cmd.verb !== "set") {
    return { state, message: "You can't do that." };
  }

  const direct = cmd.direct?.trim();
  if (!direct) {
    return { state, message: "Set what?" };
  }

  const item = resolveItemByNoun(state, direct);
  if (!item || !item.isSettable) {
    return { state, message: "There's nothing to set." };
  }

  if (item.id === "Cooler") {
    const coolerSetting = state.itemState.itemSettings["Cooler"];
    const mode =
      coolerSetting && coolerSetting.kind === "cooler"
        ? coolerSetting.mode
        : "off";

    return {
      state,
      overlay: { kind: "cooler", mode },
    };
  }

  if (item.id === "GameWhistle") {
    const mode = cmd.indirect?.trim().toLowerCase();
    if (!mode) {
      return { state, message: "Set the game whistle to what?" };
    }

    if (!isPreserveActorId(mode)) {
      return {
        state,
        message:
          "The selector has markings for badger, boar, bull, bear, and Barry.",
      };
    }

    return {
      state: {
        ...state,
        itemState: {
          ...state.itemState,
          itemSettings: {
            ...state.itemState.itemSettings,
            GameWhistle: { kind: "game-whistle", mode },
          },
        },
      },
      message: `You set the game whistle to ${mode}.`,
    };
  }

  if (item.id === "GymTreadmillAngleDial") {
    const value = parseSetNumber(cmd);
    if (value == null) {
      return { state, message: "Set the angle dial to what?" };
    }

    if (value < -20 || value > 20) {
      return {
        state,
        message: "The angle dial only runs from -20 to 20.",
      };
    }

    return {
      state: setGymTreadmillAngle(state, value),
      message:
        value === 0
          ? "You set the treadmill angle dial to 0. The broad black surface settles completely level."
          : value > 0
            ? `You set the treadmill angle dial to ${value}. The broad black surface slopes upward.`
            : `You set the treadmill angle dial to ${value}. The broad black surface slopes downward.`,
    };
  }

  if (item.id === "GymTreadmillSpeedDial") {
    return {
      state,
      message:
        "The speed dial flashes 'Instructor Override' and refuses to accept input.",
    };
  }

  if (item.id === "SpinStageSpeedDial") {
    const value = parseSetNumber(cmd);
    if (value == null) {
      return { state, message: "Set the speed dial to what?" };
    }

    if (value < 0 || value > 100) {
      return {
        state,
        message: "The speed dial only runs from 0 to 100.",
      };
    }

    return {
      state: setGymTreadmillSpeed(state, value),
      message: `You set the instructor speed dial to ${value}.`,
    };
  }

  return { state };
}
