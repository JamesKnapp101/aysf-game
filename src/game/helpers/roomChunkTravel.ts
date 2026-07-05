import { getRoomById } from "@game/helpers/itemHelpers";
import type { GameState, WorldChunk } from "@game/types/gameTypes";
import type { WorldChunkId } from "../../world/World";

const TRAVEL_ROOM_ALIASES: Partial<Record<string, string>> = {
  GridC3: "DeepStorageGrid",
  HydroponicsOne: "UnderWebOne",
};

const ROOM_CHUNK_BY_ROOM_ID: Partial<Record<string, WorldChunkId>> = {
  BotanicalOne: "level-four",
  Bridge: "level-one",
  CryoLab: "level-seven",
  DeepStorageGrid: "level-seven",
  Lab: "level-two",
  OuterRingSouth: "level-four",
  ParkCenter: "level-three",
  PowerGrid: "level-four",
  ReactorPlatform: "level-five",
  RemoteMedicalOne: "level-two",
  RemotePowerStation: "level-four",
  TPADTerminal: "stairwell",
  UnderWebOne: "level-six",
  VeterinaryCenter: "level-four",
  XenobiologyLab: "level-two",
};

export function normalizeTravelRoomId(roomId: string): string {
  return TRAVEL_ROOM_ALIASES[roomId] ?? roomId;
}

function removeLoadedChunkId(state: GameState, chunkId: WorldChunkId): GameState {
  const loadedChunkIds = Array.isArray(state.world.meta?.loadedChunkIds)
    ? state.world.meta.loadedChunkIds
    : [];

  return {
    ...state,
    world: {
      ...state.world,
      meta: {
        ...state.world.meta,
        loadedChunkIds: loadedChunkIds.filter((id) => id !== chunkId),
      },
    },
  };
}

function applyChunkToState(
  state: GameState,
  chunkId: WorldChunkId,
  chunk: WorldChunk,
  forceMerge: boolean,
  mergeWorldChunkIntoState: (
    state: GameState,
    chunkId: WorldChunkId,
    chunk: WorldChunk,
  ) => GameState,
): GameState {
  const mergeTarget = forceMerge ? removeLoadedChunkId(state, chunkId) : state;
  return mergeWorldChunkIntoState(mergeTarget, chunkId, chunk);
}

export async function prepareRoomForTravel(
  state: GameState,
  roomId: string,
): Promise<{
  applyTo: (state: GameState) => GameState;
  roomExists: boolean;
  roomId: string;
  state: GameState;
}> {
  const normalizedRoomId = normalizeTravelRoomId(roomId);

  if (getRoomById(state, normalizedRoomId)) {
    return {
      applyTo: (nextState) => nextState,
      roomExists: true,
      roomId: normalizedRoomId,
      state,
    };
  }

  const chunkId = ROOM_CHUNK_BY_ROOM_ID[normalizedRoomId];
  if (!chunkId) {
    return {
      applyTo: (nextState) => nextState,
      roomExists: false,
      roomId: normalizedRoomId,
      state,
    };
  }

  const [{ isWorldChunkLoaded, loadWorldChunk }, { mergeWorldChunkIntoState }] =
    await Promise.all([import("../../world/World"), import("@game/gameInit")]);

  const chunk = await loadWorldChunk(chunkId);
  const applyTo = (nextState: GameState) => {
    const forceMerge =
      isWorldChunkLoaded(nextState.world, chunkId) &&
      !getRoomById(nextState, normalizedRoomId);

    return applyChunkToState(
      nextState,
      chunkId,
      chunk,
      forceMerge,
      mergeWorldChunkIntoState,
    );
  };
  const nextState = applyTo(state);

  return {
    applyTo,
    roomExists: Boolean(getRoomById(nextState, normalizedRoomId)),
    roomId: normalizedRoomId,
    state: nextState,
  };
}
