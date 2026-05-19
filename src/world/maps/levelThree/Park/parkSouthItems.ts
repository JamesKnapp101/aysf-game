import type { Item } from "@game/types/itemTypes";

export const parkSouthItems: Item[] = [
  {
    id: "ParkSouthObeliskView",
    name: "towering white obelisk",
    description:
      "The obelisk stands at the Park's center, white and severe above the grass.",
    sceneryDescription:
      "Across the grass to the north you can see a towering white obelisk at the Park's center.",
    location: "ParkSouth",
    vocab: ["obelisk", "monument", "white", "towering", "center"],
    itemClass: "solid",
    itemCategory: "scenery",
    meta: {
      sceneryDescriptionOrder: 1,
    },
    itemWeight: 500,
    itemSize: 10,
  },
  {
    id: "ParkSouthDistantBuildings",
    name: "distant buildings",
    description:
      "The bar and restaurant are both visible from here, though the details blur with distance.",
    sceneryDescription:
      "To the east you can see the facade of local bar 'The Loosened Tongue' in the distance, and to the west you can see the entrance to a small, quaint-looking restaurant.",
    location: "ParkSouth",
    vocab: [
      "bar",
      "facade",
      "loosened",
      "tongue",
      "restaurant",
      "entrance",
      "buildings",
    ],
    itemClass: "solid",
    itemCategory: "scenery",
    meta: {
      sceneryDescriptionOrder: 2,
    },
    itemWeight: 50,
    itemSize: 8,
  },
  {
    id: "parksouthparkbench",
    name: "park bench",
    description:
      "A wooden park bench faces inward toward the Park's center.",
    sceneryDescription:
      "There is a park bench here, facing inward to the Park's center.",
    location: "ParkSouth",
    vocab: ["bench", "park", "wooden", "seat"],
    itemClass: "solid",
    itemCategory: "scenery",
    meta: {
      sceneryDescriptionOrder: 3,
    },
    itemWeight: 30,
    itemSize: 5,
    isContainer: true,
    isOpenable: false,
    capacity: 2,
    overrides: {
      siton:
        "You sit on the bench for a moment, facing the obelisk and the very still woman beside you.",
    },
  },
  {
    id: "parkwestcorpse",
    name: "small woman's corpse",
    description:
      "The woman is small and still, knees together, hands clasped in her lap, and head bowed down. She shows no obvious external wounds, but there is a fine red speckling clustered at the corners of her eyes and mouth.",
    sceneryDescription:
      "Sitting on the bench, all the way at one end, is the unmoving figure of a small woman, knees together, hands clasped in her lap, and head bowed down.",
    location: "ParkSouth",
    vocab: ["body", "corpse", "woman", "small", "figure"],
    itemClass: "solid",
    itemCategory: "scenery",
    meta: {
      sceneryDescriptionOrder: 4,
    },
    itemWeight: 60,
    itemSize: 7,
    isContagious: true,
  },
  {
    id: "note",
    name: "crumpled paper note",
    description:
      "The paper is creased and soft at the edges, folded small enough to hide in a closed hand.",
    initialDescription:
      "Clutched in the corpse's hand is a crumpled paper note.",
    location: "ParkSouth",
    vocab: ["note", "paper", "crumpled", "piece", "piece of paper"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isReadable: true,
    isContainer: false,
    isLoggable: true,
    readableTitle: "Rendezvous Note",
    readableText: "MEET ME BY THE TREE\n" + "DON'T TELL ANYONE\n" + "- K\n",
  },
];
