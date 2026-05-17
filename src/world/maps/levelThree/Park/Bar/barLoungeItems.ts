import type { Item } from "@game/types/itemTypes";
import { BAR_JUKEBOX_ITEM_ID } from "./barJukebox";

export const barLoungeItems: Item[] = [
  {
    id: "BarLoungeCabaretStage",
    name: "cabaret seating and stage",
    description:
      "The lounge has cabaret seating around a small stage against the western wall, suitable for karaoke, live music, or open mike nights.",
    sceneryDescription:
      "Cabaret seating is arranged around a small stage against the western wall, suitable for karaoke, live music, or open mike nights.",
    location: "BarLounge",
    vocab: [
      "cabaret",
      "seating",
      "stage",
      "small stage",
      "karaoke",
      "music",
      "open mike",
      "open mic",
    ],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 300,
    itemSize: 10,
    meta: {
      sceneryDescriptionOrder: 1,
    },
  },
  {
    id: BAR_JUKEBOX_ITEM_ID,
    name: "colorful jukebox",
    description:
      "The jukebox is a big tombstone-shaped affair, banded in colorful neon with a front-facing song selector covered in square white buttons. Its printed track index is warped, scorched, and unreadable.",
    sceneryDescription:
      "A colorful jukebox sits across from the seating area, a big tombstone-shaped affair covered in bands of neon and a front-facing song selector with square white buttons.",
    location: "BarLounge",
    vocab: [
      "jukebox",
      "colorful jukebox",
      "neon",
      "song selector",
      "buttons",
      "white buttons",
    ],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 150,
    itemSize: 7,
    meta: {
      kind: "bar-jukebox",
      sceneryDescriptionOrder: 2,
    },
  },
  {
    id: "BarLoungePoolTables",
    name: "pool tables",
    description:
      "The pair of pool tables are cleared of balls at the moment. Stained-glass billiard pendant lights hang above them.",
    sceneryDescription:
      "Opposite the stage and seating are a pair of pool tables underneath billiard pendant lights with stained glass shades, each cleared of balls at the moment.",
    location: "BarLounge",
    vocab: [
      "pool",
      "pool tables",
      "tables",
      "billiard",
      "lights",
      "pendant lights",
      "stained glass",
      "balls",
    ],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 500,
    itemSize: 12,
    meta: {
      sceneryDescriptionOrder: 3,
    },
  },
  {
    id: "BarLoungeRecentEvidence",
    name: "signs of recent company",
    description:
      "Chairs sit at slightly wrong angles, and a few tables have the kind of small abandoned clutter that says people were here not long ago.",
    sceneryDescription:
      "There's evidence that people were here not that long ago, but it is eerily quiet now.",
    location: "BarLounge",
    vocab: ["evidence", "quiet", "clutter", "company", "chairs"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 20,
    itemSize: 6,
    meta: {
      sceneryDescriptionOrder: 4,
    },
  },
];
