import { Item } from "@game/types/itemTypes";
import { doomedChefItems } from "src/world/Items/creatures/doomedChef";
import { livingQuartersThreeWestOrganismItems } from "src/world/Items/creatures/livingQuartersThreeWestOrganisms";
import { crushedWeightlifterGymItems } from "src/world/Items/creatures/virtual/crushedWeightlifterGym";
import { inckGlassboolItems } from "src/world/Items/creatures/virtual/inckGlassboolBarBasement";
import { lilLillyCorridorThreeItems } from "src/world/Items/creatures/virtual/lilLillyCorridorThree";
import { masterOfDrinkItems } from "src/world/Items/creatures/virtual/masterOfDrink";
import { moxStairBottomItems } from "src/world/Items/creatures/virtual/moxStairBottom";
import { spinInstructorSpinStageItems } from "src/world/Items/creatures/virtual/spinInstructorSpinStage";
import { barBotItems } from "src/world/Items/robots/barBot";
import { lonelyBotItems } from "src/world/Items/robots/lonelyBot";
import { nailBotItems } from "src/world/Items/robots/nailBot";
import { rangerBotItems } from "src/world/Items/robots/rangerBot";
import { spotBotItems } from "src/world/Items/robots/spotBot";
import { trashBotItems } from "src/world/Items/robots/trashBot";
import { usherBotItems } from "src/world/Items/robots/usherBot";
import {
  fiveWestItems,
  FiveWestRooms,
} from "src/world/maps/levelThree/LivingQuarters/FiveWest";
import { oneEastRooms } from "src/world/maps/levelThree/LivingQuarters/OneEast";
import { oneWestRooms } from "src/world/maps/levelThree/LivingQuarters/OneWest";
import {
  sixEastItems,
  sixEastRooms,
} from "src/world/maps/levelThree/LivingQuarters/SixEast";
import {
  threeEastItems,
  threeEastRooms,
} from "src/world/maps/levelThree/LivingQuarters/ThreeEast";
import {
  threeWestItems,
  threeWestRooms,
} from "src/world/maps/levelThree/LivingQuarters/ThreeWest";
import {
  barDoors,
  barItems,
  barRooms,
} from "src/world/maps/levelThree/Park/Bar/Bar";
import {
  gymItems,
  gymLockerItems,
  gymRooms,
} from "src/world/maps/levelThree/Park/Gym";
import { movieTheaterRooms } from "src/world/maps/levelThree/Park/MovieTheater";
import { parkItems, parkRooms } from "src/world/maps/levelThree/Park/Park";
import { restaurantRooms } from "src/world/maps/levelThree/Park/Restaurant";
import { spaItems, spaRooms } from "src/world/maps/levelThree/Park/Spa";
import {
  warehouseItems,
  warehouseRooms,
} from "src/world/maps/levelThree/Warehouse";
import { stairwellItems } from "src/world/maps/Stairwell";
import type { WorldChunk } from "../../../game/types/gameTypes";
import {
  levelThreeLivingQuartersDoors,
  levelThreeMedicalAndSpaDoors,
  levelThreeParkDoors,
} from "../../doors/levelThreeDoors";
import { drugItems } from "../../Items/drugs";
import { generalItems } from "../../Items/general";
import { levelThreeItems } from "../../Items/levelThreeMisc";

