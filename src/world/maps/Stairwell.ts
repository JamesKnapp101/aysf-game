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
import { resolveLevelFiveSpillLight } from "./levelFive/levelFiveLighting";
import { hasLevelTwoBombDetonated } from "./levelTwo/levelTwoBomb";
import {
  ELEVATOR_INTERIOR_DESCRIPTION,
  elevatorItems,
} from "./stairwell/elevator";

function describeStairTwo(state: GameState): string {
  if (!hasLevelTwoBombDetonated(state)) {
    return "This is the stair landing for Level Two, where a set of emergency lights cast the stairwell in a dim glow. The stairs, flanked by a metal railing, continue up and down.";
  }

  return "This is the stair landing for Level Two, where a set of emergency lights cast the stairwell in a dim glow. The stairs, flanked by a metal railing, also continue up.";
}

function openTeleportationTerminal({ state }: { state: GameState }) {
  return {
    state,
    message: "You open the translocation terminal.",
    overlay: { kind: "teleportation-terminal" as const },
  };
}

export const STAIRWELL: WorldChunk = {
  items: [
    ...elevatorItems,
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
        "This is the topmost stair landing. A set of emergency lights cast the stairwell in a dim glow. Sitting on the floor with her back against the wall next to the western passage is the body of a woman dressed in some kind of uniform. Her arms are crossed over her knees, and her forehead is resting on her forearms. Her shoulder-length black hair covers her face.",
      exits: [
        { direction: "down", toRoomId: "StairTwo" },
        { direction: "west", toRoomId: "LevelOneStairAccess" },
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
        { direction: "west", toRoomId: "LevelTwoStairAccess" },
      ],
    },
    {
      id: "StairThree",
      name: "Stairs Level Three",
      description:
        "This is the stair landing for Level Three. A set of emergency lights cast the stairwell in a dim glow. The stairs, flanked by a metal railing, continue up and down.",
      exits: [
        { direction: "up", toRoomId: "StairTwo" },
        { direction: "down", toRoomId: "StairFour" },
        { direction: "west", toRoomId: "LevelThreeStairAccess" },
      ],
    },
    {
      id: "StairFour",
      name: "Stairs Level Four",
      description:
        "This is the stair landing for Level Four. A set of emergency lights cast the stairwell in a dim glow. An open passage to the west leads to the elevator lobby beneath a plastic sign labeled '4'.",
      exits: [
        { direction: "up", toRoomId: "StairThree" },
        { direction: "down", toRoomId: "StairFive" },
        { direction: "west", toRoomId: "LevelFourStairAccess" },
      ],
    },
    {
      id: "StairFive",
      name: "Stairs Level Five",
      description: "",
      describe: (state) => {
        const lobbyLight = state.worldState.powerRestoredSections[
          "lights-level-five"
        ]
          ? "the lit elevator lobby beyond"
          : "the dim elevator lobby beyond, illuminated mostly by light leaking through from the stairwell";
        return `This is the stair landing for the fifth floor, where emergency lights flicker over the walls. An open passage to the west reveals ${lobbyLight}, beneath a plastic sign labeled '5'.\n\nThe stairs, flanked by a metal railing, continue up and down.`;
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
        { direction: "west", toRoomId: "LevelSixStairAccess" },
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
        { direction: "west", toRoomId: "LevelSevenStairAccess" },
      ],
    },
    {
      id: "StairWellSeven",
      name: "Bottom of Stairwell",
      ambientLightLevel: "very-dim",
      resolveAmbientLightLevel: (state) =>
        resolveLevelFiveSpillLight(state, "very-dim"),
      description:
        "This is the dimly lit bottom of a long stairwell, where the tiled floor is covered in grit and the dusty corners are shrouded in shadow. Above you, the stairwell towers in a narrow, boxy spiral that climbs many floors, stretching up into the gloom. Tucked beneath the last flight of stairs are several stacks of boxes bound with metal bands, each covered in dust and looking affected by mold or mildew. Nothing down here has been touched in a long time. Curled up next to the boxes is the body of an older man dressed in boxers, a t-shirt, and a plush blue robe. His unshaven face is tinted blue, and his hair is greasy and unkempt. In the middle of the tiled landing, a man's body lies crumpled in a heap, having fallen from somewhere above. He seems to have landed on his head, which has cracked like an egg, and a pool of blood, tacky but not quite dry, has formed around it.",
      descriptionShort:
        "The dimly lit bottom of a long stairwell, where the body of a man lay sprawled.",
      exits: [{ direction: "up", toRoomId: "StairSeven" }],
    },

    // STAIR ACCESS / LOBBIES

    {
      id: "LevelOneStairAccess",
      name: "Level One Stair Access",
      description: "This is a small elevator lobby. [[SCENERY]]",
      exits: [
        { direction: "north", toRoomId: "Elevator" },
        { direction: "east", toRoomId: "StairOne" },
        { direction: "west", doorId: "BridgeStairDoors" },
      ],
    },
    {
      id: "LevelTwoStairAccess",
      name: "Level Two Stair Access",
      description: `You are standing in a dimly lit lobby with an arched ceiling and a tiled floor the color of unpolished ivory. [[SCENERY]]`,
      exits: [
        { direction: "north", toRoomId: "Elevator" },
        { direction: "east", toRoomId: "StairTwo" },
        { direction: "west", doorId: "StairDoorTwo" },
      ],
    },
    {
      id: "LevelThreeStairAccess",
      name: "Level Three Stair Access",
      description: `You are standing in a dimly lit lobby with an arched ceiling and a tiled floor the color of unpolished ivory. [[SCENERY]]\n\nBeyond the western access door is a corridor with flickering overhead lights.`,
      exits: [
        { direction: "north", toRoomId: "Elevator" },
        { direction: "east", toRoomId: "StairThree" },
        { direction: "west", doorId: "StairDoorThree" },
        { direction: "southeast", toRoomId: "TPADTerminal" },
      ],
    },
    {
      id: "TPADTerminal",
      name: "Terminal",
      description: `This is a large, open area whose walls and floor are covered in white ceramic tile. The terminal is lit by a series of dimmed overhead lights that cast shadows across a floor marked with queue lines. Everything steers toward a slightly raised platform along the northern wall.`,
      exits: [{ direction: "northwest", toRoomId: "LevelThreeStairAccess" }],
    },
    {
      id: "LevelFourStairAccess",
      name: "Level Four Stair Access",
      description:
        "This is a small elevator lobby. [[SCENERY]] An open passage to the east is marked by a plastic sign reading 'STAIRS'.",
      exits: [
        { direction: "north", toRoomId: "Elevator" },
        { direction: "east", toRoomId: "StairFour" },
        { direction: "west", doorId: "StairDoorFour" },
      ],
    },
    {
      id: "LevelFiveStairAccess",
      name: "Level Five Stair Access",
      ambientLightLevel: "dim",
      resolveAmbientLightLevel: (state) =>
        resolveLevelFiveSpillLight(state, "dim"),
      description:
        "This is a small elevator lobby. [[SCENERY]] An open passage to the east is marked by a plastic sign reading 'STAIRS'.",
      exits: [
        { direction: "north", toRoomId: "Elevator" },
        { direction: "east", toRoomId: "StairFive" },
        { direction: "west", doorId: "EngineeringDoors" },
      ],
    },
    {
      id: "LevelSixStairAccess",
      name: "Level Six Stair Access",
      description: `This is a small lobby area for accessing an elevator but while there are signs of many people passing through it is eerily quiet now. [[SCENERY]] Beyond the western access door, a corridor heads away from the lobby and bends further down.`,
      exits: [
        { direction: "north", toRoomId: "Elevator" },
        { direction: "east", toRoomId: "StairSix" },
        { direction: "west", doorId: "StairDoorSix" },
      ],
    },
    {
      id: "LevelSevenStairAccess",
      name: "Level Seven Stair Access",
      description:
        "This is a small elevator lobby. [[SCENERY]] The atmosphere here is rather sterile and drab, and it manages to convey the feeling that this area is perhaps not quite as well traveled as some of the other parts of the ship. In stark contrast, you can see the walls and floor to the west are splattered with a large amount of blood, and a body lies in a heap there right where the corridor bends to the south. An open passage to the east is marked by a plastic sign reading 'STAIRS'. Fine ice crystals cover every surface here, and the air is dangerously cold; something in the stasis chamber or cryonics labs must have ruptured.",
      exits: [
        { direction: "north", toRoomId: "Elevator" },
        { direction: "east", toRoomId: "StairSeven" },
        { direction: "west", doorId: "CryoStairDoors" },
      ],
    },

    // SHAFT & ELEVATOR

    {
      id: "ShaftFive",
      name: "Elevator Shaft Level Five",
      description:
        "This is an elevator shaft which continues into darkness above you. You are standing on a disused service platform. Stenciled in paint on the west wall is a large yellow number '5'. On the north wall are a series of metal rungs which extend upward, into the darkness. A sealed emergency access panel lies at your feet.",
      exits: [{ direction: "up", toRoomId: "ShaftFour" }],
    },
    {
      id: "Elevator",
      name: "Elevator",
      description: ELEVATOR_INTERIOR_DESCRIPTION,
      // The movement registry redirects SOUTH to the saved boarding lobby.
      exits: [{ direction: "south", toRoomId: "LevelFiveStairAccess" }],
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
    id: "levelTwoSecurityDoor",
    name: "security door",
    description: `The heavy western access door bears a notice warning of a potential explosive device.`,
    sceneryDescription: `[[newline]]The western exit is blocked by a heavy security door with a notice posted at eye level.`,
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
      "kiosk",
      "terminal",
      "translocation terminal",
      "teleportation terminal",
    ],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isUseable: true,
    overrides: {
      use: openTeleportationTerminal,
    },
    meta: {
      kind: "teleportation-terminal",
    },
  },

  {
    id: "levelThreeTerminalArchway",
    name: "terminal entrance",
    description: `The area inside looks very well travelled, and is set up for queueing.`,
    sceneryDescription: `To the southeast is a long open archway that looks into what appears to be some sort of transit platform centered around a row of large colored disks along the far wall, each large enough to stand on.`,
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
    sceneryDescription: `Over the southeast archway is a sign in white block letters that glow softly, spelling out the word 'TERMINAL.'`,
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
