import type { DoorDefinition } from "../../game/types/doorTypes";

const describeMedicalStorageDoorFromCorridor: NonNullable<
  DoorDefinition["describeFromA"]
> = (state) =>
  state.worldState.abomination.storageDoorBroken
    ? "To the south, the medical storage door has been torn off its hinges. Splintered wood and twisted hardware frame the open passage."
    : "To the south is a sturdy wooden door, with a plastic plaque on it that says 'MEDICAL SUPPLY STORAGE' in block letters.";

const describeMedicalStorageDoorFromStorage: NonNullable<
  DoorDefinition["describeFromB"]
> = (state) =>
  state.worldState.abomination.storageDoorBroken
    ? "The ruined remains of the door lie scattered beneath the permanently open passage north."
    : "To the north is a door leading back to Medical.";

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
  {
    id: "MedStorageDoor",
    name: "sturdy wooden door",
    describeFromA: describeMedicalStorageDoorFromCorridor,
    describeFromB: describeMedicalStorageDoorFromStorage,
    beforeClose: (state) =>
      state.worldState.abomination.storageDoorBroken
        ? {
            state,
            message:
              "There is no longer enough door left to close; the passage stays open.",
          }
        : undefined,
    kind: "keyed",
    vocab: ["door", "wooden door", "sturdy door", "storage door"],
    connects: {
      roomAId: "MedicalCorridorThree",
      roomBId: "MedicalStorage",
    },
    directions: { fromA: "south", fromB: "north" },
    initiallyOpen: false,
    initiallyLocked: true,
  },
];
