import { flashlightOn } from "@game/helpers/gameHelpers";
import { applyPlayerDamage } from "@game/rules/damage";
import { setItemDoses, updateItemLocation } from "@game/rules/items";
import { triggerScoreOnce } from "@game/rules/score";
import {
  addToInventory,
  inventoryHas,
  removeFromAllBuckets,
} from "@game/rules/state";
import type { TickContext } from "@game/types/context";
import type { DoorDefinition } from "@game/types/doorTypes";
import type { GameState } from "@game/types/gameTypes";
import { Item } from "@game/types/itemTypes";
import type { ParsedCommand } from "@game/types/parserTypes";
import { Room } from "@game/types/roomTypes";
import { organismLQOverrideTick } from "src/world/Items/creatures/livingQuartersThreeWestOrganisms";

export const BAR_BULL_ADHESIVE_TRIGGER = "BarBullAdhesiveApplied";
export const BAR_FLOOR_HATCH_DOOR_ID = "BarFloorHatchDoor";
export const BAR_SNAP_OUT_CHEWABLE_ID = "BarSnapOutChewable";
export const BAR_MEMORY_BOX_ID = "BarMemoryBox";
export const BAR_DRINK_EXIT_BLOCK_MESSAGE = `"Sorry, but you can't take drinks out of the bar, Mayor's orders!"`;
export const BAR_DRINK_LIMIT_MESSAGE = `"Sorry, only one drink per customer at a time!"`;
export const BAR_MODERN_DRINK_MESSAGE = `"Sorry, but the only recipe that survived from that era was the gin fizz"`;
export const BAR_MEMORY_BOX_MESSAGE = `The bartender reaches beneath the bar, retrieves a small metal box, and hands it to you. You take it, turning it over in your hands, but it doesn't look familiar.\n\n"You gave this to me once and said if you were ever in trouble, I should give it to you."`;

type BarDrinkMenuEntry = {
  aliases: string[];
  id: string;
  menuName: string;
  number: number;
};

const BAR_INTERIOR_ROOM_IDS = [
  "Bar",
  "BarLounge",
  "BarBathroom",
  "BarBasement",
] as const;

const BAR_DRINK_EMPTY_CLEANUP = {
  location: "seeded",
  message: "The bartender whisks the empty glass away.",
  removeFromInventory: true,
  rooms: BAR_INTERIOR_ROOM_IDS,
};

export const BAR_DRINK_MENU_ENTRIES: BarDrinkMenuEntry[] = [
  {
    aliases: ["whiskey sweet", "whiskey", "sweet"],
    id: "BarWhiskeySweet",
    menuName: "Whiskey Sweet",
    number: 1,
  },
  {
    aliases: ["durian colada", "durian", "colada"],
    id: "BarDurianColada",
    menuName: "Durian Colada",
    number: 2,
  },
  {
    aliases: ["bangalore sling", "bangalore", "sling"],
    id: "BarBangaloreSling",
    menuName: "Bangalore Sling",
    number: 3,
  },
  {
    aliases: ["fischermeister shot", "fischermeister", "bomb", "shot"],
    id: "BarFischermeisterShot",
    menuName: "Fischermeister shot",
    number: 4,
  },
  {
    aliases: [
      "hand-stuff on the beach",
      "hand stuff on the beach",
      "hand-stuff",
      "hand stuff",
      "beach",
    ],
    id: "BarHandStuffOnTheBeach",
    menuName: "Hand-stuff on the Beach",
    number: 5,
  },
  {
    aliases: ["gin fizz", "gin", "fizz"],
    id: "BarGinFizz",
    menuName: "Gin Fizz",
    number: 6,
  },
];

export const BAR_DRINK_MENU_TEXT = BAR_DRINK_MENU_ENTRIES.map(
  (entry) => `#${entry.number} ${entry.menuName}`,
).join("\n");

const MODERN_DRINK_NAMES = [
  "amaretto sour",
  "aperol spritz",
  "beer",
  "black russian",
  "bloody mary",
  "champagne",
  "cosmo",
  "cosmopolitan",
  "daiquiri",
  "dark and stormy",
  "espresso martini",
  "fuzzy navel",
  "gimlet",
  "gin and tonic",
  "g&t",
  "hot toddy",
  "irish coffee",
  "long island",
  "long island iced tea",
  "mai tai",
  "manhattan",
  "margarita",
  "martini",
  "mint julep",
  "mojito",
  "moscow mule",
  "negroni",
  "old fashioned",
  "paloma",
  "pina colada",
  "rum and coke",
  "sazerac",
  "screwdriver",
  "sex on the beach",
  "sidecar",
  "tequila sunrise",
  "tom collins",
  "vodka",
  "vodka tonic",
  "whiskey sour",
  "white russian",
  "wine",
];

const BAR_MEMORY_BOX_TOPIC_WORDS = new Set([
  "amnesia",
  "amnesiac",
  "blank",
  "blackout",
  "cataclysm",
  "catastrophe",
  "crash",
  "crashed",
  "crashing",
  "dead",
  "death",
  "died",
  "disaster",
  "emergency",
  "exploded",
  "explosion",
  "forget",
  "forgetting",
  "forgot",
  "forgotten",
  "incident",
  "meltdown",
  "memories",
  "memory",
  "outbreak",
  "remember",
  "remembered",
  "remembering",
  "help",
]);

const BAR_MEMORY_BOX_TOPIC_PHRASES = [
  "before everything",
  "everyone died",
  "everything happened",
  "lost memories",
  "memory loss",
  "missing memories",
  "no memories",
  "people died",
  "ship crash",
  "ship crashed",
  "what happened",
  "help me",
];

const BAR_DART_HIT_MESSAGES = [
  "Bullseye!",
  "The dart lands in the outer ring with a neat little thunk.",
  "The dart wobbles into the twenty, which feels pretty official.",
  "The dart clips the wire and sticks at an awkward angle.",
  "The dart buries itself just outside the bullseye.",
  "The dart hits low, but it sticks. That counts for something.",
];

function setBarTrigger(
  state: GameState,
  triggerId: string,
  value: boolean,
): GameState {
  return {
    ...state,
    worldState: {
      ...state.worldState,
      conditionalTriggers: {
        ...state.worldState.conditionalTriggers,
        [triggerId]: value,
      },
    },
  };
}

