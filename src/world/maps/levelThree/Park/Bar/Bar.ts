import type { DoorDefinition } from "@game/types/doorTypes";
import type { GameState } from "@game/types/gameTypes";
import type { Item } from "@game/types/itemTypes";
import type { Room } from "@game/types/roomTypes";
import { barBasementItems } from "./barBasementItems";
import { barBathroomItems } from "./barBathroomItems";
import { BAR_FLOOR_HATCH_DOOR_ID } from "./barConstants";
import { barEntranceItems } from "./barEntranceItems";
import { barLoungeItems } from "./barLoungeItems";
import { barMainRoomItems } from "./barMainRoomItems";
import { barSeededItems } from "./barSeededItems";

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
export { BAR_CONTRABAND_ID, BAR_FLOOR_HATCH_DOOR_ID, FAKE_ID_ID } from "./barConstants";

function isBarFloorHatchOpen(state: GameState): boolean {
  return state.worldState.doors[BAR_FLOOR_HATCH_DOOR_ID]?.isOpen === true;
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
  ...barSeededItems,
  ...barEntranceItems,
  ...barMainRoomItems,
  ...barBasementItems,
  ...barLoungeItems,
  ...barBathroomItems,
];
