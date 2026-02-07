import { Room } from "@game/types/roomTypes";

export const aviaryRooms: Room[] = [
  {
    id: "OuterRingNorth",
    name: "Aviary: Outer Ring North",
    description: `This is the northern section of the aviary's outer ring. The area is filled with lush vegetation, including tall trees and vibrant flowers. Birds of various species flit about, their songs filling the air. A pathway winds through the greenery, leading to other sections of the aviary.`,
    exits: [
      { direction: "east", toRoomId: "OuterRingTopEastBend" },
      { direction: "west", toRoomId: "OuterRingTopWestBend" },
      { direction: "south", toRoomId: "InnerRingNorth" },
    ],
  },

  {
    id: "OuterRingTopEastBend",
    name: "Aviary: Outer Ring Top East Bend",
    description: `This is the eastern bend of the aviary's outer ring. The area is filled with lush vegetation, including tall trees and vibrant flowers. Birds of various species flit about, their songs filling the air. A pathway winds through the greenery, leading to other sections of the aviary.`,
    exits: [
      { direction: "southeast", toRoomId: "OuterRingNorthEastBend" },
      { direction: "west", toRoomId: "OuterRingNorth" },
      { direction: "southwest", toRoomId: "InnerRingNorth" },
    ],
  },
  {
    id: "OuterRingTopWestBend",
    name: "Aviary: Outer Ring Top West Bend",
    description: `This is the western bend of the aviary's outer ring. The area is filled with lush vegetation, including tall trees and vibrant flowers. Birds of various species flit about, their songs filling the air. A pathway winds through the greenery, leading to other sections of the aviary. There is a large storage shed here, partially hidden by the foliage.`,
    exits: [
      { direction: "southwest", toRoomId: "OuterRingNorthWestBend" },
      { direction: "east", toRoomId: "OuterRingNorth" },
      { direction: "southeast", toRoomId: "InnerRingNorth" },
      { direction: "in", toRoomId: "InsideTheShed" },
    ],
  },

  {
    id: "OuterRingNorthEastBend",
    name: "Aviary: Outer Ring North East Bend",
    description: `This is the northeastern bend of the aviary's outer ring. The area is filled with lush vegetation, including tall trees and vibrant flowers. Birds of various species flit about, their songs filling the air. A pathway winds through the greenery, leading to other sections of the aviary.`,
    exits: [
      { direction: "northwest", toRoomId: "OuterRingTopEastBend" },
      { direction: "south", toRoomId: "OuterRingSouthEastBend" },
    ],
  },
  {
    id: "OuterRingNorthWestBend",
    name: "Aviary: Outer Ring North West Bend",
    description: `This is the western bend of the aviary's outer ring. The area is filled with lush vegetation, including tall trees and vibrant flowers. Birds of various species flit about, their songs filling the air. A pathway winds through the greenery, leading to other sections of the aviary.`,
    exits: [
      { direction: "northeast", toRoomId: "OuterRingTopWestBend" },
      { direction: "south", toRoomId: "OuterRingSouthWestBend" },
      { direction: "southeast", toRoomId: "InnerRingWest" },
    ],
  },

  {
    id: "OuterRingSouthWestBend",
    name: "Aviary: Outer Ring South West Bend",
    description: `This is the southwestern bend of the aviary's outer ring. The area is filled with lush vegetation, including tall trees and vibrant flowers. Birds of various species flit about, their songs filling the air. A pathway winds through the greenery, leading to other sections of the aviary.`,
    exits: [
      { direction: "north", toRoomId: "OuterRingNorthWestBend" },
      { direction: "southeast", toRoomId: "OuterRingBottomWestBend" },
      { direction: "northeast", toRoomId: "InnerRingWest" },
    ],
  },
  {
    id: "OuterRingSouthEastBend",
    name: "Aviary: Outer Ring South East Bend",
    description: `This is the southeastern bend of the aviary's outer ring. The area is filled with lush vegetation, including tall trees and vibrant flowers. Birds of various species flit about, their songs filling the air. A pathway winds through the greenery, leading to other sections of the aviary.`,
    exits: [
      { direction: "north", toRoomId: "OuterRingNorthEastBend" },
      { direction: "southwest", toRoomId: "OuterRingBottomEastBend" },
      { direction: "northwest", toRoomId: "InnerRingEast" },
    ],
  },
  {
    id: "OuterRingBottomWestBend",
    name: "Aviary: Outer Ring Bottom West Bend",
    description: `This is the southwestern bend of the aviary's outer ring. The area is filled with lush vegetation, including tall trees and vibrant flowers. Birds of various species flit about, their songs filling the air. A pathway winds through the greenery, leading to other sections of the aviary.`,
    exits: [
      { direction: "northwest", toRoomId: "OuterRingSouthWestBend" },
      { direction: "east", toRoomId: "OuterRingSouth" },
      { direction: "northeast", toRoomId: "InnerRingSouth" },
    ],
  },
  {
    id: "OuterRingBottomEastBend",
    name: "Aviary: Outer Ring Bottom East Bend",
    description: `This is the southeastern bend of the aviary's outer ring. The area is filled with lush vegetation, including tall trees and vibrant flowers. Birds of various species flit about, their songs filling the air. A pathway winds through the greenery, leading to other sections of the aviary.`,
    exits: [
      { direction: "northeast", toRoomId: "OuterRingSouthEastBend" },
      { direction: "west", toRoomId: "OuterRingSouth" },
      { direction: "northwest", toRoomId: "InnerRingSouth" },
    ],
  },
  {
    id: "OuterRingSouth",
    name: "Aviary: Outer Ring South",
    description: `This is the southern section of the aviary's outer ring. The area is filled with lush vegetation, including tall trees and vibrant flowers. Birds of various species flit about, their songs filling the air. A pathway winds through the greenery, leading to other sections of the aviary.`,
    exits: [
      { direction: "east", toRoomId: "OuterRingBottomEastBend" },
      { direction: "west", toRoomId: "OuterRingBottomWestBend" },
      { direction: "north", toRoomId: "InnerRingSouth" },
      { direction: "southwest", toRoomId: "ZooOne" },
    ],
  },

  {
    id: "InnerRingNorth",
    name: "Aviary: Inner Ring North",
    description: `This is the northern section of the aviary's inner ring. The area is filled with lush vegetation, including tall trees and vibrant flowers. Birds of various species flit about, their songs filling the air. A pathway winds through the greenery, leading to other sections of the aviary.`,
    exits: [
      { direction: "north", toRoomId: "OuterRingNorth" },
      { direction: "northeast", toRoomId: "OuterRingTopEastBend" },
      { direction: "northwest", toRoomId: "OuterRingTopWestBend" },
      { direction: "southeast", toRoomId: "InnerRingEast" },
      { direction: "southwest", toRoomId: "InnerRingWest" },
    ],
  },

  {
    id: "InnerRingEast",
    name: "Aviary: Inner Ring East",
    description: `This is the eastern section of the aviary's inner ring. The area is filled with lush vegetation, including tall trees and vibrant flowers. Birds of various species flit about, their songs filling the air. A pathway winds through the greenery, leading to other sections of the aviary.`,
    exits: [
      { direction: "northwest", toRoomId: "InnerRingNorth" },
      { direction: "southwest", toRoomId: "InnerRingSouth" },
      { direction: "northeast", toRoomId: "OuterRingNorthEastBend" },
      { direction: "southeast", toRoomId: "OuterRingSouthEastBend" },
      { direction: "in", toRoomId: "InsideTheShack" },
    ],
  },
  {
    id: "InnerRingWest",
    name: "Aviary: Inner Ring West",
    description: `This is the western section of the aviary's inner ring. The area is filled with lush vegetation, including tall trees and vibrant flowers. Birds of various species flit about, their songs filling the air. A pathway winds through the greenery, leading to other sections of the aviary.`,
    exits: [
      { direction: "northeast", toRoomId: "InnerRingNorth" },
      { direction: "southeast", toRoomId: "InnerRingSouth" },
      { direction: "northwest", toRoomId: "OuterRingNorthWestBend" },
      { direction: "southwest", toRoomId: "OuterRingSouthWestBend" },
      { direction: "east", toRoomId: "AviaryMaintenance" },
    ],
  },
  {
    id: "AviaryMaintenance",
    name: "Aviary: Maintenance",
    description: `This is the maintenance area of the aviary. It is a small, enclosed space where staff can tend to the birds and maintain the aviary's facilities. The area is filled with tools and supplies needed for bird care.`,
    exits: [
      { direction: "west", toRoomId: "InnerRingWest" },
      { direction: "in", toRoomId: "InsideTheBuilding" },
    ],
  },
  {
    id: "InnerRingSouth",
    name: "Aviary: Inner Ring South",
    description: `This is the southern section of the aviary's inner ring. The area is filled with lush vegetation, including tall trees and vibrant flowers. Birds of various species flit about, their songs filling the air. A pathway winds through the greenery, leading to other sections of the aviary.`,
    exits: [
      { direction: "northeast", toRoomId: "InnerRingEast" },
      { direction: "northwest", toRoomId: "InnerRingWest" },
      { direction: "southeast", toRoomId: "OuterRingBottomEastBend" },
      { direction: "south", toRoomId: "OuterRingSouth" },
      { direction: "southwest", toRoomId: "OuterRingBottomWestBend" },
    ],
  },
  // Sheds, etc
  {
    id: "InsideTheShed",
    name: "Aviary: Inside The Shed",
    description: `This is the inside of a small shed within the aviary. It is a simple, enclosed space where staff can store tools and supplies needed for bird care.`,
    exits: [
      { direction: "out", toRoomId: "OuterRingTopWestBend" },
      { direction: "down", doorId: "ShedCellarDoor" },
    ],
  },
  {
    id: "InsideTheShack",
    name: "Aviary: Inside The Shack",
    description: `This is the inside of a small shack within the aviary. It is a simple, enclosed space where staff can store tools and supplies needed for bird care.`,
    exits: [
      { direction: "out", toRoomId: "InnerRingEast" },
      { direction: "down", doorId: "ShackCellarDoor" },
    ],
  },
  {
    id: "UnderTheShed",
    name: "Aviary: Under The Shed",
    description: `This is the area under a small shed within the aviary. It is a simple, enclosed space where staff can store tools and supplies needed for bird care.`,
    exits: [
      { direction: "southeast", toRoomId: "UnderTheShack" },
      { direction: "up", doorId: "ShedCellarDoor" },
    ],
  },
  {
    id: "UnderTheShack",
    name: "Aviary: Under The Shack",
    description: `This is the area under a small shack within the aviary. It is a simple, enclosed space where staff can store tools and supplies needed for bird care.`,
    exits: [
      { direction: "northwest", toRoomId: "UnderTheShed" },
      { direction: "up", doorId: "ShackCellarDoor" },
    ],
  },
  {
    id: "InsideTheBuilding",
    name: "Aviary: Inside The Building",
    description: `This is the inside of a small building within the aviary. It is a simple, enclosed space where staff can store tools and supplies needed for bird care.`,
    exits: [{ direction: "out", toRoomId: "AviaryMaintenance" }],
  },
];
