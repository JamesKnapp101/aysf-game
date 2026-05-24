import type { DoorDefinition } from "../../game/types/doorTypes";

export const stairwellDoors: DoorDefinition[] = [
  {
    id: "StairDoorTwo",
    name: "stairwell access door",
    descriptionFromA:
      "There is a door to the west with the words 'COMMUNITY/MEDICAL' printed on it and mounted over it is a plastic sign labeled '2'.",
    descriptionFromB: "To the east is a plain metal door labeled 'STAIRS'.",
    kind: "standard",
    vocab: ["door"],
    connects: { roomAId: "StairTwo", roomBId: "LevelTwoStairAccess" },
    directions: { fromA: "west", fromB: "east" },
    initiallyOpen: true,
    initiallyLocked: false,
  },
  {
    id: "StairDoorThree",
    name: "stairwell access door",
    descriptionFromA:
      "There is a door to the west with the words 'COMMUNITY/RECREATIONAL' printed on it and mounted over it is a plastic sign labeled '3'.",
    descriptionFromB: "To the east is a plain metal door labeled 'STAIRS'.",
    kind: "standard",
    vocab: ["door"],
    connects: { roomAId: "StairThree", roomBId: "LevelThreeStairAccess" },
    directions: { fromA: "west", fromB: "east" },
    initiallyOpen: true,
    initiallyLocked: false,
  },
  {
    id: "StairDoorFour",
    name: "stairwell access door",
    descriptionFromA:
      "There is a door to the west with the words 'BIOSPHERE/POWER GRID' printed on it and mounted over it is a plastic sign labeled '4'.",
    descriptionFromB: "To the east is a plain metal door labeled 'STAIRS'.",
    kind: "standard",
    vocab: ["door"],
    connects: { roomAId: "StairFour", roomBId: "LevelFourStairAccess" },
    directions: { fromA: "west", fromB: "east" },
    initiallyOpen: true,
    initiallyLocked: false,
  },
  {
    id: "StairDoorFive",
    name: "stairwell access door",
    descriptionFromA:
      "There is a door to the west with the word 'ENGINEERING' printed on it and mounted over it is a plastic sign labeled '5'.",
    descriptionFromB: "To the west is a plain metal door labeled 'STAIRS'.",
    kind: "standard",
    vocab: ["door"],
    connects: { roomAId: "StairFive", roomBId: "LevelFiveStairAccess" },
    directions: { fromA: "west", fromB: "east" },
    initiallyOpen: true,
    initiallyLocked: false,
  },
  {
    id: "StairDoorSix",
    name: "stairwell access door",
    descriptionFromA:
      "There is a door to the west with the word 'STORAGE' printed on it and mounted over it is a plastic sign labeled '6'.",
    descriptionFromB: "To the east is a plain metal door labeled 'STAIRS'.",
    description: `It's a sturdy-looking door, but doesn't appear to have any sort of lock or security scanner.`,
    kind: "standard",
    vocab: ["door", "stairwell door"],
    connects: { roomAId: "StairSix", roomBId: "LevelSixStairAccess" },
    directions: { fromA: "west", fromB: "east" },
    initiallyOpen: false,
    initiallyLocked: false,
  },
];