function isBarTriggerActive(state: GameState, triggerId: string): boolean {
  return state.worldState.conditionalTriggers?.[triggerId] === true;
}

function isBarFloorHatchOpen(state: GameState): boolean {
  return state.worldState.doors[BAR_FLOOR_HATCH_DOOR_ID]?.isOpen === true;
}

function normalizeDrinkRequest(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((token) => {
      const ignoredWords = [
        "a",
        "an",
        "the",
        "please",
        "drink",
        "cocktail",
        "number",
        "no",
      ];
      return !ignoredWords.includes(token);
    })
    .join(" ");
}

function resolveBarDrinkMenuEntry(
  request: string,
): BarDrinkMenuEntry | undefined {
  const normalizedRequest = normalizeDrinkRequest(request);
  if (!normalizedRequest) return undefined;

  const numberMatch = BAR_DRINK_MENU_ENTRIES.find(
    (entry) => String(entry.number) === normalizedRequest,
  );
  if (numberMatch) return numberMatch;

  return BAR_DRINK_MENU_ENTRIES.find((entry) =>
    [entry.menuName, ...entry.aliases].some(
      (alias) => normalizeDrinkRequest(alias) === normalizedRequest,
    ),
  );
}

function isModernDrinkRequest(request: string): boolean {
  const normalizedRequest = normalizeDrinkRequest(request);
  if (!normalizedRequest || resolveBarDrinkMenuEntry(request)) return false;

  return MODERN_DRINK_NAMES.some((drinkName) => {
    const normalizedDrink = normalizeDrinkRequest(drinkName);
    return (
      normalizedRequest === normalizedDrink ||
      normalizedRequest.includes(normalizedDrink)
    );
  });
}

function normalizeBarMemoryTopic(topic: string): string {
  return topic
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .join(" ");
}

export function isBarMemoryBoxTopic(topic: string): boolean {
  const normalizedTopic = normalizeBarMemoryTopic(topic);
  if (!normalizedTopic) return false;

  if (
    BAR_MEMORY_BOX_TOPIC_PHRASES.some((phrase) =>
      normalizedTopic.includes(phrase),
    )
  ) {
    return true;
  }

  return normalizedTopic
    .split(/\s+/)
    .some((token) => BAR_MEMORY_BOX_TOPIC_WORDS.has(token));
}

export function isBarInteriorRoom(roomId: string): boolean {
  return BAR_INTERIOR_ROOM_IDS.includes(
    roomId as (typeof BAR_INTERIOR_ROOM_IDS)[number],
  );
}

export function playerHasBarDrink(state: GameState): boolean {
  return BAR_DRINK_MENU_ENTRIES.some((entry) =>
    inventoryHas(state.player.inventory, entry.id),
  );
}

export function maybeAwardBarMemoryBox(
  state: GameState,
  npcId: string,
  topic: string,
): { state: GameState; message?: string } {
  if (npcId !== "BarBot" || !isBarMemoryBoxTopic(topic)) {
    return { state };
  }

  if (
    inventoryHas(state.player.inventory, BAR_MEMORY_BOX_ID) ||
    state.itemState.pickedUpByPlayer[BAR_MEMORY_BOX_ID] === true
  ) {
    return { state };
  }

  let next = updateItemLocation(state, BAR_MEMORY_BOX_ID, "INVENTORY");
  next = addToInventory(next, BAR_MEMORY_BOX_ID);

  return { state: next, message: BAR_MEMORY_BOX_MESSAGE };
}

export function shouldBlockLeavingBarWithDrink(
  state: GameState,
  destinationRoomId: string,
): boolean {
  return (
    isBarInteriorRoom(state.player.roomId) &&
    !isBarInteriorRoom(destinationRoomId) &&
    playerHasBarDrink(state)
  );
}

export function orderBarDrink(
  state: GameState,
  request: string,
): { state: GameState; message: string } {
  if (state.player.roomId !== "Bar") {
    return { state, message: "The bartender isn't here." };
  }

  if (playerHasBarDrink(state)) {
    return { state, message: BAR_DRINK_LIMIT_MESSAGE };
  }

  const entry = resolveBarDrinkMenuEntry(request);
  if (!entry) {
    return {
      state,
      message: isModernDrinkRequest(request)
        ? BAR_MODERN_DRINK_MESSAGE
        : `"Sorry, I don't see that one on the menu."`,
    };
  }

  let next = updateItemLocation(state, entry.id, "INVENTORY");
  next = setItemDoses(next, entry.id, 1);
  next = addToInventory(next, entry.id);

  return {
    state: next,
    message: `The bartender makes a ${entry.menuName} with crisp mechanical precision, then serves it to you.`,
  };
}

function removeItemFromSurface(
  state: GameState,
  surfaceId: string,
  itemId: string,
): GameState {
  const current = state.itemState.surfaceContents?.[surfaceId] ?? [];

  return {
    ...state,
    itemState: {
      ...state.itemState,
      surfaceContents: {
        ...state.itemState.surfaceContents,
        [surfaceId]: current.filter((candidate) => candidate !== itemId),
      },
    },
  };
}

function applyAdhesiveToBull(
  state: GameState,
  item: Item,
  cmd?: ParsedCommand,
): { state: GameState; message: string } {
  const target =
    cmd?.type === "action" ? (cmd.indirect?.toLowerCase().trim() ?? "") : "";
  if (!target) {
    return { state, message: "Apply it to what?" };
  }

  if (!target.includes("bull")) {
    return {
      state,
      message:
        "You think better of spreading powerful adhesive around at random.",
    };
  }

  if (state.player.roomId !== "Bar") {
    return { state, message: "You don't see the mechanical bull here." };
  }

  if (isBarTriggerActive(state, BAR_BULL_ADHESIVE_TRIGGER)) {
    return {
      state,
      message: "The mechanical bull is already tacky with adhesive.",
    };
  }

  const next = setBarTrigger(state, BAR_BULL_ADHESIVE_TRIGGER, true);

  return {
    state: next,
    message:
      "You spread a glossy layer of adhesive across the mechanical bull's worn leather saddle. It flashes wetly for a moment, then turns clear and tacky.",
  };
}

