import { removeItemFromPlacementLists } from "@game/helpers/itemPlacement";
import { updateItemLocation } from "@game/rules/items";
import { removeFromAllBuckets } from "@game/rules/state";
import type { GameState } from "@game/types/gameTypes";
import type { Item } from "@game/types/itemTypes";
import {
  GYM_EXERCISE_BALL_ID,
  GYM_EXERCISE_BALL_RACK_ID,
} from "./gymConstants";

export function moveGymExerciseBallToRoom(
  state: GameState,
  roomId: string,
): GameState {
  let next: GameState = {
    ...state,
    player: {
      ...state.player,
      inventory: removeFromAllBuckets(
        state.player.inventory,
        GYM_EXERCISE_BALL_ID,
      ),
    },
    itemState: {
      ...state.itemState,
      containerContents: removeItemFromPlacementLists(
        state.itemState.containerContents,
        GYM_EXERCISE_BALL_ID,
      ),
      surfaceContents: removeItemFromPlacementLists(
        state.itemState.surfaceContents,
        GYM_EXERCISE_BALL_ID,
      ),
      underContents: removeItemFromPlacementLists(
        state.itemState.underContents,
        GYM_EXERCISE_BALL_ID,
      ),
      searchableContents: removeItemFromPlacementLists(
        state.itemState.searchableContents,
        GYM_EXERCISE_BALL_ID,
      ),
    },
  };

  next = updateItemLocation(next, GYM_EXERCISE_BALL_ID, roomId);

  return next;
}

export function playerHasGymExerciseBall(state: GameState): boolean {
  const inv = state.player.inventory;
  return (
    inv.general.includes(GYM_EXERCISE_BALL_ID) ||
    inv.badges.includes(GYM_EXERCISE_BALL_ID) ||
    inv.keys.includes(GYM_EXERCISE_BALL_ID)
  );
}

export function isGymExerciseBallInRack(state: GameState): boolean {
  return Boolean(
    state.itemState.containerContents[GYM_EXERCISE_BALL_RACK_ID]?.includes(
      GYM_EXERCISE_BALL_ID,
    ),
  );
}

export const gymExerciseBallItems: Item[] = [
  {
    id: GYM_EXERCISE_BALL_RACK_ID,
    name: "wire bin",
    description:
      "The bin is built from thick wire and oversized enough for several exercise balls.",
    describeScenery: (state) => {
      const contents =
        state.itemState.containerContents[GYM_EXERCISE_BALL_RACK_ID] ?? [];
      return contents.length === 0
        ? "At the east end of the gym is a large wire bin for storing exercise balls that is currently empty."
        : "At the east end of the gym is a large wire bin for storing exercise balls.";
    },
    location: "Gym",
    vocab: ["wire", "bin", "wire bin", "ball bin", "exercise ball bin"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 80,
    itemSize: 10,
    isContainer: true,
    isOpenable: false,
    capacity: 20,
    meta: {
      sceneryDescriptionOrder: 6,
    },
  },
  {
    id: GYM_EXERCISE_BALL_ID,
    name: "bright orange exercise ball",
    description:
      "It's a giant rubber exercise ball colored bright orange. The surface feels springy under your hand, almost weirdly so.",
    initialDescription:
      "Near the elliptical machines sits a giant rubber exercise ball colored bright orange.",
    location: "Gym",
    vocab: ["ball", "exercise", "exercise ball", "orange", "rubber"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 6,
    itemSize: 6,
    overrides: {
      bounce: ({ state }: { state: GameState }) => ({
        state: moveGymExerciseBallToRoom(state, state.player.roomId),
        message:
          "You bounce the exercise ball and it rockets away with absurd force, rebounds off the floor, clips a machine, ricochets back across the room, and finally settles down wobbling before rolling to a stop.",
      }),
      siton:
        "You ease yourself onto the exercise ball, wobble for one undignified second, and have to throw a foot down before it dumps you. It is a lot harder than it looks.",
    },
  },
];
