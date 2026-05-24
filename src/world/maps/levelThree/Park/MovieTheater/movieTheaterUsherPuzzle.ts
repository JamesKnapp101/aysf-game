import { movePlayerToRoom } from "@game/helpers/gameHelpers";
import { stashItemInContainer } from "@game/helpers/itemPlacement";
import { formatNameList, updateItemLocation } from "@game/rules/items";
import type { RuleResult } from "@game/rules/result";
import { inventoryHas } from "@game/rules/state";
import type { ActionResult } from "@game/types/actionsTypes";
import type { GameState, MovieTheaterState } from "@game/types/gameTypes";
import type { Item } from "@game/types/itemTypes";
import type { ConversationTarget } from "@game/types/npcTypes";

export const MOVIE_THEATER_ENTRANCE_ROOM_ID = "MovieEntrance";
export const MOVIE_THEATER_LOBBY_ROOM_ID = "MovieTheaterLobby";
export const MOVIE_THEATER_BATHROOM_ROOM_ID = "MovieTheaterBathroom";
export const MOVIE_THEATER_AUDITORIUM_ENTRY_ROOM_ID = "MovieTheaterA";
export const MOVIE_THEATER_USHER_BOT_ID = "UsherBot";
export const MOVIE_THEATER_LOBBY_TRASH_BIN_ID = "MovieLobbyPedalTrashBin";

const MOVIE_THEATER_VAPE_ITEM_IDS = ["TrixPen", "ECigar"] as const;
const SMOKE_REPORT_THRESHOLD = 2;
const SMOKE_EJECTION_THRESHOLD = 3;

export const MOVIE_THEATER_USHER_BLOCK_MESSAGE =
  `"sorry, but the movie is already in progress, please wait for the next showing"`;
export const MOVIE_THEATER_USHER_EJECTION_LINE =
  `"Did you see the sign? Did you read the sign? CAN you read the sign? Smoking in the bathroom is an automatic ejection!"`;
export const MOVIE_THEATER_USHER_FALSE_REPORT_LINE =
  `"I'm not picking anything up, are you sure you aren't having a stroke?"`;

export function createInitialMovieTheaterState(): MovieTheaterState {
  return {
    bathroomSmokiness: 0,
    usherBotBathroomTurnsRemaining: 0,
  };
}

function getMovieTheaterState(state: GameState): MovieTheaterState {
  return state.worldState.movieTheater ?? createInitialMovieTheaterState();
}

function setMovieTheaterState(
  state: GameState,
  patch: Partial<MovieTheaterState>,
): GameState {
  const current = getMovieTheaterState(state);

  return {
    ...state,
    worldState: {
      ...state.worldState,
      movieTheater: {
        ...current,
        ...patch,
      },
    },
  };
}

function isMovieTheaterVapeItem(item: Item): boolean {
  return MOVIE_THEATER_VAPE_ITEM_IDS.includes(
    item.id as (typeof MOVIE_THEATER_VAPE_ITEM_IDS)[number],
  );
}

function getLiveItemLocation(
  state: GameState,
  itemId: string,
): string | undefined {
  const item = state.world.items.find((candidate) => candidate.id === itemId);
  return state.itemState.itemRoomId[itemId] ?? item?.location;
}

function setUsherBotLocation(state: GameState, roomId: string): GameState {
  return updateItemLocation(state, MOVIE_THEATER_USHER_BOT_ID, roomId);
}

function describeSmokeLevel(smokiness: number): string {
  if (smokiness <= 1) {
    return "A thin ribbon of vapor hangs over the sinks before spreading out against the mirror.";
  }

  return "The bathroom air has a visible haze now, just enough to make the no-smoking sign out in the lobby feel personally involved.";
}

function resetBathroomSmoke(state: GameState): GameState {
  return setMovieTheaterState(state, {
    bathroomSmokiness: 0,
  });
}

export function isUsherBotInvestigatingBathroom(state: GameState): boolean {
  return getMovieTheaterState(state).usherBotBathroomTurnsRemaining > 0;
}

export function applyMovieTheaterVapeUseEffect(
  state: GameState,
  item: Item,
  ctx: { baseMessage: string },
): RuleResult | undefined {
  if (
    state.player.roomId !== MOVIE_THEATER_BATHROOM_ROOM_ID ||
    !isMovieTheaterVapeItem(item)
  ) {
    return undefined;
  }

  if ((item.doses ?? 0) <= 0) return undefined;

  const current = getMovieTheaterState(state).bathroomSmokiness;
  const nextSmokiness = Math.min(
    SMOKE_EJECTION_THRESHOLD,
    current + 1,
  );

  let next = setMovieTheaterState(state, {
    bathroomSmokiness: nextSmokiness,
  });

  if (nextSmokiness < SMOKE_EJECTION_THRESHOLD) {
    return {
      state: next,
      message: [ctx.baseMessage, describeSmokeLevel(nextSmokiness)]
        .filter(Boolean)
        .join("\n\n"),
    };
  }

  next = resetBathroomSmoke(next);
  next = setMovieTheaterState(next, {
    usherBotBathroomTurnsRemaining: 0,
  });
  next = setUsherBotLocation(next, MOVIE_THEATER_LOBBY_ROOM_ID);
  next = movePlayerToRoom(next, MOVIE_THEATER_ENTRANCE_ROOM_ID, {
    fromRoomId: MOVIE_THEATER_BATHROOM_ROOM_ID,
    via: "ejected",
  });

  return {
    state: next,
    message: [
      ctx.baseMessage,
      `A sensor chime sounds from the lobby. A moment later the robot usher glides into the bathroom, its rendered face pinched into pure civic disappointment.\n\n${MOVIE_THEATER_USHER_EJECTION_LINE}\n\nIt clamps a gentle, inescapable hand around your upper arm and marches you all the way back out to the theater entrance.`,
    ]
      .filter(Boolean)
      .join("\n\n"),
  };
}

