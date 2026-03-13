import { addToInventory, bucketForItem } from "@game/rules/state";
import type { GameState, World } from "@game/types/gameTypes";
import { createInitialState } from "../../game/gameInit";
import { handleCommand } from "../../game/engine/handleCommand";
import { parseCommand } from "../../parse/parser";
import { LEVEL_ONE } from "../../world/maps/LevelOne";
import { LEVEL_SEVEN } from "../../world/maps/LevelSeven";
import { LEVEL_FOUR } from "../../world/maps/levelFour/LevelFour";
import { LEVEL_FIVE } from "../../world/maps/levelFive/LevelFive";
import { LEVEL_THREE } from "../../world/maps/levelThree/LevelThree";
import { LEVEL_TWO } from "../../world/maps/levelTwo/LevelTwo";
import { INITIAL_WORLD, mergeWorldChunks } from "../../world/World";

export const FULL_WORLD: World = mergeWorldChunks(
  INITIAL_WORLD,
  LEVEL_ONE,
  LEVEL_TWO,
  LEVEL_THREE,
  LEVEL_FOUR,
  LEVEL_FIVE,
  LEVEL_SEVEN,
);

type CreateStateOptions = {
  roomId?: string;
  rng?: () => number;
  visitedRooms?: string[];
  world?: World;
};

export function createTestState(options: CreateStateOptions = {}): GameState {
  const roomId = options.roomId ?? "HydroponicsPlatform";
  const world = options.world ?? FULL_WORLD;
  const visitedRooms = options.visitedRooms ?? [roomId];

  const state = createInitialState(world);

  return {
    ...state,
    rng: options.rng ?? (() => 0),
    player: {
      ...state.player,
      roomId,
    },
    worldState: {
      ...state.worldState,
      visitedRooms: {
        ...state.worldState.visitedRooms,
        ...Object.fromEntries(visitedRooms.map((visitedRoomId) => [visitedRoomId, true])),
      },
    },
  };
}

export function setInventory(state: GameState, itemIds: string[]): GameState {
  const nextInventory = {
    general: [] as string[],
    badges: [] as string[],
    keys: [] as string[],
  };

  for (const itemId of itemIds) {
    const item = state.world.items.find((candidate) => candidate.id === itemId);
    const bucket = bucketForItem(item);
    nextInventory[bucket].push(itemId);
  }

  return {
    ...state,
    player: {
      ...state.player,
      inventory: nextInventory,
    },
  };
}

export function addInventoryItems(
  state: GameState,
  itemIds: string[],
): GameState {
  return itemIds.reduce((nextState, itemId) => addToInventory(nextState, itemId), state);
}

export function setPlayerRoom(state: GameState, roomId: string): GameState {
  return {
    ...state,
    player: {
      ...state.player,
      roomId,
    },
    worldState: {
      ...state.worldState,
      visitedRooms: {
        ...state.worldState.visitedRooms,
        [roomId]: true,
      },
    },
  };
}

export function patchRoomDarkness(
  state: GameState,
  roomId: string,
  isDark: boolean,
): GameState {
  return {
    ...state,
    worldState: {
      ...state.worldState,
      darkRooms: {
        ...state.worldState.darkRooms,
        [roomId]: isDark,
      },
    },
  };
}

export async function runCommand(
  state: GameState,
  command: string,
): Promise<GameState> {
  return handleCommand(state, parseCommand(command));
}

export async function runCommands(
  state: GameState,
  commands: string[],
): Promise<GameState> {
  let nextState = state;

  for (const command of commands) {
    nextState = await runCommand(nextState, command);
  }

  return nextState;
}

export function getLastLogEntry(state: GameState): string {
  return state.log[state.log.length - 1] ?? "";
}

export function expectInventoryToContain(
  state: GameState,
  itemId: string,
): boolean {
  return (
    state.player.inventory.general.includes(itemId) ||
    state.player.inventory.badges.includes(itemId) ||
    state.player.inventory.keys.includes(itemId)
  );
}
