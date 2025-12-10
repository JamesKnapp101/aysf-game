import type { DoorDefinition } from "../types";

export const levelFiveDoors: DoorDefinition[] = [
  {
    id: "ShuttleDoor",
    name: "a security door leading into the shuttle",
    descriptionFromA:
      "To the north is a security door leading into the shuttle. Mounted next to the door is some kind of biometrics reader that appears to take a thumbprint.",
    descriptionFromB: "To the south the door leads back out of the shuttle.",
    kind: "keyed",
    vocab: ["door", "shuttle door", "security door"],
    connects: {
      roomAId: "ShuttleBay",
      roomBId: "InsideShuttle",
    },
    directions: { fromA: "north", fromB: "south" },
    initiallyOpen: false,
    initiallyLocked: true,
  },
  {
    id: "ShuttleCockpitDoor",
    name: "a narrow door leading into the shuttle's cockpit",
    descriptionFromA:
      "To the east is a narrow door leading into the shuttle's cockpit.",
    descriptionFromB: "",
    kind: "keyed",
    vocab: ["door", "cockpit door"],
    connects: {
      roomAId: "InsideShuttle",
      roomBId: "InsideShuttle", // Currently no way in
    },
    directions: { fromA: "east", fromB: "west" },
    initiallyOpen: false,
    initiallyLocked: true,
  },
];
