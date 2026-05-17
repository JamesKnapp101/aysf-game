import { handleCommand } from "../engine/handleCommand";
import { parseCommand } from "../../parse/parser";
import { handleSetCoolerMode } from "../rules/cooler";
import { setMessageListened } from "../rules/message-machine";
import { getCoolerMode } from "../selectors/gadgetSelectors";
import {
  setGymTreadmillSpeed,
  SPIN_STAGE_SPEED_DIAL_PASSWORD,
} from "../helpers/gymHelpers";
import { playBarJukeboxTrack } from "src/world/maps/levelThree/Park/Bar";
import type { ActionRequest, ActionResult } from "../types/actionsTypes";
import type { GameState } from "../types/gameTypes";
import type { CoolerMode } from "../types/itemTypes";

export async function dispatchAction(
  state: GameState,
  req: ActionRequest
): Promise<ActionResult> {
  switch (req.verb) {
    case "command": {
      const input = req.payload?.input ?? "";
      const result = await handleCommand(state, parseCommand(input));
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
    case "playJukeboxTrack": {
      return playBarJukeboxTrack(state, req.payload.trackId ?? "");
    }
    case "submitSpinStageSpeedPassword": {
      const speed = req.payload.speed;
      const password = (req.payload.password ?? "").trim().toUpperCase();

      if (
        typeof speed !== "number" ||
        !Number.isFinite(speed) ||
        !Number.isInteger(speed) ||
        speed < 0 ||
        speed > 100
      ) {
        return {
          state,
          message: "The speed dial only runs from 0 to 100.",
        };
      }

      if (password !== SPIN_STAGE_SPEED_DIAL_PASSWORD) {
        return {
          state,
          message: "The password failed.",
        };
      }

      return {
        state: setGymTreadmillSpeed(state, speed),
        message: `You set the instructor speed dial to ${speed}.`,
      };
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
