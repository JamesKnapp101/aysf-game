import { Item } from "@game/types/itemTypes";
import { Room } from "@game/types/roomTypes";
import { isSaunaDimlyLit, isSpaLightOn, spaLightSwitch } from "./spaLighting";
import { spaOrganism } from "./spaOrganism";

export const spaRooms: Room[] = [
  {
    id: "Spa",
    name: "Spa",
    description: `This is a high-end luxury spa with a shiny marble floor, dominated by a huge jacuzzi where four circular tubs converge in the middle to create a four-leaf clover formation, though the water has been drained and the high overhead light twinkles off the smooth, deep interior. There's a check in station near the spa entrance which is unoccupied, and to the left of that are racks with plush white towels and facecloths. The southern wall is entirely made of thick glass that looks into a multi-tiered steam room, a glass door with a brass handle providing access, and to the north is a small alcove where a cedar door with a round porthole leads into a sauna. To the west is the entrance to a nail salon, with a sign over the doorway that reads "Keratin Kindness".\n\nA light switch is visible on the east wall next to the exit to the park.`,
    describe: (state, room) =>
      isSpaLightOn(state)
        ? room.description
        : room.description.replace(
            "the glow of the overhead light twinkles off the jacuzzi's tiles",
            "the overhead light is off",
          ),
    exits: [
      { direction: "east", toRoomId: "ParkWest" },
      { direction: "south", doorId: "SteamRoomDoor" },
      { direction: "north", doorId: "CedarDoor" },
      { direction: "west", doorId: "NailSalonDoor" },
    ],
  },
  {
    id: "Sauna",
    name: "Spa: Sauna",
    description: `It's almost pitch black in here as the only light to see by is what trickles in from the main Spa before fading into darkness further in. Everything is cedar and benches provide a place to sit and sweat, though the heat isn't on at the moment. The entire chamber smells of body odor with a faint smell of eucalyptus, along with a whiff of decomposition. If you strain your eyes, you can just barely make out a figure sitting slumped on one of the benches.`,
    ambientLightLevel: "very-dim",
    describe: (state, room) =>
      room.description.replace(
        "It's almost pitch black in here as the only light to see by is what trickles in from the main Spa before fading into darkness further in.",
        isSaunaDimlyLit(state)
          ? "Very dim light enters through the open cedar door from the Spa, just enough to explore the Sauna."
          : isSpaLightOn(state)
            ? "No ambient light reaches into the Sauna from the Spa."
            : "The Spa beyond the doorway is unlit, and no light trickles in from it.",
      ),
    exits: [{ direction: "south", doorId: "CedarDoor" }],
  },
  {
    id: "SteamRoom",
    name: "Spa: Steam Room",
    description: `This is a large, rectangular room with a high, vaulted ceiling where every surface is covered in small, white ceramic tile and a tiered, tiled bench dominates the center of the room. The air is cool and dry, now.`,
    exits: [{ direction: "north", doorId: "SteamRoomDoor" }],
  },
  {
    id: "NailSalon",
    name: "Spa: Nail Salon",
    description: `This is a cozy little spot with floor to ceiling mirrored wall panels, containing rows of white high-backed pedicure chairs with foot basins and upholstered stools arranged in front, as well as a long, elegant glass-topped nail station on the opposite side. Hanging over the table are a series of glossy purple pendant lights, along with clusters of silk cherry blossoms. The room smells faintly of a pleasant mixture of scented oils.`,
    exits: [{ direction: "east", doorId: "NailSalonDoor" }],
  },
];

function scenery(
  id: string,
  name: string,
  location: string,
  description: string,
  vocab: string[],
): Item {
  return {
    id,
    name,
    location,
    description,
    vocab,
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 0,
  };
}

