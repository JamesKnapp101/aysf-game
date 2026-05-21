import { queueAfterRoomDescription } from "@game/helpers/gameHelpers";
import type { ScriptedEvent } from "@game/types/eventTypes";
import {
  getMovieTheaterMovieLine,
  isMovieTheaterAuditoriumRoom,
} from "./movieTheaterMovie";

export const movieTheaterScriptedEvents: ScriptedEvent[] = [
  {
    id: "movie_theater_projected_movie_loop",
    once: false,
    when: (_state, ctx) =>
      ctx.kind === "onTurnEnd" && isMovieTheaterAuditoriumRoom(ctx.roomId),
    run: (state) => {
      const movieLine = getMovieTheaterMovieLine(state.moves);

      return movieLine ? queueAfterRoomDescription(state, movieLine) : state;
    },
  },
];
