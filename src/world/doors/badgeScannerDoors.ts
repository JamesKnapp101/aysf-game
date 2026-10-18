import { GameState } from "@game/types/gameTypes";
import { DescriptionContext } from "@game/types/itemTypes";
import type { DoorDefinition } from "../../game/types/doorTypes";
import { resolveItemByNoun } from "@game/rules/scope";
import { inventoryHas } from "@game/rules/state";
import { getCurrentRoom } from "@game/selectors/roomSelectors";
import type { ActionResult } from "@game/types/actionsTypes";
import type { ParsedCommand } from "@game/types/parserTypes";

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
        ctx.roomId === "LevelOneStairAccess"
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
    connects: { roomAId: "LevelOneStairAccess", roomBId: "LevelOneCorridorOne" },
    directions: { fromA: "west", fromB: "east" },
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
      "To the south is a security door with no obvious handle and a badge reader mounted next to it. The door is painted slate gray, with a blue horizontal stripe across it at eye level. Stenciled across the banner is the word 'LAB'.",
    descriptionFromB:
      "To the north is a security door leading back to Medical.",
    kind: "badgeScanner",
    vocab: ["door", "lab door", "security door"],
    connects: {
      roomAId: "MedicalCorridorOne",
      roomBId: "Lab",
    },
    directions: { fromA: "south", fromB: "north" },
    initiallyOpen: false,
    initiallyLocked: true,
    badgeItemId: "bluebadge",
    checkBadgeOnDir: "south",
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
        ctx.roomId === "LevelSevenStairAccess"
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
    connects: { roomAId: "LevelSevenStairAccess", roomBId: "LevelSevenCorridorBend" },
    directions: { fromA: "west", fromB: "east" },
    initiallyOpen: false,
    initiallyLocked: false,
    badgeItemId: "whitebadge",
    checkBadgeOnDir: "west",
  },
  // ENGINEERING
  {
    id: "EngineeringDoors",
    name: "engineering access door",
    describe: (_state: GameState, ctx: DescriptionContext) => {
      const description =
        ctx.roomId === "LevelFiveStairAccess"
          ? `It's a slate-gray security door with a violet stripe and the word 'ENGINEERING' stenciled across it. The badge reader is scorched and hanging from its wiring, and the door itself is buckled in its track, stuck mostly open.`
          : `It's a heavy slate-gray security door buckled in its track. The damaged panels are stuck mostly open, leaving plenty of room to pass through.`;
      return description;
    },
    descriptionFromA:
      "To the west, the damaged engineering security door is buckled and stuck mostly open. Its violet-striped badge reader hangs uselessly from exposed wires.",
    descriptionFromB:
      "To the east, the damaged security door is stuck mostly open, revealing the elevator lobby beyond.",
    kind: "standard",
    vocab: ["door", "security door", "engineering door"],
    connects: {
      roomAId: "LevelFiveStairAccess",
      roomBId: "EngCorridorOne",
    },
    directions: { fromA: "west", fromB: "east" },
    initiallyOpen: true,
    initiallyLocked: false,
    beforeClose: (state) => ({
      state,
      message:
        "The warped panels grind a fraction of an inch, then bind hard in their tracks. The damaged door is staying mostly open.",
    }),
  },
];

const READER_DESCRIPTION =
  "It's some kind of electronic scanner that requires the correct badge before the door will open.";
const STRIPE_DESCRIPTION =
  "It's a colored strip extending horizontally across the door at head height, indicating the security level of the door. You'll need to find a corresponding badge.";

function withoutArticle(noun: string): string {
  return noun.trim().toLowerCase().replace(/^(?:the|a|an)\s+/, "");
}

