import type { DoorDefinition } from "../types";

export const badgeScannerDoors: DoorDefinition[] = [
  // BRIDGE
  {
    id: "BridgeDoors",
    name: "a security door",
    descriptionFromA:
      "To the north is a security door, mounted next to which is a badge scanner of some kind with a blue strip across the top. A sign over the door reads 'Lab'.",
    descriptionFromB:
      "To the south is a security door leading back to the corridor.",
    kind: "badgeScanner",
    vocab: ["doors", "bridge doors", "security doors", "door"],
    connects: {
      roomAId: "LevelOneCorridorOne",
      roomBId: "Bridge",
    },
    directions: { fromA: "north", fromB: "south" },
    initiallyOpen: false,
    initiallyLocked: true,
    badgeItemId: "greybadge",
  },
  {
    id: "BridgeStairDoors",
    name: "bridge access door",
    descriptionFromA:
      "To the west is a door which is different from those on the other floors; this door has no handle, and mounted on the wall next to it is some kind of badge scanner with a grey strip across the top. Printed on the door are the words 'MAIN BRIDGE'.",
    descriptionFromB:
      "There is a door to the east over which is mounted a plastic sign reading 'STAIRS'.",
    kind: "badgeScanner",
    vocab: ["door"],
    connects: { roomAId: "StairOne", roomBId: "LevelOneStairAccess" },
    directions: { fromA: "east", fromB: "west" },
    initiallyOpen: false,
    initiallyLocked: true,
    badgeItemId: "greybadge",
    checkBadgeOnDir: "west",
  },
  // MEDICAL LAB
  {
    id: "LabDoors",
    name: "a security door",
    descriptionFromA:
      "To the west is a security door, mounted next to which is a badge scanner of some kind with a blue strip across the top. A sign over the door reads 'Lab'.",
    descriptionFromB: "To the east is a security door leading back to Medical.",
    kind: "badgeScanner",
    vocab: ["door", "lab door", "security door"],
    connects: {
      roomAId: "MedicalCorridorOne",
      roomBId: "Lab",
    },
    directions: { fromA: "west", fromB: "east" },
    initiallyOpen: false,
    initiallyLocked: true,
    badgeItemId: "bluebadge",
    checkBadgeOnDir: "west",
  },
  // POWER GRID
  {
    id: "PowerGridDoors",
    name: "a security door",
    descriptionFromA:
      "To the south is a security door, mounted next to which is a badge scanner of some kind with a yellow strip across the top. A sign over the door reads 'MAIN POWER GRID'.",
    descriptionFromB:
      "To the north is a security door leading back to the corridor.",
    kind: "badgeScanner",
    vocab: ["door", "power doors", "security door", "power grid door"],
    connects: {
      roomAId: "LevelFourCorridorTwo",
      roomBId: "PowerGrid",
    },
    directions: { fromA: "south", fromB: "north" },
    initiallyOpen: false,
    initiallyLocked: true,
    badgeItemId: "yellowbadge",
    checkBadgeOnDir: "south",
  },
  // HYDROPONICS
  {
    id: "HydroponicsDoors",
    name: "a security door",
    descriptionFromA:
      "To the west is a security door, mounted next to which is a badge scanner of some kind with a green strip across the top. A sign over the door reads 'BOTANITCAL'.",
    descriptionFromB:
      "To the east is a security door leading back to the corridor.",
    kind: "badgeScanner",
    vocab: ["door", "security door", "botanical door"],
    connects: {
      roomAId: "LevelFourCorridorOne",
      roomBId: "HydroponicsOne",
    },
    directions: { fromA: "west", fromB: "east" },
    initiallyOpen: false,
    initiallyLocked: true,
    badgeItemId: "greenbadge",
    checkBadgeOnDir: "west",
  },
  // CRYO
  {
    id: "CryoStairDoors",
    name: "cryo access door",
    descriptionFromA:
      "There is a door to the west with the word 'CRYONICS' printed on it and mounted over it is a plastic sign labeled '7'.",
    descriptionFromB:
      "There is a door to the east over which is mounted a plastic sign reading 'STAIRS'.",
    kind: "badgeScanner",
    vocab: ["door"],
    connects: { roomAId: "StairSeven", roomBId: "LevelSevenStairAccess" },
    directions: { fromA: "east", fromB: "west" },
    initiallyOpen: true,
    initiallyLocked: false,
    badgeItemId: "whitebadge",
    checkBadgeOnDir: "west",
  },
];
