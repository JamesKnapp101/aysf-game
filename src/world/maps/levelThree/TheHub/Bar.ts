import { Room } from "@game/types/roomTypes";

export const barRooms: Room[] = [
  {
    id: "BarEntrance",
    name: "Bar Entrance",
    description: `.`,
    exits: [
      { direction: "northwest", toRoomId: "HubCenter" },
      { direction: "southeast", toRoomId: "Bar" },
      { direction: "north", toRoomId: "HubEast" },
      { direction: "west", toRoomId: "HubSouth" },
    ],
  },
  {
    id: "Bar",
    name: "Bar",
    description: ``,
    exits: [
      { direction: "northwest", toRoomId: "BarEntrance" },
      { direction: "down", toRoomId: "BarBasement" },
      { direction: "west", toRoomId: "BarBathroom" },
      { direction: "south", toRoomId: "BarLounge" },
    ],
  },
  {
    id: "BarBasement",
    name: "Bar Basement",
    description: ``,
    exits: [{ direction: "up", toRoomId: "Bar" }],
  },
  {
    id: "BarLounge",
    name: "Bar Lounge",
    description: `This is a large, open area with a long bar and several tables. The walls are lined with dark wood paneling, and the room is softly lit by overhead chandeliers.`,
    exits: [{ direction: "north", toRoomId: "Bar" }],
  },
  {
    id: "BarBathroom",
    name: "Bar Bathroom",
    description: `This is a small, dimly lit room with a single window looking out over the main bar area. The walls are covered in a worn, dark green vinyl covering.`,
    exits: [{ direction: "east", toRoomId: "Bar" }],
  },
];
