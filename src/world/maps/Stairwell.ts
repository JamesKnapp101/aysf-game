import { Item } from "@game/types/itemTypes";
import type { GameState, WorldChunk } from "../../game/types/gameTypes";
import { badgeScannerDoors } from "../doors/badgeScannerDoors";
import { stairwellDoors } from "../doors/stairwellDoors";
import { badgeItems } from "../Items/badges";
import { corpseItems } from "../Items/bodies";
import { clothingItems } from "../Items/clothing";
import { creatureItems } from "../Items/creatures";
import { drugItems } from "../Items/drugs";
import { specialItems } from "../Items/gadgets";
import { stairwellBottomItems } from "../Items/levelSevenMisc";
import { teleportationPadItems } from "../Items/teleportationPads";
import { weaponItems } from "../Items/weapons";
import { experienceRooms, experienceRoomsItems } from "./experienceRooms";
import { hasLevelTwoBombDetonated } from "./levelTwo/levelTwoBomb";

function describeStairTwo(state: GameState): string {
  if (!hasLevelTwoBombDetonated(state)) {
    return "This is the stair landing for Level Two. A set of emergency lights cast the stairwell in a dim glow. There is a door to the west with the words 'LIVING QUARTERS' printed on it, and mounted over it is a plastic sign labeled '2'. A warning panel beside the door flashes red, cycling the words 'POTENTIAL EXPLOSIVE DEVICE - KEEP OUT.' The stairs, flanked by a metal railing, continue up and down.";
  }

  return "This is the stair landing for Level Two. A set of emergency lights cast the stairwell in a dim glow. There is a door to the west with the words 'LIVING QUARTERS' printed on it, and mounted over it is a plastic sign labeled '2'. The area around the edge of the doorway is slightly blackened, and there is a lingering burnt smell in the landing here. A series of blackened footprints lead from the door to the stairs and then down. The stairs, flanked by a metal railing, also continue up.";
}

