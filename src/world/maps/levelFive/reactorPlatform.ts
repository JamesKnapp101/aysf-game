import { movePlayerToRoom } from "@game/helpers/gameHelpers";
import { isItemOpen, setItemOpen } from "@game/rules/containers";
import { updateItemLocation } from "@game/rules/items";
import {
  inventoryHas,
  removeFromInventory,
} from "@game/rules/state";
import type { GameState } from "@game/types/gameTypes";
import type {
  Item,
  ItemCommandOverrideContext,
  ItemSettings,
} from "@game/types/itemTypes";
import type { ParsedCommand } from "@game/types/parserTypes";

export const NORTH_CARGO_CAGE_ID = "TiltingPlatformNorthCargoCage";
export const SOUTH_CARGO_CAGE_ID = "TiltingPlatformSouthCargoCage";
export const RIGHT_SMARTBELL_ID = "RightSmartbell";
export const LEFT_SMARTBELL_ID = "LeftSmartbell";
export const PLATFORM_PERCH_ROOM_ID = "TiltedPlatformPerch";
export const RAFTER_TEST_ITEM_ID = "ReplacementReactorLobe";
export const PLATFORM_HYDRAULICS_PANEL_ID = "TiltingPlatformHydraulicsPanel";
export const PLATFORM_VALVE_ID = "TiltingPlatformValve";
export const MAINTENANCE_LADDER_ASCENT_MESSAGE =
  "You climb the maintenance ladder. As you reach the top, the lid opens like a sphincter to let you through. Once through, it constricts tightly closed again.";
export const MAINTENANCE_LADDER_TOP_BLOCK_MESSAGE =
  "The maintenance ladder's lid is sealed tight from this side. It looks like it requires some kind of tool to open from the top.";

const TILTED_NORTH_TRIGGER = "LevelFivePlatformTiltedToSupply";
const TILTED_SOUTH_TRIGGER = "LevelFivePlatformTiltedToObservation";
const PLAYER_WEIGHT_KG = 86;
const MINIMUM_TILT_WEIGHT_KG = 45;

export type TiltingPlatformOrientation = "level" | "north" | "south";
export type PlatformValvePosition = "A" | "B" | "C";
type SmartbellSettings = Extract<ItemSettings, { kind: "smartbell" }>;

type MaintenanceLadderSpec = {
  bottomRoomId: string;
  bottomScenery: string;
  idPrefix: string;
  topRoomId: string;
  topScenery: string;
};

const MAINTENANCE_LADDERS: MaintenanceLadderSpec[] = [
  {
    idPrefix: "SupplyWaste",
    topRoomId: "SupplyPlatform",
    bottomRoomId: "WasteProcessingPlatform",
    topScenery:
      "A sealed lid covers the top of a maintenance ladder in the deck.",
    bottomScenery:
      "A maintenance ladder climbs up toward the Supply Platform above.",
  },
  {
    idPrefix: "ObservationHeatCoolant",
    topRoomId: "ObservationPlatform",
    bottomRoomId: "HeatCoolantExchangePlatform",
    topScenery:
      "A sealed lid covers the top of a maintenance ladder near the warped guardrail.",
    bottomScenery:
      "A maintenance ladder climbs up toward the Observation Platform above.",
  },
];

export function getTiltingPlatformOrientation(
  state: GameState,
): TiltingPlatformOrientation {
  if (state.worldState.conditionalTriggers[TILTED_NORTH_TRIGGER]) {
    return "north";
  }

  if (state.worldState.conditionalTriggers[TILTED_SOUTH_TRIGGER]) {
    return "south";
  }

  return "level";
}

export function getPlatformValvePosition(
  state: GameState,
): PlatformValvePosition {
  const settings = state.itemState.itemSettings[PLATFORM_VALVE_ID];
  return settings?.kind === "platform-valve" ? settings.position : "C";
}

