import type { DoorDefinition } from "../types";

export const levelFourDoors: DoorDefinition[] = [
  {
    id: "CellarDoor",
    name: "a small trap door",
    descriptionFromA:
      "In the grass nearby you can see a circular hatch of some kind.",
    descriptionFromB: "A hatch above leads back outside.",
    kind: "keyed",
    vocab: ["door", "hatch", "maintenance hatch"],
    connects: {
      roomAId: "HydroponicsOne",
      roomBId: "HydroponicsCellar",
    },
    directions: { fromA: "down", fromB: "up" },
    initiallyOpen: false,
    initiallyLocked: true,
  },
];
