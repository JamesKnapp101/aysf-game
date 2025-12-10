import type { DoorDefinition } from "../types";

export const levelThreeLivingQuartersDoors: DoorDefinition[] = [
  // LQ 3A
  {
    id: "DOOR3AE",
    name: "living quarters door 3AE",
    descriptionFromA:
      "To the east is a door affixed with a neat black plastic label indicating '3AE'. A strip of yellow and black tape has been stretched across the eastern door.",
    descriptionFromB: "To the west is the unit's front door.",
    kind: "standard",
    vocab: ["east door", "door 3ae"],
    connects: {
      roomAId: "LevelThreeCorridorOne",
      roomBId: "LivingQuartersOneEast",
    },
    directions: { fromA: "east", fromB: "west" },
    initiallyOpen: false,
    initiallyLocked: false,
  },
  {
    id: "DOOR3AW",
    name: "living quarters door 3AW",
    descriptionFromA:
      "To the west is a door affixed with a neat black plastic label indicating '3AW'. A strip of yellow and black tape has been stretched across the western door.",
    kind: "standard",
    vocab: ["west door", "door 3aw"],
    connects: {
      roomAId: "LevelThreeCorridorOne",
      roomBId: "LevelThreeCorridorOne",
    },
    directions: { fromA: "west", fromB: "east" },
    initiallyOpen: false,
    initiallyLocked: true,
  },
  {
    id: "OneEastBDoor",
    name: "bathroom door",
    descriptionFromA: "To the south is a wooden door.",
    descriptionFromB: "The bathroom door is to the north.",
    kind: "standard",
    vocab: ["bathroom door", "door 3ae"],
    connects: {
      roomAId: "LivingQuartersOneEast",
      roomBId: "OneEastBath",
    },
    directions: { fromA: "south", fromB: "north" },
    initiallyOpen: false,
    initiallyLocked: false,
  },
  // LQ 3B
  {
    id: "DOOR3BE",
    name: "living quarters door 3BE",
    descriptionFromA:
      "To the east is a door affixed with a neat black plastic label indicating '3BE'. A strip of yellow and black tape has been stretched across the eastern door.",
    descriptionFromB: "To the west is the unit's front door.",
    kind: "standard",
    vocab: ["east door", "door 3be"],
    connects: {
      roomAId: "LevelThreeCorridorTwo",
      roomBId: "LivingQuartersTwoEast",
    },
    directions: { fromA: "east", fromB: "west" },
    initiallyOpen: false,
    initiallyLocked: false,
  },
  {
    id: "DOOR3BW",
    name: "living quarters door 3AW",
    descriptionFromA:
      "To the west is a door affixed with a neat black plastic label indicating '3BW'. A strip of yellow and black tape has been stretched across the western door.",
    kind: "standard",
    vocab: ["west door", "door 3bw"],
    connects: {
      roomAId: "LevelThreeCorridorTwo",
      roomBId: "LivingQuartersTwoWest",
    },
    directions: { fromA: "west", fromB: "east" },
    initiallyOpen: false,
    initiallyLocked: false,
  },
  {
    id: "TwoEastBDoor",
    name: "bathroom door",
    descriptionFromA: "To the south is a wooden door.",
    descriptionFromB: "The bathroom door is to the north.",
    kind: "standard",
    vocab: ["bathroom door"],
    connects: {
      roomAId: "LivingQuartersTwoEast",
      roomBId: "TwoEastBath",
    },
    directions: { fromA: "south", fromB: "north" },
    initiallyOpen: false,
    initiallyLocked: false,
  },
  {
    id: "TwoWestBDoor",
    name: "bathroom door",
    descriptionFromA: "To the south is a wooden door.",
    descriptionFromB: "The bathroom door is to the north.",
    kind: "standard",
    vocab: ["bathroom door"],
    connects: {
      roomAId: "LivingQuartersTwoWest",
      roomBId: "TwoWestBath",
    },
    directions: { fromA: "south", fromB: "north" },
    initiallyOpen: false,
    initiallyLocked: false,
  },
  // LQ 3C
  {
    id: "DOOR3CE",
    name: "living quarters door 3CE",
    descriptionFromA:
      "To the east is a door affixed with a neat black plastic label indicating '3CE'. A strip of yellow and black tape has been stretched across the eastern door.",
    descriptionFromB: "To the west is the unit's front door.",
    kind: "standard",
    vocab: ["east door", "door 3ce"],
    connects: {
      roomAId: "LevelThreeCorridorThree",
      roomBId: "LevelThreeCorridorThree",
    },
    directions: { fromA: "east", fromB: "west" },
    initiallyOpen: false,
    initiallyLocked: true,
  },
  {
    id: "DOOR3CW",
    name: "living quarters door 3CW",
    descriptionFromA:
      "To the west is a door affixed with a neat black plastic label indicating '3CW'. A strip of yellow and black tape has been stretched across the western door.",
    kind: "standard",
    vocab: ["west door", "door 3cw"],
    connects: {
      roomAId: "LevelThreeCorridorThree",
      roomBId: "LevelThreeCorridorThree",
    },
    directions: { fromA: "west", fromB: "east" },
    initiallyOpen: false,
    initiallyLocked: true,
  },
  // LQ 3D
  {
    id: "DOOR3DE",
    name: "living quarters door 3DE",
    descriptionFromA:
      "To the east is a door affixed with a neat black plastic label indicating '3CE'. A strip of yellow and black tape has been stretched across the eastern door.",
    descriptionFromB: "To the west is the unit's front door.",
    kind: "standard",
    vocab: ["east door", "door 3de"],
    connects: {
      roomAId: "LevelThreeCorridorFour",
      roomBId: "LivingQuartersFourEast",
    },
    directions: { fromA: "east", fromB: "west" },
    initiallyOpen: false,
    initiallyLocked: true,
  },
  {
    id: "FourEastBDoor",
    name: "bathroom door",
    descriptionFromA: "To the south is a wooden door.",
    descriptionFromB: "The bathroom door is to the north.",
    kind: "standard",
    vocab: ["bathroom door"],
    connects: {
      roomAId: "LivingQuartersFourEast",
      roomBId: "FourEastBath",
    },
    directions: { fromA: "south", fromB: "north" },
    initiallyOpen: false,
    initiallyLocked: false,
  },
  // LQ 3E
  {
    id: "DOOR3EE",
    name: "living quarters door 3CE",
    descriptionFromA:
      "To the east is a door affixed with a neat black plastic label indicating '3EE'. A strip of yellow and black tape has been stretched across the eastern door.",
    descriptionFromB: "To the west is the unit's front door.",
    kind: "standard",
    vocab: ["east door", "door 3ee"],
    connects: {
      roomAId: "LevelThreeCorridorFive",
      roomBId: "LivingQuartersFiveEast",
    },
    directions: { fromA: "east", fromB: "west" },
    initiallyOpen: false,
    initiallyLocked: false,
  },
  {
    id: "DOOR3EW",
    name: "living quarters door 3EW",
    descriptionFromA:
      "To the west is a door affixed with a neat black plastic label indicating '3EW'. A strip of yellow and black tape has been stretched across the western door.",
    kind: "standard",
    vocab: ["west door", "door 3ew"],
    connects: {
      roomAId: "LevelThreeCorridorFive",
      roomBId: "LevelThreeCorridorFive",
    },
    directions: { fromA: "west", fromB: "east" },
    initiallyOpen: false,
    initiallyLocked: true,
  },
  {
    id: "FiveEastBDoor",
    name: "bathroom door",
    descriptionFromA: "To the south is a wooden door.",
    descriptionFromB: "The bathroom door is to the north.",
    kind: "standard",
    vocab: ["bathroom door"],
    connects: {
      roomAId: "LivingQuartersFiveEast",
      roomBId: "FiveEastBath",
    },
    directions: { fromA: "south", fromB: "north" },
    initiallyOpen: false,
    initiallyLocked: false,
  },
  // LQ 3F
  {
    id: "DOOR3FE",
    name: "living quarters door 3FE",
    descriptionFromA:
      "To the east is a door affixed with a neat black plastic label indicating '3FE'. A strip of yellow and black tape has been stretched across the eastern door.",
    descriptionFromB: "To the west is the unit's front door.",
    kind: "standard",
    vocab: ["east door", "door 3fe"],
    connects: {
      roomAId: "LevelThreeCorridorSix",
      roomBId: "LevelThreeCorridorSix",
    },
    directions: { fromA: "east", fromB: "west" },
    initiallyOpen: false,
    initiallyLocked: true,
  },
  {
    id: "SixWestBDoor",
    name: "bathroom door",
    descriptionFromA: "To the south is a wooden door.",
    descriptionFromB: "The bathroom door is to the north.",
    kind: "standard",
    vocab: ["bathroom door"],
    connects: {
      roomAId: "LivingQuartersSixWest",
      roomBId: "SixWestBath",
    },
    directions: { fromA: "south", fromB: "north" },
    initiallyOpen: true,
    initiallyLocked: false,
  },
  {
    id: "DOOR3FW",
    name: "living quarters door 3FW",
    descriptionFromA:
      "To the west is a door affixed with a neat black plastic label indicating '3FW'. A strip of yellow and black tape has been stretched across the western door.",
    kind: "standard",
    vocab: ["west door", "door 3fw"],
    connects: {
      roomAId: "LevelThreeCorridorSix",
      roomBId: "LevelThreeCorridorSix",
    },
    directions: { fromA: "west", fromB: "east" },
    initiallyOpen: false,
    initiallyLocked: true,
  },
  // LQ 3G
  {
    id: "DOOR3FE",
    name: "living quarters door 3GW",
    descriptionFromA:
      "To the west is a door affixed with a neat black plastic label indicating '3GW'. A strip of yellow and black tape has been stretched across the western door.",
    descriptionFromB: "To the east is the unit's front door.",
    kind: "standard",
    vocab: ["east door", "door 3fe"],
    connects: {
      roomAId: "LevelThreeCorridorSeven",
      roomBId: "LivingQuartersSevenWest",
    },
    directions: { fromA: "east", fromB: "west" },
    initiallyOpen: false,
    initiallyLocked: true,
  },
  {
    id: "SevenWestBDoor",
    name: "bathroom door",
    descriptionFromA: "To the south is a wooden door.",
    descriptionFromB: "The bathroom door is to the north.",
    kind: "standard",
    vocab: ["bathroom door"],
    connects: {
      roomAId: "LivingQuartersSevenWest",
      roomBId: "SevenWestBath",
    },
    directions: { fromA: "south", fromB: "north" },
    initiallyOpen: true,
    initiallyLocked: false,
  },
];