export function setPlatformValvePosition(
  state: GameState,
  position: PlatformValvePosition,
): GameState {
  return {
    ...state,
    itemState: {
      ...state.itemState,
      itemSettings: {
        ...state.itemState.itemSettings,
        [PLATFORM_VALVE_ID]: {
          kind: "platform-valve",
          position,
        },
      },
    },
  };
}

export function getSmartbellWeight(state: GameState, itemId: string): number {
  const settings = state.itemState.itemSettings[itemId];
  return settings?.kind === "smartbell" ? settings.weightKg : 1;
}

function setSmartbellWeight(
  state: GameState,
  itemId: string,
  weightKg: number,
): GameState {
  const settings: SmartbellSettings = { kind: "smartbell", weightKg };
  return {
    ...state,
    itemState: {
      ...state.itemState,
      itemSettings: {
        ...state.itemState.itemSettings,
        [itemId]: settings,
      },
    },
  };
}

function getCageContents(state: GameState, cageId: string): string[] {
  return state.itemState.containerContents[cageId] ?? [];
}

function getCageWeight(state: GameState, cageId: string): number {
  return getCageContents(state, cageId).reduce((total, itemId) => {
    if (itemId !== RIGHT_SMARTBELL_ID && itemId !== LEFT_SMARTBELL_ID) {
      return total;
    }
    return total + getSmartbellWeight(state, itemId);
  }, 0);
}

function getWeightDrivenOrientation(
  northWeight: number,
  southWeight: number,
): TiltingPlatformOrientation {
  const northCanTilt = northWeight >= MINIMUM_TILT_WEIGHT_KG;
  const southCanTilt = southWeight >= MINIMUM_TILT_WEIGHT_KG;

  if (!northCanTilt && !southCanTilt) return "level";
  if (northCanTilt && !southCanTilt) return "north";
  if (southCanTilt && !northCanTilt) return "south";

  if (northWeight >= southWeight * 2) return "north";
  if (southWeight >= northWeight * 2) return "south";
  return "level";
}

function constrainOrientationToValve(
  orientation: TiltingPlatformOrientation,
  valve: PlatformValvePosition,
): TiltingPlatformOrientation {
  if (valve === "C") return "level";
  if (valve === "A") return orientation === "north" ? "north" : "level";
  return orientation === "south" ? "south" : "level";
}

function getCargoDrivenOrientation(
  state: GameState,
): TiltingPlatformOrientation {
  return constrainOrientationToValve(
    getWeightDrivenOrientation(
      getCageWeight(state, NORTH_CARGO_CAGE_ID),
      getCageWeight(state, SOUTH_CARGO_CAGE_ID),
    ),
    getPlatformValvePosition(state),
  );
}

function setTiltingPlatformOrientation(
  state: GameState,
  orientation: TiltingPlatformOrientation,
): GameState {
  let next: GameState = {
    ...state,
    worldState: {
      ...state.worldState,
      conditionalTriggers: {
        ...state.worldState.conditionalTriggers,
        [TILTED_NORTH_TRIGGER]: orientation === "north",
        [TILTED_SOUTH_TRIGGER]: orientation === "south",
      },
    },
  };

  const cageRooms =
    orientation === "level"
      ? {
          [NORTH_CARGO_CAGE_ID]: "SupplyPlatform",
          [SOUTH_CARGO_CAGE_ID]: "ObservationPlatform",
        }
      : orientation === "north"
        ? {
            [NORTH_CARGO_CAGE_ID]: "WasteProcessingPlatform",
            [SOUTH_CARGO_CAGE_ID]: PLATFORM_PERCH_ROOM_ID,
          }
        : {
            [NORTH_CARGO_CAGE_ID]: PLATFORM_PERCH_ROOM_ID,
            [SOUTH_CARGO_CAGE_ID]: "HeatCoolantExchangePlatform",
          };

  for (const [cageId, roomId] of Object.entries(cageRooms)) {
    next = updateItemLocation(next, cageId, roomId);
  }

  return next;
}

