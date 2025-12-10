import { levelFourDoors } from "../doors/levelFourDoors";
import { levelFourItems } from "../objects/levelFourMisc";
import type { WorldChunk } from "../types";

export const LEVEL_FOUR: WorldChunk = {
  items: [...levelFourItems],
  doors: [...levelFourDoors],
  teleportPads: [],
  rooms: [
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
        { direction: "east", toRoomId: "ZooOne" },
      ],
    },
    {
      id: "HydroponicsOne",
      name: "Botanical One",
      description:
        "This is the summit of a grassy hill in a large simulated outdoor setting which stretches forward, sloping downward to the north. The area immediately surrounding you is still relatively green, but down the slope you can see a terrible fire still burning; what looks like the remains of hundreds of plants and trees now lie in twisted black ruin, their burning cores still glowing hotly in a vast expanse of smouldering charcoal. Low flames flicker over the field, and you hear the popping of pitch like gunshots as hot embers are cast on the hot, rising air. From where you stand, the air is hot, but the high ceiling seems to be trapping the worst of the heat. You can see a network of sprinkler heads high above, but for some reason they have not activated. In the grass nearby you can see a circular hatch of some kind, and next to that, a four foot by four foot stepping stone upon which is a slightly raised green disk, made of some glassy substance.",
      exits: [
        { direction: "east", doorId: "HydroponicsDoors" },
        { direction: "north", toRoomId: "HydroponicsTwo" },
        { direction: "down", doorId: "CellarDoor" },
      ],
    },
    {
      id: "HydroponicsCellar",
      name: "Botanical Cellar",
      description:
        "This is an underground maintenance area for the botanical section. It looks like it hasn't been visited in a while. You can see a large number of bags stacked in rows here, containing fertilizer, planting soil, and mixtures of manure and humus. There also seem to be a large number of spare parts such as sections of tubing, planters, and the like. Running along the walls on the western and northern sides of the room are a series of three large pipes along with a grouping of smaller ones which run the length of those walls and disappear into the ceiling above. Situated against the north wall is a large machine. It consists of two upright rectangular units connected at the base. One of the large pipes runs between the two units, where it joins a T that connects them together.",
      exits: [{ direction: "up", doorId: "CellarDoor" }],
    },
    {
      id: "HydroponicsTwo",
      name: "Botanical Two",
      description:
        "This area is almost a complete wasteland; the fire has done severe damage and there is not a plant or tree left standing. The blackened remains are soaked, the ash forming a runny grey-black mud which covers everything. The air is filled with a bitter, burned smell. The field slopes upward to the south, where the edge of the burned area gives way to the green summit of the hill, and down to the north, where it appears the fire also did extensive damage though some trees seem to have been spared.",
      exits: [
        { direction: "south", toRoomId: "HydroponicsOne" },
        { direction: "north", toRoomId: "HydroponicsThree" },
      ],
    },
    {
      id: "HydroponicsThree",
      name: "Botanical Three",
      description:
        "This is the northernmost portion and bottom of the long slope of the botanical area. The devastation has extended here as well, though to a slightly lesser degree. Though the damage is not quite as bad, it has left most of the trees and plants burned beyond recovery. To the south, a series of trees have been burned to charcoal, their blackened branches casting eerie shadows in the limited light. The ground is soaked here, and covered in a sludge of wet ash. Toward the north, some of the grass has survived, along with some of the bushes and shrubs. Three trees stand at the top of a gentle hill here; two have been burned completely, but what looks like a walnut tree is only partially burned.",
      exits: [{ direction: "south", toRoomId: "HydroponicsTwo" }],
    },
    {
      id: "ZooOne",
      name: "Zoological One",
      description:
        "This is a large room, which looks to be devoted to the care of animals; there are pen areas set aside, tables which look as though they might have been used to administer medicine, and other supplies such as clippers, brushes and swabs stored throughout the room. To the north is an open doorway, which seems to lead into another, larger area where animals are kept. The doorway is framed by some kind of electronic devices which are evenly spaced and pointed inward. They are each emitting a soft, red glow. Above the doorway is a small sign lit up red which reads 'Emergency Containment'.",
      exits: [
        { direction: "west", toRoomId: "LevelFourCorridorOne" },
        { direction: "north", toRoomId: "ZooTwo" },
      ],
    },
    {
      id: "ZooTwo",
      name: "Zoological Two",
      description:
        "This is a large, open area which seems to be an extension of the room to the south, reserved primarily for the care of animals. The area has been trashed a bit by a rampaging gorilla; tables have been overturned and equipment lies scattered all over the floor. The doorway to the south is surrounded by electronic devices which are evenly spaced and pointed inward. They are each emitting a soft, red glow. A large doorway opens to the east into what looks like some kind of huge warehouse. You can see a myriad of tiny, green lights glowing from within.",
      exits: [
        { direction: "south", toRoomId: "ZooOne" },
        { direction: "east", toRoomId: "ZooThree" },
      ],
    },
    {
      id: "ZooThree",
      name: "Zoological Three",
      description:
        "This is a large storage area filled with cryogenic chambers of all shapes and sizes. They are stacked on top of one another and assembled in rows. Glancing over a few of the closer ones you see small ones befitting a rodent or bird, mid-sized ones about the size of a large dog, large ones which look capable of containing a horse, and huge ones, the contents of which you can only imagine. This looks to be a veritable ark, with representatives of thousands, perhaps hundreds of thousands, of different species.",
      exits: [{ direction: "west", toRoomId: "ZooTwo" }],
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
        "This is a large room which acts as the main access to the electrical power grid. The room is octagonal, and positioned along the walls on almost every side are a series of electronic level, status, and safety monitors and gauges which cause the darkened room to dance with flashing, multicolored lights. The room is dominated in the center by what looks like the main power station which accesses and routes the power from the main grids. Positioned in one corner is a slightly raised yellow disk, four feet in diameter, which appears to be made of some glassy substance.",
      exits: [{ direction: "north", doorId: "PowerGridDoors" }],
    },
  ],
};
