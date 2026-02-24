import { Room } from "@game/types/roomTypes";

export const gymRooms: Room[] = [
  // GYM
  {
    id: "GymEntrance",
    name: "Gymnasium Entrance",
    description: `This is the entrance to a gymnasium of some sort. There are aluminum and plexiglass double-doors leading northeast into the gym, and mounted over the entrance is a sign reading 'PLANET FITNESS' and sporting a logo of a comically muscled man with a mean-looking grin holding a ringed planet with a distressed face in a headlock.`,
    exits: [
      { direction: "southwest", toRoomId: "ParkCenter" },
      { direction: "northeast", toRoomId: "Gym" },
      { direction: "south", toRoomId: "ParkEast" },
      { direction: "west", toRoomId: "ParkNorth" },
    ],
  },
  {
    id: "Gym",
    name: "Gymnasium: Cardio Center",
    description: `This is a large gymnasium broken down into several parts; there are numerous weight machines present on the main floor, and next to that an open area with a few benches where racks of free-weights rest against the wall. Another portion of the main floor is set aside for stationary bicycles, stair machines, and treadmills. There is a track for running which forms a rectangle around the room's perimeter. To the northwest is a doorway, mounted over which is a small sign reading 'MEN'S SHOWERS', and to the northeast is another doorway with a small sign reading 'WOMEN'S SHOWERS'. The gym's exit is to the southwest.`,
    exits: [
      { direction: "northeast", toRoomId: "WomensShower" },
      { direction: "northwest", toRoomId: "MensShower" },
      { direction: "southwest", toRoomId: "GymEntrance" },
      { direction: "north", toRoomId: "GymWeightRoom" },
    ],
  },
  {
    id: "GymWeightRoom",
    name: "Gymnasium: Weight Room",
    description: `This is the weight room portion of the gymnasium, filled with various weight machines, benches, and racks of free-weights. There are several large mirrors mounted on the walls, and the floor is covered in thick rubber matting to help absorb the impact of dropped weights. There is an exit back to the main gym area to the west.`,
    exits: [{ direction: "south", toRoomId: "Gym" }],
  },
  {
    id: "MensShower",
    name: "Men's Locker Room",
    description: `This is the men's locker room. There are a series of thin, worn wooden benches running alongside rows of lockers. To the south is a doorway leading into the showers, and to the north is a doorway which leads back out to the gymnasium.`,
    exits: [
      // { direction: "south", toRoomId: "MShower" },    // Just combine the locker room and showers
      { direction: "southeast", toRoomId: "Gym" },
    ],
  },
  // {
  //   id: "MShower",
  //   name: "Men's Shower",
  //   description: `This is a large, open shower area with three showerheads available on each of the east, west, and south walls. The entire room, floor, walls, and ceiling, is tiled with small, shiny white tiles.`,
  //   exits: [{ direction: "north", toRoomId: "MensShower" }],
  // },
  {
    id: "WomensShower",
    name: "Women's Locker Room",
    description: `This is the women's locker room. There are a series of thin, worn wooden benches running alongside rows of lockers. To the south is a doorway leading into the showers, and to the north is a doorway which leads back out to the gymnasium.`,
    exits: [
      { direction: "southwest", toRoomId: "Gym" },
      // { direction: "south", toRoomId: "WShower" },
    ],
  },
  // {
  //   id: "WShower",
  //   name: "Women's Shower",
  //   description: `This is a large, open shower area with three showerheads available on each of the east, west, and south walls. The entire room, floor, walls, and ceiling, is tiled with small, shiny white tiles.`,
  //   exits: [{ direction: "north", toRoomId: "WomensShower" }],
  // },
];
