import { Item } from "@game/types/itemTypes";
import { Room } from "@game/types/roomTypes";
import { isSaunaDimlyLit, isSpaLightOn, spaLightSwitch } from "./spaLighting";
import { spaOrganism } from "./spaOrganism";

export const spaRooms: Room[] = [
  {
    id: "Spa",
    name: "Spa",
    description: `This appears to be some kind of recreational spa. It is a wide, open area with pristine white ceramic tiling covering the floor and walls. The center of the spa is dominated by what looks like a very large jacuzzi which has a sort of 'four leaf clover' shape, effectively providing four separate areas to congregate. The water has been drained, though, and the glow of the overhead light twinkles off the jacuzzi's tiles. There is a check-in station near the spa entrance which is unoccupied, and racks with towels and facecloths are located just to the left of that. The room is large with a high ceiling, and the wide open space gives the whole room excellent acoustics, causing even your footsteps to echo slightly. To the north is a sturdy-looking cedar door, over which hangs a carved wooden sign reading 'Sauna'. The entire southern wall is thick glass that looks into a multi-tiered steam room, and a glass door with a brass handle allows access. To the west is the entrance to a nail salon.\n\nA light switch is visible on the east wall next to the exit to the park.`,
    describe: (state, room) => isSpaLightOn(state) ? room.description : room.description
      .replace("the glow of the overhead light twinkles off the jacuzzi's tiles", "the overhead light is off"),
    exits: [
      { direction: "east", toRoomId: "ParkWest" },

      { direction: "south", doorId: "SteamRoomDoor" },
      { direction: "north", doorId: "CedarDoor" },

      { direction: "west", doorId: "NailSalonDoor" },
    ],
  },
  {
    id: "Sauna",
    name: "Sauna",
    description: `It's almost pitch black in here as the only light to see by is what trickles in from the main Spa before fading into darkness further in. Everything is cedar and benches provide a place to sit and sweat, though the heat isn't on at the moment. The entire chamber smells of body odor with a faint smell of eucalyptus, along with a whiff of decomposition. If you strain your eyes, you can just barely make out a figure sitting slumped on one of the benches.`,
    ambientLightLevel: "very-dim",
    describe: (state, room) => room.description.replace(
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
    name: "Steam Room",
    description: `This is a large, rectangular room with a high, vaulted ceiling where every surface is covered in small, white ceramic tile and a tiered, tiled bench dominates the center of the room. The air is cool and dry, now.`,
    exits: [{ direction: "north", doorId: "SteamRoomDoor" }],
  },
  {
    id: "NailSalon",
    name: "Nail Salon",
    description: `This is a cozy little spot with floor to ceiling mirrored wall panels, containing rows of white high-backed pedicure chairs with foot basins and upholstered stools arranged in front, as well as a long, elegant glass-topped nail station on the opposite side. Hanging over the table are a series of glossy purple pendant lights, along with silk cherry blossoms. The room smells faintly of a pleasant mixture of scented oils.`,
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
    id, name, location, description, vocab,
    itemClass: "solid", itemCategory: "scenery", itemWeight: 0, itemSize: 0,
  };
}

export const spaItems: Item[] = [
  spaOrganism,
  scenery("SpaTiles", "ceramic tiles", "Spa",
    "Pristine white ceramic tiles cover the floor and walls. The grout is so clean it makes the abandoned spa feel even less welcoming.",
    ["tiles", "tile", "tiling", "ceramic", "floor", "walls"]),
  scenery("SpaReception", "check-in station", "Spa",
    "An empty reception desk faces the entrance. Nobody is here to check you in, and the faded appointment board offers little reassurance.",
    ["station", "check-in station", "check in station", "desk", "reception", "reception desk"]),
  scenery("SpaTowels", "towel racks", "Spa",
    "Neatly folded towels and facecloths fill the racks beside reception. Someone left this place ready for customers who never arrived.",
    ["rack", "racks", "towel", "towels", "facecloth", "facecloths"]),
  scenery("SpaCeiling", "high ceiling", "Spa",
    "The high ceiling and hard tiled surfaces give every footstep a small, lonely echo.",
    ["ceiling", "acoustics", "echo", "echoes"]),
  {
    ...scenery("SpaOverheadLight", "overhead light", "Spa",
      "The overhead light gleams against the white tile. A switch beside the eastern exit controls the spa lighting.",
      ["light", "lights", "overhead light", "overhead lights"]),
    describe: state => isSpaLightOn(state)
      ? "The overhead light gleams against the white tile. A switch beside the eastern exit controls the spa lighting."
      : "The overhead light is off. A switch beside the eastern exit controls the spa lighting.",
  },
  spaLightSwitch,
  scenery("SpaSaunaSign", "carved wooden sign", "Spa",
    "The word 'Sauna' is carved into a wooden sign above the northern cedar door.",
    ["sign", "wooden sign", "carved sign", "sauna sign"]),
  scenery("SpaGlassWall", "glass wall", "Spa",
    "The thick glass southern wall looks into the tiled Steam Room. Light can pass through it even with the brass-handled door closed.",
    ["glass wall", "southern wall", "glass panels", "steam room wall"]),
  scenery("SaunaCedar", "cedar lining", "Sauna",
    "Cedar boards line the walls and ceiling. The wood retains a trace of eucalyptus, but the sauna's heat is off.",
    ["cedar", "wood", "boards", "walls", "ceiling", "lining"]),
  scenery("SaunaBenches", "cedar benches", "Sauna",
    "Broad cedar benches provide places to sit and sweat. A body is slumped on one of them.",
    ["bench", "benches", "platform", "platforms", "seat", "seats"]),
  scenery("SaunaSmell", "stale sauna air", "Sauna",
    "Stale body odor and a faint trace of eucalyptus mingle with the unmistakable smell of decomposition.",
    ["smell", "odor", "eucalyptus", "decomposition", "air"]),
  scenery("SteamRoomTiles", "white ceramic tiles", "SteamRoom",
    "Small white ceramic tiles cover the floor and walls. They are cool and dry; there is no steam running now.",
    ["tiles", "tile", "floor", "walls", "ceramic", "steam", "air"]),
  scenery("SteamRoomBench", "tiered tiled bench", "SteamRoom",
    "The central bench rises in tiled tiers, broad enough for several people to sit at different heights.",
    ["bench", "benches", "tier", "tiers", "seats", "seat"]),
  scenery("SteamRoomCeiling", "vaulted ceiling", "SteamRoom",
    "The tiled ceiling arches high over the central bench. The room has none of the warmth its design promises.",
    ["ceiling", "vault", "vaulted ceiling"]),
  scenery("SteamRoomGlassWall", "glass wall", "SteamRoom",
    "Through the thick northern glass wall you can see the main Spa. Closing the glass door blocks passage, but does not shut out the Spa's light.",
    ["glass wall", "northern wall", "window", "glass panels"]),
  scenery("NailSalonMirrors", "mirrored wall panels", "NailSalon",
    "Floor-to-ceiling mirrors repeat the empty chairs into rows of vacant reflections.",
    ["mirror", "mirrors", "panels", "walls", "mirrored panels"]),
  scenery("NailSalonChairs", "pedicure chairs", "NailSalon",
    "White high-backed pedicure chairs stand in orderly rows, each facing a foot basin and a small stool.",
    ["chair", "chairs", "pedicure", "pedicure chairs", "backs"]),
  scenery("NailSalonBasins", "foot basins", "NailSalon",
    "The basins below the pedicure chairs are empty and clean. Their little taps are dry.",
    ["basin", "basins", "foot basin", "foot basins", "taps"]),
  scenery("NailSalonStools", "upholstered stools", "NailSalon",
    "Low upholstered stools sit in front of the chairs, positioned for someone to spend a shift working at ankle height.",
    ["stool", "stools", "upholstery", "upholstered stools"]),
  scenery("NailSalonStation", "glass-topped nail station", "NailSalon",
    "A long glass-topped table forms the nail station opposite the chairs. Its polished surface reflects the purple pendant lights.",
    ["station", "nail station", "table", "glass-topped table", "glass top"]),
  scenery("NailSalonLights", "purple pendant lights", "NailSalon",
    "Glossy purple pendant lights hang over the nail station, casting a softer glow than the main Spa's overhead light.",
    ["light", "lights", "pendant", "pendants", "purple lights"]),
  scenery("NailSalonBlossoms", "silk cherry blossoms", "NailSalon",
    "The cherry blossoms are silk. Their carefully arranged branches have outlasted the salon's customers.",
    ["blossom", "blossoms", "cherry", "silk", "flowers", "branches"]),
  scenery("NailSalonScent", "scented oils", "NailSalon",
    "A faint, pleasant mixture of scented oils lingers around the chairs and upholstery. No bottles have been left out.",
    ["oil", "oils", "scent", "smell", "air"]),
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
