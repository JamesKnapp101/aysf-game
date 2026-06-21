import { Room } from "@game/types/roomTypes";

export const waterTreatmentRooms: Room[] = [
  // I've set up that Isosceles Onche barricaded herself in and they unsuccessfully attempted to cut their way in
  {
    id: "WaterTreatment",
    name: "Water Treatment: Entrance",
    description: "The water treatment entrance.",
    meta: { excludeFromTransmitterMap: true },
    exits: [
      { direction: "north", toRoomId: "EngCorridorTwo" },
      { direction: "west", toRoomId: "Intake" },
      // Keep this loop one-way: Reservoir leads back here.
    ],
  },
  {
    id: "Intake",
    name: "Water Treatment: Intake",
    description: "The water treatment Intake.",
    meta: { excludeFromTransmitterMap: true },
    exits: [{ direction: "south", toRoomId: "OzoneGeneratorRoom" }],
  },
  {
    id: "OzoneGeneratorRoom",
    name: "Water Treatment: Ozone Generator Room",
    description:
      "This is where the ozone generator lives, for purifying water, and eventually the ship.",
    meta: { excludeFromTransmitterMap: true },
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
    meta: { excludeFromTransmitterMap: true },
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
    meta: { excludeFromTransmitterMap: true },
    exits: [
      { direction: "west", toRoomId: "WaterTreatment" },
      { direction: "south", toRoomId: "MembraneHall" },
    ],
  },
];
