export const MOVIE_THEATER_AUDITORIUM_ROOM_IDS = [
  "MovieTheaterA",
  "MovieTheaterB",
  "MovieTheaterC",
  "MovieTheaterD",
] as const;

type MovieTheaterAuditoriumRoomId =
  (typeof MOVIE_THEATER_AUDITORIUM_ROOM_IDS)[number];

type MovieSegment = {
  id: string;
  stages: string[];
};

export const MOVIE_THEATER_MOVIE_SEGMENTS: MovieSegment[] = [
  {
    id: "celebrations",
    stages: [`PLACEHOLDER`, `PLACEHOLDER`, `PLACEHOLDER`, `PLACEHOLDER`],
  },
  {
    id: "milestones",
    stages: [
      `PLACEHOLDER`,
      `PLACEHOLDER`,
      `PLACEHOLDER`,
      `PLACEHOLDER`,
      `PLACEHOLDER`,
    ],
  },
  {
    id: "updates",
    stages: [
      `PLACEHOLDER`,
      `PLACEHOLDER`,
      `PLACEHOLDER`,
      `PLACEHOLDER`,
      `PLACEHOLDER`,
    ],
  },
  {
    id: "status",
    stages: [
      `PLACEHOLDER`,
      `PLACEHOLDER`,
      `PLACEHOLDER`,
      `PLACEHOLDER`,
      `PLACEHOLDER`,
    ],
  },
  {
    id: "anomaly",
    stages: [
      `PLACEHOLDER`,
      `PLACEHOLDER`,
      `PLACEHOLDER`,
      `PLACEHOLDER`,
      `PLACEHOLDER`,
    ],
  },
  {
    id: "status-update",
    stages: [
      `PLACEHOLDER`,
      `PLACEHOLDER`,
      `PLACEHOLDER`,
      `PLACEHOLDER`,
      `PLACEHOLDER`,
    ],
  },
  {
    id: "anomaly-query",
    stages: [
      `PLACEHOLDER`,
      `PLACEHOLDER`,
      `PLACEHOLDER`,
      `PLACEHOLDER`,
      `PLACEHOLDER`,
    ],
  },
  {
    id: "analysis",
    stages: [
      `PLACEHOLDER`,
      `PLACEHOLDER`,
      `PLACEHOLDER`,
      `PLACEHOLDER`,
      `PLACEHOLDER`,
    ],
  },
];

const MOVIE_THEATER_TOTAL_MOVIE_TURNS = MOVIE_THEATER_MOVIE_SEGMENTS.reduce(
  (total, segment) => total + segment.stages.length,
  0,
);

export function isMovieTheaterAuditoriumRoom(
  roomId: string | undefined,
): roomId is MovieTheaterAuditoriumRoomId {
  return MOVIE_THEATER_AUDITORIUM_ROOM_IDS.includes(
    roomId as MovieTheaterAuditoriumRoomId,
  );
}

export function getMovieTheaterMovieLine(turn: number): string | undefined {
  if (MOVIE_THEATER_TOTAL_MOVIE_TURNS <= 0) return undefined;

  const wrappedTurn = turn % MOVIE_THEATER_TOTAL_MOVIE_TURNS;
  let cursor =
    wrappedTurn < 0
      ? wrappedTurn + MOVIE_THEATER_TOTAL_MOVIE_TURNS
      : wrappedTurn;

  for (const segment of MOVIE_THEATER_MOVIE_SEGMENTS) {
    if (cursor < segment.stages.length) {
      return `From the movie overhead: ${segment.stages[cursor]}`;
    }

    cursor -= segment.stages.length;
  }

  return undefined;
}
