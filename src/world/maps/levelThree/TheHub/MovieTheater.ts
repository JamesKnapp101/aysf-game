import { Room } from "@game/types/roomTypes";

export const movieTheaterRooms: Room[] = [
  // MOVIE THEATRE
  {
    id: "MovieEntrance",
    name: "Movie Theatre Entrance",
    description: `This is the entrance to a small movie theater; glass doors lead into the theater to the northwest, hanging over which is a small marquee with the words 'THE TRIALS OF FRED' spelled out in block lettering. There is a narrow, green metal doorway located to the west, and a bent, green door lying in the grass nearby with the words DO NOT ENTER stenciled on its surface in small white lettering. A tan colored brick-paved path leads southwest into the Hub's center.`,
    exits: [
      { direction: "southeast", toRoomId: "HubCenter" },
      { direction: "northwest", toRoomId: "MovieTheatreOne" },
      { direction: "southwest", toRoomId: "HubWest" },
      { direction: "east", toRoomId: "HubNorth" },
      { direction: "south", toRoomId: "HubTree" },
      // { direction: "up", toRoomId: "Projection" },
    ],
  },
  {
    id: "Projection",
    name: "Projector Room",
    description: `This is the movie theater's projection room, a small, cozy area which looks to have been torn to shreds; The remains of what looks like a wooden chair lies in pieces and the walls and floor have been gouged with what look like deep claw marks. A trail of dried blood heads in the direction of the door then peters out. There is a small window which overlooks the movie theater below, and the projector, looking a bit battered, stares out through this window, the lens dark.`,
    exits: [
      //   { direction: "east", toRoomId: "MovieEntrance" },
      { direction: "west", toRoomId: "MovieTheatreOne" },
    ],
  },
  {
    id: "MovieTheatreOne",
    name: "Movie Theatre",
    description: `This is a small lobby where tickets are purchased and dispensed...it looks like kind of a no-frills affair; there's no candy counter or anything, just a glass partition where a ticket seller might stand. A doorway leads southeast out of the theatre, and wide doorway opens up into the main theatre to the north.`,
    exits: [
      { direction: "southeast", toRoomId: "MovieEntrance" },
      { direction: "north", toRoomId: "MovieTheatreTwo" },
      { direction: "east", toRoomId: "Projection" },
    ],
  },
  {
    id: "MovieTheatreTwo",
    name: "Movie Theatre",
    description: `You are standing at the back of two rows of movie theatre seats which are separated by a center aisle. The movie screen, now lit up with a flat, white light, looms before you to the north.`,
    exits: [{ direction: "south", toRoomId: "MovieTheatreOne" }],
  },
];
