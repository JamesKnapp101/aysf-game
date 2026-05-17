import { handleRegisteredSetCommand } from "../../registries/setCommandRegistry";
import { resolveItemByNoun } from "../../rules/scope";
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

  const registered = handleRegisteredSetCommand(state, cmd, item);
  if (registered) return registered;

  return { state };
}
