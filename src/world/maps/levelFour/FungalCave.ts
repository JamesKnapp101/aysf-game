import { Room } from "@game/types/roomTypes";

export const fungalCaveRooms: Room[] = [
  {
    id: "FungalCave",
    name: "Fungal Cultivation Cave",
    description:
      "This is a dark, damp cave within the preserve. The walls are lined with various fungi and moss. You can see a small path leading to the south.",
    exits: [
      { direction: "east", toRoomId: "BotanicalOne" },
      { direction: "northeast", toRoomId: "Greenhouse" },
      { direction: "northwest", toRoomId: "FungalIncubation" },
      { direction: "southwest", toRoomId: "FungalFruiting" },
    ],
  },
  {
    id: "FungalIncubation",
    name: "Fungal Incubation Cave",
    description:
      "This is a dark, damp cave within the preserve. The walls are lined with various fungi and moss. You can see a small path leading to the northwest.",
    exits: [{ direction: "southeast", toRoomId: "FungalCave" }],
  },
  {
    id: "FungalFruiting",
    name: "Fungal Fruiting Cave",
    description:
      "This is a dark, damp cave within the preserve. The walls are lined with various fungi and moss. You can see a small path leading to the northeast.",
    exits: [{ direction: "northeast", toRoomId: "FungalCave" }],
  },
];
