import { Room } from "@game/types/roomTypes";

export const waterTreatmentRooms: Room[] = [
  {
    id: "WaterTreatment",
    name: "Water Treatment: Entrance",
    description: "The water treatment entrance.",
    exits: [
      { direction: "west", toRoomId: "Intake" },
      //  { direction: "east", toRoomId: "Reservoir" },  I'm thinking keep the loop one way in this case
    ],
  },
  {
    id: "Intake",
    name: "Water Treatment: Intake",
    description: "The water treatment Intake.",
    exits: [{ direction: "south", toRoomId: "OzoneGeneratorRoom" }],
  },
  {
    id: "OzoneGeneratorRoom",
    name: "Water Treatment: Ozone Generator Room",
    description:
      "This is where the ozone generator lives, for purifying water, and eventually the ship.",
    exits: [
      { direction: "north", toRoomId: "Intake" },
      { direction: "east", toRoomId: "MembraneHall" },
    ],
  },
  {
    id: "MembraneHall",
    name: "Water Treatment: Membrane Hall",
    description:
      "This is where the high-tech filters turn poo squirts into clean, delicious water. An AI version of a celebrity stands by to teach all about the process.",
    exits: [
      { direction: "west", toRoomId: "OzoneGeneratorRoom" },
      { direction: "north", toRoomId: "Reservoir" },
    ],
  },
  {
    id: "Reservoir",
    name: "Water Treatment: Reservoir",
    description:
      "This is where the Reservoir lives, for storing purified water.",
    exits: [
      { direction: "west", toRoomId: "WaterTreatment" },
      { direction: "south", toRoomId: "MembraneHall" },
    ],
  },
];
