import { removeItemFromPlacementLists } from "@game/helpers/itemPlacement";
import { updateItemLocation } from "@game/rules/items";
import { triggerScoreOnce } from "@game/rules/score";
import { addToInventory, inventoryHas } from "@game/rules/state";
import type { GameState, StatusId } from "@game/types/gameTypes";
import type { Item } from "@game/types/itemTypes";
import {
  GYM_ORANGE_BADGE_ID,
  GYM_WEIGHT_ROOM_ID,
  GYM_WEIGHTLIFTER_MOVED_TRIGGER,
} from "./gymConstants";

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
        GYM_ORANGE_BADGE_ID,
      ),
      surfaceContents: removeItemFromPlacementLists(
        state.itemState.surfaceContents,
        GYM_ORANGE_BADGE_ID,
      ),
      underContents: removeItemFromPlacementLists(
        state.itemState.underContents,
        GYM_ORANGE_BADGE_ID,
      ),
      searchableContents: removeItemFromPlacementLists(
        state.itemState.searchableContents,
        GYM_ORANGE_BADGE_ID,
      ),
    },
  };

  if (!inventoryHas(next.player.inventory, GYM_ORANGE_BADGE_ID)) {
    next = updateItemLocation(next, GYM_ORANGE_BADGE_ID, "INVENTORY");
    next = addToInventory(next, GYM_ORANGE_BADGE_ID);
    next = triggerScoreOnce(
      next,
      next.world.items.find((item) => item.id === GYM_ORANGE_BADGE_ID)?.scoreId,
    );
  }

  return {
    state: next,
    message:
      "You plant your feet, take hold of the barbell, and lift. The bar rises just enough for you to hook the orange badge out from beneath the body. You grab it, then ease the weight back down before your grip gives out.",
  };
}

export const gymWeightRoomItems: Item[] = [
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
