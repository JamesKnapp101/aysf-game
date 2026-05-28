import type { WorldChunk } from "../../game/types/gameTypes";
import { levelSevenItems } from "../Items/levelSevenMisc";
import { describeDeepStorageGrid } from "./levelSeven/deepStorage";

export const LEVEL_SEVEN: WorldChunk = {
  items: [...levelSevenItems],
  doors: [],
  teleportPads: [],
  rooms: [
    {
      id: "LevelSevenCorridorBend",
      name: "Level Seven Corridor Bend",
      description:
        "The long, straight corridor ends here, and bends to the south. To the west is a blank white door with a light mounted over it which is currently dark. A flat white light illuminates this area, and you can see the white walls, ceiling, and floor are covered with blood splatters and sprays. Down the hall to the south you can see some scoring on the floor, like something was burned. There are several holes in the northern wall that look like they might be bullet holes.",
      exits: [
        { direction: "east", toRoomId: "LevelSevenStairAccess" },
        { direction: "west", toRoomId: "CryoLab" },
        { direction: "south", toRoomId: "Stasis" },
      ],
    },
    {
      id: "CryoLab",
      name: "Cryonics Laboratory",
      description:
        "This is a laboratory of some kind, consisting mostly of a large open area cluttered with equipment that you don't recognize. The northern portion of the room is dominated by a series of ten or so metal chambers resting side by side at about chest level. Each chamber has a glass window on its face providing a view inside, and each also has two armholes to which are connected thick rubbery black gloves to allow physical access. The chambers seem to all contain some kind of delicate-looking medical instruments along with different types of organic samples. Along the eastern wall are a series of what look like large pressurized canisters which extend floor to ceiling. Piping extends from the top of each canister, along the corners of the ceiling, and is distributed around the room mainly in the direction of the strange chambers. The southern part of the lab is devoted to a large array of computer equipment and workstations, which are all currently dark. Positioned in one corner is a slightly raised white disk, four feet in diameter, made of some kind of glassy substance.",
      exits: [{ direction: "east", toRoomId: "LevelSevenCorridorBend" }],
    },
    {
      id: "Stasis",
      name: "Stasis Dock",
      description:
        "This chamber is a docking vestibule for the cryogenic deep freeze. The walls are lined with sealed stasis pods and pale LCD panels, but the center of the room is dominated by a reinforced cradle built for a bulky environmental suit. To the north is the corridor bend; to the south, the dark mouth of the deep-storage grid exhales vapor cold enough to fog the floor.",
      exits: [
        { direction: "north", toRoomId: "LevelSevenCorridorBend" },
        { direction: "south", toRoomId: "DeepStorageGrid" },
      ],
    },
    {
      id: "DeepStorageGrid",
      name: "Cryogenic Deep Storage Grid",
      description:
        "The cryogenic deep freeze stretches away in a strict repeating grid of coffin-sized storage chambers.",
      describe: (state) => describeDeepStorageGrid(state),
      exits: [
        { direction: "north", toRoomId: "DeepStorageGrid" },
        { direction: "south", toRoomId: "DeepStorageGrid" },
        { direction: "east", toRoomId: "DeepStorageGrid" },
        { direction: "west", toRoomId: "DeepStorageGrid" },
        { direction: "out", toRoomId: "DeepStorageGrid" },
      ],
    },
    {
      id: "DeepStorageMedVault",
      name: "Biostasis Service Dock",
      description:
        "A narrow dock chamber hides behind the cryogenic grid at coordinate R20. The walls are packed with service panels, folded thermal blankets, and a rack of sealed medical canisters, all crusted with harmless-looking frost. A dock cradle waits beside the hatch back out to the grid, its clamps sized exactly for the cryonic suit. An equipment bay opens to the east.",
      exits: [
        { direction: "out", toRoomId: "DeepStorageGrid" },
        { direction: "east", toRoomId: "DeepStorageRecordsBay" },
      ],
    },
    {
      id: "DeepStorageRecordsBay",
      name: "Biostasis Records Bay",
      description:
        "This cramped records bay is colder than comfort but warmer than the grid. Ranks of black data wafers sit in foam-lined drawers, each drawer labeled with coordinate ranges and patient batch IDs. Most of the displays are dead, but one diagnostic slate blinks the same message over and over: ROUTE CONFIRMATION REQUIRED.",
      exits: [{ direction: "west", toRoomId: "DeepStorageMedVault" }],
    },
    {
      id: "DeepStorageArchiveDock",
      name: "Deep Archive Dock",
      description:
        "This dock is buried deep in the freeze grid at coordinate H24. It feels older than the rest of the level, as if it was sealed before the ship finished learning what it was. The suit cradle here is polished by use, and a low crawl of white vapor leaks through the grid hatch. A specimen gallery lies west.",
      exits: [
        { direction: "out", toRoomId: "DeepStorageGrid" },
        { direction: "west", toRoomId: "DeepStorageSpecimenGallery" },
      ],
    },
    {
      id: "DeepStorageSpecimenGallery",
      name: "Frozen Specimen Gallery",
      description:
        "The gallery is a silent corridor of upright cylinders filled with milky coolant. The shapes inside are deliberately hard to read: folded limbs, long shadows, and labels turned to the wall. On the far bulkhead, a stenciled warning has been half-scraped away, leaving only three legible words: DO NOT THAW.",
      exits: [{ direction: "east", toRoomId: "DeepStorageArchiveDock" }],
    },
  ],
};
