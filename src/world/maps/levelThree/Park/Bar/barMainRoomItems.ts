import type { GameState } from "@game/types/gameTypes";
import type { Item } from "@game/types/itemTypes";
import { barDartboardHasDart } from "./barDarts";
import { BAR_DRINK_MENU_TEXT } from "./barDrinks";
import { BAR_FLOOR_HATCH_DOOR_ID } from "./barConstants";
import { getAttachedBullPantsName, isBarBullAdhesiveApplied, rideBarMechanicalBull } from "./barMechanicalBull";

function isBarFloorHatchOpen(state: GameState): boolean {
  return state.worldState.doors[BAR_FLOOR_HATCH_DOOR_ID]?.isOpen === true;
}

export const barMainRoomItems: Item[] = [
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
];
