import { flashlightOn } from "@game/helpers/gameHelpers";
import { updateItemLocation } from "@game/rules/items";
import { addToInventory, removeFromAllBuckets } from "@game/rules/state";
import type { TickContext } from "@game/types/context";
import type { DoorDefinition } from "@game/types/doorTypes";
import type { GameState } from "@game/types/gameTypes";
import type { Item } from "@game/types/itemTypes";
import type { ParsedCommand } from "@game/types/parserTypes";
import type { Room } from "@game/types/roomTypes";
import { organismLQOverrideTick } from "src/world/Items/creatures/livingQuartersThreeWestOrganisms";
import { BAR_MEMORY_BOX_ID, MANI_PEDI_VOUCHER_ID } from "./barBartenderRewards";
import { barDartboardHasDart } from "./barDarts";
import { BAR_DRINK_MENU_TEXT, barDrinkItems } from "./barDrinks";
import { BAR_JUKEBOX_ITEM_ID } from "./barJukebox";
import {
  applyAdhesiveToBull,
  FREE_DRINK_TICKET_ID,
  getAttachedBullPantsName,
  isBarBullAdhesiveApplied,
  rideBarMechanicalBull,
} from "./barMechanicalBull";
import {
  BAR_SNAP_OUT_CHEWABLE_ID,
  consumeSnapOutChewable,
  dispenseSnapOutChewable,
} from "./barSnapOut";

export {
  BAR_MEMORY_BOX_ID,
  BAR_MEMORY_BOX_MESSAGE,
  BAR_TRIVIA_ANSWER,
  BAR_TRIVIA_PRIZE_MESSAGE,
  BAR_TRIVIA_QUESTION,
  BAR_TRIVIA_SCORE_ID,
  isBarMemoryBoxTopic,
  isCorrectBarTriviaAnswer,
  MANI_PEDI_VOUCHER_ID,
  maybeAwardBarMemoryBox,
  maybeAwardBarTriviaPrize,
} from "./barBartenderRewards";
export {
  barDartboardHasDart,
  giveDartToBarBartender,
  throwDartAtBarDartboard,
} from "./barDarts";
export {
  BAR_DRINK_EXIT_BLOCK_MESSAGE,
  BAR_DRINK_LIMIT_MESSAGE,
  BAR_DRINK_MENU_ENTRIES,
  BAR_DRINK_MENU_TEXT,
  BAR_MODERN_DRINK_MESSAGE,
  barDrinkItems,
  isBarInteriorRoom,
  orderBarDrink,
  playerHasBarDrink,
  shouldBlockLeavingBarWithDrink,
} from "./barDrinks";
export type { BarDrinkMenuEntry } from "./barDrinks";
export {
  BAR_JUKEBOX_ITEM_ID,
  BAR_JUKEBOX_TRACK_NOT_FOUND_MESSAGE,
  BAR_JUKEBOX_TRACKS,
  playBarJukeboxTrack,
  tickBarJukebox,
} from "./barJukebox";
export type { BarJukeboxTrack } from "./barJukebox";
export {
  applyAdhesiveToBull,
  BAR_BULL_ADHESIVE_TRIGGER,
  BAR_BULL_RIDE_PRIZE_MESSAGE,
  BAR_BULL_RIDE_SCORE_ID,
  FREE_DRINK_TICKET_ID,
  getAttachedBullPantsName,
  isBarBullAdhesiveApplied,
  rideBarMechanicalBull,
} from "./barMechanicalBull";
export {
  BAR_SNAP_OUT_CHEWABLE_ID,
  consumeSnapOutChewable,
  dispenseSnapOutChewable,
} from "./barSnapOut";

export const BAR_FLOOR_HATCH_DOOR_ID = "BarFloorHatchDoor";
export const BAR_CONTRABAND_ID = "BarContraband";
export const FAKE_ID_ID = "FakeID";

function isBarFloorHatchOpen(state: GameState): boolean {
  return state.worldState.doors[BAR_FLOOR_HATCH_DOOR_ID]?.isOpen === true;
}