export const levelThreeHubDoors: DoorDefinition[] = [
  // THE HUB
  {
    id: "HubDoor",
    name: "engraved wooden door",
    descriptionFromA:
      "To the west is a large, heavy-looking wooden door, engraved with a leaf and floral pattern.",
    descriptionFromB:
      "To the east is a large, heavy wooden door that exits The Hub.",
    kind: "keyed",
    vocab: ["wooden door", "engraved door", "engraved wooden door"],
    connects: {
      roomAId: "LevelThreeSecondCorridorTwo",
      roomBId: "HubEast",
    },
    directions: { fromA: "west", fromB: "east" },
    initiallyOpen: true,
    initiallyLocked: false,
  },
];

export const levelThreeMedicalAndSpaDoors: DoorDefinition[] = [
  // Second Corridor
  {
    id: "LevelThreeSecondCorrThreeDoor",
    name: "aluminum and glass door",
    descriptionFromA:
      "To the west is a large glass door with an aluminum frame.",
    descriptionFromB:
      "To the east is a large glass door with an aluminum frame.",
    kind: "keyed",
    vocab: ["door", "aluminum door", "glass door", "aluminum and glass door"],
    connects: {
      roomAId: "LevelThreeSecondCorridorThree",
      roomBId: "Spa",
    },
    directions: { fromA: "west", fromB: "east" },
    initiallyOpen: false,
    initiallyLocked: false,
  },
  // SPA
  {
    id: "CedarDoor",
    name: "cedar door",
    descriptionFromA:
      "To the north is a door made of cedar, with a simple handle, also made of cedar.",
    descriptionFromB: "The sauna's exit is to the south.",
    kind: "standard",
    vocab: ["cedar door", "sauna door"],
    connects: {
      roomAId: "Spa",
      roomBId: "Sauna",
    },
    directions: { fromA: "north", fromB: "south" },
    initiallyOpen: false,
    initiallyLocked: false,
  },
  {
    id: "SteamRoomDoor",
    name: "heavy glass door",
    descriptionFromA:
      "To the south is a heavy glass door that looks into a tiled steam room.",
    descriptionFromB:
      "To the north, a heavy glass door looks out into the main Spa.",
    kind: "standard",
    vocab: ["glass door", "heavy glass door", "steam door", "steam room door"],
    connects: {
      roomAId: "Spa",
      roomBId: "SteamRoom",
    },
    directions: { fromA: "south", fromB: "north" },
    initiallyOpen: false,
    initiallyLocked: false,
  },
  {
    id: "MassageDoor",
    name: "varnished wooden door",
    descriptionFromA:
      "To the west is a varnished wooden door with a little sign on it reading 'Massage'.",
    descriptionFromB:
      "To the east is a varnished wooden door leading back to the Spa.",
    kind: "standard",
    vocab: [
      "wooden door",
      "varnished door",
      "varnished wooden door",
      "massage door",
    ],
    connects: {
      roomAId: "Spa",
      roomBId: "Massage",
    },
    directions: { fromA: "west", fromB: "east" },
    initiallyOpen: false,
    initiallyLocked: false,
  },
  // Medical
  {
    id: "MainMedicalDoor",
    name: "a security door",
    descriptionFromA:
      "To the south is an open entryway, a sign over which reads 'Main Medical'.",
    descriptionFromB:
      "To the north is an open doorway leading back to the Medical Entrance.",
    kind: "keyed",
    vocab: ["doorway", "entryway"],
    connects: {
      roomAId: "MedicalEntrance",
      roomBId: "MainMedical",
    },
    directions: { fromA: "south", fromB: "north" },
    initiallyOpen: true,
    initiallyLocked: false,
  },
  {
    id: "MedStorageDoor",
    name: "a sturdy-looking wooden door",
    descriptionFromA:
      "To the south is a sturdy wooden door, with a plastic plaque on it that says 'MEDICAL SUPPLY STORAGE' in block letters.",
    descriptionFromB: "To the north is a door leading back to Medical.",
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