export const STAIRWELL: WorldChunk = {
  items: [
    ...creatureItems,
    ...badgeItems,
    ...corpseItems,
    ...drugItems,
    ...specialItems,
    ...clothingItems,
    ...weaponItems,
    ...teleportationPadItems,
    ...stairwellBottomItems,
    ...experienceRoomsItems,
  ],
  doors: [...stairwellDoors, ...badgeScannerDoors],
  teleportPads: [],
  rooms: [
    ...experienceRooms,
    {
      id: "StairOne",
      name: "Stairs Level One",
      description:
        "This is the topmost stair landing. A set of emergency lights cast the stairwell in a dim glow. Sitting on the floor with her back against the wall next to the door is the body of a woman dressed in some kind of uniform. Her arms are crossed over her knees, and her forehead is resting on her forearms. Her shoulder-length black hair covers her face.",
      exits: [
        { direction: "down", toRoomId: "StairTwo" },
        { direction: "west", doorId: "BridgeStairDoors" },
      ],
    },
    {
      id: "StairTwo",
      name: "Stairs Level Two",
      description: "",
      describe: (state) => describeStairTwo(state),
      exits: [
        { direction: "up", toRoomId: "StairOne" },
        { direction: "down", toRoomId: "StairThree" },
        { direction: "west", doorId: "StairDoorTwo" },
      ],
    },
    {
      id: "StairThree",
      name: "Stairs Level Three",
      description:
        "This is the stair landing for Level Three. A set of emergency lights cast the stairwell in a dim glow. The stairs, flanked by a metal railing, continue up and down. A series of what look like sooty footprints can be seen on the stairs leading up and also down. It's difficult to tell which direction they head in.",
      exits: [
        { direction: "up", toRoomId: "StairTwo" },
        { direction: "down", toRoomId: "StairFour" },
        { direction: "west", doorId: "StairDoorThree" },
      ],
    },
    {
      id: "StairFour",
      name: "Stairs Level Four",
      description:
        "This is the stair landing for Level Four. A set of emergency lights cast the stairwell in a dim glow. There is a door to the west with the words 'BIOSPHERE/POWER GRID' printed on it and mounted over it is a plastic sign labeled '4'. A series of sooty footprints can be seen on the steps coming from the level above, and there are black streaks on the railing which flanks the stairs which also continue down. The footprints lead to a burned body which lies face down in the middle of the landing, its blackened hands extended in front of it, curled into claws.",
      exits: [
        { direction: "up", toRoomId: "StairThree" },
        { direction: "down", toRoomId: "StairFive" },
        { direction: "west", doorId: "StairDoorFour" },
      ],
    },
    {
      id: "StairFive",
      name: "Stairs Level Five",
      description: "",
      describe: (state) => {
        let desc = `This is the stair landing for the fifth floor, where a set of emergency lights cast the stairwell in a dim glow that flickers every so often. There is a door to the west with the word 'REACTOR PLATFORM' printed on it, and mounted over it is a plastic sign labeled '5'. There is a badge scanner mounted next to the door with a violet strip, but it appears to have been damaged, scorched around the edges and hanging from wires at an odd angle. The door is wide open, `;
        const levelFiveStairAccessLit =
          state.worldState.darkRooms["LevelFiveStairAccess"] === true;
        if (levelFiveStairAccessLit) {
          desc += `revealing only darkness beyond, and you can hear something moving in there, even if you can't see it. Whatever is there shifts unnaturally, and seems to gravitate toward you whenever you move, as if it were pressed right to the edge of the light. `;
        } else {
          desc += `revealing a lit elevator lobby on the other side.`;
        }
        return (desc += `\n\nThe stairs, flanked by a metal railing, continue up and down.`);
      },
      exits: [
        { direction: "up", toRoomId: "StairFour" },
        { direction: "down", toRoomId: "StairSix" },
        { direction: "west", toRoomId: "LevelFiveStairAccess" },
      ],
    },
    {
      id: "StairSix",
      name: "Stairs Level Six",
      description:
        "This is the stair landing for the sixth floor, where a set of emergency lights cast shadows in the dim glow. The stairs continue up and down, [[SCENERY]]",
      exits: [
        { direction: "up", toRoomId: "StairFive" },
        { direction: "down", toRoomId: "StairSeven" },
        { direction: "west", doorId: "StairDoorSix" },
      ],
    },
    {
      id: "StairSeven",
      name: "Stairs Level Seven",
      description:
        "The stairwell landing here looks clean but rarely used, with stairs heading both up and down, flanked by a smooth metal railing. Looking down the stairs you can see what looks like blood spattered across the steps near the bottom.",
      descriptionShort: "",
      exits: [
        { direction: "up", toRoomId: "StairSix" },
        { direction: "down", toRoomId: "StairWellSeven" },
        { direction: "west", doorId: "CryoStairDoors" },
      ],
    },
    {
      id: "StairWellSeven",
      name: "Bottom of Stairwell",
      description:
        "This is the dimly lit bottom of a long stairwell, where the tiled floor is covered in grit and the dusty corners are shrouded in shadow. Above you, the stairwell towers in a narrow, boxy spiral that climbs many floors, stretching up into the gloom. [[SCENERY]]",
      descriptionShort:
        "The dimly lit bottom of a long stairwell, where the body of a man lay sprawled.",
      exits: [{ direction: "up", toRoomId: "StairSeven" }],
    },

    // STAIR ACCESS / LOBBIES

    {
      id: "LevelOneStairAccess",
      name: "Level One Stair Access",
      description:
        "This is a small lobby area for accessing an elevator; there is a set of elevator doors to the north, next to which is a call button. An LCD display mounted above the elevator doors probably indicated the current floor the elevator is on, but it is currently dark.",
      exits: [
        { direction: "east", doorId: "BridgeStairDoors" },
        { direction: "west", toRoomId: "LevelOneCorridorOne" },
      ],
    },
    {
      id: "LevelTwoStairAccess",
      name: "Level Two Stair Access",
      description: `You are standing in a dimly lit lobby with an arched ceiling and a tiled floor the color of unpolished ivory. [[SCENERY]]`,
      exits: [{ direction: "east", doorId: "StairDoorTwo" }],
    },
    {
      id: "LevelThreeStairAccess",
      name: "Level Three Stair Access",
      description: `You are standing in a dimly lit lobby with an arched ceiling and a tiled floor the color of unpolished ivory.[[SCENERY]]\n\nAn open doorway to the west leads to a corridor with flickering overhead lights.`,
      exits: [
        { direction: "east", doorId: "StairDoorThree" },
        { direction: "west", toRoomId: "LevelThreeCorridorSeven" },
        { direction: "north", toRoomId: "TPADTerminal" },
      ],
    },
    {
      id: "TPADTerminal",
      name: "Terminal",
      description: `This is a large, open area whose walls and floor are covered in white ceramic tile. The terminal is lit by a series of dimmed overhead lights that cast shadows across a floor marked with queue lines. Everything steers toward a slightly raised platform along the northern wall.`,
      exits: [{ direction: "south", toRoomId: "LevelThreeStairAccess" }],
    },
    {
      id: "LevelFourStairAccess",
      name: "Level Four Stair Access",
      description:
        "This is a small lobby area for accessing an elevator; there is a set of elevator doors to the north, next to which is a call button. An LCD display mounted above the elevator doors probably indicated the current floor the elevator is on, but it is currently dark. There is a door to the east over which is mounted a plastic sign reading 'STAIRS'. Smeared on the north wall next to the elevator doors are the words 'They WAnt bloOD'. The words appear to be written in blood.",
      exits: [
        { direction: "east", doorId: "StairDoorFour" },
        { direction: "west", toRoomId: "LevelFourCorridorTwo" },
      ],
    },
    {
      id: "LevelFiveStairAccess",
      name: "Level Five Stair Access",
      description:
        "This is a small lobby area for accessing an elevator; there is a set of elevator doors to the north, next to which is a call button. The elevator doors are hanging open, allowing entry to the elevator car beyond which is stuck at this floor. An LCD display mounted above the elevator doors probably indicated the current floor the elevator is on, but it is currently dark. There is a door to the east over which is mounted a plastic sign reading 'STAIRS'.",
      exits: [
        { direction: "east", doorId: "StairDoorFive" },
        { direction: "north", toRoomId: "Elevator" },
        { direction: "west", toRoomId: "EngCorridorOne" },
      ],
    },
    {
      id: "LevelSixStairAccess",
      name: "Level Six Stair Access",
      description: `This is a small lobby area for accessing an elevator but while there are signs of many people passing through it is eerily quiet now. [[SCENERY]] A corridor heads off to the west, away from the lobby, and you can see that it bends further down.`,
      exits: [
        { direction: "east", doorId: "StairDoorSix" },
        { direction: "west", toRoomId: "LevelSixCorridorBend" },
      ],
    },
    {
      id: "LevelSevenStairAccess",
      name: "Level Seven Stair Access",
      description:
        "This is a small lobby area for accessing an elevator; there is a set of elevator doors to the north, next to which is a call button. An LCD display mounted above the elevator doors probably indicated the current floor the elevator is on, but it is currently dark. The atmosphere here is rather sterile and drab, and it manages to convey the feeling that this area is perhaps not quite as well traveled as some of the other parts of the ship. In stark contrast, you can see the walls and floor to the west are splattered with a large amount of blood, and a body lies in a heap there right where the corridor bends to the south. There is a door to the east over which is mounted a plastic sign reading 'STAIRS'. Fine ice crystals cover every surface here, and the air is dangerously cold; something in the stasis chamber or cryonics labs must have ruptured.",
      exits: [
        { direction: "east", doorId: "CryoStairDoors" },
        { direction: "west", toRoomId: "LevelSevenCorridorBend" },
      ],
    },

    // SHAFT & ELEVATOR

    {
      id: "ShaftFive",
      name: "Elevator Shaft Level Five",
      description:
        "This is an elevator shaft which continues into darkness above you. Currently, you are standing on top of the elevator car which is stuck at this floor. Stenciled in paint on the west wall is a large yellow number '5'. On the north wall are a series of metal rungs which extend upward, into the darkness. There is an emergency access panel at your feet which leads into the elevator car.",
      exits: [
        { direction: "up", toRoomId: "ShaftFour" },
        { direction: "down", toRoomId: "Elevator" },
      ],
    },
    {
      id: "Elevator",
      name: "Elevator",
      description:
        "This is the interior of a passenger elevator. There is a panel of buttons, all dark, to the left of a set of elevator doors which hang open to the south. Above you, in the rear left corner of the elevator is a small access panel.",
      exits: [
        { direction: "up", toRoomId: "ShaftFive" },
        { direction: "south", toRoomId: "LevelFiveStairAccess" },
      ],
    },
    {
      id: "ShaftFour",
      name: "Elevator Shaft Level Four",
      description:
        "This is an elevator shaft which continues into darkness above and below you. Stenciled in paint on the west wall is a large yellow number '4'. There are a pair of elevator doors on the south wall which are closed, and behind them on the north wall are a series of metal rungs which you are currently clinging to. These form a ladder leading upward and downward.",
      exits: [
        { direction: "up", toRoomId: "ShaftThree" },
        { direction: "down", toRoomId: "ShaftFive" },
      ],
    },
    {
      id: "ShaftThree",
      name: "Elevator Shaft Level Three",
      description:
        "This is an elevator shaft which continues into darkness above and below you. Stenciled in paint on the west wall is a large yellow number '3'. There are a pair of elevator doors on the south wall which are closed, and behind them on the north wall are a series of metal rungs which you are currently clinging to. These form a ladder leading upward and downward.",
      exits: [
        { direction: "up", toRoomId: "ShaftTwo" },
        { direction: "down", toRoomId: "ShaftFour" },
      ],
    },
    {
      id: "ShaftTwo",
      name: "Elevator Shaft Level Two",
      description:
        "This is an elevator shaft which continues into darkness above and below you. Stenciled in paint on the west wall is a large yellow number '2'. The south wall has been ruptured here, and the elevator doors are off their track, hanging to one side. The doors and doorframe are blackened from some sort of intense heat, and the whole shaft is filled with a lingering, acrid smoke smell.",
      exits: [
        { direction: "up", toRoomId: "ShaftOne" },
        { direction: "down", toRoomId: "ShaftThree" },
        { direction: "south", toRoomId: "LevelTwoStairAccess" },
      ],
    },
    {
      id: "ShaftOne",
      name: "Elevator Shaft Level One",
      description:
        "You have reached the top of the elevator shaft which continues into darkness below you. Stenciled in paint on the west wall is a large yellow number '1'. There are a pair of elevator doors on the south wall which are closed, and behind them on the north wall are a series of metal rungs which you are currently clinging to. These form a ladder leading downward.",
      exits: [{ direction: "down", toRoomId: "ShaftTwo" }],
    },
  ],
};

