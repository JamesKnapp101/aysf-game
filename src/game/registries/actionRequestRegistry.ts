import type { ActionRequest, ActionResult } from "@game/types/actionsTypes";
import type { GameState } from "@game/types/gameTypes";
import { playBarJukeboxTrack } from "src/world/maps/levelThree/Park/Bar/barJukebox";
import {
  setGymTreadmillSpeed,
  SPIN_STAGE_SPEED_DIAL_PASSWORD,
} from "src/world/maps/levelThree/Park/Gym/gymTreadmill";
import { returnDeepStorageSuitHome } from "src/world/maps/levelSeven/deepStorage";

type ActionRequestHandler = (
  state: GameState,
  req: ActionRequest,
) => ActionResult | Promise<ActionResult>;

function handlePlayJukeboxTrack(
  state: GameState,
  req: ActionRequest,
): ActionResult {
  return playBarJukeboxTrack(state, req.payload.trackId ?? "");
}

function handleSubmitSpinStageSpeedPassword(
  state: GameState,
  req: ActionRequest,
): ActionResult {
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

function handleDeepStorageHome(state: GameState): ActionResult {
  return returnDeepStorageSuitHome(state, "manual");
}

const ACTION_REQUEST_HANDLERS: Partial<
  Record<ActionRequest["verb"], ActionRequestHandler>
> = {
  deepStorageHome: handleDeepStorageHome,
  playJukeboxTrack: handlePlayJukeboxTrack,
  submitSpinStageSpeedPassword: handleSubmitSpinStageSpeedPassword,
};

export async function dispatchRegisteredActionRequest(
  state: GameState,
  req: ActionRequest,
): Promise<ActionResult | undefined> {
  const handler = ACTION_REQUEST_HANDLERS[req.verb];
  return handler ? await handler(state, req) : undefined;
}
