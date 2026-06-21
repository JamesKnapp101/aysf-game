import type { GameState } from "@game/types/gameTypes";

export type TiltingPlatformOrientation =
  | "level"
  | "supply-side"
  | "observation-side";

const TILTED_TO_SUPPLY_TRIGGER = "LevelFivePlatformTiltedToSupply";
const TILTED_TO_OBSERVATION_TRIGGER =
  "LevelFivePlatformTiltedToObservation";

export function getTiltingPlatformOrientation(
  state: GameState,
): TiltingPlatformOrientation {
  if (state.worldState.conditionalTriggers[TILTED_TO_SUPPLY_TRIGGER]) {
    return "supply-side";
  }

  if (state.worldState.conditionalTriggers[TILTED_TO_OBSERVATION_TRIGGER]) {
    return "observation-side";
  }

  return "level";
}

function setTiltingPlatformOrientation(
  state: GameState,
  orientation: Exclude<TiltingPlatformOrientation, "level">,
): GameState {
  return {
    ...state,
    worldState: {
      ...state.worldState,
      conditionalTriggers: {
        ...state.worldState.conditionalTriggers,
        [TILTED_TO_SUPPLY_TRIGGER]: orientation === "supply-side",
        [TILTED_TO_OBSERVATION_TRIGGER]:
          orientation === "observation-side",
      },
    },
  };
}

export function resolveReactorPlatformMovement(
  state: GameState,
  ctx: {
    destinationRoomId: string;
    direction: string;
    fromRoomId: string;
  },
) {
  if (
    ctx.fromRoomId === "SupplyPlatform" &&
    ctx.direction === "south" &&
    ctx.destinationRoomId === "ObservationPlatform"
  ) {
    return {
      kind: "redirect" as const,
      destinationRoomId: "WasteProcessingPlatform",
      state: setTiltingPlatformOrientation(state, "supply-side"),
      message:
        "You step south onto the hydraulic platform. Its supply-side edge drops instantly beneath your weight, pitching like a seesaw as the whole assembly plunges down its shaft. You lose your footing, slide off the low edge, and tumble onto the Waste Processing Platform below.",
    };
  }

  if (
    ctx.fromRoomId === "ObservationPlatform" &&
    ctx.direction === "north" &&
    ctx.destinationRoomId === "SupplyPlatform"
  ) {
    return {
      kind: "redirect" as const,
      destinationRoomId: "HeatCoolantExchangePlatform",
      state: setTiltingPlatformOrientation(state, "observation-side"),
      message:
        "You step north onto the hydraulic platform. The observation-side edge collapses beneath you, seesawing violently as the assembly sinks. You skid across the canted deck and spill out onto the Heat/Coolant Exchange Platform below.",
    };
  }

  const orientation = getTiltingPlatformOrientation(state);

  if (
    ctx.fromRoomId === "WasteProcessingPlatform" &&
    ctx.direction === "south" &&
    ctx.destinationRoomId === "HeatCoolantExchangePlatform"
  ) {
    if (orientation === "level") {
      return {
        kind: "block" as const,
        state,
        message:
          "The hydraulic platform is still raised between the upper platforms. Only its empty shaft lies to the south.",
      };
    }

    if (orientation === "supply-side") {
      return {
        kind: "block" as const,
        state,
        message:
          "The near edge of the tilting platform is sunk toward you. Its deck rises south at an angle far too steep to climb.",
      };
    }

    return {
      kind: "allow" as const,
      state,
      message:
        "The platform slopes away from you. You pick your way down its canted deck and step onto the Heat/Coolant Exchange Platform.",
    };
  }

  if (
    ctx.fromRoomId === "HeatCoolantExchangePlatform" &&
    ctx.direction === "north" &&
    ctx.destinationRoomId === "WasteProcessingPlatform"
  ) {
    if (orientation === "level") {
      return {
        kind: "block" as const,
        state,
        message:
          "The hydraulic platform is still raised between the upper platforms. Only its empty shaft lies to the north.",
      };
    }

    if (orientation === "observation-side") {
      return {
        kind: "block" as const,
        state,
        message:
          "The near edge of the tilting platform is sunk toward you. Its deck rises north at an angle far too steep to climb.",
      };
    }

    return {
      kind: "allow" as const,
      state,
      message:
        "The platform slopes away from you. You descend carefully across its tilted deck to the Waste Processing Platform.",
    };
  }

  return undefined;
}

export function describeTiltingPlatform(state: GameState): string {
  const orientation = getTiltingPlatformOrientation(state);

  if (orientation === "level") {
    return "The broad hydraulic platform between the upper decks is level, though its exposed pistons are bent and leaking fluid.";
  }

  return orientation === "supply-side"
    ? "The damaged hydraulic platform sits at the lower level, tipped sharply toward the supply and waste-processing side of its shaft."
    : "The damaged hydraulic platform sits at the lower level, tipped sharply toward the observation and heat-exchange side of its shaft.";
}
