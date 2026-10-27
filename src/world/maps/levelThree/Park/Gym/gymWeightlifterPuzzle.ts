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
import { resolveItemByNoun } from "@game/rules/scope";
import { GYM_LIFTING_MESSAGE, exerciseOnGymMachine } from "./gymWeightMachines";

export function handleGymPinnedWeightCommand(state: GameState, cmd: ParsedCommand) {
  if (state.player.roomId !== GYM_WEIGHT_ROOM_ID || cmd.type !== "action" || !isGymWeightlifterPinningBadge(state)) return undefined;
  const noun = (cmd.direct ?? "").replace(/^(?:the|a|an)\s+/, "");
  const item = resolveItemByNoun(state, noun);
  if (cmd.verb === "pull" && item?.id === GYM_YELLOW_BADGE_ID) return { state, message: "You get a grip on the corner and pull, but you can't get it to move." };
  if (cmd.verb === "pull" && item && ["GymWeightRoomCrushedBody", "GymWeightlifterLanyard"].includes(item.id) && typeof item.overrides?.pull === "string") return { state, message: item.overrides.pull };
  if (["turn", "shut", "switch"].includes(cmd.verb) &&
      (item?.id === "GymPinnedBarbell" || /^(?:off (?:the )?)?(?:smart )?barbell(?: off)?$/.test(noun)) &&
      (cmd.preposition === "off" || noun.startsWith("off ") || noun.endsWith(" off"))) {
    return { state, message: "It's not responding to the controls, I think something damaged it." };
  }
  if (cmd.verb === "roll" && /^(?:the )?(?:weights|(?:smart )?barbell)(?: off (?:the )?(?:body|corpse|man))?$/.test(noun)) {
    return { state, message: "The bar is embedded in about three inches of muscle and rib cage, it's not going anywhere." };
  }
  if (["remove", "take"].includes(cmd.verb) && noun === "plates" &&
      (!cmd.indirect || resolveItemByNoun(state, cmd.indirect)?.id === "GymPinnedBarbell")) {
    return { state, message: "There aren't any plates, it uses an adjustable gravity field to change the weight, which is unfortunately stuck at 4007 kilograms." };
  }
  return undefined;
}

const trappedBodyResponse = (message: string) => ({ state }: { state: GameState }) => ({
  state, message: isGymWeightlifterPinningBadge(state) ? message : "You've already retrieved the badge from beneath him.",
});

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
    isUseable: true,
    name: "weight machines",
    description:
      "The machines are built for serious resistance work, all cable stacks, thick pads, and adjustment levers.",
    sceneryDescription:
      "Various weight machines fill one side of the room, their adjustable seats and cable stacks set at different heights.",
    location: GYM_WEIGHT_ROOM_ID,
    vocab: ["machine", "machines", "weight machines"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 300,
    itemSize: 10,
    meta: {
      sceneryDescriptionOrder: 1,
    },
    overrides: { use: ({ state, cmd }: { state: GameState; cmd?: ParsedCommand }) =>
      cmd?.type === "action" && cmd.indirect ? { state, message: "You can't use the weight machines that way." } : exerciseOnGymMachine(state) },
  },
  {
    id: "GymWeightRoomFreeWeights",
    isUseable: true,
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
    overrides: { use: ({ state }: { state: GameState }) => ({ state, message: GYM_LIFTING_MESSAGE }), lift: GYM_LIFTING_MESSAGE },
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
    isPushable: true,
    name: "crushed body",
    description:
      "The man was heavily muscled and rugged-looking, with copper hair and a barely-there black tank top. A malfunctioning smart barbell stuck at 4007 kilograms has crushed his ribcage flat.",
    sceneryDescription:
      "Lying on the floor is the body of a heavily muscled, rugged-looking copper-haired man in a black tank top, camo shorts, and white sneakers. His lifeless eyes bug out at the ceiling as a malfunctioning smart barbell stuck at 4007 kilograms crushes his ribcage.",
    location: GYM_WEIGHT_ROOM_ID,
    vocab: [
      "body",
      "corpse",
      "man",
      "copper",
      "hair",
      "weightlifter",
      "lifter",
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
      push: trappedBodyResponse("The part you'd need to push looks like it would weigh a ton even if it wasn't pinned under a 4007 kilo barbell."),
      pull: "You grab an arm and give it a heave but nothing moves an inch.",
      lift: trappedBodyResponse("It's pinned under that barbell, you're going to have to find a way to move that first."),
      move: trappedBodyResponse("You'll never move it with that weight pinning it down."),
    },
  },
  {
    id: "GymPinnedBarbell", name: "smart barbell",
    description: "Its display is cracked and appears to be damaged, registering a weight of 4007 kilograms. The bar has embedded itself in the man's broad chest.",
    location: GYM_WEIGHT_ROOM_ID, vocab: ["barbell", "barbel", "smart barbell"],
    itemClass: "solid", itemCategory: "scenery", itemWeight: 4007, itemSize: 10,
    overrides: {
      lift: ({ state }: { state: GameState }) => liftGymWeightlifterBarbell(state),
      move: ({ state }: { state: GameState }) => liftGymWeightlifterBarbell(state),
    },
  },
  {
    id: "GymWeightlifterLanyard", name: "lanyard", description: "The man's lanyard leads down to the trapped yellow badge.",
    location: GYM_WEIGHT_ROOM_ID, vocab: ["lanyard"],
    itemClass: "solid", itemCategory: "scenery", itemWeight: 0, itemSize: 1,
    overrides: { pull: "You pull the lanyard as hard as you can but you can't get it to budge an inch." },
  },
];
