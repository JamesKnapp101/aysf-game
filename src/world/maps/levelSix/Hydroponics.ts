import { Room } from "@game/types/roomTypes";

export const hydroponicsRooms: Room[] = [
  {
    id: "HydroponicsPlatform",
    name: "Hydroponics: Central Platform Top",
    description: `.`,
    exits: [
      { direction: "north", doorId: "HydroponicsDoor" },
      { direction: "down", toRoomId: "HydroponicsPlatformMid" },
    ],
  },
  {
    id: "HydroponicsPlatformMid",
    name: "Hydroponics: Central Platform Middle",
    description: `.`,
    exits: [
      { direction: "up", doorId: "HydroponicsPlatform" },
      { direction: "down", toRoomId: "HydroponicsPlatformBottom" },
    ],
  },

  {
    id: "HydroponicsPlatformBottom",
    name: "Hydroponics: Underneath Web",
    description: `.`,
    exits: [
      { direction: "up", doorId: "HydroponicsPlatformMid" },
      { direction: "northwest", toRoomId: "UnderWebOne" },
      { direction: "northeast", toRoomId: "UnderWebTwo" },
      { direction: "southwest", toRoomId: "UnderWebThree" },
      { direction: "southeast", toRoomId: "UnderWebFour" },
    ],
  },

  {
    id: "UnderWebOne",
    name: "Web Underhang",
    description: `.`,
    exits: [
      { direction: "east", doorId: "UnderWebTwo" },
      { direction: "southeast", toRoomId: "HydroponicsPlatformBottom" },
      { direction: "south", toRoomId: "UnderWebThree" },
    ],
  },
  {
    id: "UnderWebTwo",
    name: "Web Corner",
    description: `.`,
    exits: [
      { direction: "west", doorId: "UnderWebOne" },
      { direction: "southwest", toRoomId: "HydroponicsPlatformBottom" },
      { direction: "south", toRoomId: "UnderWebFour" },
    ],
  },
  {
    id: "UnderWebThree",
    name: "Web Pocket",
    description: `.`,
    exits: [
      { direction: "north", doorId: "UnderWebOne" },
      { direction: "northeast", toRoomId: "HydroponicsPlatformBottom" },
      { direction: "east", toRoomId: "UnderWebFour" },
    ],
  },
  {
    id: "UnderWebFour",
    name: "Web Grotto",
    description: `.`,
    exits: [
      { direction: "west", doorId: "UnderWebThree" },
      { direction: "northwest", toRoomId: "HydroponicsPlatformBottom" },
      { direction: "north", toRoomId: "UnderWebThree" },
    ],
  },
];
