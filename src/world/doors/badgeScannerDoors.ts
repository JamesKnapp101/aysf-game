import { GameState } from "@game/types/gameTypes";
import { DescriptionContext } from "@game/types/itemTypes";
import type { DoorDefinition } from "../../game/types/doorTypes";

export const badgeScannerDoors: DoorDefinition[] = [
  // BRIDGE
  {
    id: "BridgeDoors",
    name: "a security door",
    descriptionFromA:
      "To the north is a security door, mounted next to which is a badge scanner of some kind with a maroon strip across the top. A sign over the door reads 'BRIDGE'.",
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
    badgeItemId: "maroonbadge",
  },
  {
    id: "BridgeStairDoors",
    name: "bridge access door",
    describe: (state: GameState, ctx: DescriptionContext) => {
      const description =
        ctx.roomId === "StairOne"
          ? `It's a security door with no obvious handle and a badge reader mounted next to it. The door is painted slate gray, with a maroon horizontal stripe across it at eye level. Stenciled across the banner is the word 'OPERATIONS'.`
          : `It's a heavy security door, painted slate gray. There is no badge reader on this side of the door.`;
      return description;
    },
    descriptionFromA:
      "To the west is a security door with no obvious handle and a badge reader mounted next to it. The door is painted slate gray, with a maroon horizontal stripe across it at eye level. Stenciled across the banner is the word 'OPERATIONS'. ",
    descriptionFromB:
      "There is a door to the east over which is mounted a plastic sign reading 'STAIRS'.",
    kind: "badgeScanner",
    vocab: ["door"],
    connects: { roomAId: "StairOne", roomBId: "LevelOneStairAccess" },
    directions: { fromA: "east", fromB: "west" },
    initiallyOpen: false,
    initiallyLocked: true,
    badgeItemId: "maroonbadge",
    checkBadgeOnDir: "west",
  },
  // MEDICAL LAB
  {
    id: "LabDoors",
    name: "lab access door",
    describe: (state: GameState, ctx: DescriptionContext) => {
      const description =
        ctx.roomId === "MedicalCorridorOne"
          ? `It's a security door with no obvious handle and a badge reader mounted next to it. The door is painted slate gray, with a blue horizontal stripe across it at eye level. Stenciled across the banner is the word 'LAB'.`
          : `It's a heavy security door, painted slate gray. There is no badge reader on this side of the door.`;
      return description;
    },
    descriptionFromA:
      "To the west is a security door with no obvious handle and a badge reader mounted next to it. The door is painted slate gray, with a blue horizontal stripe across it at eye level. Stenciled across the banner is the word 'LAB'.",
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
    name: "power access door",
    describe: (state: GameState, ctx: DescriptionContext) => {
      const description =
        ctx.roomId === "LevelFourCorridorTwo"
          ? `It's a security door with no obvious handle and a badge reader mounted next to it. The door is painted slate gray, with a yellow horizontal stripe across it at eye level. Stenciled across the banner are the words 'MAIN POWER GRID'.`
          : `It's a heavy security door, painted slate gray. There is no badge reader on this side of the door.`;
      return description;
    },
    descriptionFromA:
      "To the south is a security door with no obvious handle and a badge reader mounted next to it. The door is painted slate gray, with a yellow horizontal stripe across it at eye level. Stenciled across the banner are the words 'MAIN POWER GRID'.",
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
    name: "botanical access door",
    describe: (state: GameState, ctx: DescriptionContext) => {
      const description =
        ctx.roomId === "LevelFourCorridorOne"
          ? `It's a security door with no obvious handle and a badge reader mounted next to it. The door is painted slate gray, with a green horizontal stripe across it at eye level. Stenciled across the banner is the word 'BOTANICAL'.`
          : `It's a heavy security door, painted slate gray. There is no badge reader on this side of the door.`;
      return description;
    },
    descriptionFromA:
      "To the west is a security door with no obvious handle and a badge reader mounted next to it. The door is painted slate gray, with a green horizontal stripe across it at eye level. Stenciled across the banner is the word 'BOTANICAL'.",
    descriptionFromB:
      "To the east is a security door leading back to the corridor.",
    kind: "badgeScanner",
    vocab: ["door", "security door", "botanical door"],
    connects: {
      roomAId: "LevelFourCorridorOne",
      roomBId: "BotanicalOne",
    },
    directions: { fromA: "west", fromB: "east" },
    initiallyOpen: false,
    initiallyLocked: true,
    badgeItemId: "greenbadge",
    checkBadgeOnDir: "west",
  },
  // ZOOLOGICAL
  {
    id: "ZoologicalDoors",
    name: "zoo access door",
    describe: (state: GameState, ctx: DescriptionContext) => {
      const description =
        ctx.roomId === "LevelFourCorridorOne"
          ? `It's a security door with no obvious handle and a badge reader mounted next to it. The door is painted slate gray, with a orange horizontal stripe across it at eye level. Stenciled across the banner is the word 'ZOOLOGICAL'.`
          : `It's a heavy security door, painted slate gray. There is no badge reader on this side of the door.`;
      return description;
    },
    descriptionFromA:
      "To the north is a security door with no obvious handle and a badge reader mounted next to it. The door is painted slate gray, with an orange horizontal stripe across it at eye level. Stenciled across the banner is the word 'ZOOLOGICAL.'",
    descriptionFromB:
      "To the south is a security door leading back to the corridor.",
    kind: "badgeScanner",
    vocab: ["door", "security door", "zoological door"],
    connects: {
      roomAId: "LevelFourCorridorOne",
      roomBId: "ZooOne",
    },
    directions: { fromA: "north", fromB: "south" },
    initiallyOpen: false,
    initiallyLocked: true,
    badgeItemId: "orangebadge",
    checkBadgeOnDir: "north",
  },
  // CRYO
  {
    id: "CryoStairDoors",
    name: "cryo access door",
    describe: (state: GameState, ctx: DescriptionContext) => {
      const description =
        ctx.roomId === "StairSeven"
          ? `It's a security door with no obvious handle and a badge reader mounted next to it. The door is painted slate gray, with a white horizontal stripe across it at eye level. Stenciled across the banner are the words 'DEEP STORAGE'.`
          : `It's a heavy security door, painted slate gray. There is no badge reader on this side of the door.`;
      return description;
    },
    descriptionFromA:
      "To the west is a security door with no obvious handle and a badge reader mounted next to it. The door is painted slate gray, with a white horizontal stripe across it at eye level. Stenciled across the banner are the words 'DEEP STORAGE'.",
    descriptionFromB:
      "There is a door to the east over which is mounted a plastic sign reading 'STAIRS'.",
    kind: "badgeScanner",
    vocab: ["door"],
    connects: { roomAId: "StairSeven", roomBId: "LevelSevenStairAccess" },
    directions: { fromA: "east", fromB: "west" },
    initiallyOpen: false,
    initiallyLocked: false,
    badgeItemId: "whitebadge",
    checkBadgeOnDir: "west",
  },
  // ENGINEERING
  {
    id: "EngineeringDoors",
    name: "engineering access door",
    describe: (state: GameState, ctx: DescriptionContext) => {
      const description =
        ctx.roomId === "StairFive"
          ? `It's a security door with no obvious handle and a badge reader mounted next to it. The door is painted slate gray, with a violet horizontal stripe across it at eye level. Stenciled across the banner is the word 'ENGINEERING'.`
          : `It's a heavy security door, painted slate gray. There is no badge reader on this side of the door.`;
      return description;
    },
    descriptionFromA:
      "To the west is a security door with no obvious handle and a badge reader mounted next to it. The door is painted slate gray, with a violet horizontal stripe across it at eye level. Stenciled across the banner is the word 'ENGINEERING.'",
    descriptionFromB:
      "To the east is a security door leading back to the stairwell.",
    kind: "badgeScanner",
    vocab: ["door", "security door", "engineering door"],
    connects: {
      roomAId: "StairFive",
      roomBId: "LevelFiveStairAccess",
    },
    directions: { fromA: "west", fromB: "east" },
    initiallyOpen: false,
    initiallyLocked: true,
    badgeItemId: "violetbadge",
    checkBadgeOnDir: "west",
  },
];
