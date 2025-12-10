import { badgeScannerDoors } from "../doors/badgeScannerDoors";
import { stairwellDoors } from "../doors/stairwellDoors";
import { badgeItems } from "../objects/badges";
import { corpseItems } from "../objects/bodies";
import { drugItems } from "../objects/drugs";
import { specialItems } from "../objects/gadgets";
import type { WorldChunk } from "../types";

export const STAIRWELL: WorldChunk = {
  items: [...badgeItems, ...corpseItems, ...drugItems, ...specialItems],
  doors: [...stairwellDoors, ...badgeScannerDoors],
  teleportPads: [],
  rooms: [
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
      description:
        "This is the stair landing for Level Two. A set of emergency lights cast the stairwell in a dim glow. There is a door to the west with the words 'LIVING QUARTERS' printed on it, and mounted over it is a plastic sign labeled '2'. The area around the edge of the doorway is slightly blackened, and there is a lingering burnt smell in the landing here. A series of blackened footprints lead from the door to the stairs and then down. The stairs, flanked by a metal railing, also continue up.",
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
      description:
        "This is the stair landing for Level Five. A set of emergency lights cast the stairwell in a dim glow. There is a door to the west with the word 'ENGINEERING' printed on it, and mounted over it is a plastic sign labeled '5'. The stairs, flanked by a metal railing, continue up and down.",
      exits: [
        { direction: "up", toRoomId: "StairFour" },
        { direction: "down", toRoomId: "StairSix" },
        { direction: "west", doorId: "StairDoorFive" },
      ],
    },
    {
      id: "StairSix",
      name: "Stairs Level Six",
      description:
        "This is the stair landing for Level Six. A set of emergency lights cast the stairwell in a dim glow. There is a door to the west with the word 'STORAGE' printed on it and mounted over it is a plastic sign labeled '6'. The stairs, flanked by a metal railing, continue up and down, where what looks like blood is spattered across some of the steps.",
      // The original had a before-rule blocking if InnerDoor & OuterDoor are open.
      // That logic can be handled elsewhere; here we just wire the exits.
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
        "This is the stair landing for Level Seven. A set of emergency lights cast the stairwell in a dim glow. There is a door to the west here which is different from the other doors; it has no handle and mounted next to it is a badge scanner of some kind with a white strip across its top. The door is printed with the word 'CRYONICS', and mounted over it is a plastic sign labeled '7'. The stairs, flanked by a metal railing, continue up, and down to a small enclosed area below. There is what looks like blood covering a portion of the steps about midway down.",
      exits: [
        { direction: "up", toRoomId: "StairSix" },
        { direction: "down", toRoomId: "StairWellSeven" },
        { direction: "west", doorId: "CryoStairDoors" },
      ],
    },
    {
      id: "StairWellSeven",
      name: "Bottom Stairwell",
      description:
        "This is the very bottom of the stairs; there are no exits here except back up the way you came. It appears this place may have once been used as a small storage area, but now it is covered in dust and disused. A man's body lies in a crumpled heap here, in the center of the landing where it appears to have fallen from somewhere up above. The body's arms and legs are sprawled at odd angles, and it looks like he landed on his head, where a pool of blood, tacky but not quite dry, has formed. He is wearing a brown jumpsuit with a name patch sewn onto the breast.",
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
        // north is blocked elevator doors in the original
      ],
    },
    {
      id: "DestroyedCorridor",
      name: "Destroyed Corridor",
      description:
        "This area has been almost completely destroyed; almost as soon as you enter you are confronted with a wall of twisted debris which blocks all further progress west, and what remains of the corridor has been completely burned, the walls, floor, and ceiling black with soot. You can just make out one corner of a set of elevator doors, visible at the edge of the debris where they've twisted off their track. There is a door to the east over which is mounted a plastic sign reading 'STAIRS'.",
      exits: [
        { direction: "east", doorId: "StairDoorTwo" },
        // west is blocked by debris
      ],
    },
    {
      id: "LevelTwoStairAccess",
      name: "Level Two Stair Access",
      description:
        "This is a small lobby area for accessing an elevator, or what's left of it; something has caused a huge buckle in the deck here, preventing any further movement to the east, and the entire area has been gutted by an intense fire. Every surface is covered in black carbon and a burnt stench lingers in the air. There is a set of elevator doors lying askew against the pile of debris to the east, and the doorway gapes open to the north where you can see rungs are mounted leading up and down. Next to the opening is a call button, covered in soot, and above the opening is an LCD display which has been fused into an opaque blob by the heat. The lobby has an exit to the west.",
      exits: [
        { direction: "west", toRoomId: "LevelTwoBurnedArea" },
        { direction: "north", toRoomId: "ShaftTwo" },
      ],
    },
    {
      id: "LevelThreeStairAccess",
      name: "Level Three Stair Access",
      description:
        "This is a small lobby area for accessing an elevator; there is a set of elevator doors to the north, next to which is a call button. An LCD display mounted above the elevator doors probably indicated the current floor the elevator is on, but it is currently dark. To the south is a long archway leading into another area where different colored circular pads are arranged on the floor. Over the archway is the word 'TERMINAL LQ3'.",
      exits: [
        { direction: "east", doorId: "StairDoorThree" },
        { direction: "west", toRoomId: "LevelThreeCorridorSeven" },
        { direction: "south", toRoomId: "TPADTerminal" },
        // north: elevator doors closed
      ],
    },
    {
      id: "TPADTerminal",
      name: "Terminal",
      description:
        "This is a large room, rectangular in shape, which looks to have been designed to accomodate a large amount of people.  The walls  and floor are covered with a white, ceramic tile, and painted on the floor are a series of black lines which seem to mark off areas where queues are  formed.  Along the southern wall where the black lines are directed are a series of six colored disks, each about four feet in diameter and evenly spaced  about four feet apart.  The disks are colored, from left to right facing the southern wall; green, blue, yellow, brown, white, and grey.",
      exits: [{ direction: "north", toRoomId: "LevelThreeStairAccess" }],
    },
    {
      id: "LevelFourStairAccess",
      name: "Level Four Stair Access",
      description:
        "This is a small lobby area for accessing an elevator; there is a set of elevator doors to the north, next to which is a call button. An LCD display mounted above the elevator doors probably indicated the current floor the elevator is on, but it is currently dark. There is a door to the east over which is mounted a plastic sign reading 'STAIRS'. Smeared on the north wall next to the elevator doors are the words 'They WAnt bloOD'. The words appear to be written in blood.",
      exits: [
        { direction: "east", doorId: "StairDoorFour" },
        { direction: "west", toRoomId: "LevelFourCorridorTwo" },
        // north: elevator doors closed
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
      description:
        "This is a small lobby area for accessing an elevator; there is a set of elevator doors to the north, next to which is a call button. An LCD display mounted above the elevator doors probably indicated the current floor the elevator is on, but it is currently dark. The atmosphere here is rather dusty and drab, and it looks as though it might receive a lot of foot-traffic. There is a door to the east over which is mounted a plastic sign reading 'STAIRS'.",
      exits: [
        { direction: "east", doorId: "StairDoorSix" },
        { direction: "west", toRoomId: "LevelSixCorridorBend" },
        // north: elevator doors closed
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
        // north: elevator doors closed
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
        { direction: "down", toRoomId: "Elevator" }, // simplified: panel leads directly to the car
      ],
    },
    {
      id: "Elevator",
      name: "Elevator",
      description:
        "This is the interior of a passenger elevator. There is a panel of buttons, all dark, to the left of a set of elevator doors which hang open to the south. Above you, in the rear left corner of the elevator is a small access panel.",
      exits: [
        { direction: "up", toRoomId: "ShaftFive" }, // via access panel
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
        // south: doors stuck shut
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
        // south: doors stuck shut
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
      exits: [
        { direction: "down", toRoomId: "ShaftTwo" },
        // south: doors stuck shut
      ],
    },
  ],
};