/** Door scenery stays local: ordinary scoped items keep priority over parts. */
function resolveSecurityDoorPart(
  state: GameState,
  noun: string,
  badgeInteraction = false,
): "reader" | "stripe" | undefined {
  const reference = withoutArticle(noun);
  const item = resolveItemByNoun(state, noun) ?? resolveItemByNoun(state, reference);
  // A badge directed at a generic reader means the nearby door reader, even
  // when carried equipment shares that alias. Explicit device names and room
  // objects retain their ordinary meaning.
  const carriedReaderAlias = badgeInteraction &&
    (reference === "reader" || reference === "scanner") && item &&
    inventoryHas(state.player.inventory, item.id) &&
    withoutArticle(item.name) !== reference;
  if (item && !carriedReaderAlias) {
    return undefined;
  }

  const room = getCurrentRoom(state);
  for (const door of badgeScannerDoors) {
    // The reverse-side descriptions explicitly have no badge reader.
    const exit = room.exits.find((entry) => entry.doorId === door.id);
    if (!exit || room.id !== door.connects.roomAId) continue;
    if (!state.world.doors.some((entry) => entry.id === door.id)) continue;

    const color = door.badgeItemId?.replace(/badge$/, "") ?? "violet";
    const qualifiers = [
      "door", "security door", door.id.toLowerCase(), door.name,
      ...door.vocab, `${color} door`, `${exit.direction} door`,
    ];
    const parts = {
      reader: ["reader", "scanner", "badge reader", "badge scanner", "card reader", "card scanner"],
      stripe: ["stripe", "strip", "band"].flatMap((part) => [
        part, `colored ${part}`, `coloured ${part}`, `horizontal ${part}`,
        `colored horizontal ${part}`, `coloured horizontal ${part}`,
        `${color} ${part}`, `${color} horizontal ${part}`,
      ]),
    };
    for (const part of ["reader", "stripe"] as const) {
      if (parts[part].some((alias) =>
        reference === alias || qualifiers.some((qualifier) =>
          reference === `${qualifier}'s ${alias}` ||
          reference === `${qualifier} ${alias}` ||
          reference === `${alias} on ${qualifier}` ||
          reference === `${alias} on the ${qualifier}` ||
          reference === `${alias} of ${qualifier}` ||
          reference === `${alias} of the ${qualifier}`,
        ),
      )) return part;
    }
  }
  return undefined;
}

/** Feedback only; all access checks and door state changes remain in door rules. */
export function handleSecurityDoorPartAction(
  state: GameState,
  cmd: ParsedCommand,
): ActionResult | undefined {
  if (cmd.type !== "action") return undefined;

  if (cmd.verb === "examine" || cmd.verb === "look") {
    const noun = cmd.verb === "look" && cmd.preposition === "at" && !cmd.direct
      ? cmd.indirect
      : cmd.direct;
    if (!noun) return undefined;
    // The parser splits "stripe on door" at ON, but "look at stripe on
    // door" keeps the same part reference in the indirect noun.
    const reference = cmd.direct && cmd.preposition === "on" && cmd.indirect
      ? `${noun} on ${cmd.indirect}`
      : !cmd.preposition || cmd.preposition === "at" ? noun : undefined;
    const part = reference && resolveSecurityDoorPart(state, reference);
    if (!part) return undefined;
    return {
      state,
      message: part === "reader" ? READER_DESCRIPTION : STRIPE_DESCRIPTION,
      ...(cmd.verb === "look" ? { consumesTurn: false } : {}),
    };
  }

  const showing = cmd.verb === "show" || cmd.verb === "present";
  if (!showing && !["touch", "swipe", "use"].includes(cmd.verb)) return undefined;
  if (!cmd.direct || !cmd.indirect) return undefined;

  const readerFirst = (cmd.verb === "touch" || cmd.verb === "swipe") &&
    cmd.preposition === "with";
  if (!readerFirst && !(showing
    ? cmd.preposition === "to"
    : cmd.preposition === "on" || cmd.preposition === "with" ||
      cmd.preposition === "at" || cmd.preposition === "to")) {
    return undefined;
  }
  const readerNoun = readerFirst ? cmd.direct : cmd.indirect;
  if (resolveSecurityDoorPart(state, readerNoun, true) !== "reader") return undefined;

  const badgeNoun = readerFirst ? cmd.indirect : cmd.direct;
  const badge = resolveItemByNoun(state, badgeNoun) ??
    resolveItemByNoun(state, withoutArticle(badgeNoun));
  if (!badge) return { state, message: "You aren't carrying that." };
  if (badge.meta?.kind !== "security-badge") return undefined;

  return {
    state,
    message: showing
      ? "The scanner will detect it automatically, there's no need to show it."
      : "You don't need to swipe the card, the scanner will detect any badges in your inventory.",
  };
}
