import type { Item } from "@game/types/itemTypes";
import type { Room } from "@game/types/roomTypes";

export const BOTANICAL_ONE_ROOM_ID = "BotanicalOne";

export const botanicalRooms: Room[] = [
  {
    id: BOTANICAL_ONE_ROOM_ID,
    name: "Botanical Garden",
    description:
      "This area is home to an expansive botanical garden, topped with uniformly cut, bright green grass, [[SCENERY]]",
    exits: [
      { direction: "east", doorId: "HydroponicsDoors" },
      { direction: "north", toRoomId: "Greenhouse" },
      { direction: "west", toRoomId: "FungalCave" },
      { direction: "south", toRoomId: "SeedBank" },
    ],
  },
];

export const botanicalItems: Item[] = [
  {
    id: "BotanicalGrassAndPaths",
    name: "bright grass and stone paths",
    description:
      "The grass is uniformly cut and shockingly green, broken by several stone-paved paths that wander through the garden in measured curves.",
    sceneryDescription: "through which wander several stone paved paths.",
    location: BOTANICAL_ONE_ROOM_ID,
    vocab: ["grass", "paths", "path", "stone paths", "paved paths", "stones"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 0,
    meta: { sceneryDescriptionOrder: 10 },
  },
  {
    id: "BotanicalPlantBeds",
    name: "landscaped plant beds",
    description:
      "The beds are lush and meticulously arranged: trees, shrubs, succulents, herb gardens, and colorful wildflowers packed into careful botanical displays.",
    sceneryDescription:
      "Along the paths grow a huge variety of trees, shrubs, succulents, herb gardens, and colorful wildflowers arranged in beautifully landscaped beds.",
    location: BOTANICAL_ONE_ROOM_ID,
    vocab: [
      "plants",
      "plant",
      "beds",
      "trees",
      "tree",
      "shrubs",
      "shrub",
      "succulents",
      "succulent",
      "herbs",
      "herb",
      "flowers",
      "wildflowers",
      "wildflower",
    ],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 0,
    meta: { sceneryDescriptionOrder: 20 },
  },
  {
    id: "BotanicalPlaques",
    name: "wooden botanical plaques",
    description:
      "Each tall wooden plaque is etched with a plant's botanical name, its common name beneath that, and a few crisp lines of species information.",
    sceneryDescription:
      "In front of each planting stands a tall wooden plaque etched with the plant's botanical name, common name, and species information.",
    location: BOTANICAL_ONE_ROOM_ID,
    vocab: [
      "plaque",
      "plaques",
      "wooden plaque",
      "wooden plaques",
      "names",
      "botanical names",
      "common names",
      "information",
    ],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 0,
    meta: { sceneryDescriptionOrder: 30 },
  },
  {
    id: "BotanicalGreenhouseView",
    name: "distant commercial greenhouse",
    description:
      "Northward, one of the stone paths leads toward a large commercial greenhouse visible beyond the garden beds.",
    sceneryDescription:
      "One stone path winds northward, where a large commercial greenhouse is visible off in the distance.",
    location: BOTANICAL_ONE_ROOM_ID,
    vocab: [
      "greenhouse",
      "commercial greenhouse",
      "north path",
      "northward path",
      "north",
    ],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 0,
    meta: { sceneryDescriptionOrder: 40 },
  },
  {
    id: "BotanicalCaveMouth",
    name: "open cave mouth",
    description:
      "To the west, the polished garden gives way to a rock wall and an open cave mouth where the grass thins out around the stone.",
    sceneryDescription:
      "To the west, the grass tapers off as it meets an open cave mouth in a rock wall.",
    location: BOTANICAL_ONE_ROOM_ID,
    vocab: [
      "cave",
      "cave mouth",
      "open cave",
      "rock",
      "rock wall",
      "wall",
      "west",
    ],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 0,
    meta: { sceneryDescriptionOrder: 50 },
  },
  {
    id: "BotanicalSeedBankStructure",
    name: "secure seed bank structure",
    description:
      "South of the garden, a secure-looking structure faces the path. A single set of double doors leads inside, and a sign over them reads 'SEED BANK' in bold letters.",
    sceneryDescription:
      "Another path heads south to the face of a secure-looking structure with double doors and a bold sign reading 'SEED BANK'.",
    location: BOTANICAL_ONE_ROOM_ID,
    vocab: [
      "seed bank",
      "seedbank",
      "structure",
      "secure structure",
      "doors",
      "double doors",
      "sign",
      "south",
    ],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 0,
    meta: { sceneryDescriptionOrder: 60 },
  },
];