type MovieTheaterMovementContext = {
  destinationRoomId: string;
  direction: string;
  fromRoomId: string;
};

export function resolveMovieTheaterMovement(
  state: GameState,
  ctx: MovieTheaterMovementContext,
):
  | { kind: "allow"; message?: string; state?: GameState }
  | { kind: "block"; message: string; state?: GameState }
  | undefined {
  const isEnteringAuditorium =
    ctx.fromRoomId === MOVIE_THEATER_LOBBY_ROOM_ID &&
    ctx.direction === "north" &&
    ctx.destinationRoomId === MOVIE_THEATER_AUDITORIUM_ENTRY_ROOM_ID;

  if (!isEnteringAuditorium) return undefined;

  if (isUsherBotInvestigatingBathroom(state)) {
    return {
      kind: "allow",
      message:
        "With the robot usher occupied in the bathroom, the auditorium doors are unguarded.",
      state,
    };
  }

  return {
    kind: "block",
    message: MOVIE_THEATER_USHER_BLOCK_MESSAGE,
    state,
  };
}

function normalizeReportTopic(topic: string): string[] {
  return topic
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function isBathroomSmokeReport(topic: string): boolean {
  const tokens = normalizeReportTopic(topic);
  if (tokens.length === 0) return false;

  const hasSmokeWord = tokens.some((token) =>
    ["smoke", "smoking", "vapor", "vapour", "vape", "vaping"].includes(
      token,
    ),
  );
  const hasBathroomWord = tokens.some((token) =>
    ["bathroom", "restroom", "toilet", "toilets", "lavatory"].includes(
      token,
    ),
  );

  return hasSmokeWord && hasBathroomWord;
}

function stashBathroomVapesInLobbyTrash(state: GameState): {
  collectedNames: string[];
  state: GameState;
} {
  let next = state;
  const collectedNames: string[] = [];

  for (const itemId of MOVIE_THEATER_VAPE_ITEM_IDS) {
    if (inventoryHas(next.player.inventory, itemId)) continue;
    if (getLiveItemLocation(next, itemId) !== MOVIE_THEATER_BATHROOM_ROOM_ID) {
      continue;
    }

    const item = next.world.items.find((candidate) => candidate.id === itemId);
    if (item) collectedNames.push(item.name);
    next = stashItemInContainer(
      next,
      itemId,
      MOVIE_THEATER_LOBBY_TRASH_BIN_ID,
    );
  }

  return { state: next, collectedNames };
}

function startUsherBathroomInvestigation(state: GameState): {
  collectedNames: string[];
  state: GameState;
} {
  let next = resetBathroomSmoke(state);
  next = setMovieTheaterState(next, {
    usherBotBathroomTurnsRemaining: 3,
  });
  next = setUsherBotLocation(next, MOVIE_THEATER_BATHROOM_ROOM_ID);

  return stashBathroomVapesInLobbyTrash(next);
}

export function handleMovieTheaterUsherTell(
  state: GameState,
  target: ConversationTarget,
  topic: string,
): ActionResult | undefined {
  if (target.kind !== "npc" || target.npc.id !== MOVIE_THEATER_USHER_BOT_ID) {
    return undefined;
  }

  if (
    state.player.roomId !== MOVIE_THEATER_LOBBY_ROOM_ID ||
    !isBathroomSmokeReport(topic)
  ) {
    return undefined;
  }

  const theaterState = getMovieTheaterState(state);
  if (theaterState.bathroomSmokiness < SMOKE_REPORT_THRESHOLD) {
    return {
      state,
      message: MOVIE_THEATER_USHER_FALSE_REPORT_LINE,
    };
  }

  const investigation = startUsherBathroomInvestigation(state);
  const collectedMessage =
    investigation.collectedNames.length > 0
      ? `On the way, the robot usher scoops up ${formatNameList(
          investigation.collectedNames,
        )} and drops ${investigation.collectedNames.length === 1 ? "it" : "them"} into the pedal trash bin.`
      : "";

  return {
    state: investigation.state,
    message: [
      `The robot usher extends a little intake port, samples the lobby air, and freezes.\n\n"Confirmed. Bathroom vapor detected. I will investigate."\n\nIt glides west into the bathroom.`,
      collectedMessage,
    ]
      .filter(Boolean)
      .join("\n\n"),
  };
}

export function tickMovieTheaterUsher(state: GameState): {
  messages?: string[];
  state: GameState;
} {
  const theaterState = getMovieTheaterState(state);
  const remaining = theaterState.usherBotBathroomTurnsRemaining;
  if (remaining <= 0) return { state };

  const nextRemaining = Math.max(0, remaining - 1);
  let next = setMovieTheaterState(state, {
    usherBotBathroomTurnsRemaining: nextRemaining,
  });

  if (nextRemaining === 0) {
    next = setUsherBotLocation(next, MOVIE_THEATER_LOBBY_ROOM_ID);
  }

  return { state: next };
}
