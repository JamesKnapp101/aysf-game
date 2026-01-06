import type { WorldChunk } from "../../game/types/gameTypes";
import { levelOneDoors } from "../doors/levelOneDoors";
import { levelOneItems } from "../Items/levelOneMisc";

export const LEVEL_ONE: WorldChunk = {
  items: [...levelOneItems],
  doors: [...levelOneDoors],
  teleportPads: [],
  rooms: [
    {
      id: "Bridge",
      name: "Main Bridge",
      description:
        "This is the main Bridge entryway. There is a faint yet unmistakable organic kind of smell lingering in the air here, a mingling of body-odors which sends a shiver down your spine. From where you are standing, the source of the odors is all too obvious; in the dim lighting you can make out the silhouettes of human figures slumped at their posts. A red light is flashing from above somewhere, rhythmically washing the scene in a flat electric crimson. Near the center of the room you can see the back of a figure's head poking above the command chair, the hair spiking out in disarray. To the east is some kind of station which appears to be unmanned. To the west is another station where a figure can be seen bent over in its chair. To the north is what looks like the command chair. On the deck in front of you is a slightly raised grey disk, four feet in diameter, made of some kind of glassy substance.",
      exits: [
        { direction: "south", doorId: "BridgeDoors" },
        { direction: "north", toRoomId: "BridgeCaptain" },
        { direction: "west", toRoomId: "BridgeTact" },
        { direction: "southwest", toRoomId: "BridgeComm" },
      ],
    },
    {
      id: "BridgeCaptain",
      name: "Bridge, Captain's Station",
      description:
        "This is the Captain's station, dominated by the Captain's chair which faces the main viewer.",
      exits: [
        { direction: "north", toRoomId: "BridgeHelm" },
        { direction: "south", toRoomId: "Bridge" },
        { direction: "west", toRoomId: "BridgeReady" },
        { direction: "east", toRoomId: "BridgeScience" },
      ],
    },
    {
      id: "BridgeScience",
      name: "Bridge, Science Station",
      description:
        "This is the Science Station of the Main Bridge, and the location of the main computer. The computer appears to be still operational; the contacts are glowing serenely and a small screen displays the word 'LOGIN:'",
      exits: [{ direction: "west", toRoomId: "BridgeCaptain" }],
    },
    {
      id: "BridgeHelm",
      name: "Bridge, Helm",
      description:
        "This is the Helm. The helmsman is slumped forward over the console, his hands still resting over the contacts. The console appears to be still active, the light of the contacts bathing the corpse's face in a ghostly, sallow glow. One contact in particular, a circular, glowing red contact, stands out.",
      exits: [{ direction: "south", toRoomId: "BridgeCaptain" }],
    },
    {
      id: "BridgeTact",
      name: "Bridge, Tactical",
      description:
        "This appears to be the Weapon's Station. A man's body is lying sprawled on the floor here just in front of the main console. The console looks to be still active.",
      exits: [{ direction: "east", toRoomId: "Bridge" }],
    },
    {
      id: "BridgeComm",
      name: "Bridge, Communications",
      description:
        "This is the ship's communications station. A woman's body is sitting slumped over in the chair, her head resting between her knees and her arms dangling onto the floor. The console seems to still be active; several lights are flashing regularly.",
      exits: [{ direction: "northeast", toRoomId: "Bridge" }],
    },
    {
      id: "BridgeReady",
      name: "Ready Room",
      description:
        "This is the Captain's ready room, a small, unassuming room which is dominated by a desk with a comfortable looking leather chair. To one side of the desk is what appears to be some kind of large glass cage or terrarium containing a variety of leafy branches and other greenery.",
      exits: [{ direction: "east", toRoomId: "BridgeCaptain" }],
    },
    {
      id: "LevelOneCorridorOne",
      name: "Level One Corridor",
      description:
        "This is a cold, dimly lit corridor. There is a door to the east with a badge scanner mounted next to it. To your left, the corridor begins to incline sharply, and the corridor rises up into darkness.",
      exits: [
        { direction: "north", doorId: "BridgeDoors" },
        { direction: "south", toRoomId: "LevelOneConf" },
        { direction: "west", toRoomId: "Observation" },
        { direction: "east", toRoomId: "LevelOneStairAccess" },
      ],
    },
    {
      id: "LevelOneConf",
      name: "War Room",
      description:
        "This is a large room dominated by a large conference table, around which ten chairs are assembled. This room seems to have recently seen a lot of activity, with papers strewn across the table and a jumble of hastilly drawn diagrams and notes on a nearby LCD board. The chairs are all ominously unoccupied now, their backs standing out in the dim lighting like a series of grim tombstones.",
      exits: [{ direction: "north", toRoomId: "LevelOneCorridorOne" }],
    },
    {
      id: "Observation",
      name: "Observation Deck",
      description:
        "This is a huge, circular deck with a domed ceiling that rises up into the darkness. The area has no furnishings at all, but there is a shiny brass rail which curves along the base of a huge viewing window which dominates roughly half of the chamber. The window also curves up into the darkness, and you can see stars shining through one hemisphere of the dome.",
      exits: [{ direction: "east", toRoomId: "LevelOneCorridorOne" }],
    },
  ],
};
