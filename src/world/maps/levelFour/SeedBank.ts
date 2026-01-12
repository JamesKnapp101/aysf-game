import { Room } from "@game/types/roomTypes";

export const seedBankRooms: Room[] = [
  {
    id: "SeedBank",
    name: "Seed Bank",
    description:
      "This is a small seed bank within the preserve. The room is filled with rows of shelves containing various seeds and plants. You can see a small path leading to the north.",
    exits: [{ direction: "north", toRoomId: "BotanicalOne" }],
  },
];