function getAttachedBullPantsName(state: GameState): string | undefined {
  const pantsId = Object.entries(state.itemState.attachedTo ?? {}).find(
    ([, hostId]) => hostId === "BarMechanicalBull",
  )?.[0];

  if (!pantsId) return undefined;

  return state.world.items.find((item) => item.id === pantsId)?.name;
}

function rideBarMechanicalBull(state: GameState): {
  state: GameState;
  message: string;
} {
  if (!isBarTriggerActive(state, BAR_BULL_ADHESIVE_TRIGGER)) {
    return {
      state: applyPlayerDamage(state, 5),
      message:
        "You climb onto the mechanical bull. For one gentle second it seems manageable, then the machine bucks hard, twists under you, and launches you sideways into the bar. You hit the floor in a deeply educational way.",
    };
  }

  const pantsId = state.itemState.wornByPlayer.legs;

  if (!pantsId) {
    return {
      state,
      message: "I don't think that's such a good idea with no pants on",
    };
  }

  const pants = state.world.items.find((item) => item.id === pantsId);
  let next: GameState = {
    ...state,
    player: {
      ...state.player,
      inventory: removeFromAllBuckets(state.player.inventory, pantsId),
    },
    itemState: {
      ...state.itemState,
      attachedTo: {
        ...state.itemState.attachedTo,
        [pantsId]: "BarMechanicalBull",
      },
      wornByPlayer: {
        ...state.itemState.wornByPlayer,
        legs: undefined,
      },
    },
  };

  next = updateItemLocation(next, pantsId, "Bar");

  return {
    state: next,
    message: `You climb onto the mechanical bull and hold on. The adhesive does most of the work, keeping you planted through every buck, spin, and spiteful little lurch. When the machine finally winds down, you peel yourself free, but ${
      pants?.name ?? "your pants"
    } stay behind, hopelessly stuck to the saddle.`,
  };
}

function dispenseSnapOutChewable(state: GameState): {
  state: GameState;
  message: string;
} {
  if (inventoryHas(state.player.inventory, BAR_SNAP_OUT_CHEWABLE_ID)) {
    return { state, message: "You already have one" };
  }

  let next = updateItemLocation(state, BAR_SNAP_OUT_CHEWABLE_ID, "INVENTORY");
  next = setItemDoses(next, BAR_SNAP_OUT_CHEWABLE_ID, 1);
  next = addToInventory(next, BAR_SNAP_OUT_CHEWABLE_ID);

  return {
    state: next,
    message:
      "You turn the crank. The machine clunks, then drops a brick-shaped chewable through the little chute and into your hand.",
  };
}

function consumeSnapOutChewable(
  state: GameState,
  item: Item,
): { state: GameState; message: string } {
  const doses = item.doses ?? 0;
  if (doses <= 0) {
    return { state, message: "That's the last of the chewable." };
  }

  const wasDrunk = state.player.statusEffects.some(
    (effect) => effect.id === "drunk",
  );

  let next = setItemDoses(state, item.id, 0);
  next = {
    ...next,
    player: {
      ...next.player,
      inventory: removeFromAllBuckets(next.player.inventory, item.id),
      statusEffects: next.player.statusEffects.filter(
        (effect) => effect.id !== "drunk",
      ),
      vitals: {
        ...next.player.vitals,
        brainActivity: wasDrunk ? 1 : next.player.vitals.brainActivity,
        drunkenness: wasDrunk ? 0 : next.player.vitals.drunkenness,
      },
    },
  };

  return {
    state: next,
    message:
      "You chew the Snap out of It! tablet. It collapses into a sharp citrus foam that seems to scrape the fog right off your thoughts.",
  };
}

export function throwDartAtBarDartboard(state: GameState): {
  state: GameState;
  message: string;
} {
  if (state.player.roomId !== "Bar") {
    return { state, message: "You don't see a dartboard here." };
  }

  if (!inventoryHas(state.player.inventory, "Dart")) {
    return { state, message: "You need to be holding the dart first." };
  }

  const currentDarts = state.itemState.surfaceContents.BarDartboard ?? [];
  if (currentDarts.includes("Dart")) {
    return {
      state,
      message: "The dart is already stuck in the dartboard.",
    };
  }

  const idx = Math.floor(state.rng() * BAR_DART_HIT_MESSAGES.length);
  const hitMessage =
    BAR_DART_HIT_MESSAGES[
      Math.max(0, Math.min(BAR_DART_HIT_MESSAGES.length - 1, idx))
    ];

  let next: GameState = {
    ...state,
    player: {
      ...state.player,
      inventory: removeFromAllBuckets(state.player.inventory, "Dart"),
    },
    itemState: {
      ...state.itemState,
      surfaceContents: {
        ...state.itemState.surfaceContents,
        BarDartboard: [...currentDarts, "Dart"],
      },
    },
  };
  next = updateItemLocation(next, "Dart", "Bar");

  return {
    state: next,
    message: `You throw the dart at the dartboard. ${hitMessage}`,
  };
}

export function giveDartToBarBartender(state: GameState): {
  state: GameState;
  message: string;
} {
  if (state.player.roomId !== "Bar") {
    return { state, message: "The bartender isn't here." };
  }

  if (!inventoryHas(state.player.inventory, "Dart")) {
    return { state, message: "You need to be holding the dart first." };
  }

  let next: GameState = {
    ...state,
    player: {
      ...state.player,
      inventory: removeFromAllBuckets(state.player.inventory, "Dart"),
    },
  };

  next = removeItemFromSurface(next, "BarDartboard", "Dart");
  next = updateItemLocation(next, "Dart", "Bar");
  next = triggerScoreOnce(next, "returned_red_dart");
  return {
    state: next,
    message: `"Hey, you found one of the darts! That's great!"`,
  };
}

