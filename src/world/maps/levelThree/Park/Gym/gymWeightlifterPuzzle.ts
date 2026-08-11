import { removeItemFromPlacementLists } from "@game/helpers/itemPlacement";
import { updateItemLocation } from "@game/rules/items";
import { triggerScoreOnce } from "@game/rules/score";
import {
  addToInventory,
  inventoryHas,
  removeFromInventory,
} from "@game/rules/state";
import type { GameState, StatusId } from "@game/types/gameTypes";
import type { Item, ItemSettings } from "@game/types/itemTypes";
import { ParsedCommand } from "@game/types/parserTypes";
import {
  NORTH_CARGO_CAGE_ID,
  recalculateCargoDrivenPlatform,
  SOUTH_CARGO_CAGE_ID,
} from "src/world/maps/levelFive/reactorPlatform";
import {
  GYM_WEIGHT_ROOM_ID,
  GYM_WEIGHTLIFTER_MOVED_TRIGGER,
  GYM_YELLOW_BADGE_ID,
} from "./gymConstants";

type SmartbellSettings = Extract<ItemSettings, { kind: "smartbell" }>;
export const RIGHT_SMARTBELL_ID = "RightSmartbell";
export const LEFT_SMARTBELL_ID = "LeftSmartbell";

export function isGymWeightlifterPinningBadge(state: GameState): boolean {
  return (
    state.worldState.conditionalTriggers[GYM_WEIGHTLIFTER_MOVED_TRIGGER] !==
    true
  );
}

function playerHasStatusEffect(state: GameState, statusId: StatusId): boolean {
  return state.player.statusEffects.some((effect) => effect.id === statusId);
}

