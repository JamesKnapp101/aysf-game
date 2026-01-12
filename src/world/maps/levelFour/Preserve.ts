import { Room } from "@game/types/roomTypes";

export const preserveRooms: Room[] = [
  {
    id: "Preserve",
    name: "Preserve: Entrance",
    description:
      "Preserve entryway, from here you can see the Veterinary Center to the northwest, and the Zoo One to the south.",
    exits: [
      { direction: "south", toRoomId: "VeterinaryCenter" },
      { direction: "east", toRoomId: "PreserveField" },
      { direction: "northwest", toRoomId: "PreserveSlope" },
    ],
  },
  {
    id: "PreserveField",
    name: "Preserve: Field",
    description:
      "This is a large, open field within the preserve. The area is mostly grassy with scattered trees and shrubs. You can see a small path leading to the east, and a large building to the north.",
    exits: [
      { direction: "west", toRoomId: "Preserve" },
      { direction: "northeast", toRoomId: "PreserveWoodedAreaTwo" },
    ],
  },
  {
    id: "PreserveSlope",
    name: "Preserve: Grassy Slope",
    description:
      "This is a large, open field within the preserve. The area is mostly grassy with scattered trees and shrubs. You can see a small path leading to the east, and a large building to the north.",
    exits: [
      { direction: "southeast", toRoomId: "Preserve" },
      { direction: "northwest", toRoomId: "PreserveTopSlope" },
      { direction: "northeast", toRoomId: "PreserveWindingRunSouth" },
    ],
  },
  {
    id: "PreserveTopSlope",
    name: "Preserve: Top of Grassy Slope",
    description:
      "This is the top of a grassy slope within the preserve. From here, you have a clear view of the surrounding area, including the preserve entrance to the southeast.",
    exits: [
      { direction: "southeast", toRoomId: "PreserveSlope" },
      { direction: "north", toRoomId: "PreserveBrook" },
    ],
  },
  {
    id: "PreserveBrook",
    name: "Preserve: Near the Brook",
    description:
      "This area is located near a small brook that runs through the preserve. The sound of flowing water can be heard nearby, and the area is surrounded by lush vegetation.",
    exits: [
      { direction: "northeast", toRoomId: "PreserveOverlook" },
      { direction: "south", toRoomId: "PreserveTopSlope" },
      { direction: "east", toRoomId: "PreserveRockyOverhang" },
    ],
  },
  {
    id: "PreserveRockyOverhang",
    name: "Preserve: Rocky Overhang",
    description:
      "This area is located near a small brook that runs through the preserve. The sound of flowing water can be heard nearby, and the area is surrounded by lush vegetation.",
    exits: [{ direction: "west", toRoomId: "PreserveBrook" }],
  },
  {
    id: "PreserveOverlook",
    name: "Preserve: Overlook",
    description:
      "This overlook provides a panoramic view of the preserve. You can see the entrance to the preserve to the southwest, and a small path leading to the northeast.",
    exits: [
      { direction: "southwest", toRoomId: "PreserveBrook" },
      { direction: "east", toRoomId: "PreserveRockySlope" },
    ],
  },
  {
    id: "PreserveRockySlope",
    name: "Preserve: Rocky Slope",
    description:
      "This is a rocky slope within the preserve. The area is mostly covered in moss and small shrubs. You can see a small path leading to the east.",
    exits: [
      { direction: "west", toRoomId: "PreserveOverlook" },
      { direction: "east", toRoomId: "PreserveRockyBottom" },
    ],
  },
  {
    id: "PreserveRockyBottom",
    name: "Preserve: Rocky Bottom",
    description:
      "This is the bottom of a rocky slope within the preserve. The area is mostly covered in moss and small shrubs. You can see a small path leading to the west.",
    exits: [
      { direction: "west", toRoomId: "PreserveRockySlope" },
      { direction: "southeast", toRoomId: "PreserveDirtPath" },
      { direction: "southwest", toRoomId: "PreserveWindingRunNorth" },
    ],
  },
  {
    id: "PreserveWindingRunNorth",
    name: "Preserve: Winding Run North",
    description:
      "This is a winding run within the preserve. The area is mostly covered in moss and small shrubs. You can see a small path leading to the west.",
    exits: [
      { direction: "northeast", toRoomId: "PreserveRockyBottom" },
      { direction: "southwest", toRoomId: "PreserveWindingRun" },
    ],
  },
  {
    id: "PreserveWindingRun",
    name: "Preserve: Winding Run",
    description:
      "This is a winding run within the preserve. The area is mostly covered in moss and small shrubs. You can see a small path leading to the west.",
    exits: [
      { direction: "northeast", toRoomId: "PreserveWindingRunNorth" },
      { direction: "southwest", toRoomId: "PreserveWindingRunSouth" },
    ],
  },

  {
    id: "PreserveWindingRunSouth",
    name: "Preserve: Winding Run South",
    description:
      "This is a winding run within the preserve. The area is mostly covered in moss and small shrubs. You can see a small path leading to the west.",
    exits: [
      { direction: "northeast", toRoomId: "PreserveWindingRun" },
      { direction: "southwest", toRoomId: "PreserveSlope" },
    ],
  },

  {
    id: "PreserveDirtPath",
    name: "Preserve: Dirt Path",
    description:
      "This is a dirt path that winds through the preserve. The area is surrounded by trees and shrubs. You can see the rocky bottom to the northwest.",
    exits: [
      { direction: "northwest", toRoomId: "PreserveRockyBottom" },
      { direction: "south", toRoomId: "PreserveWoodedArea" },
    ],
  },
  {
    id: "PreserveWoodedArea",
    name: "Preserve: Wooded Area",
    description:
      "This is a wooded area within the preserve. The area is surrounded by tall trees and thick undergrowth. You can see a small path leading to the north.",
    exits: [
      { direction: "north", toRoomId: "PreserveDirtPath" },
      { direction: "southwest", toRoomId: "PreserveWoodedAreaTwo" },
    ],
  },
  {
    id: "PreserveWoodedAreaTwo",
    name: "Preserve: Thinning Woods",
    description:
      "This is a thinning wooded area within the preserve. The trees here are more spaced out, allowing more light to filter through. You can see a small path leading to the northeast.",
    exits: [
      { direction: "northeast", toRoomId: "PreserveWoodedArea" },
      { direction: "southwest", toRoomId: "PreserveField" },
      { direction: "west", toRoomId: "PreserveClearing" },
    ],
  },
  {
    id: "PreserveClearing",
    name: "Preserve: Clearing",
    description:
      "This is a clearing within the preserve. The area is mostly open with scattered trees and shrubs. You can see a small path leading to the northeast.",
    exits: [
      { direction: "north", toRoomId: "Pond" },
      { direction: "east", toRoomId: "PreserveWoodedAreaTwo" },
    ],
  },
];
