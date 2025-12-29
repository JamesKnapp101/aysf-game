import type { GameState } from "./gameTypes";
import type { Item } from "./itemTypes";
import type { Exit } from "./roomTypes";

export type TickFn = (ctx: TickContext) => GameState | void;

export type TickContext = {
  state: GameState;
  item: Item;
  turn: number;

  rng: () => number;
  emit: (ev: GamepadEvent) => void;

  moveItemToRoom: (itemId: string, roomId: string) => GameState;
  getRoomExits: (roomId: string) => Exit[];
  canEnter: (item: Item, roomId: string) => boolean;
  getPlayerRoomId: () => string;
  isRoomDark: (roomId: string) => boolean;
};

export type EncounterContext = {
  state: GameState;
  item: Item;
  turn: number;

  rng: () => number; // deterministic if seeded
  emit: (ev: GamepadEvent) => void;

  // helpers (so AI code doesn’t touch internals)
  determineEncounterAction: (roomId: string) => void;

  moveItemToRoom: (itemId: string, roomId: string) => void;
  getRoomExits: (roomId: string) => Exit[];
  canEnter: (item: Item, roomId: string) => boolean;
  getPlayerRoomId: () => string;
  isRoomDark: (roomId: string) => boolean;
};
