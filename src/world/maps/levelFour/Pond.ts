import { Room } from "@game/types/roomTypes";

export const pondRooms: Room[] = [
  {
    id: "Pond",
    name: "Pond",
    description:
      "This is a small pond within the preserve. The water is clear and still, surrounded by tall grass and trees. You can see a small path leading to the south.",
    exits: [{ direction: "south", toRoomId: "PreserveClearing" }],
  },
];
