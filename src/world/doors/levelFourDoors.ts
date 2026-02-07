import type { DoorDefinition } from "../../game/types/doorTypes";

export const levelFourDoors: DoorDefinition[] = [
  {
    id: "ShedCellarDoor",
    name: "a small trap door",
    descriptionFromA:
      "In the middle of the shed floor you see a small trap door.",
    descriptionFromB: "A trap door above leads back into the shed.",
    kind: "keyed",
    vocab: ["door", "hatch", "maintenance hatch"],
    connects: {
      roomAId: "InsideTheShed",
      roomBId: "UnderTheShed",
    },
    directions: { fromA: "down", fromB: "up" },
    initiallyOpen: false,
    initiallyLocked: true,
    keyItemId: "ShedCellarKey",
  },
  {
    id: "ShackCellarDoor",
    name: "a small trap door",
    descriptionFromA:
      "In the middle of the shack floor you see a small trap door.",
    descriptionFromB: "A trap door above leads back into the shack.",
    kind: "keyed",
    vocab: ["door", "hatch", "maintenance hatch"],
    connects: {
      roomAId: "InsideTheShack",
      roomBId: "UnderTheShack",
    },
    directions: { fromA: "down", fromB: "up" },
    initiallyOpen: false,
    initiallyLocked: true,
    keyItemId: "ShackCellarKey",
  },
];