export const spaItems: Item[] = [
  spaOrganism,
  scenery(
    "SpaTiles",
    "ceramic tiles",
    "Spa",
    "Pristine white ceramic tiles cover the floor and walls. The grout is so clean it makes the abandoned spa feel even less welcoming.",
    ["tiles", "tile", "tiling", "ceramic", "floor", "walls"],
  ),
  scenery(
    "SpaReception",
    "check-in station",
    "Spa",
    "An empty reception desk faces the entrance. Nobody is here to check you in, and the faded appointment board offers little reassurance.",
    [
      "station",
      "check-in station",
      "check in station",
      "desk",
      "reception",
      "reception desk",
    ],
  ),
  scenery(
    "SpaTowels",
    "towel racks",
    "Spa",
    "Neatly folded towels and facecloths fill the racks beside reception. Someone left this place ready for customers who never arrived.",
    ["rack", "racks", "towel", "towels", "facecloth", "facecloths"],
  ),
  scenery(
    "SpaCeiling",
    "high ceiling",
    "Spa",
    "The high ceiling and hard tiled surfaces give every footstep a small, lonely echo.",
    ["ceiling", "acoustics", "echo", "echoes"],
  ),
  {
    ...scenery(
      "SpaOverheadLight",
      "overhead light",
      "Spa",
      "The overhead light gleams against the white tile. A switch beside the eastern exit controls the spa lighting.",
      ["light", "lights", "overhead light", "overhead lights"],
    ),
    describe: (state) =>
      isSpaLightOn(state)
        ? "The overhead light gleams against the white tile. A switch beside the eastern exit controls the spa lighting."
        : "The overhead light is off. A switch beside the eastern exit controls the spa lighting.",
  },
  spaLightSwitch,
  scenery(
    "SpaSaunaSign",
    "carved wooden sign",
    "Spa",
    "The word 'Sauna' is carved into a wooden sign above the northern cedar door.",
    ["sign", "wooden sign", "carved sign", "sauna sign"],
  ),
  scenery(
    "SpaGlassWall",
    "glass wall",
    "Spa",
    "The thick glass southern wall looks into a large tiled Steam Room, allowing the slight from the Spa to stream in.",
    ["glass wall", "southern wall", "glass panels", "steam room wall"],
  ),
  scenery(
    "SaunaCedar",
    "cedar lining",
    "Sauna",
    "Cedar boards line the walls and ceiling. The wood retains a trace of eucalyptus, but the sauna's heat is off.",
    ["cedar", "wood", "boards", "walls", "ceiling", "lining"],
  ),
  scenery(
    "SaunaBenches",
    "cedar benches",
    "Sauna",
    "Broad cedar benches provide places to sit and sweat. The body of a heavily muscled man is slumped on one of them.",
    ["bench", "benches", "platform", "platforms", "seat", "seats"],
  ),
  scenery(
    "SaunaSmell",
    "stale sauna air",
    "Sauna",
    "Stale body odor and a faint trace of eucalyptus mingle with the not-as-pleasant smell of decomposition.",
    ["smell", "odor", "eucalyptus", "decomposition", "air"],
  ),
  scenery(
    "SteamRoomTiles",
    "white ceramic tiles",
    "SteamRoom",
    "Small white ceramic tiles cover the floor and walls, cool and dry. It's been a while since there was any steam in here.",
    ["tiles", "tile", "floor", "walls", "ceramic", "steam", "air"],
  ),
  scenery(
    "SteamRoomBench",
    "tiered tiled bench",
    "SteamRoom",
    "The central bench rises in tiled tiers, broad enough for several people to sit at different heights.",
    ["bench", "benches", "tier", "tiers", "seats", "seat"],
  ),
  scenery(
    "SteamRoomCeiling",
    "vaulted ceiling",
    "SteamRoom",
    "The tiled ceiling arches high over the central bench.",
    ["ceiling", "vault", "vaulted ceiling"],
  ),
  scenery(
    "SteamRoomGlassWall",
    "glass wall",
    "SteamRoom",
    "Through the thick northern glass wall you can see the main Spa.",
    ["glass wall", "northern wall", "window", "glass panels"],
  ),
  scenery(
    "NailSalonMirrors",
    "mirrored wall panels",
    "NailSalon",
    "Floor-to-ceiling mirrors make the space look larger than it is, reflecting rows of empty stations.",
    ["mirror", "mirrors", "panels", "walls", "mirrored panels"],
  ),
  scenery(
    "NailSalonChairs",
    "pedicure chairs",
    "NailSalon",
    "White high-backed pedicure chairs stand in orderly rows, each facing a foot basin and a small stool.",
    ["chair", "chairs", "pedicure", "pedicure chairs", "backs"],
  ),
  scenery(
    "NailSalonBasins",
    "foot basins",
    "NailSalon",
    "The basins below the pedicure chairs are empty and clean, their little taps bone dry.",
    ["basin", "basins", "foot basin", "foot basins", "taps"],
  ),
  scenery(
    "NailSalonStools",
    "upholstered stools",
    "NailSalon",
    "Low upholstered stools are positioned in front of the chairs, giving the robot nail technicians someplace to sit while working.",
    ["stool", "stools", "upholstery", "upholstered stools"],
  ),
  scenery(
    "NailSalonStation",
    "glass-topped nail station",
    "NailSalon",
    "A long glass-topped table forms the nail station opposite the chairs, with a polished surface that reflects the purple pendant lights above.",
    ["station", "nail station", "table", "glass-topped table", "glass top"],
  ),
  scenery(
    "NailSalonLights",
    "purple pendant lights",
    "NailSalon",
    "Glossy purple pendant lights hang over the nail station, casting a soft glow.",
    ["light", "lights", "pendant", "pendants", "purple lights"],
  ),
  scenery(
    "NailSalonBlossoms",
    "silk cherry blossoms",
    "NailSalon",
    "The cherry blossoms are fake, made from fake silk, but they're very realistic, down to the faint, floral scent.",
    ["blossom", "blossoms", "cherry", "silk", "flowers", "branches"],
  ),
  scenery(
    "NailSalonScent",
    "scented oils",
    "NailSalon",
    "A faint, pleasant mixture of scented oils lingers around the chairs and upholstery.",
    ["oil", "oils", "scent", "smell", "air"],
  ),
  {
    id: "RobotWhistle",
    name: "a small metal whistle",
    description: `It's a small, pipe-shaped metal whistle, about the length of your index finger.`,
    location: "seeded",
    vocab: ["whistle", "robot", "metal"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 0,
    itemSize: 1,
    overrides: {
      blow: "You blow into the little whistle but it doesn't make any noise, at least not one you can hear.",
    },
  },
];
