import { Room } from "@game/types/roomTypes";

export const oneEastRooms: Room[] = [
  // LIVING QUARTERS ONE EAST
  {
    id: "LivingQuartersOneEast",
    name: "Living Quarters One East",
    description: `This is a tasteful but disorderly living room, consisting mainly of a sofa and loveseat combination facing a television set and videogame console. A small, shag area rug covers a stain near the entryway with moderate success. There is a print on one wall depicting a pop idol. There is a door to the south and also to the west, and a doorway leading into what looks like a bedroom area to the east.`,
    exits: [
      { direction: "west", doorId: "DOOR3AE" },
      { direction: "south", doorId: "OneEastBDoor" },
      { direction: "east", toRoomId: "OneEastBed" },
    ],
  },
  {
    id: "OneEastBath",
    name: "One East Bathroom",
    description: `This is a small bathroom, equipped with a stand-alone shower, a sink, and a washlet. Mounted on the wall above the sink is a mirror which is spattered here and there with toothpaste. The bathroom looks like it hasn't been cleaned in a while; the washlet has a ring of scum around the water-line and the sink looks as though it hasn't been scrubbed in months. A door leads back out to the north.`,
    exits: [{ direction: "north", doorId: "OneEastBDoor" }],
  },
  {
    id: "OneEastBed",
    name: "One East Bedroom",
    description: `This room has an off-smell to it. There is a twin bed situated against the south wall, to your right, with an endtable next to it. The endtable has a ceramic lamp resting on it. The floor is littered with old laundry, and the whole place looks like it hasn't been cleaned in ages. Mounted over the bed is another print of what must be a musician of some kind.^^The bed covers are twisted around what looks like a human figure which is lying in the bed. Resting on the end table is a flat, compact messaging system with an integrated headset. A doorway leads back out to the west into the Living Area.`,
    exits: [{ direction: "west", toRoomId: "LivingQuartersOneEast" }],
  },
];
