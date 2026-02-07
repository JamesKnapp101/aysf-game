import {
  LivingQuartersFiveWestItems,
  LivingQuartersFiveWestRooms,
} from "src/world/maps/levelThree/LivingQuarters/FiveWest";
import { oneEastRooms } from "src/world/maps/levelThree/LivingQuarters/OneEast";
import { oneWestRooms } from "src/world/maps/levelThree/LivingQuarters/OneWest";

import { livingQuartersThreeWestOrganismItems } from "src/world/Items/creatures/livingQuartersThreeWestOrganisms";
import {
  LivingQuartersFourEastItems,
  LivingQuartersFourEastRooms,
} from "src/world/maps/levelThree/LivingQuarters/FourEast";
import {
  LivingQuartersSixEastItems,
  LivingQuartersSixEastRooms,
} from "src/world/maps/levelThree/LivingQuarters/SixEast";
import {
  LivingQuartersSixWestItems,
  LivingQuartersSixWestRooms,
} from "src/world/maps/levelThree/LivingQuarters/SixWest";
import {
  LivingQuartersThreeEastItems,
  LivingQuartersThreeEastRooms,
} from "src/world/maps/levelThree/LivingQuarters/ThreeEast";
import {
  threeWestItems,
  threeWestRooms,
} from "src/world/maps/levelThree/LivingQuarters/ThreeWest";
import { spaRooms } from "src/world/maps/levelThree/Spa";
import { barRooms } from "src/world/maps/levelThree/TheHub/Bar";
import { gymRooms } from "src/world/maps/levelThree/TheHub/Gym";
import { movieTheaterRooms } from "src/world/maps/levelThree/TheHub/MovieTheater";
import { parkRooms } from "src/world/maps/levelThree/TheHub/Park";
import { restaurantRooms } from "src/world/maps/levelThree/TheHub/Restaurant";
import type { WorldChunk } from "../../../game/types/gameTypes";
import {
  levelThreeHubDoors,
  levelThreeLivingQuartersDoors,
  levelThreeMedicalAndSpaDoors,
} from "../../doors/levelThreeDoors";
import { drugItems } from "../../Items/drugs";
import { generalItems } from "../../Items/general";
import { levelThreeItems } from "../../Items/levelThreeMisc";

