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
        "This is a stretch of wide corridor extending north and south. The floor is well worn, and the width of the corridor suggests it might be used for moving large objects or pallets of objects. There is a large, heavy-looking steel door to the north which is hanging open to reveal a bend in the corridor beyond. To the south, another heavy-looking steel door is closed. Above the door to the south is a panel which is lit up red.",
      exits: [
        { direction: "north", doorId: "InnerDoor" },
        { direction: "south", doorId: "OuterDoor" },
      ],
    },
    {
      id: "AboveTheQuadOne",
      name: "Above Storage Area",
      description:
        "You are floating in mid air about three feet away from the ceiling high above the storage area below you. From this vantage, you can see the four storage quadrants and their stacks of pallets, with a huge loading dock area at the southern wall of the southwest quadrant. You can really appreciate its scale from up here; the huge hull doors look capable of admitting large vehicles and equipment and there must be thousands and thousands of crates down there. You can also see what looks like heavy damage in the southeastern quadrant, right in the corner; it looks like the hull was breached but the lights in that area are out and it's hard to see the extent of it.",
      exits: [
        { direction: "east", toRoomId: "AboveTheQuadTwo" },
        { direction: "south", toRoomId: "AboveTheQuadThree" },
        { direction: "southeast", toRoomId: "AboveTheQuadFour" },
      ],
    },
    {
      id: "AboveTheQuadTwo",
      name: "Above Storage Area",
      description:
        "You are floating in mid air about three feet away from the ceiling high above the storage area below you. From this vantage, you can see the four storage quadrants and their stacks of pallets, with a huge loading dock area at the southern wall of the southwest quadrant. You can really appreciate its scale from up here; the huge hull doors look capable of admitting large vehicles and equipment and there must be thousands and thousands of crates down there. You can also see what looks like heavy damage in the southeastern quadrant, right in the corner; it looks like the hull was breached but the lights in that area are out and it's hard to see the extent of it.",
      exits: [
        { direction: "west", toRoomId: "AboveTheQuadOne" },
        { direction: "south", toRoomId: "AboveTheQuadFour" },
        { direction: "southwest", toRoomId: "AboveTheQuadThree" },
      ],
    },
    {
      id: "AboveTheQuadThree",
      name: "Above Storage Area",
      description:
        "You are floating in mid air about three feet away from the ceiling high above the storage area below you. From this vantage, you can see the four storage quadrants and their stacks of pallets, with a huge loading dock area at the southern wall of the southwest quadrant. You can really appreciate its scale from up here; the huge hull doors look capable of admitting large vehicles and equipment and there must be thousands and thousands of crates down there. You can also see what looks like heavy damage in the southeastern quadrant, right in the corner; it looks like the hull was breached but the lights in that area are out and it's hard to see the extent of it.",
      exits: [
        { direction: "north", toRoomId: "AboveTheQuadOne" },
        { direction: "east", toRoomId: "AboveTheQuadFour" },
        { direction: "northeast", toRoomId: "AboveTheQuadTwo" },
      ],
    },
    {
      id: "AboveTheQuadFour",
      name: "Above Storage Area",
      description:
        "You are floating in mid air about three feet away from the ceiling high above the storage area below you. From this vantage, you can see the four storage quadrants and their stacks of pallets, with a huge loading dock area at the southern wall of the southwest quadrant. You can really appreciate its scale from up here; the huge hull doors look capable of admitting large vehicles and equipment and there must be thousands and thousands of crates down there. You can also see what looks like heavy damage in the southeastern quadrant, right in the corner; it looks like the hull was breached but the lights in that area are out and it's hard to see the extent of it.",
      exits: [
        { direction: "north", toRoomId: "AboveTheQuadTwo" },
        { direction: "west", toRoomId: "AboveTheQuadThree" },
        { direction: "northwest", toRoomId: "AboveTheQuadOne" },
      ],
    },
    {
      id: "StorageQuadOne",
      name: "Storage Northwest Quadrant",
      description:
        "This is the northwestern quadrant of a large storage area. Pallets stacked high with large, plastic-covered containers are arranged to form rows. Curiously, it doesn't look like the smallest of these containers would fit through the door to the north. The stacks of containers are quite high, making it difficult to take in the entire area at once, but it looks like you could make progress to the east, south and southeast.",
      exits: [
        { direction: "north", doorId: "OuterDoor" },
        { direction: "south", toRoomId: "StorageQuadThree" },
        { direction: "east", toRoomId: "StorageQuadTwo" },
        { direction: "southeast", toRoomId: "StorageQuadFour" },
        { direction: "up", toRoomId: "QuadOneStack" },
      ],
    },
    {
      id: "StorageQuadTwo",
      name: "Storage Northeast Quadrant",
      description:
        "This is the northeastern quadrant of a large storage area. Pallets stacked high with large plastic-covered containers are arranged to form rows. The stacks of containers are quite high, making it difficult to take in the entire area at once, but it looks like you could make progress to the west, south, and southwest.",
      exits: [
        { direction: "south", toRoomId: "StorageQuadFour" },
        { direction: "west", toRoomId: "StorageQuadOne" },
        { direction: "southwest", toRoomId: "StorageQuadThree" },
        { direction: "up", toRoomId: "QuadTwoStack" },
      ],
    },
    {
      id: "StorageQuadThree",
      name: "Storage Southwest Quadrant",
      description:
        "This is the southwestern quadrant of a large storage area. Pallets stacked high with large, plastic-covered containers are arranged to form rows. The southern wall is dominated by a huge metal door which is currently closed. There are two yellow emergency lights flanking the door which are currently off. A large, rectangular area in front of the door is painted off in yellow and black outline and the words 'STAND CLEAR WHEN LOADING AND UNLOADING' are stencilled on the floor within it.",
      exits: [
        { direction: "north", toRoomId: "StorageQuadOne" },
        { direction: "east", toRoomId: "StorageQuadFour" },
        { direction: "northeast", toRoomId: "StorageQuadTwo" },
        // south: massive cargo door, not walkable by player
        { direction: "up", toRoomId: "QuadThreeStack" },
      ],
    },
    {
      id: "StorageQuadFour",
      name: "Storage Southeast Quadrant",
      description:
        "This is the southeastern quadrant of a large storage area. Pallets stacked high with large, plastic-covered containers are arranged to form rows. Looking toward the southeastern corner of this quadrant, you see a good number of the pallets have been disrupted; some of the plastic is torn and a number of boxes have spilled out and are lying end over end all over the deck. The deck itself in that direction is cracked in several places as if something struck it with extreme force. The emergency lights in the southeastern corner of this area are out, and that whole section is completely dark.",
      exits: [
        { direction: "north", toRoomId: "StorageQuadTwo" },
        { direction: "west", toRoomId: "StorageQuadThree" },
        { direction: "northwest", toRoomId: "StorageQuadOne" },
        { direction: "southeast", toRoomId: "RIFT" },
        { direction: "up", toRoomId: "QuadFourStack" },
      ],
    },
    {
      id: "QuadOneStack",
      name: "Top of Stack Northwest Quadrant",
      description:
        "This is the top of a huge stack of enormous crates and boxes, easily thirty feet off the floor. From this vantage, you can see the rows between the four storage quadrants far below, and the ceiling high above. From here you can really appreciate just how much cargo is stored in this area; the stacks are just huge, and the tops of each stack can be seen to the east, southeast, and south like rooftops of small buildings.",
      exits: [{ direction: "down", toRoomId: "StorageQuadOne" }],
    },
    {
      id: "QuadTwoStack",
      name: "Top of Stack Northeast Quadrant",
      description:
        "This is the top of a huge stack of enormous crates and boxes, easily thirty feet off the floor. From this vantage, you can see the rows between the four storage quadrants far below, and the ceiling high above. From here you can really appreciate just how much cargo is stored in this area; the stacks are just huge, and the tops of each stack can be seen to the west, southwest, and south like rooftops of small buildings. Floating a few feet in the air is a corpse wearing a space suit, one hand clutched to the collar where the suit joins with the helmet.",
      exits: [{ direction: "down", toRoomId: "StorageQuadTwo" }],
    },
    {
      id: "QuadThreeStack",
      name: "Top of Stack Southwest Quadrant",
      description:
        "This is the top of a huge stack of enormous crates and boxes, easily thirty feet off the floor. From this vantage, you can see the rows between the four storage quadrants far below, and the ceiling high above. From here you can really appreciate just how much cargo is stored in this area; the stacks are just huge, and the tops of each stack can be seen to the east, northeast, and north like rooftops of small buildings.",
      exits: [{ direction: "down", toRoomId: "StorageQuadThree" }],
    },
    {
      id: "QuadFourStack",
      name: "Top of Stack Southeast Quadrant",
      description:
        "This is the top of a huge stack of enormous crates and boxes, easily thirty feet off the floor. From this vantage, you can see the rows between the four storage quadrants far below, and the ceiling high above. From here you can really appreciate just how much cargo is stored in this area; the stacks are just huge, and the tops of each stack can be seen to the west, northwest, and north like rooftops of small buildings.",
      exits: [{ direction: "down", toRoomId: "StorageQuadFour" }],
    },
    {
      id: "RIFT",
      name: "Rift",
      description:
        "The cracks in the deck continue here, until they reach the wall where an enormous rift has been torn in the ship's hull. You stand on the edge of it, with the tear arching high above you and exposing the star-speckled blackness of space beyond it. The hull plating is buckled inward, as if struck from the outside. You look down over the crumbled remains of the deck's edge and see the outer hull sloping downward until it meets another huge structure. You can't see all of the structure from this angle, but whatever it is it must be enormous; it looks like it collided with the ship. At the point where the two meet, you can see a split in the structure to the southeast that looks like it's accessible.",
      exits: [
        { direction: "northwest", toRoomId: "StorageQuadFour" },
        { direction: "southeast", toRoomId: "AlienShipCorridorOne" },
      ],
    },
  ],
};