const corridorItems: Item[] = [
  {
    id: "TightSqueeze",
    name: "a narrow opening",
    description:
      "The gap is pretty small, not even a child could squeeze through it.",
    sceneryDescription: `leaving only a very narrow gap near the floor that's much too small to squeeze under.`,
    location: "LevelThreeCorridorSeven",
    vocab: ["opening", "gap"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    meta: {
      sceneryDescriptionOrder: 1,
    },
  },
];

export const LEVEL_THREE: WorldChunk = {
  items: [
    ...generalItems,
    ...drugItems,
    ...levelThreeItems,
    ...fiveWestItems,
    ...livingQuartersThreeWestOrganismItems,
    ...threeWestItems,
    ...threeEastItems,
    ...sixEastItems,
    ...stairwellItems,
    ...corridorItems,
    ...rangerBotItems,
    ...lonelyBotItems,
    ...barBotItems,
    ...spotBotItems,
    ...trashBotItems,
    ...usherBotItems,
    ...nailBotItems,
    ...doomedChefItems,
    ...moxStairBottomItems,
    ...lilLillyCorridorThreeItems,
    ...crushedWeightlifterGymItems,
    ...spinInstructorSpinStageItems,
    ...inckGlassboolItems,
    ...masterOfDrinkItems,
    ...warehouseItems,
    ...spaItems,
    ...parkItems,
    ...gymItems,
    ...gymLockerItems,
    ...barItems,
  ],
  doors: [
    ...levelThreeLivingQuartersDoors,
    ...barDoors,
    ...levelThreeParkDoors,
    ...levelThreeMedicalAndSpaDoors,
  ],
  teleportPads: [],
  rooms: [
    ...warehouseRooms,
    ...barRooms,
    ...gymRooms,
    ...movieTheaterRooms,
    ...restaurantRooms,
    ...parkRooms,
    ...spaRooms,
    ...oneEastRooms,
    ...oneWestRooms,
    ...threeWestRooms,
    ...sixEastRooms,
    ...threeEastRooms,
    ...FiveWestRooms,
    {
      id: "LevelThreeCorridorOne",
      name: "Level Three Corridor One",
      description: `The corridor ends here, stretching off into darkness to the north. To the east and west are doors affixed with neat black plastic labels indicating '3AE' and '3AW' respectively. A strip of yellow and black tape has been stretched across the eastern door.`,
      exits: [
        { direction: "north", toRoomId: "LevelThreeCorridorTwo" },
        { direction: "east", doorId: "DOOR3AE" },
        { direction: "west", toRoomId: "LivingQuartersOneWest" },
      ],
    },
    {
      id: "LevelThreeCorridorTwo",
      name: "Level Three Corridor Two",
      description: `The corridor ends abruptly here at [[SCENERY]]`,
      exits: [
        { direction: "north", toRoomId: "LevelThreeCorridorThree" },
        { direction: "south", toRoomId: "LevelThreeCorridorOne" },
      ],
    },
    {
      id: "LevelThreeCorridorThree",
      name: "Level Three Corridor Three",
      description: `The corridor continues north and south, with an apartment unit entrance to both the east and west. [[SCENERY]]`,
      exits: [
        { direction: "north", toRoomId: "LevelThreeCorridorFour" },
        { direction: "south", toRoomId: "LevelThreeCorridorTwo" },
        { direction: "east", doorId: "DOOR3CE" },
        { direction: "west", toRoomId: "LivingQuartersThreeWest" },
      ],
    },
    {
      id: "LevelThreeCorridorFour",
      name: "Level Three Corridor Junction",
      description: `This is a junction in the residential corridor, where it branches off to the west down a smaller corridor, and also continues north, and south.`,
      exits: [
        { direction: "north", toRoomId: "LevelThreeCorridorFive" },
        { direction: "south", toRoomId: "LevelThreeCorridorThree" },
        { direction: "east", doorId: "WarehouseDoor" },
        { direction: "west", toRoomId: "LevelThreeCorridorBranch" },
      ],
    },
    {
      id: "LevelThreeCorridorFive",
      name: "Level Three Corridor Five",
      description: `This is a dimly lit corridor in a residential complex which stretches off to the north where you can see flickering lights, and also to the south, where the corridor branches further on.`,
      exits: [
        { direction: "north", toRoomId: "LevelThreeCorridorSix" },
        { direction: "south", toRoomId: "LevelThreeCorridorFour" },
        { direction: "west", doorId: "UmboltzResidenceDoor" },
      ],
    },
    {
      id: "LevelThreeCorridorSix",
      name: "Level Three Corridor Six",
      description: `This is toward the northern end of the main corridor, near the entrance of a residential apartment unit. Off to the north you can see broken and flickering lights, where to corridor eventually ends in a collapse, and to the south the hallway continues.`,
      exits: [
        { direction: "north", toRoomId: "LevelThreeCorridorSeven" },
        { direction: "south", toRoomId: "LevelThreeCorridorFive" },
        { direction: "east", doorId: "OncheResidenceDoor" },
      ],
    },
    {
      id: "LevelThreeCorridorSeven",
      name: "Ruined Corridor",
      description: `This is a long corridor that would extend north and south, except some sort of accident has caused the ceiling to collapse to the north, pitching down at a steep angle and [[SCENERY]] A row of emergency lights provide a flickering, weak electric strobe down the length of the southern corridor, where doors are visible to either side, and another corridor branches east, toward the Terminal platform.`,
      exits: [
        { direction: "south", toRoomId: "LevelThreeCorridorSix" },
        { direction: "north", toRoomId: "LevelThreeCubby" },
        { direction: "east", toRoomId: "LevelThreeStairAccess" },
      ],
    },
    {
      id: "LevelThreeCubby",
      name: "Cubby",
      description: `This is a small cubby in the midst of tons of rubble and debris; you can pick out broken furnishings, ceiling panels...even clothing. To the west the wall has ruptured, exposing some kind of air duct.^^A child's doll lies crumpled in one corner, missing an arm and covered in soot.`,
      exits: [
        { direction: "south", toRoomId: "LevelThreeCorridorSeven" },
        { direction: "west", toRoomId: "LevelThreeDuct" },
      ],
    },
    {
      id: "LevelThreeDuct",
      name: "Level Three Duct",
      description: `This is a narrow duct of some kind, about twice as wide and tall as the cat. It looks like part of the floor above has caved in on the duct, creating a tear which looks like it leads north through the floor into a room beyond.`,
      exits: [
        { direction: "east", toRoomId: "LevelThreeCubby" },
        { direction: "north", toRoomId: "LevelThreeSecretRoom" },
      ],
    },
    {
      id: "LevelThreeSecretRoom",
      name: "Level Three Secret Room",
      description: `This appears to have been a living room, but it is now devestated; you can see a sofa split into two pieces and lying on its back amongst the rubble and debris, including a broken end table, a shattered lamp, an overturned plant, and various electronics which may be sound equipment scattered all over the floor. You can just make out part of what looks to have been the front door to the quarters, which now lies askew on the floor with the other debris. The plate on the door reads '3HW'. Lying nearby is a woman's body, face down, long, tangled hair covering her face. Judging by her twisted position she has to be dead...lying on the floor near her body is a cylinder of red serum. You can just make out the label, which reads 'SERITROXIN'.`,
      exits: [{ direction: "south", toRoomId: "LevelThreeDuct" }],
    },
    {
      id: "LevelThreeCorridorBranch",
      name: "Level Three Corridor Branch",
      description: `This is a branch off the main corridor for accessing the Level Three Living Quarters. The hall continues to the west.`,
      exits: [
        { direction: "east", toRoomId: "LevelThreeCorridorFour" },
        { direction: "west", toRoomId: "ParkEntrance" },
      ],
    },

    // SECONDARY CORRIDOR BRANCH
    {
      id: "ParkEntrance",
      name: "Level Three Secondary Corridor",
      description: `This short stretch of corridor branches west off the main residential hall and ends at a large, sturdy-looking wooden door engraved with a leaf and floral pattern. Mounted on the wall next to the door is a metal panel with a thin horizontal slot in it. Just below the slot is a flat metal tray. Mounted over the door is a bronze plaque engraved with the words 'WELCOME TO VIVARIUM PARK'.`,
      exits: [
        { direction: "west", doorId: "ParkDoor" },
        { direction: "east", toRoomId: "LevelThreeCorridorBranch" },
      ],
    },
  ],
};
