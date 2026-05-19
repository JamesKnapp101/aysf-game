import type { Item } from "@game/types/itemTypes";

export const parkNorthItems: Item[] = [
  {
    id: "ParkNorthObeliskSlope",
    name: "gentle grassy slope",
    description:
      "The grass slopes down toward the Park's central monument.",
    sceneryDescription:
      "To the south, down a gentle slope in the grass, you can see the triumphant obelisk at the Park's center.",
    location: "ParkNorth",
    vocab: ["slope", "grass", "grassy", "obelisk", "monument"],
    itemClass: "solid",
    itemCategory: "scenery",
    meta: {
      sceneryDescriptionOrder: 1,
    },
    itemWeight: 50,
    itemSize: 8,
  },
  {
    id: "ParkNorthDistantBuildings",
    name: "distant buildings",
    description:
      "A gymnasium sits to the east, while a small single-screen theater stands to the west.",
    sceneryDescription:
      "To the east you can see the entrance to a gymnasium, and to the west is a small movie theater with a single screen.",
    location: "ParkNorth",
    vocab: ["gym", "gymnasium", "movie", "theater", "theatre", "buildings"],
    itemClass: "solid",
    itemCategory: "scenery",
    meta: {
      sceneryDescriptionOrder: 2,
    },
    itemWeight: 50,
    itemSize: 8,
  },
  {
    id: "TREE",
    name: "tree",
    description:
      "A healthy-looking tree grows near the path, its branches partly blocking the view west.",
    sceneryDescription:
      "Branches from a nearby tree obscure part of the movie theater marquee.",
    location: "ParkNorth",
    vocab: ["tree", "branches", "branch"],
    itemClass: "solid",
    itemCategory: "scenery",
    meta: {
      sceneryDescriptionOrder: 3,
    },
    itemWeight: 200,
    itemSize: 10,
  },
  {
    id: "DistMarquee2",
    name: "partly obscured marquee",
    description:
      "The tree blocks most of the marquee, leaving only part of the title visible.",
    sceneryDescription:
      "You can only make out part of the marquee from here, which reads 'CHAPTER 542' in block lettering.",
    location: "ParkNorth",
    vocab: ["marquee", "block", "lettering", "chapter", "542"],
    itemClass: "solid",
    itemCategory: "scenery",
    meta: {
      sceneryDescriptionOrder: 4,
    },
    itemWeight: 15,
    itemSize: 5,
    isReadable: true,
    readableText: "CHAPTER 542",
  },
  {
    id: "parknorthparkbench",
    name: "wooden park bench",
    description:
      "A wooden park bench faces south toward the white obelisk.",
    sceneryDescription:
      "There is a wooden park bench here that faces south toward the towering white obelisk at the park's center.",
    location: "ParkNorth",
    vocab: ["bench", "park", "wooden", "seat"],
    itemClass: "solid",
    itemCategory: "scenery",
    meta: {
      sceneryDescriptionOrder: 5,
    },
    itemWeight: 30,
    itemSize: 5,
    isContainer: true,
    isOpenable: false,
    capacity: 2,
  },
];
