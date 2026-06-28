import type { GameState } from "@game/types/gameTypes";
import {
  BAR_DRINK_EXIT_BLOCK_MESSAGE,
  shouldBlockLeavingBarWithDrink,
} from "src/world/maps/levelThree/Park/Bar/barDrinks";
import { resolveGymTreadmillMovement } from "src/world/maps/levelThree/Park/Gym/gymTreadmill";
import { resolveMovieTheaterMovement } from "src/world/maps/levelThree/Park/MovieTheater/movieTheaterUsherPuzzle";
import { resolveDeepStorageMovement } from "src/world/maps/levelSeven/deepStorage";
import { resolveLevelSixStorageMovement } from "src/world/maps/levelSix/airlockAndStorage";
import { resolveReactorPlatformMovement } from "src/world/maps/levelFive/reactorPlatform";
import { resolveReactorCoreAccess } from "src/world/maps/levelFive/reactorSystems";

export type MovementRuleContext = {
  destinationRoomId: string;
  direction: string;
  fromRoomId: string;
};

export type MovementRuleResult =
  | {
      kind: "allow";
      message?: string;
      state?: GameState;
    }
  | {
      kind: "block";
      message: string;
      state?: GameState;
    }
  | {
      destinationRoomId: string;
      kind: "redirect";
      message?: string;
      state?: GameState;
    };

type MovementRule = (
  state: GameState,
  ctx: MovementRuleContext,
) => MovementRuleResult | undefined;

const blockLeavingBarWithDrink: MovementRule = (state, ctx) => {
  if (!shouldBlockLeavingBarWithDrink(state, ctx.destinationRoomId)) {
    return undefined;
  }

  return {
    kind: "block",
    message: BAR_DRINK_EXIT_BLOCK_MESSAGE,
    state,
  };
};

const resolveGymTreadmillMovementRule: MovementRule = (state, ctx) =>
  resolveGymTreadmillMovement(state, ctx);

const resolveMovieTheaterMovementRule: MovementRule = (state, ctx) =>
  resolveMovieTheaterMovement(state, ctx);

const resolveDeepStorageMovementRule: MovementRule = (state, ctx) =>
  resolveDeepStorageMovement(state, ctx);

const resolveLevelSixStorageMovementRule: MovementRule = (state, ctx) =>
  resolveLevelSixStorageMovement(state, ctx);

const resolveReactorPlatformMovementRule: MovementRule = (state, ctx) =>
  resolveReactorPlatformMovement(state, ctx);

const MOVEMENT_RULES: MovementRule[] = [
  blockLeavingBarWithDrink,
  resolveGymTreadmillMovementRule,
  resolveMovieTheaterMovementRule,
  resolveLevelSixStorageMovementRule,
  resolveDeepStorageMovementRule,
  resolveReactorPlatformMovementRule,
  (state, ctx) => resolveReactorCoreAccess(state, ctx),
];

export function resolveRegisteredMovementRule(
  state: GameState,
  ctx: MovementRuleContext,
): MovementRuleResult | undefined {
  for (const rule of MOVEMENT_RULES) {
    const result = rule(state, ctx);
    if (result) return result;
  }

  return undefined;
}