function openBarContrabandPackage(state: GameState): {
  state: GameState;
  message: string;
} {
  let next: GameState = {
    ...state,
    player: {
      ...state.player,
      inventory: removeFromAllBuckets(
        state.player.inventory,
        BAR_CONTRABAND_ID,
      ),
    },
  };

  next = updateItemLocation(next, BAR_CONTRABAND_ID, "NOWHERE");
  next = updateItemLocation(next, FAKE_ID_ID, "INVENTORY");
  next = addToInventory(next, FAKE_ID_ID);

  return {
    state: next,
    message: "You unwrap the package, and discard the paper",
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
    id: BAR_CONTRABAND_ID,
    name: "small wrapped package",
    description:
      "It's a small package of some sort, no bigger than a deck of cards, wrapped tightly in paper. Written on the paper in ink is the name 'Yolonope'.",
    location: "seeded",
    vocab: ["package", "packet", "paper"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1000,
    itemSize: 20,
    isOpenable: true,
    overrides: {
      open: ({ state }: { state: GameState }) =>
        openBarContrabandPackage(state),
    },
  },
  {
    id: FAKE_ID_ID,
    name: "fake ID",
    description:
      "It's a fake ID, a good fake, but still a fake. The information on it is for Yolonope Fick. It has her current living quarters on level two, Rotation K",
    location: "seeded",
    vocab: ["fake", "id", "yolonope id"],
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
      const adhesive = isBarBullAdhesiveApplied(state)
        ? " The saddle has a clear, tacky sheen of adhesive across it."
        : "";
      const pants = pantsName
        ? ` A pair of pants is stuck fast to the saddle.`
        : "";
      return `The bull is big, heavy, and covered in worn leather. It is currently sitting idle.${adhesive}${pants}`;
    },
    describeScenery: (state) => {
      const pantsName = getAttachedBullPantsName(state);
      const adhesive = isBarBullAdhesiveApplied(state)
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
      const hasDart = barDartboardHasDart(state);
      return hasDart
        ? "The cork dartboard hangs on the southern wall. The red dart is stuck in it, quivering slightly."
        : "The cork dartboard hangs on the southern wall, though you don't see any darts.";
    },
    describeScenery: (state) => {
      const hasDart = barDartboardHasDart(state);
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
    id: "AllPurposeAdhesive",
    name: "tube of 'Crazy Goo'",
    description: "The tube is labeled 'Crazy Goo'",
    initialDescription: "A small tube of adhesive sits on the shelf.",
    location: "seeded",
    vocab: ["adhesive", "glue", "tube", "crazy", "goo", "crazy goo"],
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
    id: MANI_PEDI_VOUCHER_ID,
    name: "nail salon voucher",
    description:
      "It says if you present it at Keratin Kindness you get a free mani-pedi, and the offer doesn't expire.",
    location: "seeded",
    vocab: ["voucher", "gift card"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
  },
  {
    id: FREE_DRINK_TICKET_ID,
    name: "free drink ticket",
    description:
      "It says if you present it at a bar called 'Whiskey Tango' then you get a free drink, and the offer doesn't expire.",
    location: "seeded",
    vocab: ["free", "drink", "ticket"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
  },
  ...barDrinkItems,
  {
    id: "TShirtPrize",
    name: "prize t-shirt",
    description:
      "It's a good quality cotton t-shirt, cream colored, and sporting the words 'I Got So Drunk I Became Delirious and Hallucinated Being Thrown Into Six Different Drinks Before Getting Swallowed Alive And On The Last One I Even Got Thrown Up Again, And All I Got Was This Lousy, But Good Quality, T-Shirt That Appeared In My Inventory When I Woke Up Completely Sober'.",
    readableText:
      "I Got So Drunk I Became Delirious and Hallucinated Being Thrown Into Six Different Drinks\nBefore Getting Swallowed Alive And On The Last One I Even Got Thrown Up Again,\nAnd All I Got Was This Lousy, But Good Quality, T-Shirt That Appeared In My Inventory\nWhen I Woke Up Completely Sober",
    location: "seeded",
    vocab: ["t-shirt", "prize", "gift", "shirt"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isReadable: true,
    isWearable: true,
    clothingSlot: "torso",
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
    id: BAR_JUKEBOX_ITEM_ID,
    name: "colorful jukebox",
    description:
      "The jukebox is a big tombstone-shaped affair, banded in colorful neon with a front-facing song selector covered in square white buttons. Its printed track index is warped, scorched, and unreadable.",
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
      kind: "bar-jukebox",
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
