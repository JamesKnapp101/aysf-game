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

  rng: () => number;
  emit: (ev: GamepadEvent) => void;

  determineEncounterAction: (roomId: string) => void;

  moveItemToRoom: (itemId: string, roomId: string) => void;
  getRoomExits: (roomId: string) => Exit[];
  canEnter: (item: Item, roomId: string) => boolean;
  getPlayerRoomId: () => string;
  isRoomDark: (roomId: string) => boolean;
};