function describeOrientationChange(
  before: TiltingPlatformOrientation,
  after: TiltingPlatformOrientation,
): string | undefined {
  if (before === after) return undefined;
  if (after === "level") {
    return "The hydraulic platform settles back into a level position with a heavy metallic thud.";
  }
  return after === "north"
    ? "The platform groans and tilts north, its south edge climbing toward the rafters."
    : "The platform groans and tilts south, its north edge climbing toward the rafters.";
}

function recalculateCargoDrivenPlatform(
  state: GameState,
  allowPlayerPerch = true,
): { message?: string; state: GameState } {
  const before = getTiltingPlatformOrientation(state);
  const after = getCargoDrivenOrientation(state);
  let next = setTiltingPlatformOrientation(state, after);
  let message = describeOrientationChange(before, after);

  const northWeight = getCageWeight(next, NORTH_CARGO_CAGE_ID);
  const southWeight = getCageWeight(next, SOUTH_CARGO_CAGE_ID);
  const playerCanRideNorthTip =
    allowPlayerPerch &&
    before === "level" &&
    after === "north" &&
    state.player.roomId === "ObservationPlatform" &&
    northWeight >= PLAYER_WEIGHT_KG;
  const playerCanRideSouthTip =
    allowPlayerPerch &&
    before === "level" &&
    after === "south" &&
    state.player.roomId === "SupplyPlatform" &&
    southWeight >= PLAYER_WEIGHT_KG;

  if (playerCanRideNorthTip || playerCanRideSouthTip) {
    next = movePlayerToRoom(next, PLATFORM_PERCH_ROOM_ID, {
      fromRoomId: state.player.roomId,
      via: "rising tilting platform",
    });
    message = [
      message,
      "The edge beside you starts rising. You scramble onto the canted deck before it climbs out of reach and ride it upward toward the scaffolding.",
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  if (
    allowPlayerPerch &&
    before !== "level" &&
    after === "level" &&
    state.player.roomId === PLATFORM_PERCH_ROOM_ID
  ) {
    const destinationRoomId =
      before === "north" ? "ObservationPlatform" : "SupplyPlatform";
    next = movePlayerToRoom(next, destinationRoomId, {
      fromRoomId: state.player.roomId,
      via: "lowering tilting platform",
    });
    message = [
      message,
      "The raised edge sinks back down. You ride the cage-side lip with considerably less grace than before, but it returns you safely to the upper deck.",
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  return { state: next, message };
}

function getSetValue(cmd: ParsedCommand): number | undefined {
  if (cmd.type !== "action") return undefined;
  const match = (cmd.indirect ?? "").match(/\d+/);
  if (!match) return undefined;
  const value = Number.parseInt(match[0], 10);
  return Number.isInteger(value) ? value : undefined;
}

function setSmartbell({
  cmd,
  item,
  state,
}: {
  cmd: ParsedCommand;
  item: Item;
  state: GameState;
}) {
  const value = getSetValue(cmd);
  if (value == null) {
    return { state, message: "Set the Smartbell to what weight?" };
  }
  if (value < 1 || value > 300) {
    return { state, message: "The Smartbell dial only runs from 1 to 300 kilograms." };
  }

  const wasHeld = inventoryHas(state.player.inventory, item.id);
  const previousLocation = state.itemState.itemRoomId[item.id] ?? item.location;
  let next = state;
  let message: string;

  if (wasHeld && value > 5) {
    next = removeFromInventory(next, item.id);
    next = updateItemLocation(next, item.id, state.player.roomId);
    message = `You put the ${item.name} down first, then turn its dial to ${value}. Its pastel shell settles against the deck with alarming weight.`;
  } else if (wasHeld) {
    message = `You turn the ${item.name}'s dial to ${value}. The weight in your hand increases immediately.`;
  } else {
    message = `You turn the ${item.name}'s dial to ${value}. The Smartbell gives a soft electronic chirp as its weight changes.`;
  }

  next = setSmartbellWeight(next, item.id, value);

  if (
    previousLocation === NORTH_CARGO_CAGE_ID ||
    previousLocation === SOUTH_CARGO_CAGE_ID
  ) {
    const recalculated = recalculateCargoDrivenPlatform(next);
    next = recalculated.state;
    if (recalculated.message) {
      message += `\n\n${recalculated.message}`;
    }
  }

  return { state: next, message };
}

function openHydraulicsPanel({ state }: { state: GameState }) {
  if (state.itemState.openItems[PLATFORM_HYDRAULICS_PANEL_ID]) {
    return { state, message: "The heavy maintenance panel is already open." };
  }

  return {
    state: setItemOpen(state, PLATFORM_HYDRAULICS_PANEL_ID, true),
    message:
      "You haul the heavy panel open. Behind it, pipes, ducts, and hydraulic lines crowd the compartment around a pressure gauge and a three-position valve marked A, B, and C.",
  };
}

function describeHydraulicsPanelScenery(state: GameState): string {
  if (!isItemOpen(state, PLATFORM_HYDRAULICS_PANEL_ID)) {
    return "A heavy maintenance panel with a recessed handle occupies one wall.";
  }

  return `The heavy maintenance panel hangs open, exposing pipes, ducts, hydraulic lines, a pressure gauge, and a three-position valve currently set to ${getPlatformValvePosition(state)}.`;
}

function setPlatformValve({
  cmd,
  state,
}: {
  cmd: ParsedCommand;
  state: GameState;
}) {
  if (cmd.type !== "action") return { state, message: "Set the valve where?" };
  const requested = cmd.indirect?.trim().toUpperCase();
  if (requested !== "A" && requested !== "B" && requested !== "C") {
    return { state, message: "The valve has only three positions: A, B, and C." };
  }

  if (getPlatformValvePosition(state) === requested) {
    return { state, message: `The valve is already set to ${requested}.` };
  }

  const recalculated = recalculateCargoDrivenPlatform(
    setPlatformValvePosition(state, requested),
  );
  return {
    state: recalculated.state,
    message: [
      `You wrench the valve around to position ${requested}. Something clunks and hisses in the hydraulic lift between the Supply and Observation Platforms.`,
      recalculated.message,
    ]
      .filter(Boolean)
      .join("\n\n"),
  };
}

export function handleReactorCargoPut(
  state: GameState,
  ctx: { hostId: string; itemId: string; preposition: string },
) {
  if (
    ctx.hostId !== NORTH_CARGO_CAGE_ID &&
    ctx.hostId !== SOUTH_CARGO_CAGE_ID
  ) {
    return undefined;
  }

  const item = state.world.items.find((candidate) => candidate.id === ctx.itemId);
  const cageName =
    ctx.hostId === NORTH_CARGO_CAGE_ID ? "north cargo cage" : "south cargo cage";
  const recalculated = recalculateCargoDrivenPlatform(state);

  return {
    state: recalculated.state,
    message: [
      `You stow ${item?.name ?? "the item"} in the ${cageName}.`,
      recalculated.message,
    ]
      .filter(Boolean)
      .join("\n\n"),
  };
}

export function handleReactorSmartbellTaken(state: GameState, item: Item) {
  if (item.id !== RIGHT_SMARTBELL_ID && item.id !== LEFT_SMARTBELL_ID) {
    return undefined;
  }

  const previousWeight = getSmartbellWeight(state, item.id);
  let next = previousWeight === 1 ? state : setSmartbellWeight(state, item.id, 1);
  const recalculated = recalculateCargoDrivenPlatform(next);
  next = recalculated.state;

  if (previousWeight === 1 && !recalculated.message) {
    return { state: next };
  }

  return {
    state: next,
    message: [
      previousWeight === 1
        ? undefined
        : "You dial the weight down to 1 before picking it up.",
      recalculated.message,
    ]
      .filter(Boolean)
      .join("\n\n"),
  };
}

function getPlayerStepOrientation(
  state: GameState,
  side: "north" | "south",
): TiltingPlatformOrientation {
  const northWeight =
    getCageWeight(state, NORTH_CARGO_CAGE_ID) +
    (side === "north" ? PLAYER_WEIGHT_KG : 0);
  const southWeight =
    getCageWeight(state, SOUTH_CARGO_CAGE_ID) +
    (side === "south" ? PLAYER_WEIGHT_KG : 0);
  return constrainOrientationToValve(
    getWeightDrivenOrientation(northWeight, southWeight),
    getPlatformValvePosition(state),
  );
}

function getOppositeCargoWarning(state: GameState, cageId: string): string {
  return getCageContents(state, cageId).length > 0
    ? "The items you put in the opposite cargo cage might slow the descent somewhat, but you'd need something a lot heavier than that."
    : "";
}

function resetAfterPlayerFall(state: GameState): GameState {
  return recalculateCargoDrivenPlatform(state, false).state;
}

function getMaintenanceLadderByBottomRoom(
  roomId: string,
): MaintenanceLadderSpec | undefined {
  return MAINTENANCE_LADDERS.find((ladder) => ladder.bottomRoomId === roomId);
}

function blockMaintenanceLadderTop({ state }: ItemCommandOverrideContext) {
  return {
    state,
    message: MAINTENANCE_LADDER_TOP_BLOCK_MESSAGE,
  };
}

function climbMaintenanceLadderFromBelow({
  state,
}: ItemCommandOverrideContext) {
  const ladder = getMaintenanceLadderByBottomRoom(state.player.roomId);
  if (!ladder) {
    return {
      state,
      message: "The maintenance ladder does not lead anywhere useful from here.",
    };
  }

  return {
    state: movePlayerToRoom(state, ladder.topRoomId, {
      fromRoomId: state.player.roomId,
      via: "maintenance ladder",
    }),
    message: MAINTENANCE_LADDER_ASCENT_MESSAGE,
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
    ctx.fromRoomId === PLATFORM_PERCH_ROOM_ID &&
    ctx.direction === "down"
  ) {
    const orientation = getTiltingPlatformOrientation(state);
    return {
      kind: "redirect" as const,
      destinationRoomId:
        orientation === "south"
          ? "HeatCoolantExchangePlatform"
          : "WasteProcessingPlatform",
      state,
      message:
        "You lower yourself onto the steep deck and slide down the tilted platform to the opposite side.",
    };
  }

  const topBlockedMaintenanceLadder = MAINTENANCE_LADDERS.find(
    (ladder) =>
      ctx.fromRoomId === ladder.topRoomId &&
      ctx.destinationRoomId === ladder.bottomRoomId &&
      ctx.direction === "down",
  );
  if (topBlockedMaintenanceLadder) {
    return {
      kind: "block" as const,
      state,
      message: MAINTENANCE_LADDER_TOP_BLOCK_MESSAGE,
    };
  }

  const upwardMaintenanceLadder = MAINTENANCE_LADDERS.find(
    (ladder) =>
      ctx.fromRoomId === ladder.bottomRoomId &&
      ctx.destinationRoomId === ladder.topRoomId &&
      ctx.direction === "up",
  );
  if (upwardMaintenanceLadder) {
    return {
      kind: "allow" as const,
      state,
      message: MAINTENANCE_LADDER_ASCENT_MESSAGE,
    };
  }

  const orientation = getTiltingPlatformOrientation(state);
  const upperCrossing =
    (ctx.fromRoomId === "SupplyPlatform" &&
      ctx.direction === "south" &&
      ctx.destinationRoomId === "ObservationPlatform") ||
    (ctx.fromRoomId === "ObservationPlatform" &&
      ctx.direction === "north" &&
      ctx.destinationRoomId === "SupplyPlatform");

  if (upperCrossing && orientation !== "level") {
    return {
      kind: "block" as const,
      state,
      message:
        ctx.fromRoomId === "SupplyPlatform" && orientation === "north"
          ? "The north edge of the platform is twenty feet below you. There is no safe way to step south onto it."
          : ctx.fromRoomId === "ObservationPlatform" && orientation === "north"
            ? "The platform's south edge has tilted far too high above the Observation Platform to reach."
            : ctx.fromRoomId === "SupplyPlatform"
              ? "The platform's north edge has tilted far too high above the Supply Platform to reach."
              : "The south edge of the platform is twenty feet below you. There is no safe way to step north onto it.",
    };
  }

  if (
    ctx.fromRoomId === "SupplyPlatform" &&
    ctx.direction === "south" &&
    ctx.destinationRoomId === "ObservationPlatform"
  ) {
    if (getPlayerStepOrientation(state, "north") !== "north") {
      return {
        kind: "allow" as const,
        state,
        message:
          "You step onto the hydraulic platform. It shifts under your weight but remains level, allowing you to cross to the Observation Platform.",
      };
    }

    const warning = getOppositeCargoWarning(state, SOUTH_CARGO_CAGE_ID);
    return {
      kind: "redirect" as const,
      destinationRoomId: "WasteProcessingPlatform",
      state: resetAfterPlayerFall(
        setTiltingPlatformOrientation(state, "north"),
      ),
      message: [
        "You step south onto the hydraulic platform. Its north edge drops instantly beneath your weight, pitching like a seesaw as the whole assembly plunges down its shaft. You lose your footing, slide off the low edge, and tumble onto the Waste Processing Platform below. Free of your weight, the platform rises and settles level again.",
        warning,
      ]
        .filter(Boolean)
        .join("\n\n"),
    };
  }

  if (
    ctx.fromRoomId === "ObservationPlatform" &&
    ctx.direction === "north" &&
    ctx.destinationRoomId === "SupplyPlatform"
  ) {
    if (getPlayerStepOrientation(state, "south") !== "south") {
      return {
        kind: "allow" as const,
        state,
        message:
          "You step onto the hydraulic platform. It shifts under your weight but remains level, allowing you to cross to the Supply Platform.",
      };
    }

    const warning = getOppositeCargoWarning(state, NORTH_CARGO_CAGE_ID);
    return {
      kind: "redirect" as const,
      destinationRoomId: "HeatCoolantExchangePlatform",
      state: resetAfterPlayerFall(
        setTiltingPlatformOrientation(state, "south"),
      ),
      message: [
        "You step north onto the hydraulic platform. Its south edge collapses beneath you, seesawing violently as the assembly sinks. You skid across the canted deck and spill out onto the Heat/Coolant Exchange Platform below. Free of your weight, the platform rises and settles level again.",
        warning,
      ]
        .filter(Boolean)
        .join("\n\n"),
    };
  }

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
    if (orientation === "north") {
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
    if (orientation === "south") {
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
  return orientation === "north"
    ? "The damaged hydraulic platform is tipped sharply north, its south edge raised toward the overhead scaffolding. The north cargo cage hangs from the lowered edge, while the south cargo cage rides high with the raised deck."
    : "The damaged hydraulic platform is tipped sharply south, its north edge raised toward the overhead scaffolding. The south cargo cage hangs from the lowered edge, while the north cargo cage rides high with the raised deck.";
}

export function describeTiltedPlatformPerch(state: GameState): string {
  const orientation = getTiltingPlatformOrientation(state);
  const raisedCage =
    orientation === "north"
      ? "The south cargo cage is bolted beside this raised edge, close enough to reach."
      : orientation === "south"
        ? "The north cargo cage is bolted beside this raised edge, close enough to reach."
        : "The hydraulic platform has settled level again below you, leaving this perch with the embarrassing logic of a ladder that forgot its rungs.";

  return `You are perched near the raised edge of the damaged hydraulic platform, level with the overhead scaffolding. The deck drops away at a severe angle beneath you, leaving down as the only safe route off. ${raisedCage}`;
}

function createMaintenanceLadderItems(): Item[] {
  return MAINTENANCE_LADDERS.flatMap((ladder) => [
    {
      id: `${ladder.idPrefix}MaintenanceLadderLid`,
      name: "maintenance ladder lid",
      description:
        "A thick iris-like lid seals the top of the maintenance ladder. It has no handwheel, handle, or obvious release on this side; opening it from here requires some kind of tool.",
      sceneryDescription: ladder.topScenery,
      location: ladder.topRoomId,
      vocab: [
        "lid",
        "ladder lid",
        "maintenance ladder lid",
        "maintenance lid",
        "maintenance ladder",
        "ladder",
        "hatch",
        "cover",
      ],
      itemClass: "solid" as const,
      itemCategory: "scenery" as const,
      itemWeight: 200,
      itemSize: 5,
      isUseable: true,
      overrides: {
        open: blockMaintenanceLadderTop,
        use: blockMaintenanceLadderTop,
      },
    },
    {
      id: `${ladder.idPrefix}MaintenanceLadder`,
      name: "maintenance ladder",
      description:
        "A narrow ladder is bolted into the wall, its worn rungs climbing to a circular lid overhead. The mechanism is clearly designed to admit someone coming from below.",
      sceneryDescription: ladder.bottomScenery,
      location: ladder.bottomRoomId,
      vocab: ["ladder", "maintenance ladder", "service ladder", "rungs"],
      itemClass: "solid" as const,
      itemCategory: "scenery" as const,
      itemWeight: 120,
      itemSize: 8,
      isUseable: true,
      overrides: {
        use: climbMaintenanceLadderFromBelow,
      },
    },
  ]);
}

export const reactorPlatformItems: Item[] = [
  ...createMaintenanceLadderItems(),
  {
    id: PLATFORM_HYDRAULICS_PANEL_ID,
    name: "heavy maintenance panel",
    description:
      "A thick steel access panel is secured over part of the lift's hydraulic control system.",
    describeScenery: (state) => describeHydraulicsPanelScenery(state),
    sceneryDescription:
      "A heavy maintenance panel with a recessed handle occupies one wall.",
    location: "MaintenancePlatform",
    vocab: ["panel", "maintenance panel", "heavy panel", "access panel"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 100,
    itemSize: 6,
    isContainer: true,
    isOpenable: true,
    overrides: { open: openHydraulicsPanel },
  },
  {
    id: "TiltingPlatformHydraulics",
    name: "pipes, ducts, and hydraulics",
    description:
      "A cramped web of pipes, ducts, and hydraulic lines feeds the damaged platform lift.",
    sceneryDescription:
      "Pipes, ducts, and hydraulic lines fill almost every inch behind the panel.",
    location: PLATFORM_HYDRAULICS_PANEL_ID,
    vocab: ["pipes", "ducts", "hydraulics", "hydraulic lines", "lines"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 100,
    itemSize: 5,
  },
  {
    id: "TiltingPlatformPressureGauge",
    name: "pressure gauge",
    description:
      "The pressure needle jitters deep in a red failure band. Something in the lift's balancing hydraulics is plainly broken.",
    sceneryDescription:
      "A pressure gauge trembles in its red failure band.",
    location: PLATFORM_HYDRAULICS_PANEL_ID,
    vocab: ["gauge", "pressure gauge", "needle"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 2,
    itemSize: 1,
  },
  {
    id: PLATFORM_VALVE_ID,
    name: "three-position valve",
    description: "The sturdy valve can be set to A, B, or C.",
    describe: (state) =>
      `The sturdy hydraulic valve can be set to A, B, or C. It is currently set to ${getPlatformValvePosition(state)}.`,
    sceneryDescription:
      "Among the hydraulic lines is a valve with positions marked A, B, and C.",
    location: PLATFORM_HYDRAULICS_PANEL_ID,
    vocab: ["valve", "hydraulic valve", "three-position valve"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 10,
    itemSize: 2,
    isSettable: true,
    overrides: { set: setPlatformValve },
  },
  {
    id: NORTH_CARGO_CAGE_ID,
    name: "north cargo cage",
    description:
      "A sturdy open-topped metal bin is fixed to the north side of the hydraulic platform for carrying heavy cargo between levels.",
    sceneryDescription:
      "A sturdy cargo cage is attached to the platform's north side.",
    location: "SupplyPlatform",
    vocab: ["north cage", "north cargo cage", "cargo cage", "cage", "bin"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 200,
    itemSize: 8,
    isContainer: true,
    isOpenable: false,
    capacity: 20,
    meta: { transparentContainer: true },
  },
  {
    id: SOUTH_CARGO_CAGE_ID,
    name: "south cargo cage",
    description:
      "A sturdy open-topped metal bin is fixed to the south side of the hydraulic platform for carrying heavy cargo between levels.",
    sceneryDescription:
      "A sturdy cargo cage is attached to the platform's south side.",
    location: "ObservationPlatform",
    vocab: ["south cage", "south cargo cage", "cargo cage", "cage", "bin"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 200,
    itemSize: 8,
    isContainer: true,
    isOpenable: false,
    capacity: 20,
    meta: { transparentContainer: true },
  },
  {
    id: RIGHT_SMARTBELL_ID,
    name: "right Smartbell dumbbell",
    description:
      "A pastel exercise weight branded SMARTBELL has a digital dial on one end and a large letter R printed on its shell.",
    describe: (state) =>
      `The pastel right Smartbell has an R printed on it. Its dial is set to ${getSmartbellWeight(state, RIGHT_SMARTBELL_ID)} kilograms.`,
    location: "INVENTORY",
    vocab: [
      "right",
      "right dumbbell",
      "right smartbell",
      "right smartbell dumbbell",
      "smartbell r",
    ],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 3,
    isSettable: true,
    overrides: { set: setSmartbell },
  },
  {
    id: LEFT_SMARTBELL_ID,
    name: "left Smartbell dumbbell",
    description:
      "A pastel exercise weight branded SMARTBELL has a digital dial on one end and a large letter L printed on its shell.",
    describe: (state) =>
      `The pastel left Smartbell has an L printed on it. Its dial is set to ${getSmartbellWeight(state, LEFT_SMARTBELL_ID)} kilograms.`,
    location: "INVENTORY",
    vocab: [
      "left",
      "left dumbbell",
      "left smartbell",
      "left smartbell dumbbell",
      "smartbell l",
    ],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 3,
    isSettable: true,
    overrides: { set: setSmartbell },
  },
  {
    id: "ObservationRafterTestItemView",
    name: "reactor lobe lodged in the rafters",
    description:
      "An intact-looking spherical Reactor Lobe is wedged high in the scaffolding above the platform. The large connector on its back still has a full set of straight gold pins, but it is well beyond your reach from here.",
    sceneryDescription:
      "High above, an intact Reactor Lobe is visibly lodged in the metal scaffolding.",
    location: "ObservationPlatform",
    vocab: ["lobe", "reactor lobe", "replacement lobe", "rafters"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    overrides: {
      take: "The Reactor Lobe is lodged far too high in the scaffolding to reach from the Observation Platform.",
    },
  },
  {
    id: RAFTER_TEST_ITEM_ID,
    name: "intact reactor lobe",
    description:
      "A spherical housing contains a dormant reactor-control AI. The broad connector on its back carries rows of straight, clean gold pins. Unlike the wreckage below, this lobe appears intact.",
    initialDescription:
      "The intact Reactor Lobe is wedged in the scaffolding within arm's reach.",
    location: PLATFORM_PERCH_ROOM_ID,
    vocab: ["lobe", "reactor lobe", "replacement lobe", "intact lobe"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
  },
];
