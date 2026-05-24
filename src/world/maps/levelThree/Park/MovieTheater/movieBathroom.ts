import { setItemDoses, updateItemLocation } from "@game/rules/items";
import { addToInventory, inventoryHas } from "@game/rules/state";
import type { GameState } from "@game/types/gameTypes";
import type { Item } from "@game/types/itemTypes";

export const MOVIE_THEATER_CHEWABLE_ID = "MovieTheaterSupercontinentChewable";

export function dispenseMovieTheaterChewable(state: GameState): {
  message: string;
  state: GameState;
} {
  if (inventoryHas(state.player.inventory, MOVIE_THEATER_CHEWABLE_ID)) {
    return {
      state,
      message: "You already have one.",
    };
  }

  let next = updateItemLocation(state, MOVIE_THEATER_CHEWABLE_ID, "INVENTORY");
  next = setItemDoses(next, MOVIE_THEATER_CHEWABLE_ID, 1);
  next = addToInventory(next, MOVIE_THEATER_CHEWABLE_ID);

  return {
    state: next,
    message:
      "You turn the crank. The dispenser clacks, thinks about it, then drops a wrapped chewable into your hand.",
  };
}

export const movieBathroomItems: Item[] = [
  {
    id: "ECigar",
    name: "e-cigar",
    description: `It's a thick mahogany cylinder that simulates a papery feel, and sports a gold emblem stamped on a silk cigar band. The end that would normally be lit is fitted with a colored LED ring capped by a fine mesh, while the cigar band end tapers slightly, and has a hole in the center.`,
    initialDescription: "A fat e-cigar rests on the dry counter by the sinks.",
    location: "seeded",
    vocab: ["cigar", "e-cigar", "vape-cigar"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 2,
    itemSize: 3,
    isUseable: true,
    doses: 100,
    meta: {
      consumable: {
        kind: "use",
        perDose: [
          {
            type: "message",
            text: "It's surprisingly satisfying to 'smoke', the lit end flaring up with flame hues and emitting a crackling sound as you draw the thick vapor in. It has a heady aroma that brings to mind leather, coffee, and pepper, and it lingers when you exhale.",
          },
        ],
        onEmpty: [{ type: "message", text: "It's empty." }],
      },
    },
  },
  {
    id: "MovieBathroomStalls",
    name: "bathroom stalls",
    description:
      "There are three enclosed stalls. Two doors hang open, and the one closest to the wall is closed in a way that makes the room feel like it is holding its breath.",
    sceneryDescription:
      "The room is large enough to accommodate three enclosed stalls, each door hanging open except the one closest the wall.",
    location: "MovieTheaterBathroom",
    vocab: ["stall", "stalls", "toilet", "toilets", "doors", "closed door"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 200,
    itemSize: 8,
    meta: {
      sceneryDescriptionOrder: 1,
    },
  },
  {
    id: "MovieBathroomSinks",
    name: "bathroom sinks",
    description:
      "The pair of sinks are clean, dry, and aggressively ordinary. The basins still have that faint institutional shine.",
    sceneryDescription: "A pair of sinks sit directly across from the toilets,",
    location: "MovieTheaterBathroom",
    vocab: ["sink", "sinks", "basin", "basins"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 120,
    itemSize: 5,
    meta: {
      sceneryDescriptionOrder: 2,
    },
  },
  {
    id: "MovieBathroomMirror",
    name: "long mirror",
    description:
      "The mirror runs the length of the wall over the sinks. A warm recessed light shines down from above, making the reflection look almost flattering if you do not ask too much of it.",
    sceneryDescription:
      "and a mirror runs the length of the wall over them, where a warm light shines down from a recessed fixture above.",
    location: "MovieTheaterBathroom",
    vocab: ["mirror", "long mirror", "reflection", "light", "fixture"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 80,
    itemSize: 6,
    isReflective: true,
    meta: {
      sceneryDescriptionOrder: 3,
    },
  },
  {
    id: "MovieBathroomDispenser",
    name: "chewable dispenser",
    description:
      "The metal dispenser is mounted on the wall, fitted with a turn crank, and painted with the logo 'Urine Good Hands'. A little product window shows a wrapper promising salty grape flavor and uninterrupted viewing.",
    sceneryDescription:
      "[[newline]]On one wall is mounted a metal dispenser with a turn crank, painted with the logo 'Urine Good Hands'.",
    location: "MovieTheaterBathroom",
    vocab: [
      "dispenser",
      "chewable dispenser",
      "machine",
      "crank",
      "turn crank",
      "dispenser crank",
      "urine good hands",
      "logo",
    ],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 25,
    itemSize: 3,
    isTurnable: true,
    meta: {
      sceneryDescriptionOrder: 4,
    },
    overrides: {
      turn: ({ state }: { state: GameState }) =>
        dispenseMovieTheaterChewable(state),
    },
  },
  {
    id: MOVIE_THEATER_CHEWABLE_ID,
    name: "salty grape chewable",
    description:
      "It's a small, brick-shaped chewable in a purple wrapper. The label promises zero mid-movie trips to the bathroom.",
    location: "NOWHERE",
    vocab: [
      "chewable",
      "gummy",
      "tablet",
      "brick",
      "grape",
      "salty grape",
      "supercontinent",
    ],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isConsumable: true,
    doses: 0,
    meta: {
      consumable: {
        kind: "drug",
        onEmpty: [{ type: "message", text: "That's the last of it." }],
        perDose: [
          {
            type: "status",
            id: "supercontinent",
            intensity: 100,
            duration: 100,
          },
          {
            type: "message",
            text: "You chew the tablet. It dissolves into a salty grape syrup, and seconds after eating it you feel the unsettling sensation of your bladder and urethra both going on full lock down. You feel like you could sit through a four hour movie!",
          },
        ],
      },
    },
  },
];
