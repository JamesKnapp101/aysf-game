import { Room } from "@game/types/roomTypes";

export const veterinaryCenterRooms: Room[] = [
  {
    id: "VeterinaryCenter",
    name: "Veterinary Center",
    description:
      "This is a large, well-lit room with a high ceiling and walls lined with medical equipment. The room is filled with the soft hum of machinery and the occasional beep of monitoring devices. There are several workbenches and storage units scattered throughout the space. In one corner, there is a small examination table with various veterinary tools neatly arranged on a tray beside it. The room appears to be designed for the care and treatment of animals, with posters on the walls depicting different species and their anatomical structures.",
    exits: [
      { direction: "southeast", toRoomId: "ZooOne" },
      { direction: "north", toRoomId: "PresD" },
    ],
  },
];
