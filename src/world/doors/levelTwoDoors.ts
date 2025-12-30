import type { DoorDefinition } from "../../game/types/doorTypes";

export const levelTwoDoors: DoorDefinition[] = [
  {
    id: "DOOR2AE",
    name: "scorched door",
    descriptionFromA:
      "To the west is a white metal door, it has been partially scored by some kind of explosion. A label reading '2AE' is mounted on it.",
    descriptionFromB: "To the east is a door exiting the quarters.",
    kind: "standard",
    vocab: ["door", "scorched door", "door 2ae"],
    connects: {
      roomAId: "LevelTwoCorridorOne",
      roomBId: "LevelTwoBurnedQuartersOne",
    },
    directions: { fromA: "west", fromB: "east" },
    initiallyOpen: false,
    initiallyLocked: true,
  },
  {
    id: "MessDoor",
    name: "double doors",
    descriptionFromA:
      "To the west is a set of wide, metal grey doors that look like they've seen a lot of traffic. A sign over it reads 'Mess Hall'",
    descriptionFromB:
      "To the east is a set of doors leading back to the corridor.",
    kind: "standard",
    vocab: ["door", "mess door", "mess hall door"],
    connects: {
      roomAId: "LevelTwoSecondaryCorridorTwo",
      roomBId: "MessHall",
    },
    directions: { fromA: "west", fromB: "east" },
    initiallyOpen: false,
    initiallyLocked: false,
  },
];