export const barRooms: Room[] = [
  {
    id: "BarEntrance",
    name: "Bar Entrance",
    description: `The grass gives way here to the landscaped exterior of a cozy looking little bar situated at the end of a paved path. [[SCENERY]]`,
    exits: [
      { direction: "northwest", toRoomId: "ParkCenter" },
      { direction: "southeast", toRoomId: "Bar" },
      { direction: "north", toRoomId: "ParkEast" },
      { direction: "west", toRoomId: "ParkSouth" },
    ],
  },
  {
    id: "Bar",
    name: "Bar: Barroom",
    description: `The interior of the bar is dimly lit by warm electric light. [[SCENERY]]`,
    exits: [
      { direction: "northwest", toRoomId: "BarEntrance" },
      { direction: "down", doorId: BAR_FLOOR_HATCH_DOOR_ID },
      { direction: "west", toRoomId: "BarBathroom" },
      { direction: "south", toRoomId: "BarLounge" },
    ],
  },
  {
    id: "BarBasement",
    name: "Bar: Basement",
    description: `This is a somewhat tight cellar space with a low ceiling, though it clears your head. [[SCENERY]]`,
    exits: [{ direction: "up", doorId: BAR_FLOOR_HATCH_DOOR_ID }],
  },
  {
    id: "BarLounge",
    name: "Bar: Lounge",
    description: `This area acts as the bar's lounge. [[SCENERY]]`,
    exits: [{ direction: "north", toRoomId: "Bar" }],
  },
  {
    id: "BarBathroom",
    name: "Bar: Bathroom",
    description: `The bathroom is a simple affair, designed to do a lot of business without much fanfare. [[SCENERY]]`,
    exits: [{ direction: "east", toRoomId: "Bar" }],
  },
];

export const barDoors: DoorDefinition[] = [
  {
    id: BAR_FLOOR_HATCH_DOOR_ID,
    name: "floor hatch",
    kind: "standard",
    vocab: ["hatch", "floor hatch", "panel", "floor panel"],
    connects: {
      roomAId: "Bar",
      roomBId: "BarBasement",
    },
    directions: { fromA: "down", fromB: "up" },
    initiallyOpen: false,
    initiallyLocked: false,
    openVerb: "swings open, revealing wooden steps leading down into darkness",
    closeVerb: "settles shut",
    describeFromA: (state) =>
      isBarFloorHatchOpen(state)
        ? "Behind the bar, an open floor hatch exposes a set of wooden steps leading down."
        : "Behind the bar you can see a square floor hatch with a recessed pull ring.",
    describeFromB: (state) =>
      isBarFloorHatchOpen(state)
        ? "Above you, the open floor hatch leads back up into the bar."
        : "Above you, the floor hatch is closed.",
  },
];

