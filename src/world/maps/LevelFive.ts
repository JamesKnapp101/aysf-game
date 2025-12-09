import { levelFiveItems } from "../objects/levelFiveMisc";
import type { WorldChunk } from "../types";

export const LEVEL_FIVE: WorldChunk = {
  rooms: [
    {
      id: "EngineRoom",
      name: "Engine Room",
      description:
        "This is the ship's engine room, which consists of a semi-circular area curving to the west. Along the curving walls are an array of monitors and gauges, including a viewscreen which is displaying information. In front of the viewscreen is a large, round silver receptacle which looks like it would hold a key. Next to the keyhole is a round, flat red button which is solidly lit. To the west is a bulkhead which leads to the engine core. The bulkhead is currently closed, but appears to have been damaged; there is a gap between the two heavy doors from which an angry, orange light is spilling, along with a steady trickle of steam. There is a panel with a radiation symbol over the bulkhead which is currently lit up red.",
      exits: [
        { direction: "east", toRoomId: "MainEngineering" },
        // west is blocked: "You'll never be able to squeeze through the gap."
      ],
    },
    {
      id: "MainEngineering",
      name: "Main Engineering",
      description:
        "This is a large area which is devoted to the ship's engineering; there is a myriad of machinery, mainframes, monitors, and all manner of modern multifarious mechanisms merging into a mighty monolithic monstrosity mounted above, consisting of a mammoth apparatus surrounded on all sides by a maze of wiring, pipes, and ducts which cross the room and disappear into the wall to the west. On the western wall is a featureless door with some kind of proximity scanner next to it. The scanner has a brown strip across the top of it. Positioned in one corner is a slightly raised brown disk, four feet in diameter, which is made of some kind of glassy substance. Mounted above the door is a panel which is lit up red bearing a radiation symbol.",
      exits: [
        { direction: "west", toRoomId: "EngineRoom" },
        { direction: "east", toRoomId: "EngCorridorTwo" },
      ],
    },
    {
      id: "MaintenanceDuct",
      name: "Maintenance Duct",
      description:
        "You are standing in a small, dark room constructed as a perfect cube, about eight feet by eight feet on each side. The walls and floors have a sort of drab, grimy look to them which suggests this area is not well traveled. The air is warm here, and dry, smelling faintly of oil. The only way out seems to be through a dark, octagonal crawlspace situated near the floor on the north wall. In the center of the room is a glassy brown disc nestled in the middle of a square, slightly raised mounting.",
      exits: [{ direction: "north", toRoomId: "MaintenanceDuctTwo" }],
    },
    {
      id: "MaintenanceDuctTwo",
      name: "Maintenance Duct",
      description:
        "You are crouching in the middle of some kind of maintenance duct. It looks like there are a series of light panels mounted every few feet or so, but they don't seem to be working. The duct extends into the darkness to the north and south.",
      exits: [
        { direction: "north", toRoomId: "MaintenanceDuctThree" },
        { direction: "south", toRoomId: "MaintenanceDuct" },
      ],
    },
    {
      id: "MaintenanceDuctThree",
      name: "Maintenance Duct",
      description:
        "The maintenance duct comes to an end here, where a metal-runged ladder descends into the darkness through an octagonal access port in the floor. On the eastern wall of the duct, you can see some kind of rectangular keypad has been crookedly mounted. A series of wires trail from behind the device, snaking down the wall, across the floor, and into the mounting around the access port. Lying face down on the floor is the body of a man dressed in some kind of black and grey uniform. It looks as though he was crawling through the duct toward the access port when he collapsed.",
      exits: [
        { direction: "south", toRoomId: "MaintenanceDuctTwo" },
        { direction: "down", toRoomId: "BombChamber" },
      ],
    },
    {
      id: "BombChamber",
      name: "Warp Chamber",
      description:
        "This is a large, open chamber which appears to be for the access and maintenance of the engine core. The ceiling here is vaulted, with the access ladder leading down from the peak of the dome, through a grid of ductwork and cabling, to the deck. The lights are out here, but a dim glow emanates from a large rectangular observation window which looks in on a portion of the gently pulsing core. Even in the dim light, you can see that this chamber was the scene of a violent confrontation recently; the observation window has been splashed with a jet of what looks like blood, and there are two bodies here. The first is a middle-aged woman with a sinewy body and short hair. She is wearing a pair of fatigues, combat boots, and a form-fitting white T-shirt with a single black Kanji character printed on it. She lies on her back, arms and legs sprawled out to either side, and there is a single bullet hole above her left breast. A large pool of blood has formed around her body. To her left, a few feet away from one clawed hand, is a rectangular wooden crate which is open to reveal a large capsule-shaped device of some kind with an LED display mounted on it. Just beneath the LED is a small panel which has been removed to reveal a series of wires inside. The crate has been placed near the main computer array and is peppered with blood spots. Just in front of the crate is the body of a man dressed all in black and wearing body armor, including a helmet with face-shield. There is a small knife sticking out of one side of his neck, and blood has run down the front of him in a sheet and formed a pool around him. One of his hands still clutches the side of the crate, as if he were pulling himself toward it when he died.",
      exits: [{ direction: "up", toRoomId: "MaintenanceDuctThree" }],
    },
    {
      id: "EngCorridorOne",
      name: "Engineering Corridor One",
      description:
        "This is the main corridor leading into the engineering section. It forms an 'L' here and bends south, and also heads back to the east.",
      exits: [
        { direction: "south", toRoomId: "EngCorridorTwo" },
        { direction: "east", toRoomId: "LevelFiveStairAccess" },
      ],
    },
    {
      id: "EngCorridorTwo",
      name: "Engineering Corridor Two",
      description:
        "This is the main corridor providing access to the engineering section. It heads back to the north, and continues south as well. To the west is a doorway providing access to what looks like the main engineering section. To the east is a set of heavy double doors which have been buckled and jammed in place due to some kind of impact; there's a space between the doors that is not nearly wide enough to crawl through, and you can't see much through it.",
      exits: [
        { direction: "north", toRoomId: "EngCorridorOne" },
        { direction: "south", toRoomId: "EngCorridorThree" },
        { direction: "east", toRoomId: "Warehouse" },
        { direction: "west", toRoomId: "MainEngineering" },
      ],
    },
    {
      id: "EngCorridorThree",
      name: "Engineering Corridor Three",
      description:
        "The corridor ends here, where a large doorway to the east opens up into a wide open area of some kind.",
      exits: [
        { direction: "north", toRoomId: "EngCorridorTwo" },
        { direction: "east", toRoomId: "ShuttleBay" },
      ],
    },
    {
      id: "ShuttleBay",
      name: "Shuttle Bay",
      description:
        "This is a wide, open area which acts as a landing bay for the large shuttlecraft which dominates it. The bay itself is mostly empty, the floor painted with green and white lines dividing it into zones. The shuttle itself is not that large; from out here it looks like it might be capable of carrying maybe six people. It's shaped like a half-moon, wide in the back where the engines are mounted, then tapering to a near point along the edge. It is mounted on three short landing pads, and pointed in the direction of a set of large bay doors. There is a door leading into the craft to the north.",
      exits: [
        { direction: "west", toRoomId: "EngCorridorThree" },
        { direction: "north", doorId: "ShuttleDoor" },
      ],
    },
    {
      id: "InsideShuttle",
      name: "Inside Shuttle",
      description:
        "This is the somewhat cramped interior of one of the ship's shuttlecrafts. A dim overhead light illuminates the interior to reveal a series of cushioned seats along the north and south sides. One such seat cushion has a nylon tab extending from it, and below that the word 'STORAGE' is stenciled in white letters. There is a featureless door to the east which looks like it leads to the cockpit.",
      exits: [
        { direction: "south", toRoomId: "ShuttleDoor" },
        { direction: "east", doorId: "ShuttleCockpitDoor" },
      ],
    },
    {
      id: "Warehouse",
      name: "Warehouse",
      description:
        "This is a large, open area filled with a series of tall metal shelving, many of which have now twisted on their brackets and are leaning against one another like huge, scattered dominoes, their contents scattered throughout the rows and aisles. The place is a complete mess; computer devices, machine parts, and all manner of junk and debris are scattered everywhere. Some of the metal shelving has come crashing down onto the floor, where it lies scattered amongst the flotsam.",
      exits: [{ direction: "west", toRoomId: "EngCorridorTwo" }],
    },
  ],
  items: [...levelFiveItems],
  doors: [
    {
      id: "ShuttleDoor",
      name: "a security door leading into the shuttle",
      descriptionFromA:
        "To the north is a security door leading into the shuttle. Mounted next to the door is some kind of biometrics reader that appears to take a thumbprint.",
      descriptionFromB: "To the south the door leads back out of the shuttle.",
      kind: "keyed",
      vocab: ["door", "shuttle door", "security door"],
      connects: {
        roomAId: "ShuttleBay",
        roomBId: "InsideShuttle",
      },
      directions: { fromA: "north", fromB: "south" },
      initiallyOpen: false,
      initiallyLocked: true,
    },
    {
      id: "ShuttleCockpitDoor",
      name: "a narrow door leading into the shuttle's cockpit",
      descriptionFromA:
        "To the east is a narrow door leading into the shuttle's cockpit.",
      descriptionFromB: "",
      kind: "keyed",
      vocab: ["door", "cockpit door"],
      connects: {
        roomAId: "InsideShuttle",
        roomBId: "InsideShuttle", // Currently no way in
      },
      directions: { fromA: "east", fromB: "west" },
      initiallyOpen: false,
      initiallyLocked: true,
    },
  ],
  teleportPads: [],
};
