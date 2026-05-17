import { isPreserveActorId } from "@game/preserve/preserveTypes";
import type { ActionResult } from "@game/types/actionsTypes";
import type { GameState } from "@game/types/gameTypes";
import type { Item } from "@game/types/itemTypes";
import type { ParsedCommand } from "@game/types/parserTypes";
import { setGymTreadmillAngle } from "src/world/maps/levelThree/Park/Gym/gymTreadmill";

type SetCommandContext = {
  cmd: ParsedCommand;
  item: Item;
  state: GameState;
};

type SetCommandHandler = (ctx: SetCommandContext) => ActionResult | undefined;

function parseSetNumber(cmd: ParsedCommand): number | undefined {
  if (cmd.type !== "action") return undefined;

  const valueText = cmd.indirect?.trim() ?? "";
  const match = valueText.match(/-?\d+/);
  if (!match) return undefined;

  const value = Number.parseInt(match[0], 10);
  return Number.isFinite(value) ? value : undefined;
}

const SET_COMMAND_HANDLERS: Record<string, SetCommandHandler> = {
  GameWhistle: ({ state, cmd }) => {
    const mode = cmd.type === "action" ? cmd.indirect?.trim().toLowerCase() : "";
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
  },

  GymTreadmillAngleDial: ({ state, cmd }) => {
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
  },

  GymTreadmillSpeedDial: ({ state }) => ({
    state,
    message:
      "The speed dial flashes 'Instructor Override' and refuses to accept input.",
  }),

  SpinStageSpeedDial: ({ state, cmd }) => {
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
      state,
      message:
        "The instructor speed dial flashes 'Password Required' and waits for input.",
      overlay: {
        kind: "spin-stage-speed-password",
        targetSpeed: value,
      },
    };
  },
};

export function handleRegisteredSetCommand(
  state: GameState,
  cmd: ParsedCommand,
  item: Item,
): ActionResult | undefined {
  return SET_COMMAND_HANDLERS[item.id]?.({ state, cmd, item });
}