export const LEVEL_THREE: WorldChunk = {
  items: [
    ...generalItems,
    ...drugItems,
    ...levelThreeItems,
    ...LivingQuartersThreeEastItems,
    ...LivingQuartersFourEastItems,
    ...LivingQuartersFiveWestItems,
    ...LivingQuartersSixEastItems,
    ...LivingQuartersSixWestItems,
    ...livingQuartersThreeWestOrganismItems,
    ...threeWestItems,
  ],
  doors: [
    ...levelThreeLivingQuartersDoors,
    ...levelThreeHubDoors,
    ...levelThreeMedicalAndSpaDoors,
  ],
  teleportPads: [],
  rooms: [
    ...barRooms,
    ...gymRooms,
    ...movieTheaterRooms,
    ...restaurantRooms,
    ...parkRooms,
    ...spaRooms,
    ...oneEastRooms,
    ...oneWestRooms,
    ...threeWestRooms,
    ...LivingQuartersThreeEastRooms,
    ...LivingQuartersFourEastRooms,
    ...LivingQuartersFiveWestRooms,
    ...LivingQuartersSixEastRooms,
    ...LivingQuartersSixWestRooms,
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
      description: `The corridor continues south for a short ways here, and off into the darkness to the north. There seems to be some kind of substance splashed across the floor and part of the western wall here. To the west is a door affixed with neat black plastic label indicating '3BW'. There is a door to the east which is currently hanging open, with the tattered remains of a strip of yellow and black warning tape at either side of the gap. Peering through the doorway you see that there doesn't seem to be any light coming from within.`,
      exits: [
        { direction: "north", toRoomId: "LevelThreeCorridorThree" },
        { direction: "south", toRoomId: "LevelThreeCorridorOne" },
      ],
    },
    {
      id: "LevelThreeCorridorThree",
      name: "Level Three Corridor Three",
      description: `The corridor stretches into the darkness to the north and south here. To the east and west are doors affixed with neat black plastic labels indicating '3CE' and '3CW' respectively.`,
      exits: [
        { direction: "north", toRoomId: "LevelThreeCorridorFour" },
        { direction: "south", toRoomId: "LevelThreeCorridorTwo" },
        { direction: "east", doorId: "DOOR3CE" },
        { direction: "west", doorId: "DOOR3CW" },
      ],
    },
    {
      id: "LevelThreeCorridorFour",
      name: "Level Three Corridor Junction",
      description: `This is a junction in the main corridor for accessing the Level Three Living Quarters. To the east is a door affixed with a neat black plastic label indicating '3DE'. Another corridor branches off to the west.`,
      exits: [
        { direction: "north", toRoomId: "LevelThreeCorridorFive" },
        { direction: "south", toRoomId: "LevelThreeCorridorThree" },
        { direction: "east", doorId: "DOOR3DE" },
        { direction: "west", toRoomId: "LevelThreeCorridorBranch" },
      ],
    },
    {
      id: "LevelThreeCorridorFive",
      name: "Level Three Corridor Five",
      description: `This is a dimly lit corridor stretching off to the north and south. To the east and west are doors affixed with neat black plastic labels reading '3EE' and '3EW' respectively. Hanging on either side of the eastern door are the ends of a broken strip of yellow and black warning tape.`,
      exits: [
        { direction: "north", toRoomId: "LevelThreeCorridorSix" },
        { direction: "south", toRoomId: "LevelThreeCorridorFour" },
        { direction: "west", doorId: "DOOR3EW" },
      ],
    },
    {
      id: "LevelThreeCorridorSix",
      name: "Level Three Corridor Six",
      description: `This is the main corridor for accessing the Level Three Living Quarters. To the east and west are doors affixed with neat black plastic labels indicating '3FE' and '3FW' respectively.`,
      exits: [
        { direction: "north", toRoomId: "LevelThreeCorridorSixPointSix" },
        { direction: "south", toRoomId: "LevelThreeCorridorFive" },
        { direction: "east", doorId: "DOOR3FE" },
      ],
    },
    {
      id: "LevelThreeCorridorSixPointSix",
      name: "Damaged Corridor",
      description: `This section of the corridor begins to show signs of significant damage up ahead to the north.`,
      exits: [
        { direction: "north", toRoomId: "LevelThreeCorridorSeven" },
        { direction: "south", toRoomId: "LevelThreeCorridorSix" },
        { direction: "west", doorId: "DOOR3FW" },
      ],
    },
    {
      id: "LevelThreeCorridorSeven",
      name: "Ruined Corridor",
      description: `This is the main corridor for accessing the Level Three Living Quarters. Only one of the lights remains on here, providing just a flickering, weak electric strobe. The way north has been cut off by a violent buckle in the deck which has caused the huge metal floor plating to wrinkle, actually piercing the ceiling above it in spots. A huge amount of debris has settled in the upheaval. A small gap near the ceiling is the only way through, but it's much too small to fit through. To the west is a door affixed with neat black plastic labels reading '3GW' and a strip of yellow and black warning tape stretched across it. There is no door to the east; instead the corridor bends and heads off in that direction.`,
      exits: [
        { direction: "south", toRoomId: "LevelThreeCorridorSixPointSix" },
        { direction: "north", doorId: "CubbySqueeze" },
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
        { direction: "west", toRoomId: "LevelThreeSecondCorridorConnector" },
      ],
    },

    // SECONDARY CORRIDOR BRANCH
    {
      id: "LevelThreeSecondCorridorConnector",
      name: "Level Three Secondary Corridor Connector",
      description: `The corridor continues to the east and west.`,
      exits: [
        { direction: "east", toRoomId: "LevelThreeCorridorBranch" },
        { direction: "west", toRoomId: "LevelThreeSecondCorridorTwo" },
      ],
    },
    {
      id: "LevelThreeSecondCorridorTwo",
      name: "Level Three Secondary Corridor",
      description: `This is another T in the corridor, where the corridor branch connects with a secondary corridor. The secondary corridor extends north and south from here. There is also a large, sturdy-looking wooden door to the west, engraved with a leaf and floral pattern. Mounted on the wall next to the door is a metal panel with a thin horizontal slot in it. Just below the slot is a flat metal tray. Mounted over the door is a bronze plaque. The bronze plaque is engraved with the words 'THE HUB'`,
      exits: [
        //{ direction: "north", toRoomId: "LevelThreeSecondCorridorThree" },
        // { direction: "south", toRoomId: "LevelThreeSecondCorridorOne" },
        { direction: "west", doorId: "HubDoor" },
        { direction: "east", toRoomId: "LevelThreeSecondCorridorConnector" },
      ],
    },
    // {
    //   id: "LevelThreeSecondCorridorThree",
    //   name: "Level Three Secondary Corridor",
    //   description: `The secondary corridor ends here. There is a large glass door with an aluminum frame to the west.`,
    //   exits: [
    //     { direction: "south", toRoomId: "LevelThreeSecondCorridorTwo" },
    //     { direction: "north", doorId: "LevelThreeSecondCorrThreeDoor" },
    //   ],
    // },
    // {
    //   id: "LevelThreeSecondCorridorOne",
    //   name: "Level Three Secondary Corridor",
    //   description: `The secondary corridor ends here. There is a set of double doors to the south with a plastic sign mounted overhead. The sign is white with black block lettering which reads 'DeM Main Medical Facility'`,
    //   exits: [
    //     { direction: "north", toRoomId: "LevelThreeSecondCorridorTwo" },
    //     { direction: "south", toRoomId: "MedicalEntrance" },
    //   ],
    // },
  ],
};
