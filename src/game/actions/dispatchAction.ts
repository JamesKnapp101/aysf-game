import { handleSetCoolerMode } from "../rules/cooler";
import { getCoolerMode } from "../selectors/gadgetSelectors";
import type { ActionRequest, ActionResult } from "../types/actionsTypes";
import type { GameState } from "../types/gameTypes";
import type { CoolerMode } from "../types/itemTypes";

export function dispatchAction(
  state: GameState,
  req: ActionRequest
): ActionResult {
  switch (req.verb) {
    case "setCoolerMode": {
      const mode = (req.payload?.mode ?? "off") as CoolerMode;
      const result = handleSetCoolerMode(state, mode);

      return {
        ...result,
        overlay: {
          kind: "cooler",
          mode,
        },
      };
    }

    case "openCoolerPanel":
      return {
        state,
        overlay: {
          kind: "cooler",
          mode: getCoolerMode(state),
        },
      };
    default:
      return { state, message: "Nothing happens." };
  }
}
