import {
  hydroponicsItems,
  hydroponicsRooms,
} from "src/world/maps/levelSix/Hydroponics";
import type { WorldChunk } from "../../../game/types/gameTypes";
import { levelSixDoors } from "../../doors/levelSixDoors";
import { giantSpiderItems } from "../../Items/creatures/giantSpider";
import { levelSixItems } from "../../Items/levelSixMisc";

export const LEVEL_SIX: WorldChunk = {
  items: [...levelSixItems, ...giantSpiderItems, ...hydroponicsItems],
  doors: [...levelSixDoors],
  teleportPads: [],
  rooms: [
    ...hydroponicsRooms,
    {
      id: "LevelSixCorridorBend",
      name: "Dimly Lit Corridor",
      description:
        "The corridor has experienced some minor structural damage, with a visible crack along the north wall near the floor, which is scattered with debris. Some but not all of the overhead lights have been broken, leaving the corridor partially lit as it heads east toward the elevator lobby and stair access, and also to the west, continuing on into the gloom. Letters have been stenciled along the south wall read 'Storage Quad Two' with an arrow pointing in that direction. [[SCENERY]]",
      exits: [
        { direction: "east", toRoomId: "LevelSixStairAccess" },
        { direction: "south", doorId: "InnerDoor" },
        { direction: "west", toRoomId: "LevelSixCorridorEnd" },
      ],
    },
    {
      id: "LevelSixCorridorEnd",
      name: "Corridor End",
      description:
        "The corridor ends here, the single remaining overhead light casting shadows across the buckled tile floor, where the crack along the north wall is widest. [[SCENERY]]",
      exits: [
        { direction: "east", toRoomId: "LevelSixCorridorBend" },
        { direction: "south", doorId: "HydroponicsDoor" },
      ],
    },
    {
      id: "LevelSixCorridor",
      name: "Level Six Corridor",
      description:
        "This is a short, heavy-walled airlock chamber extending north and south. The inner steel door to the north is closed, while the outer steel door to the south hangs open onto the storage quad. A flat status panel over the northern door glows red.",
      exits: [
        { direction: "north", doorId: "InnerDoor" },
        { direction: "south", doorId: "OuterDoor" },
      ],
    },
    // Storage Quad
    // Lower Level
    {
      id: "StorageQuadOne",
      name: "Storage: Quadrant A",
      description:
        "This is the northwestern quadrant of a large storage area. Pallets stacked high with large, plastic-covered containers are arranged to form rows, though in the airless zero gravity many of the stacks have loosened into slow drifting masses. Curiously, it doesn't look like the smallest of these containers would fit through the door to the north. The only clear route through the storage maze leads south.",
      exits: [
        { direction: "north", doorId: "OuterDoor" },
        { direction: "south", toRoomId: "StorageQuadThree" },
        { direction: "east", toRoomId: "StorageQuadTwo" },
        { direction: "southeast", toRoomId: "StorageQuadFour" },
        { direction: "up", toRoomId: "StorageQuadOneMid" },
      ],
    },
    {
      id: "StorageQuadTwo",
      name: "Storage: Quadrant B",
      description:
        "This is the northeastern quadrant of a large storage area. Pallets stacked high with large plastic-covered containers are arranged to form rows, but without gravity the loosened containers drift together in slow, obstructive rafts. The clearest paths lead southwest and up.",
      exits: [
        { direction: "south", toRoomId: "StorageQuadFour" },
        { direction: "west", toRoomId: "StorageQuadOne" },
        { direction: "southwest", toRoomId: "StorageQuadThree" },
        { direction: "up", toRoomId: "StorageQuadTwoMid" },
      ],
    },
    {
      id: "StorageQuadThree",
      name: "Storage: Quadrant C",
      description:
        "This is the southwestern quadrant of a large storage area, now airless and weightless. Pallets stacked high with large, plastic-covered containers are arranged to form rows, with some of the cargo floating just far enough out of place to block easy shortcuts. The southern wall is dominated by a huge metal door which is currently closed. There are two yellow emergency lights flanking the door which are currently off. A large, rectangular area in front of the door is painted off in yellow and black outline and the words 'STAND CLEAR WHEN LOADING AND UNLOADING' are stencilled on the floor within it. The clearest paths lead north and northeast.",
      exits: [
        { direction: "north", toRoomId: "StorageQuadOne" },
        { direction: "east", toRoomId: "StorageQuadFour" },
        { direction: "northeast", toRoomId: "StorageQuadTwo" },
        { direction: "up", toRoomId: "StorageQuadThreeMid" },
      ],
    },
    {
      id: "StorageQuadFour",
      name: "Storage: Quadrant D",
      description:
        "This is the southeastern quadrant of a large storage area, open to hard vacuum and stripped of gravity. Pallets stacked high with large, plastic-covered containers are arranged to form rows. Looking toward the southeastern corner of this quadrant, you see a good number of the pallets have been disrupted; some of the plastic is torn and a number of boxes have spilled out and are drifting end over end above the deck. The deck itself in that direction is cracked in several places as if something struck it with extreme force. The emergency lights in the southeastern corner of this area are out, and that whole section is completely dark. The only clear route leads up.",
      exits: [
        { direction: "north", toRoomId: "StorageQuadTwo" },
        { direction: "west", toRoomId: "StorageQuadThree" },
        { direction: "northwest", toRoomId: "StorageQuadOne" },
        { direction: "up", toRoomId: "StorageQuadFourMid" },
      ],
    },
    // Mid Level
    {
      id: "StorageQuadOneMid",
      name: "Storage: Above Quadrant A",
      description:
        "This is the middle tier of the northwestern quadrant of the storage area. Pallets and plastic-covered containers hang in stacked rows, many of them floating slightly out of alignment in the airless zero gravity. The clearest paths lead east, south, and up.",
      exits: [
        { direction: "south", toRoomId: "StorageQuadThreeMid" },
        { direction: "east", toRoomId: "StorageQuadTwoMid" },
        { direction: "southeast", toRoomId: "StorageQuadFourMid" },
        { direction: "up", toRoomId: "StorageQuadOneTop" },
        { direction: "down", toRoomId: "StorageQuadOne" },
      ],
    },
    {
      id: "StorageQuadTwoMid",
      name: "Storage: Above Quadrant B",
      description:
        "This is the middle tier of the northeastern quadrant of the storage area. Pallets stacked high with plastic-covered containers drift in slow, stubborn clusters, leaving only a few reliable lanes through the vacuum. The clearest paths lead west and down.",
      exits: [
        { direction: "south", toRoomId: "StorageQuadFourMid" },
        { direction: "west", toRoomId: "StorageQuadOneMid" },
        { direction: "southwest", toRoomId: "StorageQuadThreeMid" },
        { direction: "up", toRoomId: "StorageQuadTwoTop" },
        { direction: "down", toRoomId: "StorageQuadTwo" },
      ],
    },
    {
      id: "StorageQuadThreeMid",
      name: "Storage: Above Quadrant C",
      description:
        "This is the middle tier of the southwestern quadrant of the storage area. Pallets stacked high with large, plastic-covered containers are arranged to form rows, though several loads float loose enough to turn most gaps into dead ends. The clearest paths lead north and up.",
      exits: [
        { direction: "north", toRoomId: "StorageQuadOneMid" },
        { direction: "east", toRoomId: "StorageQuadFourMid" },
        { direction: "northeast", toRoomId: "StorageQuadTwoMid" },
        { direction: "up", toRoomId: "StorageQuadThreeTop" },
        { direction: "down", toRoomId: "StorageQuadThree" },
      ],
    },
    {
      id: "StorageQuadFourMid",
      name: "Storage: Above Quadrant D",
      description:
        "This is the middle tier of the southeastern quadrant of the storage area. Pallets stacked high with large, plastic-covered containers are arranged to form rows, while loose boxes drift lazily through the vacuum. Looking toward the southeastern corner, the damage below continues upward in cracked supports and torn plastic. The clearest paths lead up and down.",
      exits: [
        { direction: "north", toRoomId: "StorageQuadTwoMid" },
        { direction: "west", toRoomId: "StorageQuadThreeMid" },
        { direction: "northwest", toRoomId: "StorageQuadOneMid" },
        { direction: "up", toRoomId: "StorageQuadFourTop" },
        { direction: "down", toRoomId: "StorageQuadFour" },
      ],
    },
    // Top Level
    {
      id: "StorageQuadOneTop",
      name: "Storage: High Above Quadrant A",
      description:
        "This is the top tier of the northwestern quadrant of the storage area. The upper edges of the pallet stacks loom around you, their plastic-wrapped cargo drifting in the vacuum like badly organized debris. The clearest paths lead south, southeast, and down.",
      exits: [
        { direction: "south", toRoomId: "StorageQuadThreeTop" },
        { direction: "east", toRoomId: "StorageQuadTwoTop" },
        { direction: "southeast", toRoomId: "StorageQuadFourTop" },
        { direction: "down", toRoomId: "StorageQuadOneMid" },
      ],
    },
    {
      id: "StorageQuadTwoTop",
      name: "Storage: High Above Quadrant B",
      description:
        "This is the top tier of the northeastern quadrant of the storage area. The pallet stacks crowd close on all sides, and the absence of gravity has let several containers drift into awkward, lane-blocking positions. Every visible lane is choked off by drifting cargo.",
      exits: [
        { direction: "south", toRoomId: "StorageQuadFourTop" },
        { direction: "west", toRoomId: "StorageQuadOneTop" },
        { direction: "southwest", toRoomId: "StorageQuadThreeTop" },
        { direction: "down", toRoomId: "StorageQuadTwoMid" },
      ],
    },
    {
      id: "StorageQuadThreeTop",
      name: "Storage: High Above Quadrant C",
      description:
        "This is the top tier of the southwestern quadrant of the storage area. Pallet stacks and plastic-covered containers form a weightless maze of blocked angles and narrow lanes. The clearest paths lead north and down.",
      exits: [
        { direction: "north", toRoomId: "StorageQuadOneTop" },
        { direction: "east", toRoomId: "StorageQuadFourTop" },
        { direction: "northeast", toRoomId: "StorageQuadTwoTop" },
        { direction: "down", toRoomId: "StorageQuadThreeMid" },
      ],
    },
    {
      id: "StorageQuadFourTop",
      name: "Storage: High Above Quadrant D",
      description:
        "This is the top tier of the southeastern quadrant of the storage area. Vacuum silence presses in around the drifting cargo, and the damage toward the southeastern corner is severe enough that the deck seems to have peeled away from the hull. The clearest paths lead east, northwest, and down. A ragged route also leads southeast toward the breach.",
      exits: [
        { direction: "north", toRoomId: "StorageQuadTwoTop" },
        { direction: "west", toRoomId: "StorageQuadThreeTop" },
        { direction: "northwest", toRoomId: "StorageQuadOneTop" },
        { direction: "east", toRoomId: "3DPrintingFacility" },
        { direction: "southeast", toRoomId: "RIFT" },
        { direction: "down", toRoomId: "StorageQuadFourMid" },
      ],
    },
    {
      id: "3DPrintingFacility",
      name: "3D Printing Facility",
      description:
        "This compact fabrication room is built around a floor-to-ceiling 3D printer, with storage lockers, feed tubes, and resin-stained maintenance panels packed tight around it. The air is gone, but the printer's touchscreen still glows a steady CRT green.",
      exits: [{ direction: "west", toRoomId: "StorageQuadFourTop" }],
    },
    {
      id: "RIFT",
      name: "Rift",
      description:
        "The cracks in the deck continue here, until they reach the wall where an enormous rift has been torn in the ship's hull. You stand on the edge of it, with the tear arching high above you and exposing the star-speckled blackness of space beyond it. The hull plating is buckled inward, as if struck from the outside. You look down over the crumbled remains of the deck's edge and see the outer hull sloping downward until it meets another huge structure. You can't see all of the structure from this angle, but whatever it is it must be enormous; it looks like it collided with the ship. At the point where the two meet, you can see a split in the structure to the southeast that looks like it's accessible.",
      exits: [{ direction: "northwest", toRoomId: "StorageQuadFourTop" }],
    },
  ],
};
