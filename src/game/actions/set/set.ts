import { resolveItemByNoun } from "../../rules/scope";
import { isPreserveActorId } from "../../preserve/preserveTypes";
import type { ActionResult } from "../../types/actionsTypes";
import type { GameState } from "../../types/gameTypes";
import type { ParsedCommand } from "../../types/parserTypes";

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

  return { state };
}
