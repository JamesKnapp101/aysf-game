import { aviaryOrganismItems } from "src/world/Items/creatures/aviaryOrganisms";
import { badgerItems } from "src/world/Items/creatures/badger";
import { barryItems } from "src/world/Items/creatures/barry";
import { bearItems } from "src/world/Items/creatures/bear";
import { boarItems } from "src/world/Items/creatures/boar";
import { bullItems } from "src/world/Items/creatures/bull";
import { octopusItems } from "src/world/Items/creatures/octopus";
import { gamePreserveStructureItems } from "src/world/Items/gamePreserveStructures";
import { apiaryItems, apiaryRooms } from "src/world/maps/levelFour/Apiary";
import { aquariumRooms } from "src/world/maps/levelFour/Aquarium";
import { aviaryRooms } from "src/world/maps/levelFour/Aviary";
import {
  botanicalItems,
  botanicalRooms,
} from "src/world/maps/levelFour/Botanical";
import { fungalCaveRooms } from "src/world/maps/levelFour/FungalCave";
import { gamePreserveRooms } from "src/world/maps/levelFour/GamePreserve";
import {
  greenhouseItems,
  greenhouseRooms,
} from "src/world/maps/levelFour/Greenhouse";
import { pondRooms } from "src/world/maps/levelFour/Pond";
import { preserveRooms } from "src/world/maps/levelFour/Preserve";
import { seedBankRooms } from "src/world/maps/levelFour/SeedBank";
import { veterinaryCenterRooms } from "src/world/maps/levelFour/VeterinaryCenter";
import type { WorldChunk } from "../../../game/types/gameTypes";
import { levelFourDoors } from "../../doors/levelFourDoors";
import { levelFourItems } from "../../Items/levelFourMisc";

export const LEVEL_FOUR: WorldChunk = {
  items: [
    ...levelFourItems,
    ...gamePreserveStructureItems,
    ...aviaryOrganismItems,
    ...badgerItems,
    ...barryItems,
    ...bearItems,
    ...boarItems,
    ...bullItems,
    ...octopusItems,
    ...apiaryItems,
    ...botanicalItems,
    ...greenhouseItems,
  ],
  doors: [...levelFourDoors],
  teleportPads: [],
  rooms: [
    ...aquariumRooms,
    ...aviaryRooms,
    ...preserveRooms,
    ...gamePreserveRooms,
    ...veterinaryCenterRooms,
    ...pondRooms,
    ...apiaryRooms,
    ...botanicalRooms,
    ...greenhouseRooms,
    ...seedBankRooms,
    ...fungalCaveRooms,
    {
      id: "LevelFourCorridorTwo",
      name: "Level Four Corridor",
      description:
        "This is a wide corridor which looks like at times it may be used to transport large objects or cargo. The corridor bends here, heading off to the north. To the south is a metal door with no handle. Mounted next to the door is some kind of scanner with a yellow strip across the top of it. The door to the south has the words 'MAIN POWER GRID' printed on it.",
      exits: [
        { direction: "east", toRoomId: "LevelFourStairAccess" },
        { direction: "south", doorId: "PowerGridDoors" },
        { direction: "north", toRoomId: "LevelFourCorridorOne" },
      ],
    },
    {
      id: "LevelFourCorridorOne",
      name: "Level Four Corridor T",
      description:
        "This is a T in the wide corridor. It heads off to the east and west here. There is a small sign on the north wall which says 'BOTANICAL', with an arrow pointing left, and 'ZOOLOGICAL' with an arrow pointing right.",
      exits: [
        { direction: "south", toRoomId: "LevelFourCorridorTwo" },
        { direction: "west", doorId: "HydroponicsDoors" },
        { direction: "north", doorId: "ZoologicalDoors" },
      ],
    },
    {
      id: "ZooOne",
      name: "Zoological One",
      description:
        "This is the zoo zone entryway, from here you can see the Aviary to the northeast, the Veterinary Center to the northwest, and a sealed preserve transfer room to the east. To the south is the main corridor leading back to the power grid and hydroponics sections.",
      exits: [
        { direction: "south", doorId: "ZoologicalDoors" },
        { direction: "northeast", toRoomId: "OuterRingSouth" },
        { direction: "northwest", toRoomId: "VeterinaryCenter" },
        { direction: "north", toRoomId: "GamePreservePortal" },
      ],
    },
    {
      id: "GamePreservePortal",
      name: "Game Preserve Portal",
      description:
        "This compact staging room sits between the public zoological corridor and a more theatrical hunting simulation beyond. A dead transfer pad is set into the floor, and mounted beside it is a preserve control panel built around a CRT readout, a chunky rotary dial, and a square button labeled HUNT. The only ordinary way out is back west.",
      exits: [{ direction: "south", toRoomId: "ZooOne" }],
    },
    {
      id: "RemotePowerStation",
      name: "Power Station E",
      description:
        "This looks like it was once a large storage area for the power facilities, but the way north is blocked almost immediately by a series of collapsed metal shelving. You can see replacement transformers, fuses, wires, and other components strewn about in the area beyond, which seems to have been rocked by a large explosion. Near the west wall in a relatively undamaged part of the room is a glassy yellow disk.",
      exits: [],
    },
    {
      id: "PowerGrid",
      name: "Power Grid",
      description:
        "This is a large room which acts as the main access to the electrical power grid. The room is octagonal, and positioned along the walls on almost every side are a series of electronic level, status, and safety monitors and gauges which cause the darkened room to dance with flashing, multicolored lights. The room is dominated in the center by what looks like the main power station which accesses and routes the power from the main grids. [[SCENERY]]Positioned in one corner is a slightly raised yellow disk, four feet in diameter, which appears to be made of some glassy substance.",
      exits: [{ direction: "north", doorId: "PowerGridDoors" }],
    },
  ],
};
