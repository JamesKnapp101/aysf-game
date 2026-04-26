import type { DoorDefinition } from "../../game/types/doorTypes";

export const levelThreeLivingQuartersDoors: DoorDefinition[] = [
  // CUBBY 'DOOR'
  {
    id: "CubbySqueeze",
    name: "Narrow opening",
    descriptionFromA: "",
    descriptionFromB: "You can't physically reach the Cubby.",
    kind: "blocked",
    vocab: ["narrow opening"],
    connects: {
      roomAId: "LevelThreeCorridorSeven",
      roomBId: "LevelThreeCubby",
    },
    directions: { fromA: "north", fromB: "south" },
    initiallyOpen: false,
    initiallyLocked: true,
    blockMsg:
      "There's no way you'll be able to squeeze through that tiny opening.",
  },
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
      roomAId: "LivingQuartersOneWest",
      roomBId: "LevelThreeCorridorOne",
    },
    directions: { fromA: "west", fromB: "east" },
    initiallyOpen: false,
    initiallyLocked: false,
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
  {
    id: "OneWestBDoor",
    name: "bathroom door",
    descriptionFromA: "To the south is a wooden door.",
    descriptionFromB: "The bathroom door is to the north.",
    kind: "standard",
    vocab: ["bathroom door", "door 3ae"],
    connects: {
      roomAId: "LivingQuartersOneWest",
      roomBId: "OneWestBath",
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
    descriptionFromA: "To the east is a wooden door.",
    descriptionFromB: "The bathroom door is to the west.",
    kind: "standard",
    vocab: ["bathroom door"],
    connects: {
      roomAId: "TwoWestBath",
      roomBId: "TwoWestBed",
    },
    directions: { fromA: "east", fromB: "west" },
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
      roomBId: "LivingQuartersThreeEast",
    },
    directions: { fromA: "east", fromB: "west" },
    initiallyOpen: false,
    initiallyLocked: false,
  },
  {
    id: "DOOR3CW",
    name: "living quarters door 3CW",
    descriptionFromA:
      "To the west is a door affixed with a neat black plastic label indicating '3CW'. A strip of yellow and black tape has been stretched across the western door.",
    descriptionFromB: "To the east is the unit's front door.",
    kind: "standard",
    vocab: ["west door", "door 3cw"],
    connects: {
      roomAId: "LevelThreeCorridorThree",
      roomBId: "LivingQuartersThreeWest",
    },
    directions: { fromA: "west", fromB: "east" },
    initiallyOpen: false,
    initiallyLocked: false,
  },
  {
    id: "ThreeWestBDoor",
    name: "bathroom door",
    descriptionFromA: "To the south is a wooden door.",
    descriptionFromB: "The bathroom door is to the north.",
    kind: "standard",
    vocab: ["bathroom door"],
    connects: {
      roomAId: "LivingQuartersThreeWest",
      roomBId: "ThreeWestBath",
    },
    directions: { fromA: "south", fromB: "north" },
    initiallyOpen: false,
    initiallyLocked: false,
  },
  {
    id: "ThreeEastBDoor",
    name: "bathroom door",
    descriptionFromA: "To the south is a wooden door.",
    descriptionFromB: "The bathroom door is to the north.",
    kind: "standard",
    vocab: ["bathroom door"],
    connects: {
      roomAId: "LivingQuartersThreeEast",
      roomBId: "ThreeEastBath",
    },
    directions: { fromA: "south", fromB: "north" },
    initiallyOpen: false,
    initiallyLocked: false,
  },
  // LQ 3D
  {
    id: "WarehouseDoor",
    name: "warehouse door",
    descriptionFromA:
      "To the east is a door affixed with a neat black plastic label that reads 'Warehouse.'",
    descriptionFromB: "To the west is a door that leads back to the corridor.",
    kind: "standard",
    vocab: ["east door", "warehouse door", "door"],
    connects: {
      roomAId: "LevelThreeCorridorFour",
      roomBId: "L3Warehouse",
    },
    directions: { fromA: "east", fromB: "west" },
    initiallyOpen: false,
    initiallyLocked: false,
  },
  {
    id: "FourEastBDoor",
    name: "bathroom door",
    descriptionFromA: "To the north is a wooden door.",
    descriptionFromB: "The bathroom door is to the south.",
    kind: "standard",
    vocab: ["bathroom door"],
    connects: {
      roomAId: "FourEastBath",
      roomBId: "LivingQuartersFourEast",
    },
    directions: { fromA: "north", fromB: "south" },
    initiallyOpen: false,
    initiallyLocked: false,
  },
  // LQ 3E
  {
    id: "DOOR3EE",
    name: "living quarters door 3CE",
    descriptionFromA:
      "To the east is a door affixed with a neat black plastic label indicating '3EE'. A strip of yellow and black tape has been stretched across the eastern door.",
    descriptionFromB:
      "To the west, a heavier looking door seems to be the unit's exit. ",
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
    id: "BoulosResidenceDoor",
    name: "living quarters door 3EW",
    descriptionFromA:
      "To the west is a door affixed with a wooden placard that reads 'Boulos Residence.'",
    descriptionFromB: `To the east is the unit's front door.`,
    kind: "standard",
    vocab: ["west door", "door 3ew"],
    connects: {
      roomAId: "LevelThreeCorridorFive",
      roomBId: "LivingQuartersFiveWest",
    },
    directions: { fromA: "west", fromB: "east" },
    initiallyOpen: false,
    initiallyLocked: false,
  },
  {
    id: "FiveEastBDoor",
    name: "bathroom door",
    descriptionFromA:
      "To the north is a wooden door, slightly ajar, that leads to a bathroom.",
    descriptionFromB: "The bathroom door is to the south.",
    kind: "standard",
    vocab: ["bathroom door"],
    connects: {
      roomAId: "LivingQuartersFiveEast",
      roomBId: "FiveEastBath",
    },
    directions: { fromA: "north", fromB: "south" },
    initiallyOpen: false,
    initiallyLocked: false,
  },
  {
    id: "FiveWestBDoor",
    name: "bathroom door",
    descriptionFromA: "To the north is a wooden door.",
    descriptionFromB: "The bathroom door is to the south.",
    kind: "standard",
    vocab: ["bathroom door"],
    connects: {
      roomAId: "LivingQuartersFiveWest",
      roomBId: "FiveWestBath",
    },
    directions: { fromA: "north", fromB: "south" },
    initiallyOpen: false,
    initiallyLocked: false,
  },
  // LQ 3F
  {
    id: "OncheResidenceDoor",
    name: "living quarters door 3FE",
    descriptionFromA:
      "To the east is a door affixed with an engraved sign that reads 'Onche Residence.'",
    descriptionFromB: "To the west is the unit's front door.",
    kind: "standard",
    vocab: ["east door", "door", "apartment", "onche"],
    connects: {
      roomAId: "LevelThreeCorridorSix",
      roomBId: "LivingQuartersSixEast",
    },
    directions: { fromA: "east", fromB: "west" },
    initiallyOpen: false,
    initiallyLocked: false,
  },
  {
    id: "SixEastBDoor",
    name: "bathroom door",
    descriptionFromA: "To the south is a wooden door.",
    descriptionFromB: "The bathroom door is to the north.",
    kind: "standard",
    vocab: ["bathroom door"],
    connects: {
      roomAId: "LivingQuartersSixEast",
      roomBId: "SixEastBath",
    },
    directions: { fromA: "south", fromB: "north" },
    initiallyOpen: true,
    initiallyLocked: false,
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

export const levelThreeParkDoors: DoorDefinition[] = [
  // THE HUB
  {
    id: "ParkDoor",
    name: "engraved wooden door",
    descriptionFromA:
      "To the west is a large, heavy-looking wooden door, engraved with a leaf and floral pattern.",
    descriptionFromB:
      "To the east is a large, heavy wooden door that exits The Park.",
    kind: "keyed",
    vocab: ["wooden door", "engraved door", "engraved wooden door"],
    connects: {
      roomAId: "ParkEntrance",
      roomBId: "ParkEast",
    },
    directions: { fromA: "west", fromB: "east" },
    initiallyOpen: true,
    initiallyLocked: false,
  },
  {
    id: "WalkInDoor",
    name: "walk-in door",
    descriptionFromA:
      "To the west is a large, heavy-looking door of polished steel, with a pull handle.",
    descriptionFromB:
      "To the east is the freezer door, covered with a thin layer of frost.",
    kind: "keyed",
    vocab: ["freezer door", "walk-in door", "walk in door"],
    connects: {
      roomAId: "Kitchen",
      roomBId: "WalkIn",
    },
    directions: { fromA: "west", fromB: "east" },
    initiallyOpen: true,
    initiallyLocked: false,
  },
];

export const levelThreeMedicalAndSpaDoors: DoorDefinition[] = [
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
      "To the east is a heavy glass door that looks into a tiled steam room.",
    descriptionFromB:
      "To the west, a heavy glass door looks out into the main Spa.",
    kind: "standard",
    vocab: ["glass door", "heavy glass door", "steam door", "steam room door"],
    connects: {
      roomAId: "Spa",
      roomBId: "SteamRoom",
    },
    directions: { fromA: "east", fromB: "west" },
    initiallyOpen: false,
    initiallyLocked: false,
  },
  {
    id: "NailSalonDoor",
    name: "varnished wooden door",
    descriptionFromA:
      "To the west is a varnished wooden door with a little sign on it reading 'Nail Salon'.",
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
      roomBId: "NailSalon",
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
