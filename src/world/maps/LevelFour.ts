import { aviaryOrganismItems } from "src/world/Items/creatures/aviaryOrganisms";
import { aquariumRooms } from "src/world/maps/levelFour/Aquarium";
import { aviaryRooms } from "src/world/maps/levelFour/Aviary";
import { fungalCaveRooms } from "src/world/maps/levelFour/FungalCave";
import { greenhouseRooms } from "src/world/maps/levelFour/Greenhouse";
import { pondRooms } from "src/world/maps/levelFour/Pond";
import { preserveRooms } from "src/world/maps/levelFour/Preserve";
import { seedBankRooms } from "src/world/maps/levelFour/SeedBank";
import { veterinaryCenterRooms } from "src/world/maps/levelFour/VeterinaryCenter";
import type { WorldChunk } from "../../game/types/gameTypes";
import { levelFourDoors } from "../doors/levelFourDoors";
import { levelFourItems } from "../Items/levelFourMisc";

export const LEVEL_FOUR: WorldChunk = {
  items: [...levelFourItems, ...aviaryOrganismItems],
  doors: [...levelFourDoors],
  teleportPads: [],
  rooms: [
    ...aquariumRooms,
    ...aviaryRooms,
    ...preserveRooms,
    ...veterinaryCenterRooms,
    ...pondRooms,
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
        { direction: "north", toRoomId: "ZooOne" },
      ],
    },
    {
      id: "BotanicalOne",
      name: "Botanical One",
      description:
        "This is the summit of a grassy hill in a large simulated outdoor setting which stretches forward, sloping downward to the north. The area immediately surrounding you is still relatively green, but down the slope you can see a terrible fire still burning; what looks like the remains of hundreds of plants and trees now lie in twisted black ruin, their burning cores still glowing hotly in a vast expanse of smouldering charcoal. Low flames flicker over the field, and you hear the popping of pitch like gunshots as hot embers are cast on the hot, rising air. From where you stand, the air is hot, but the high ceiling seems to be trapping the worst of the heat. You can see a network of sprinkler heads high above, but for some reason they have not activated. In the grass nearby you can see a circular hatch of some kind, and next to that, a four foot by four foot stepping stone upon which is a slightly raised green disk, made of some glassy substance.",
      exits: [
        { direction: "east", doorId: "HydroponicsDoors" },
        { direction: "north", toRoomId: "Greenhouse" },
        { direction: "west", toRoomId: "FungalCave" },
        { direction: "south", toRoomId: "SeedBank" },
      ],
    },

    {
      id: "ZooOne",
      name: "Zoological One",
      description:
        "This is the zoo zone entryway, from here you can see the Aviary to the northeast, and the Veterenary Center to the northwest. To the south is the main corridor leading back to the power grid and hydroponics sections.",
      exits: [
        { direction: "south", toRoomId: "LevelFourCorridorOne" },
        { direction: "northeast", toRoomId: "OuterRingSouth" },
        { direction: "northwest", toRoomId: "VeterinaryCenter" },
      ],
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
