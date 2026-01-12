import { Room } from "@game/types/roomTypes";

export const spaRooms: Room[] = [
  {
    id: "Spa",
    name: "Spa",
    description: `This appears to be some kind of recreational spa. It is a wide, open area with pristine white ceramic tiling covering the floor and walls. The center of the spa is predominated by a what looks like a very large jaquzzi which has a sort of 'four leaf clover' shape, effectively providing four separate areas to congregate. The jets in the tub are currently inactive, and the glow of the overhead light twinkles off the jaquzzi's tiles. There is a check in station to the right which is unoccupied, and racks with towels and facecloths are located just to the left of that. The room is large with a high ceiling, and the wide open space gives the whole room excellent acoustics, causing even your footsteps to echo slightly. There is a wooden door on the opposite wall to the west with a check-in board next to it. To the north is another wooden door which appears to be made of cedar, with a small glass porthole in it at about head's height. The the south is a white metal door with an aluminum handle.^^A light switch is visible on the east wall next to the exit.`,
    exits: [
      { direction: "east", doorId: "SteamRoomDoor" },
      { direction: "north", doorId: "CedarDoor" },
      { direction: "south", doorId: "LevelThreeSecondCorrThreeDoor" },
      { direction: "west", doorId: "MassageDoor" },
    ],
  },
  {
    id: "Sauna",
    name: "Sauna",
    description: `It's difficult to see in here; the light has been smashed and the only light to see by is what trickles in from the main Spa. You can see the interior of the sauna has taken heavy damage, with deep claw marks gouging every surface visible in the gloom. The entire chamber smells of body odor, with a faint smell of eucalyptus.`,
    exits: [{ direction: "south", doorId: "CedarDoor" }],
  },
  {
    id: "SteamRoom",
    name: "Steam Room",
    description: `It's hard to see in here; the interior light doesn't seem to be working and the only light is what seeps in from the main Spa. It appears to be a large, rectangular room with a high ceiling disappearing into the gloom. Every surface seems to be covered in small, white ceramic tile.`,
    exits: [{ direction: "west", doorId: "SteamRoomDoor" }],
  },
  {
    id: "Massage",
    name: "Massage Parlor",
    description: `This is a cozy, clean little room dominated by a comfortable-looking padded massage table. The room smells faintly of a pleasant mixture of scented oils.`,
    exits: [{ direction: "east", doorId: "MassageDoor" }],
  },
];