export const stairwellItems: Item[] = [
  {
    id: "levelTwoElevators",
    name: "elevators",
    description: `There are little up and down arrows above each door, all dark, along with the call buttons. Something must have lost power, or gotten damaged.`,
    sceneryDescription: `To the south are a row of three elevator doors, each made of polished steel, all closed, and none of the buttons are lit.`,
    location: "LevelTwoStairAccess",
    vocab: ["elevator", "elevators", "doors", "door"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    meta: {
      sceneryDescriptionOrder: 1,
    },
  },
  {
    id: "levelTwoLCD",
    name: "lcd screen",
    description: `It displays the message 'ELEVATOR FAILURE.' The screen is speckled with dead pixels.`,
    sceneryDescription: `An LCD screen mounted above the elevator doors is tinted red, and displays the message 'ELEVATOR FAILURE.'`,
    readableText: `ELEVATOR FAILURE`,
    location: "LevelTwoStairAccess",
    vocab: ["lcd", "screen", "lcd screen", "message"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isReadable: true,
    meta: {
      sceneryDescriptionOrder: 2,
    },
  },
  {
    id: "levelTwoSecurityDoor",
    name: "security door",
    description: `It displays the message 'ELEVATOR FAILURE.' The screen is speckled with dead pixels.`,
    sceneryDescription: `[[newline]]The western exit to blocked by a heavy security door with a notice posted at eye level.`,
    readableText: `DANGER: Potential explosive device. Keep Out by order of Aeneas Security`,
    location: "LevelTwoStairAccess",
    vocab: ["door", "security", "notice", "message"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isReadable: true,
    meta: {
      sceneryDescriptionOrder: 3,
    },
  },
  {
    id: "TelepadTerminal",
    name: "terminal",
    description:
      "It's a large touchscreen that lets travellers select a destination.",
    sceneryDescription: `At the gate to access the colored disks is a kiosk that houses a touchpad terminal. A colorful sign over the terminal invites you to 'Select Your Destination.'`,
    location: "TPADTerminal",
    vocab: [
      "kisosk",
      "terminal",
      "translocation terminal",
      "teleportation terminal",
    ],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    meta: {
      kind: "teleportation-terminal",
    },
  },
  {
    id: "levelThreeElevators",
    name: "elevators",
    description: `There are little up and down arrows above each door, all dark, along with the call buttons. Something must have lost power, or gotten damaged.`,
    sceneryDescription: `To the south are a row of three elevator doors, each made of polished steel, all closed, and none of the buttons are lit.`,
    location: "LevelThreeStairAccess",
    vocab: ["elevator", "elevators", "doors", "door"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    meta: {
      sceneryDescriptionOrder: 1,
    },
  },
  {
    id: "levelThreeLCD",
    name: "lcd screen",
    description: `It displays the message 'ELEVATOR FAILURE.' The screen is speckled with dead pixels.`,
    sceneryDescription: `An LCD screen mounted above the elevator doors is tinted red, and displays the message 'ELEVATOR FAILURE.'`,
    readableText: `ELEVATOR FAILURE`,
    location: "LevelThreeStairAccess",
    vocab: ["lcd", "screen", "lcd screen", "message"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isReadable: true,
    meta: {
      sceneryDescriptionOrder: 2,
    },
  },
  {
    id: "levelThreeTerminalArchway",
    name: "terminal entrance",
    description: `The area inside looks very well travelled, and is set up for queueing.`,
    sceneryDescription: `To the north is a long open archway that looks into what appears to be some sort of transit platform centered around a row of large colored disks along the far wall, each large enough to stand on.`,
    location: "LevelThreeStairAccess",
    vocab: ["entrance", "terminal", "terminal entrance", "archway", "arch"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    meta: {
      sceneryDescriptionOrder: 3,
    },
  },
  {
    id: "levelThreeTerminalSign",
    name: "terminal sign",
    description: `The 'E' in 'TERMINAL' flickers ever so slightly.`,
    sceneryDescription: `Over the north archway is a sign in white block letters that glow softly, spelling out the word 'TERMINAL.'`,
    location: "LevelThreeStairAccess",
    vocab: ["sign"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    meta: {
      sceneryDescriptionOrder: 4,
    },
  },
];
