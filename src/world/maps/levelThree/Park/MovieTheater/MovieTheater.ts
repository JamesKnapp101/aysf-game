import type { Item } from "@game/types/itemTypes";
import { Room } from "@game/types/roomTypes";
import { movieAuditoriumItems } from "./movieAuditoriumItems";
import { movieBathroomItems } from "./movieBathroom";
import { movieEntranceItems } from "./movieEntranceItems";
import { movieLobbyItems } from "./movieLobbyItems";
import { movieProjectionItems } from "./movieProjectionItems";

export { MOVIE_THEATER_CHEWABLE_ID } from "./movieBathroom";
export {
  MOVIE_THEATER_AUDITORIUM_ROOM_IDS,
  MOVIE_THEATER_MOVIE_SEGMENTS,
  MOVIE_THEATER_ROOM_IDS,
  MOVIE_THEATER_TOTAL_MOVIE_TURNS,
  getMovieTheaterMovieLine,
  isMovieTheaterAuditoriumRoom,
  isMovieTheaterTransitionTurn,
  tickMovieTheaterProjectionLighting,
} from "./movieTheaterMovie";

export const movieTheaterRooms: Room[] = [
  // MOVIE THEATRE
  {
    id: "MovieEntrance",
    name: "Movie Theater Entrance",
    description: `This is the entrance to a small movie theater. [[SCENERY]]`,
    exits: [
      { direction: "southeast", toRoomId: "ParkCenter" },
      { direction: "northwest", toRoomId: "MovieTheaterLobby" },
      { direction: "southwest", toRoomId: "ParkWest" },
      { direction: "east", toRoomId: "ParkNorth" },
      { direction: "south", toRoomId: "ParkMaintenance" },
    ],
  },
  {
    id: "Projection",
    name: "Movphitheater: Projector Room",
    description: `The theater's projection room is less glamorous than the show it controls. [[SCENERY]]`,
    exits: [{ direction: "west", toRoomId: "MovieTheaterLobby" }],
  },
  {
    id: "MovieTheaterLobby",
    name: "Movphitheater: Lobby",
    description: `The theater lobby is roomy, with cream colored walls, dark wood trim, and spotless maroon carpet. [[SCENERY]]`,
    exits: [
      { direction: "southeast", toRoomId: "MovieEntrance" },
      { direction: "north", toRoomId: "MovieTheaterA" },
      { direction: "east", toRoomId: "Projection" },
      { direction: "west", toRoomId: "MovieTheaterBathroom" },
    ],
  },
  {
    id: "MovieTheaterBathroom",
    name: "Movphitheater: Rest Room",
    description: `The theater bathroom is large, bright, and quiet enough that every drip feels rehearsed. [[SCENERY]]`,
    exits: [{ direction: "east", toRoomId: "MovieTheaterLobby" }],
  },
  {
    id: "MovieTheaterA",
    name: "Movphitheater: Quadrant A",
    description: `This is the southwestern quadrant of the arena. [[SCENERY]]`,
    exits: [
      { direction: "south", toRoomId: "MovieTheaterLobby" },
      { direction: "north", toRoomId: "MovieTheaterB" },
      { direction: "east", toRoomId: "MovieTheaterD" },
    ],
  },
  {
    id: "MovieTheaterB",
    name: "Movphitheater: Quadrant B",
    description: `This is the northwestern quadrant of the arena. [[SCENERY]]`,
    exits: [
      { direction: "south", toRoomId: "MovieTheaterA" },
      { direction: "east", toRoomId: "MovieTheaterC" },
    ],
  },
  {
    id: "MovieTheaterC",
    name: "Movphitheater: Quadrant C",
    description: `This is the northeastern quadrant of the arena. [[SCENERY]]`,
    exits: [
      { direction: "south", toRoomId: "MovieTheaterD" },
      { direction: "west", toRoomId: "MovieTheaterB" },
    ],
  },
  {
    id: "MovieTheaterD",
    name: "Movphitheater: Quadrant D",
    description: `This is the southeastern quadrant of the arena. [[SCENERY]]`,
    exits: [
      { direction: "north", toRoomId: "MovieTheaterC" },
      { direction: "west", toRoomId: "MovieTheaterA" },
    ],
  },
];

export const movieTheaterItems: Item[] = [
  ...movieEntranceItems,
  ...movieLobbyItems,
  ...movieBathroomItems,
  ...movieProjectionItems,
  ...movieAuditoriumItems,
];
