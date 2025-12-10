import type { DoorDefinition } from "../types";

export const levelSixDoors: DoorDefinition[] = [
  {
    id: "InnerDoor",
    name: "inner steel door",
    descriptionFromA:
      "To the south is a a heavy steel door with a large, cumbersome metal handle which seems to seal it shut when closed.",
    descriptionFromB: "To the north is a a heavy steel door.",
    kind: "airlock",
    vocab: ["door", "inner door", "inner steel door", "steel door"],
    connects: {
      roomAId: "LevelSixCorridor",
      roomBId: "LevelSixCorridorBend",
    },
    directions: { fromA: "south", fromB: "north" },
    initiallyOpen: false,
    initiallyLocked: true,
  },
  {
    id: "OuterDoor",
    name: "Outer steel door",
    descriptionFromA:
      "To the south is a a heavy steel door with a large, cumbersome metal handle which seems to seal it shut when closed.",
    descriptionFromB: "To the north is a a heavy steel door.",
    kind: "airlock",
    vocab: ["door", "outer door", "outer steel door", "steel door"],
    connects: {
      roomAId: "LevelSixCorridor",
      roomBId: "StorageQuadOne",
    },
    directions: { fromA: "south", fromB: "north" },
    initiallyOpen: false,
    initiallyLocked: true,
  },
];
