import { Room } from "@game/types/roomTypes";

export const apiaryRooms: Room[] = [
  {
    id: "Apiary",
    name: "Apiary",
    description: `This is a grassy area surrounded by thin, drooping willow trees that stir in the occasional breeze. Within the grassy clearing are arranged a series of four large rectangular crates, each of which has a series of regular thin horizontal slots that run down each side. At the head of the arrangement of crates is a slightly raised platform, upon which stands some sort of computer terminal or kiosk with a tiny tray mounted next to the screen and keyboard.`,
    exits: [{ direction: "east", toRoomId: "Greenhouse" }],
  },
];
