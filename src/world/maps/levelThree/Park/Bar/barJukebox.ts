import type { GameState } from "@game/types/gameTypes";

export const BAR_JUKEBOX_ITEM_ID = "BarLoungeJukebox";
export const BAR_JUKEBOX_TRACK_NOT_FOUND_MESSAGE = "808 Track not Found";

export type BarJukeboxTrack = {
  trackArtist: string;
  trackClips: string[];
  trackClose: string;
  trackId: string;
  trackLength: number;
  trackName: string;
  trackOpen: string;
};

export const BAR_JUKEBOX_TRACKS: BarJukeboxTrack[] = [
  {
    trackId: "R221",
    trackName: "Dancing on a String",
    trackArtist: "Supertwink",
    trackLength: 10,
    trackOpen: "and the throb of an electronic synth fills the room.",
    trackClose:
      "The electronic music builds to a crescendo then ends on an orchestra hit.",
    trackClips: [
      `"Pull me close, pull me bright, pull me through the neon night."`,
      `"I keep dancing on a string, but I still choose the swing."`,
      `"Chrome-heart darling, count me in, three-two-one and spin."`,
      `"If the floor drops out, let the bass line hold me."`,
      `"You cut the lights, I catch the glow."`,
      `"Every little motion makes the midnight sing."`,
    ],
  },
];

function normalizeJukeboxTrackId(trackId: string): string {
  return trackId
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 4);
}

function getJukeboxTrack(trackId: string): BarJukeboxTrack | undefined {
  const normalizedTrackId = normalizeJukeboxTrackId(trackId);
  return BAR_JUKEBOX_TRACKS.find(
    (track) => normalizeJukeboxTrackId(track.trackId) === normalizedTrackId,
  );
}

export function playBarJukeboxTrack(
  state: GameState,
  trackId: string,
): { state: GameState; message: string } {
  const normalizedTrackId = normalizeJukeboxTrackId(trackId);
  const track = getJukeboxTrack(normalizedTrackId);

  if (normalizedTrackId.length !== 4 || !track) {
    return { state, message: BAR_JUKEBOX_TRACK_NOT_FOUND_MESSAGE };
  }

  const next: GameState = {
    ...state,
    worldState: {
      ...state.worldState,
      barJukebox: {
        activeTrack: {
          remainingClips: [...track.trackClips],
          trackArtist: track.trackArtist,
          trackId: track.trackId,
          trackName: track.trackName,
          turnsRemaining: Math.max(0, Math.floor(track.trackLength)),
        },
      },
    },
  };

  return {
    state: next,
    message: `The song ${track.trackName} by ${track.trackArtist} begins to play ${track.trackOpen}`,
  };
}

export function tickBarJukebox(state: GameState): {
  messages: string[];
  state: GameState;
} {
  const activeTrack = state.worldState.barJukebox?.activeTrack;
  if (!activeTrack) return { state, messages: [] };

  const track = getJukeboxTrack(activeTrack.trackId);
  if (!track) {
    return {
      state: {
        ...state,
        worldState: {
          ...state.worldState,
          barJukebox: {},
        },
      },
      messages: [],
    };
  }

  const messages: string[] = [];
  const remainingClips = [...(activeTrack.remainingClips ?? [])];
  const turnsRemaining = Math.max(0, activeTrack.turnsRemaining - 1);

  if (state.rng() < 0.3) {
    const clip = remainingClips.pop();
    messages.push(
      clip
        ? `${activeTrack.trackName} continues playing...\n\n${clip}`
        : `${activeTrack.trackName} continues playing...`,
    );
  }

  if (turnsRemaining <= 0) {
    messages.push(track.trackClose);
    return {
      state: {
        ...state,
        worldState: {
          ...state.worldState,
          barJukebox: {},
        },
      },
      messages,
    };
  }

  return {
    state: {
      ...state,
      worldState: {
        ...state.worldState,
        barJukebox: {
          activeTrack: {
            ...activeTrack,
            remainingClips,
            turnsRemaining,
          },
        },
      },
    },
    messages,
  };
}
