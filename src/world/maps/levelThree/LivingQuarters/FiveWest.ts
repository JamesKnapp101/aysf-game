import { Item } from "@game/types/itemTypes";
import { Room } from "@game/types/roomTypes";
import { describeScotchBottle } from "@game/rules/items";

export const FiveWestRooms: Room[] = [
  // LIVING QUARTERS THREE EAST
  {
    id: "LivingQuartersFiveWest",
    name: "Living Quarters Five West",
    description: `This is a tasteful but disorderly living room, consisting mainly of a sofa and loveseat combination facing a television set and videogame console. A small, shag area rug covers a stain near the entryway with moderate success. There is a print on one wall depicting a pop idol. There is a door to the south and also to the west, and a doorway leading into what looks like a bedroom area to the east.`,
    exits: [
      { direction: "east", doorId: "BoulosResidenceDoor" },
      { direction: "north", doorId: "FiveWestBDoor" },
      { direction: "west", toRoomId: "FiveWestBed" },
    ],
  },
  {
    id: "FiveWestBath",
    name: "One East Bathroom",
    description: `This is a small bathroom, equipped with a stand-alone shower, a sink, and a washlet. Mounted on the wall above the sink is a mirror which is spattered here and there with toothpaste. The bathroom looks like it hasn't been cleaned in a while; the washlet has a ring of scum around the water-line and the sink looks as though it hasn't been scrubbed in months. A door leads back out to the north.`,
    exits: [{ direction: "south", doorId: "FiveWestBDoor" }],
  },
  {
    id: "FiveWestBed",
    name: "Five West Bedroom",
    description: `This room has an off-smell to it. There is a twin bed situated against the south wall, to your right, with an endtable next to it. The endtable has a ceramic lamp resting on it. The floor is littered with old laundry, and the whole place looks like it hasn't been cleaned in ages. Mounted over the bed is another print of what must be a musician of some kind.^^The bed covers are twisted around what looks like a human figure which is lying in the bed. Resting on the end table is a flat, compact messaging system with an integrated headset. A doorway leads back out to the west into the Living Area.`,
    exits: [{ direction: "east", toRoomId: "LivingQuartersFiveWest" }],
  },
];

export const fiveWestItems: Item[] = [
  {
    id: "FiveWestScotch",
    name: "bottle of scotch",
    description:
      "A tall bottle of dark scotch with a clean label and a heavy glass bottom.",
    describe: (_state, item) => describeScotchBottle(item),
    initialDescription: "A bottle of scotch sits on the end table.",
    location: "FiveWestBed",
    vocab: ["scotch", "bottle", "whisky", "whiskey", "liquor"],
    itemClass: "liquid",
    itemCategory: "collectable",
    itemWeight: 3,
    itemSize: 2,
    isConsumable: true,
    isContainer: true,
    isOpenable: false,
    doses: 17,
    meta: {
      consumable: {
        kind: "drink",
        perDose: [
          { type: "status", id: "drunk", intensity: 20, duration: 20 },
          {
            type: "message",
            text: "You take a bracing drink of scotch. It burns all the way down.",
          },
        ],
        onEmpty: [{ type: "message", text: "The bottle is empty." }],
      },
    },
  },
];
