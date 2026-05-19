import type { Room } from "@game/types/roomTypes";

export const parkRooms: Room[] = [
  {
    id: "ParkEast",
    name: "Park East",
    description: `This is a large, open, rectangular court where [[SCENERY]] A brick-paved path leads both north and south from here, and the park continues west.`,
    exits: [
      { direction: "east", doorId: "ParkDoor" },
      { direction: "north", toRoomId: "GymEntrance" },
      { direction: "south", toRoomId: "BarEntrance" },
      { direction: "west", toRoomId: "ParkCenter" },
    ],
  },
  {
    id: "ParkSouth",
    name: "Park South",
    description: `This is the southernmost point of the Park, as you follow along the outer rim of the brick-paved walkway. [[SCENERY]] The path continues east and west from here, and the park's center lies north across the grass.`,
    exits: [
      { direction: "east", toRoomId: "BarEntrance" },
      { direction: "west", toRoomId: "RestaurantEntrance" },
      { direction: "north", toRoomId: "ParkCenter" },
    ],
  },
  {
    id: "ParkWest",
    name: "Park West",
    description: `This is the westernmost point of the park, as you follow along the outer ring of the brick-paved walkway. [[SCENERY]]`,
    exits: [
      { direction: "southeast", toRoomId: "RestaurantEntrance" },
      { direction: "northeast", toRoomId: "MovieEntrance" },
      { direction: "east", toRoomId: "ParkMaintenance" },
      { direction: "west", toRoomId: "Spa" },
    ],
  },
  {
    id: "ParkNorth",
    name: "Park North",
    description: `This is the northernmost point of the Park, as you follow along the outer ring of the brick-paved walkway. [[SCENERY]] The circular path continues east and west from here.`,
    exits: [
      { direction: "east", toRoomId: "GymEntrance" },
      { direction: "west", toRoomId: "MovieEntrance" },
      { direction: "south", toRoomId: "ParkCenter" },
    ],
  },
  {
    id: "ParkMaintenance",
    name: "Maintenance Depot",
    description: `This section of the park sits at the bottom of a shallow, grassy bowl where [[SCENERY]] The park continues to the west.`,
    exits: [
      { direction: "east", toRoomId: "ParkCenter" },
      { direction: "west", toRoomId: "ParkWest" },
      { direction: "north", toRoomId: "MovieEntrance" },
      { direction: "south", toRoomId: "RestaurantEntrance" },
      { direction: "in", toRoomId: "ParkMaintenanceInterior" },
    ],
  },
  {
    id: "ParkMaintenanceInterior",
    name: "Inside Maintenance Depot",
    description: `The interior of the concrete structure is orderly and mostly clean, no small feat given the amount of refuse being stored here. [[SCENERY]]`,
    exits: [{ direction: "out", toRoomId: "ParkMaintenance" }],
  },
  {
    id: "ParkCenter",
    name: "Park Center",
    description: `You're standing in the center of the Park where [[SCENERY]]`,
    exits: [
      { direction: "north", toRoomId: "ParkNorth" },
      { direction: "south", toRoomId: "ParkSouth" },
      { direction: "east", toRoomId: "ParkEast" },
      { direction: "west", toRoomId: "ParkMaintenance" },
      { direction: "northeast", toRoomId: "GymEntrance" },
      { direction: "southeast", toRoomId: "BarEntrance" },
      { direction: "southwest", toRoomId: "RestaurantEntrance" },
      { direction: "northwest", toRoomId: "MovieEntrance" },
    ],
  },
];
