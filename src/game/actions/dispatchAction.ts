import { handleCommand } from "../engine/handleCommand";
import { handleSetCoolerMode } from "../rules/cooler";
import { setMessageListened } from "../rules/message-machine";
import { getCoolerMode } from "../selectors/gadgetSelectors";
import type { ActionRequest, ActionResult } from "../types/actionsTypes";
import type { GameState } from "../types/gameTypes";
import type { CoolerMode } from "../types/itemTypes";

export async function dispatchAction(
  state: GameState,
  req: ActionRequest
): Promise<ActionResult> {
  switch (req.verb) {
    case "command": {
      const result = await handleCommand(state, {
        type: "action",
        verb: req.payload?.input ?? "",
        raw: req.payload?.input ?? "",
      });
      return { state: result, message: undefined };
    }
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
    case "markMessagePlayed": {
      const next = setMessageListened(state, req.payload.messageId ?? "");
      return { state: next, message: undefined };
    }
    case "cycleCameraGunView":
      return {
        state,
        overlay: {
          kind: "camera-gun-viewer",
          currentViewIndex: 0,
        },
      };
    default:
      return { state, message: "Nothing happens." };
  }
}
