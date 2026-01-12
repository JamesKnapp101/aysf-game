import { Room } from "@game/types/roomTypes";

export const greenhouseRooms: Room[] = [
  {
    id: "Greenhouse",
    name: "Greenhouse",
    description:
      "This is a large, well-lit greenhouse within the preserve. The room is filled with rows of shelves containing various plants and flowers. You can see a small path leading to the north.",
    exits: [
      { direction: "south", toRoomId: "BotanicalOne" },
      { direction: "southwest", toRoomId: "FungalCave" },
    ],
  },
];