export function liftGymWeightlifterBarbell(state: GameState): {
  message: string;
  state: GameState;
} {
  if (!playerHasStatusEffect(state, "stronger")) {
    return {
      state,
      message:
        "You squat down, grip the barbell, and strain until your shoulders shake, but you can't move it an inch.",
    };
  }

  let next: GameState = {
    ...state,
    worldState: {
      ...state.worldState,
      conditionalTriggers: {
        ...state.worldState.conditionalTriggers,
        [GYM_WEIGHTLIFTER_MOVED_TRIGGER]: true,
      },
    },
    itemState: {
      ...state.itemState,
      containerContents: removeItemFromPlacementLists(
        state.itemState.containerContents,
        GYM_YELLOW_BADGE_ID,
      ),
      surfaceContents: removeItemFromPlacementLists(
        state.itemState.surfaceContents,
        GYM_YELLOW_BADGE_ID,
      ),
      underContents: removeItemFromPlacementLists(
        state.itemState.underContents,
        GYM_YELLOW_BADGE_ID,
      ),
      searchableContents: removeItemFromPlacementLists(
        state.itemState.searchableContents,
        GYM_YELLOW_BADGE_ID,
      ),
    },
  };

  if (!inventoryHas(next.player.inventory, GYM_YELLOW_BADGE_ID)) {
    next = updateItemLocation(next, GYM_YELLOW_BADGE_ID, "INVENTORY");
    next = addToInventory(next, GYM_YELLOW_BADGE_ID);
    next = triggerScoreOnce(
      next,
      next.world.items.find((item) => item.id === GYM_YELLOW_BADGE_ID)?.scoreId,
    );
  }

  return {
    state: next,
    message:
      "You plant your feet, take hold of the barbell, and lift. The bar rises just enough for you to hook the yellow badge out from beneath the body. You grab it, then ease the weight back down before your grip gives out.",
  };
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
    return {
      state,
      message: "The Smartbell dial only runs from 1 to 300 kilograms.",
    };
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

export function getSmartbellWeight(state: GameState, itemId: string): number {
  const settings = state.itemState.itemSettings[itemId];
  return settings?.kind === "smartbell" ? settings.weightKg : 1;
}

export function setSmartbellWeight(
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

export const gymWeightRoomItems: Item[] = [
  {
    id: RIGHT_SMARTBELL_ID,
    name: "right Smartbell dumbbell",
    description:
      "A pastel exercise weight branded SMARTBELL has a digital dial on one end and a large letter R printed on its shell.",
    describe: (state) =>
      `The pastel right Smartbell has an R printed on it. Its dial is set to ${getSmartbellWeight(state, RIGHT_SMARTBELL_ID)} kilograms.`,
    location: "GymWeightRoom",
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
    location: "GymWeightRoom",
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
    id: "GymWeightRoomMachines",
    name: "weight machines",
    description:
      "The machines are built for serious resistance work, all cable stacks, thick pads, and adjustment levers.",
    sceneryDescription:
      "Various weight machines fill one side of the room, their adjustable seats and cable stacks set at different heights.",
    location: GYM_WEIGHT_ROOM_ID,
    vocab: ["weight", "weights", "machine", "machines"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 300,
    itemSize: 10,
    meta: {
      sceneryDescriptionOrder: 1,
    },
  },
  {
    id: "GymWeightRoomFreeWeights",
    name: "free weights",
    description:
      "The free weights range from small dumbbells to plates big enough to make your wrists ache just looking at them.",
    sceneryDescription:
      "Benches and racks of free weights range from tiny all the way up to massive.",
    location: GYM_WEIGHT_ROOM_ID,
    vocab: [
      "free",
      "weights",
      "free weights",
      "dumbbells",
      "plates",
      "benches",
    ],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 400,
    itemSize: 10,
    meta: {
      sceneryDescriptionOrder: 2,
    },
  },
  {
    id: "GymWeightRoomMirrors",
    name: "wall mirrors",
    description:
      "The mirrors are broad and bright, positioned so lifters can admire their form or confront their mistakes from several angles at once.",
    sceneryDescription: "Several large mirrors are mounted on the walls.",
    location: GYM_WEIGHT_ROOM_ID,
    vocab: ["mirror", "mirrors", "wall mirrors"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 80,
    itemSize: 8,
    isReflective: true,
    meta: {
      sceneryDescriptionOrder: 3,
    },
  },
  {
    id: "GymWeightRoomMatting",
    name: "rubber matting",
    description:
      "The thick rubber matting is scuffed, dented, and faintly chalky. It has absorbed a lot of punishment.",
    sceneryDescription:
      "The floor is covered in thick rubber matting to absorb the impact of dropped weights.",
    location: GYM_WEIGHT_ROOM_ID,
    vocab: ["rubber", "matting", "mat", "floor"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 100,
    itemSize: 10,
    meta: {
      sceneryDescriptionOrder: 4,
    },
  },
  {
    id: "GymWeightRoomCrushedBody",
    name: "crushed body",
    description:
      "The man was heavily muscled and rugged-looking, with copper hair and a barely-there black tank top. A barbell stacked with four hundred pounds has crushed his ribcage flat.",
    sceneryDescription:
      "Lying on the floor is the body of a heavily muscled, rugged-looking copper-haired man in a black tank top, camo shorts, and white sneakers. His lifeless eyes bug out at the ceiling as a barbell stacked with four hundred pounds crushes his ribcage.",
    location: GYM_WEIGHT_ROOM_ID,
    vocab: [
      "body",
      "corpse",
      "man",
      "copper",
      "hair",
      "weightlifter",
      "lifter",
      "barbell",
      "barbel",
      "weights",
    ],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 120,
    itemSize: 9,
    meta: {
      corpse: {
        hasIntactHead: true,
        memoryExperienceId: "barbell_corpse_memory",
      },
      sceneryDescriptionOrder: 5,
    },
    overrides: {
      lift: ({ state }: { state: GameState }) =>
        liftGymWeightlifterBarbell(state),
      move: ({ state }: { state: GameState }) =>
        liftGymWeightlifterBarbell(state),
    },
  },
];
