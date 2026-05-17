import type { GameState } from "@game/types/gameTypes";
import type { Item } from "@game/types/itemTypes";
import { dispenseSnapOutChewable } from "./barSnapOut";

export const barBathroomItems: Item[] = [
  {
    id: "BarBathroomWalls",
    name: "scribbled black walls",
    description:
      "The walls are painted black and covered in scribbles and overlapping old fliers, a dense archive of boredom and bad handwriting.",
    sceneryDescription:
      "The space is small, painted black, and covered in scribbles and overlapping old fliers.",
    location: "BarBathroom",
    vocab: ["walls", "black walls", "scribbles", "fliers", "flyers"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 400,
    itemSize: 10,
    meta: {
      sceneryDescriptionOrder: 1,
    },
  },
  {
    id: "BarBathroomSink",
    name: "porcelain bar sink",
    description:
      "The porcelain sink has seen heavy use but still looks functional enough.",
    sceneryDescription: "There's a porcelain sink in front of a wide mirror,",
    location: "BarBathroom",
    vocab: ["sink", "porcelain", "porcelain sink"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 80,
    itemSize: 5,
    meta: {
      sceneryDescriptionOrder: 2,
    },
    isContainer: true,
  },
  {
    id: "BarBathroomMirror",
    name: "wide mirror",
    description:
      "The mirror could use a good cleaning, but it still reflects well enough to be honest with you.",
    sceneryDescription: "which could use a good cleaning.",
    location: "BarBathroom",
    vocab: ["mirror", "wide mirror", "reflection", "reflective"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 50,
    itemSize: 5,
    isReflective: true,
    meta: {
      sceneryDescriptionOrder: 3,
    },
  },
  {
    id: "BarBathroomToiletUrinal",
    name: "toilet and urinal",
    description:
      "There is no stall. The urinal's plastic net cradles a partially dissolved urinal cake with grim professional dedication.",
    sceneryDescription:
      "Across from that is a toilet with no stall, right next to a wall mounted urinal, in the bottom of which a plastic net cradles a partially dissolved urinal cake.",
    location: "BarBathroom",
    vocab: [
      "toilet",
      "urinal",
      "wall mounted urinal",
      "net",
      "urinal cake",
      "cake",
      "stall",
    ],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 120,
    itemSize: 6,
    meta: {
      sceneryDescriptionOrder: 4,
    },
  },
  {
    id: "BarBathroomDispenser",
    name: "dispensing machine",
    description:
      "The little dispenser has a silver turn crank and a metal flap beneath it. Its breezy logo reads 'Snap out of It!' and promises to get you seeing clear again.",
    sceneryDescription:
      "[[newline]]Mounted on the wall next to the sink is a little dispensing machine with a silver turn crank and a metal flap beneath it. The dispenser is painted with a breezy logo that reads 'Snap out of It!'.",
    location: "BarBathroom",
    vocab: [
      "dispenser",
      "dispensing machine",
      "machine",
      "crank",
      "turn crank",
      "dispenser crank",
      "flap",
      "snap out of it",
    ],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 25,
    itemSize: 3,
    isTurnable: true,
    meta: {
      sceneryDescriptionOrder: 5,
    },
    overrides: {
      turn: ({ state }: { state: GameState }) => dispenseSnapOutChewable(state),
    },
  },
];