export const barItems: Item[] = [
  {
    id: "BarContraband",
    name: "small wrapped package",
    description:
      "It's a small package of some sort, no bigger than a deck of cards, wrapped tightly in paper. Written on the paper in ink is the name 'Yolonope'.",
    location: "seeded",
    vocab: ["package", "packet", "paper"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1000,
    itemSize: 20,
  },
  {
    id: "BarEntranceExterior",
    name: "bar exterior",
    description:
      "The exterior is cozy and unpretentious in a carefully managed way, the kind of modesty that probably cost extra.",
    sceneryDescription:
      "The exterior is unpretentious, but still gives the impression that it's more expensive than it pretends it is.",
    location: "BarEntrance",
    vocab: ["exterior", "bar", "building"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1000,
    itemSize: 20,
    meta: {
      sceneryDescriptionOrder: 1,
    },
  },
  {
    id: "BarEntrancePath",
    name: "paved path",
    description:
      "The path leads southeast from the grass to the bar entrance, its edges trimmed by neat landscaping.",
    sceneryDescription:
      "A paved path leads southeast through tidy landscaping to the front entrance.",
    location: "BarEntrance",
    vocab: ["path", "paved path", "landscaping", "landscaped"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1000,
    itemSize: 10,
    meta: {
      sceneryDescriptionOrder: 2,
    },
  },
  {
    id: "BarEntranceNeonSign",
    name: "red neon sign",
    description:
      "The red neon sign reads 'The Loosened Tongue' in cursive letters, buzzing faintly over the entrance.",
    sceneryDescription:
      "The front of the bar bears a red neon sign that reads 'The Loosened Tongue' in cursive letters,",
    location: "BarEntrance",
    vocab: ["sign", "neon", "red", "loosened", "tongue", "loosened tongue"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 20,
    itemSize: 5,
    meta: {
      sceneryDescriptionOrder: 3,
    },
  },
  {
    id: "BarEntranceWindows",
    name: "large windows",
    description:
      "The windows look directly into the bar, though a heavy layer of fliers blocks enough of the view to make the interior feel withheld.",
    sceneryDescription:
      "and beneath that is the entrance, flanked on either side by large windows looking directly into the bar, though much of each window is covered in fliers.",
    location: "BarEntrance",
    vocab: ["window", "windows", "large windows", "fliers", "flyers"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 120,
    itemSize: 8,
    meta: {
      sceneryDescriptionOrder: 4,
    },
  },
  {
    id: "BarEntranceBlackboard",
    name: "blackboard sign",
    description:
      "The blackboard advertises the night's specials in chalk and adds: 'Answer tonight's Trivia Question for a Mystery Prize!'",
    sceneryDescription:
      "Just outside the bar is a stand holding a blackboard sign with the specials written in chalk, along with the message 'Answer tonight's Trivia Question for a Mystery Prize!'",
    location: "BarEntrance",
    vocab: ["blackboard", "blackboard sign", "chalk", "specials", "trivia"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 8,
    itemSize: 4,
    isReadable: true,
    readableText: `Tonight's Specials\n\n${BAR_DRINK_MENU_TEXT}\n\nAnswer tonight's Trivia Question for a Mystery Prize!`,
    meta: {
      sceneryDescriptionOrder: 5,
    },
  },
  {
    id: "BarWindowTables",
    name: "small tables",
    description:
      "Each small table is paired with two chairs and pushed close to the windowed walls, intimate enough for a date or an argument held in low voices.",
    sceneryDescription:
      "A series of small tables, each with two chairs, are positioned along the windowed walls.",
    location: "Bar",
    vocab: ["tables", "table", "chairs", "chair", "windowed walls"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 200,
    itemSize: 10,
    meta: {
      sceneryDescriptionOrder: 1,
    },
  },
  {
    id: "BarPolishedWoodBar",
    name: "long bar",
    description:
      "The long bar is polished wood, though years of nicks and pale water rings show through the shine. Wooden stools are arranged around it.",
    sceneryDescription:
      "Most of the room is occupied by a long bar of polished wood, covered over the years by nicks and water rings, with wooden stools all around it.",
    location: "Bar",
    vocab: ["bar", "long bar", "wood", "polished", "stools", "wooden stools"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 600,
    itemSize: 14,
    meta: {
      sceneryDescriptionOrder: 2,
    },
  },
  {
    id: "BarBeerTaps",
    name: "beer taps",
    description:
      "Three beer taps stand in a row behind the bar, their handles shaped to look hand-carved and probably printed by the dozen.",
    sceneryDescription: "Behind the bar are a row of three beer taps,",
    location: "Bar",
    vocab: ["beer", "tap", "taps", "beer taps"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 40,
    itemSize: 4,
    meta: {
      sceneryDescriptionOrder: 3,
    },
  },
  {
    id: "BarLiquorShelves",
    name: "liquor shelves",
    description:
      "The shelves are packed tight with bottles of liquor, every bottle capped with a pourer and waiting for the bartender's practiced reach.",
    sceneryDescription:
      "and farther back are shelves packed with tightly arranged bottles of liquor, each topped with a pourer.",
    location: "Bar",
    vocab: ["shelves", "liquor", "bottles", "liquor shelves", "pourers"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 200,
    itemSize: 10,
    meta: {
      sceneryDescriptionOrder: 4,
    },
  },
  {
    id: "BarStage",
    name: "raised open stage",
    description:
      "The stage is raised just enough to make bad decisions visible from everywhere in the room.",
    sceneryDescription:
      "[[newline]]Across from the bar is a raised open stage.",
    location: "Bar",
    vocab: ["stage", "raised stage", "open stage"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 400,
    itemSize: 12,
    meta: {
      sceneryDescriptionOrder: 5,
    },
  },
  {
    id: "BarMechanicalBull",
    name: "mechanical bull",
    description:
      "The bull is big, heavy, and covered in worn leather. Even idle, it has the smug posture of a machine with a litigation history.",
    describe: (state) => {
      const pantsName = getAttachedBullPantsName(state);
      const adhesive = isBarTriggerActive(state, BAR_BULL_ADHESIVE_TRIGGER)
        ? " The saddle has a clear, tacky sheen of adhesive across it."
        : "";
      const pants = pantsName
        ? ` A pair of pants is stuck fast to the saddle.`
        : "";
      return `The bull is big, heavy, and covered in worn leather. It is currently sitting idle.${adhesive}${pants}`;
    },
    describeScenery: (state) => {
      const pantsName = getAttachedBullPantsName(state);
      const adhesive = isBarTriggerActive(state, BAR_BULL_ADHESIVE_TRIGGER)
        ? " Its worn leather saddle has a clear tacky sheen."
        : "";
      const pants = pantsName ? ` A pair of pants is stuck to it.` : "";
      return `In the middle of the stage sits a big mechanical bull covered in worn leather, currently sitting idle.${adhesive}${pants}`;
    },
    location: "Bar",
    vocab: ["bull", "mechanical bull", "machine", "saddle", "leather"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 500,
    itemSize: 10,
    meta: {
      sceneryDescriptionOrder: 6,
    },
    overrides: {
      ride: ({ state }: { state: GameState }) => rideBarMechanicalBull(state),
      siton: ({ state }: { state: GameState }) => rideBarMechanicalBull(state),
    },
  },
  {
    id: "BarDartboard",
    name: "cork dartboard",
    description:
      "The cork dartboard hangs on the southern wall, its face pocked by old hits and near misses.",
    describe: (state) => {
      const hasDart =
        state.itemState.surfaceContents.BarDartboard?.includes("Dart") === true;
      return hasDart
        ? "The cork dartboard hangs on the southern wall. The red dart is stuck in it, quivering slightly."
        : "The cork dartboard hangs on the southern wall, though you don't see any darts.";
    },
    describeScenery: (state) => {
      const hasDart =
        state.itemState.surfaceContents.BarDartboard?.includes("Dart") === true;
      return hasDart
        ? "On the southern wall hangs a cork dartboard with the red dart stuck in it."
        : "On the southern wall hangs a cork dartboard, though you don't see any darts.";
    },
    location: "Bar",
    vocab: ["dartboard", "board", "cork", "cork dartboard", "dart board"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 10,
    itemSize: 4,
    isSurface: true,
    meta: {
      sceneryDescriptionOrder: 7,
    },
  },
  {
    id: "BarRestroomSign",
    name: "Rest Room sign",
    description:
      "The sign reads 'Rest Room' and hangs over the door to the west.",
    sceneryDescription:
      "A sign that reads 'Rest Room' hangs on the wall over a door to the west,",
    location: "Bar",
    vocab: ["rest", "room", "rest room", "restroom", "sign", "bathroom"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 3,
    itemSize: 2,
    meta: {
      sceneryDescriptionOrder: 8,
    },
  },
  {
    id: "BarLoungeSign",
    name: "Lounge sign",
    description:
      "The sign reads 'Lounge' and hangs over an open doorway to the southwest.",
    sceneryDescription:
      "and another sign reading 'Lounge' hangs over an open doorway to the southwest.",
    location: "Bar",
    vocab: ["lounge", "sign", "open doorway", "doorway"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 3,
    itemSize: 2,
    meta: {
      sceneryDescriptionOrder: 9,
    },
  },
  {
    id: "BarDrinkMenu",
    name: "holographic drink menu",
    description:
      "The menu is projected up from the bar in crisp floating letters, listing six drinks that range from plausible to legally adventurous.",
    sceneryDescription:
      "[[newline]]Projected up from the bar is a holographic drink menu.",
    location: "Bar",
    vocab: ["menu", "drink menu", "holographic", "hologram", "drinks"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 4,
    isReadable: true,
    readableText: BAR_DRINK_MENU_TEXT,
    meta: {
      sceneryDescriptionOrder: 11,
    },
  },
  {
    id: "BarFloorHatch",
    name: "floor hatch",
    description:
      "The square hatch is set into the floor behind the bar, with a recessed pull ring worn smooth by use.",
    describe: (state) =>
      isBarFloorHatchOpen(state)
        ? "The floor hatch stands open, exposing wooden steps leading down into the dark cellar."
        : "The square hatch is set into the floor behind the bar, with a recessed pull ring worn smooth by use.",
    location: "Bar",
    vocab: ["hatch", "floor hatch", "panel", "floor panel", "stairs", "steps"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 80,
    itemSize: 5,
    meta: {
      sceneryDescriptionOrder: 12,
    },
  },
  {
    id: "BarAdhesive",
    name: "tube of adhesive",
    description:
      "The tube is labeled GraviBond Recreation-Grade Adhesive. The warning text insists it is temporary, skin-safe, and fun, in that order.",
    initialDescription:
      "A small tube of adhesive sits on the bar, wedged near the drink menu's projector.",
    location: "seeded",
    vocab: ["adhesive", "glue", "tube", "gravibond", "bond"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isUseable: true,
    overrides: {
      use: ({
        state,
        item,
        cmd,
      }: {
        state: GameState;
        item: Item;
        cmd?: ParsedCommand;
      }) => applyAdhesiveToBull(state, item, cmd),
    },
  },
  {
    id: "BarWhiskeySweet",
    name: "Whiskey Sweet",
    description:
      "A small amber cocktail with a candied peel twisted over the rim.",
    location: "seeded",
    vocab: ["whiskey", "sweet", "whiskey sweet", "drink", "cocktail"],
    itemClass: "liquid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    doses: 1,
    overrides: {
      smell: `It smells kind of floral, with a whiff of citrus.`,
    },
    meta: {
      barDrink: true,
      consumable: {
        emptyCleanup: BAR_DRINK_EMPTY_CLEANUP,
        kind: "drink",
        perDose: [
          {
            type: "message",
            text: "You drink the Whiskey Sweet. It goes down warm with the flavor of honey and orange.",
          },
          { type: "status", id: "drunk", intensity: 12, duration: 18 },
        ],
        onEmpty: [{ type: "message", text: "That drink is finished." }],
      },
    },
  },
  {
    id: "BarDurianColada",
    name: "Durian Colada",
    description: "A pale tropical drink with a nose-wrinkling smell.",
    location: "seeded",
    vocab: ["durian", "colada", "durian colada", "drink", "cocktail"],
    itemClass: "liquid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    doses: 1,
    overrides: {
      smell: `You give the drink a sniff and the smell immediately triggers your gag reflex and a loud 'hork' sound. Ugh, it smells like an onion rotting inside of a used diaper!`,
    },
    meta: {
      barDrink: true,
      consumable: {
        emptyCleanup: BAR_DRINK_EMPTY_CLEANUP,
        kind: "drink",
        perDose: [
          {
            type: "message",
            text: "You plug your nose and drink the Durian Colada. The flavor isn't bad, creamy and tropical, and it's got a kick, too!",
          },
          { type: "status", id: "drunk", intensity: 18, duration: 22 },
        ],
        onEmpty: [{ type: "message", text: "That drink is finished." }],
      },
    },
  },
  {
    id: "BarBangaloreSling",
    name: "Bangalore Sling",
    description: "A deep ruby cocktail in a tall glass.",
    location: "seeded",
    vocab: ["bangalore", "sling", "bangalore sling", "drink", "cocktail"],
    itemClass: "liquid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    doses: 1,
    overrides: {
      smell: `It has a perfume smell, filled with galangal, ginger, and mint.`,
    },
    meta: {
      barDrink: true,
      consumable: {
        emptyCleanup: BAR_DRINK_EMPTY_CLEANUP,
        kind: "drink",
        perDose: [
          {
            type: "message",
            text: "You drink the Bangalore Sling. It is tart, and spicy, and quite strong!",
          },
          { type: "status", id: "drunk", intensity: 24, duration: 24 },
        ],
        onEmpty: [{ type: "message", text: "That drink is finished." }],
      },
    },
  },
  {
    id: "BarFischermeisterShot",
    name: "Fischermeister Shot",
    description:
      "A shot glass filled with a dark, syrupy liquid that smells of juniper, rosemary, and fermented fish.",
    location: "seeded",
    vocab: [
      "fischermeister",
      "fischermeister shot",
      "fischermeister bomb",
      "bomb",
      "drink",
      "shot",
    ],
    itemClass: "liquid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    doses: 1,
    overrides: {
      smell: `The combination of strong smells is weirdly intoxicating.`,
    },
    meta: {
      barDrink: true,
      consumable: {
        emptyCleanup: BAR_DRINK_EMPTY_CLEANUP,
        kind: "drink",
        perDose: [
          {
            type: "message",
            text: "You drink the Fischermeister shot in one gulp. The taste and the smell that flood your nose are strongly medicinal, with deeply fishy undercurrent, and a kick like a mule!",
          },
          { type: "status", id: "drunk", intensity: 34, duration: 28 },
        ],
        onEmpty: [{ type: "message", text: "That drink is finished." }],
      },
    },
  },
  {
    id: "BarHandStuffOnTheBeach",
    name: "Hand-stuff on the Beach",
    description:
      "A layered peach-orange cocktail floated with a layer of rumchata.",
    location: "seeded",
    vocab: [
      "hand-stuff",
      "hand stuff",
      "beach",
      "hand-stuff on the beach",
      "hand stuff on the beach",
      "drink",
      "cocktail",
    ],
    itemClass: "liquid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    doses: 1,
    overrides: {
      smell: `You're picking up vanilla and cinnamon.`,
    },
    meta: {
      barDrink: true,
      consumable: {
        emptyCleanup: BAR_DRINK_EMPTY_CLEANUP,
        kind: "drink",
        perDose: [
          {
            type: "message",
            text: "You drink the Hand-stuff on the Beach. It's fruity in the extreme, and super sweet.",
          },
          { type: "status", id: "drunk", intensity: 28, duration: 26 },
        ],
        onEmpty: [{ type: "message", text: "That drink is finished." }],
      },
    },
  },
  {
    id: "BarGinFizz",
    name: "Gin Fizz",
    description:
      "A cloudy, sparkling gin drink with a foamy cap and a clean citrus snap.",
    location: "seeded",
    vocab: ["gin", "fizz", "gin fizz", "drink", "cocktail"],
    itemClass: "liquid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    doses: 1,
    overrides: {
      smell: `It smells of citrus.`,
    },
    meta: {
      barDrink: true,
      consumable: {
        emptyCleanup: BAR_DRINK_EMPTY_CLEANUP,
        kind: "drink",
        perDose: [
          {
            type: "message",
            text: "You drink the Gin Fizz. It is bright, bubbly, and probably pretty good if you like gin, but you don't seem to.",
          },
          { type: "status", id: "drunk", intensity: 15, duration: 20 },
        ],
        onEmpty: [{ type: "message", text: "That drink is finished." }],
      },
    },
  },
  {
    id: "BarBasementLiquorBoxes",
    name: "liquor boxes",
    description:
      "The boxes are stacked tight along the walls, each packed with bottles and labeled by brand, proof, and optimistic inventory codes.",
    sceneryDescription:
      "Stacks of boxes containing liquor bottles are arranged along the walls, along with drink garnishes like olives, cocktail onions, fruit, and celery, and crates containing replacement glassware.",
    location: "BarBasement",
    vocab: [
      "boxes",
      "liquor",
      "bottles",
      "garnishes",
      "olives",
      "onions",
      "fruit",
      "celery",
      "glassware",
      "crates",
    ],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 500,
    itemSize: 12,
    meta: {
      sceneryDescriptionOrder: 1,
    },
  },
  {
    id: "BarBasementSteps",
    name: "wooden steps",
    description:
      "The wooden steps lead back up to the bar through the open panel above.",
    sceneryDescription:
      "A set of wooden steps leads back up to the bar, visible through the open panel above.",
    location: "BarBasement",
    vocab: ["steps", "stairs", "wooden steps", "panel", "open panel"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 150,
    itemSize: 8,
    meta: {
      sceneryDescriptionOrder: 2,
    },
  },
  {
    id: "BarBasementStainedClothing",
    name: "stained clothing",
    description:
      "The clothing is strewn on the basement floor, stained brown and red.",
    sceneryDescription:
      "Near one edge of the hatch above, the floor is strewn articles of clothing, all stained brown and red.",
    location: "BarBasement",
    vocab: ["clothing", "clothes", "stained clothing", "stains"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 10,
    itemSize: 4,
    meta: {
      sceneryDescriptionOrder: 3,
    },
  },
  {
    id: "BarBasementTornPants",
    name: "torn pants",
    description:
      "The pants are torn and stained, lying on the floor. Two feet sprout from the otherwise empty legs, heels pointing toward the hatch above.",
    sceneryDescription:
      "A pair of torn, stained pants lie on the floor, with two feet sprouting from the otherwise empty legs, toes pointing up toward the hatch.",
    location: "BarBasement",
    vocab: ["pants", "torn pants", "feet", "legs", "heels"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 8,
    itemSize: 4,
    meta: {
      sceneryDescriptionOrder: 4,
    },
  },
  {
    id: "BarBasementShirtApron",
    name: "torn t-shirt and apron",
    description:
      "The t-shirt is torn and bloodstained. The apron beside it still has its ties knotted, which is somehow worse.",
    sceneryDescription:
      "Next to thant is a torn t-shirt, stained with blood, along with an apron with the ties still knotted.",
    location: "BarBasement",
    vocab: ["shirt", "t-shirt", "torn shirt", "apron", "ties", "blood"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 5,
    itemSize: 3,
    meta: {
      sceneryDescriptionOrder: 5,
    },
  },
  {
    id: "BarBasementHead",
    name: "man's head",
    description:
      "The man's face is slack and ashen. The stump of the neck shows signs of some sort of burning, or melting.",
    sceneryDescription:
      "[[newline]]Resting against the wall opposite the stairs is a man's head, face slack and ashen. The stump of the neck shows signs of some sort of burning, or melting.",
    location: "BarBasement",
    vocab: ["head", "man's head", "man", "corpse", "body", "neck"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 6,
    itemSize: 3,
    meta: {
      corpse: {
        hasIntactHead: true,
        memoryExperienceId: "bar_basement_head_memory",
      },
      sceneryDescriptionOrder: 6,
    },
  },
  {
    id: "BarBasementOrganism",
    name: "organism-bar-basement",
    itemCategory: "animate",
    meta: {
      isAlive: true,
      canMove: true,
      vision: "dark",
      hostility: "hostile",
      homeRegion: [],
      memories: [],
      moveChance: 0,
    },
    description: "You can't see it...",
    initialDescription:
      "Between two stacks of boxes is a tall, vaguely humanoid mannequin made from a glassy, black material. It stands in the approximate position of someone on their toes, peeking up over something.",
    describe: (state, item) => {
      const loc = state.itemState.itemRoomId?.[item.id] ?? item.location;
      if (flashlightOn(state) && loc === state.player.roomId) {
        return "The shape is definitely humanoid, with spindly limbs and a head like the end of a burned matchstick. The surface is black like volcanic glass but the surface is covered in fine, complex ridges and wrinkles.";
      }
      return "...you can't see it.";
    },
    describeInitial: (state, item) => {
      const loc = state.itemState.itemRoomId?.[item.id] ?? item.location;
      if (flashlightOn(state) && loc === state.player.roomId) {
        return "Between two stacks of boxes is a tall, vaguely humanoid mannequin made from a glassy, black material. It stands in the approximate position of someone on their toes, peeking up over something.";
      }
      return "...you can't see it.";
    },
    location: "BarBasement",
    vocab: ["sculpture", "mannequin", "statue", "organism"],
    itemClass: "solid",
    itemWeight: 8,
    itemSize: 2,
    overrides: {
      tick: ({
        state,
        item,
        rng,
        moveItemToRoom,
        getRoomExits,
        isRoomDark,
        getPlayerRoomId,
        triggerPlayerDeath,
      }: TickContext & {
        triggerPlayerDeath?: (deathMessage: string, cause: string) => void;
      }): GameState | void =>
        organismLQOverrideTick(
          item,
          state,
          rng,
          moveItemToRoom,
          getRoomExits,
          isRoomDark,
          getPlayerRoomId,
          triggerPlayerDeath,
        ),
    },
  },
  {
    id: "BarLoungeCabaretStage",
    name: "cabaret seating and stage",
    description:
      "The lounge has cabaret seating around a small stage against the western wall, suitable for karaoke, live music, or open mike nights.",
    sceneryDescription:
      "Cabaret seating is arranged around a small stage against the western wall, suitable for karaoke, live music, or open mike nights.",
    location: "BarLounge",
    vocab: [
      "cabaret",
      "seating",
      "stage",
      "small stage",
      "karaoke",
      "music",
      "open mike",
      "open mic",
    ],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 300,
    itemSize: 10,
    meta: {
      sceneryDescriptionOrder: 1,
    },
  },
  {
    id: "BarLoungeJukebox",
    name: "colorful jukebox",
    description:
      "The jukebox is a big tombstone-shaped affair, banded in colorful neon with a front-facing song selector covered in square white buttons.",
    sceneryDescription:
      "A colorful jukebox sits across from the seating area, a big tombstone-shaped affair covered in bands of neon and a front-facing song selector with square white buttons.",
    location: "BarLounge",
    vocab: [
      "jukebox",
      "colorful jukebox",
      "neon",
      "song selector",
      "buttons",
      "white buttons",
    ],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 150,
    itemSize: 7,
    meta: {
      sceneryDescriptionOrder: 2,
    },
  },
  {
    id: "BarLoungePoolTables",
    name: "pool tables",
    description:
      "The pair of pool tables are cleared of balls at the moment. Stained-glass billiard pendant lights hang above them.",
    sceneryDescription:
      "Opposite the stage and seating are a pair of pool tables underneath billiard pendant lights with stained glass shades, each cleared of balls at the moment.",
    location: "BarLounge",
    vocab: [
      "pool",
      "pool tables",
      "tables",
      "billiard",
      "lights",
      "pendant lights",
      "stained glass",
      "balls",
    ],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 500,
    itemSize: 12,
    meta: {
      sceneryDescriptionOrder: 3,
    },
  },
  {
    id: "BarLoungeRecentEvidence",
    name: "signs of recent company",
    description:
      "Chairs sit at slightly wrong angles, and a few tables have the kind of small abandoned clutter that says people were here not long ago.",
    sceneryDescription:
      "There's evidence that people were here not that long ago, but it is eerily quiet now.",
    location: "BarLounge",
    vocab: ["evidence", "quiet", "clutter", "company", "chairs"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 20,
    itemSize: 6,
    meta: {
      sceneryDescriptionOrder: 4,
    },
  },
  {
    id: "BarBathroomWalls",
    name: "scribbled black walls",
    description:
      "The walls are painted black and covered in scribbles and overlapping old fliers, a dense archive of boredom and bad handwriting.",
    sceneryDescription:
      "The space is small, painted black, and covered in scribbles and overlapping old fliers.",
    location: "BarBathroom",
    vocab: ["walls", "black walls", "scribbles", "fliers", "flyers"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 400,
    itemSize: 10,
    meta: {
      sceneryDescriptionOrder: 1,
    },
  },
  {
    id: "BarBathroomSink",
    name: "porcelain bar sink",
    description:
      "The porcelain sink has seen heavy use but still looks functional enough.",
    sceneryDescription: "There's a porcelain sink in front of a wide mirror,",
    location: "BarBathroom",
    vocab: ["sink", "porcelain", "porcelain sink"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 80,
    itemSize: 5,
    meta: {
      sceneryDescriptionOrder: 2,
    },
    isContainer: true,
  },
  {
    id: "BarBathroomMirror",
    name: "wide mirror",
    description:
      "The mirror could use a good cleaning, but it still reflects well enough to be honest with you.",
    sceneryDescription: "which could use a good cleaning.",
    location: "BarBathroom",
    vocab: ["mirror", "wide mirror", "reflection", "reflective"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 50,
    itemSize: 5,
    isReflective: true,
    meta: {
      sceneryDescriptionOrder: 3,
    },
  },
  {
    id: "BarBathroomToiletUrinal",
    name: "toilet and urinal",
    description:
      "There is no stall. The urinal's plastic net cradles a partially dissolved urinal cake with grim professional dedication.",
    sceneryDescription:
      "Across from that is a toilet with no stall, right next to a wall mounted urinal, in the bottom of which a plastic net cradles a partially dissolved urinal cake.",
    location: "BarBathroom",
    vocab: [
      "toilet",
      "urinal",
      "wall mounted urinal",
      "net",
      "urinal cake",
      "cake",
      "stall",
    ],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 120,
    itemSize: 6,
    meta: {
      sceneryDescriptionOrder: 4,
    },
  },
  {
    id: "BarBathroomDispenser",
    name: "dispensing machine",
    description:
      "The little dispenser has a silver turn crank and a metal flap beneath it. Its breezy logo reads 'Snap out of It!' and promises to get you seeing clear again.",
    sceneryDescription:
      "[[newline]]Mounted on the wall next to the sink is a little dispensing machine with a silver turn crank and a metal flap beneath it. The dispenser is painted with a breezy logo that reads 'Snap out of It!'.",
    location: "BarBathroom",
    vocab: [
      "dispenser",
      "dispensing machine",
      "machine",
      "crank",
      "turn crank",
      "dispenser crank",
      "flap",
      "snap out of it",
    ],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 25,
    itemSize: 3,
    isTurnable: true,
    meta: {
      sceneryDescriptionOrder: 5,
    },
    overrides: {
      turn: ({ state }: { state: GameState }) => dispenseSnapOutChewable(state),
    },
  },
  {
    id: BAR_MEMORY_BOX_ID,
    name: "small metal box",
    description:
      "A small metal box with a snug lid. It is empty for now, but it feels like it was meant to matter.",
    location: "NOWHERE",
    vocab: ["box", "small box", "metal box", "small metal box", "memory box"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 2,
    itemSize: 2,
    isContainer: true,
    isOpenable: true,
    capacity: 10,
  },
  {
    id: BAR_SNAP_OUT_CHEWABLE_ID,
    name: "Snap out of It! chewable",
    description:
      "It's a small, brick-shaped chewable in a breezy white wrapper that promises to get you seeing clear again.",
    location: "NOWHERE",
    vocab: ["snap", "snap out of it", "chewable", "gummy", "tablet", "brick"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    doses: 0,
    meta: {
      consumable: {
        kind: "drug",
        onEmpty: [{ type: "message", text: "That's the last of it." }],
      },
    },
    overrides: {
      eat: ({ state, item }: { state: GameState; item: Item }) =>
        consumeSnapOutChewable(state, item),
    },
  },
];
