import type { TickEvent } from "@game/engine/turn";
import type { GameState } from "./gameTypes";
import type { Item } from "./itemTypes";
import type { Exit } from "./roomTypes";

export type TickFn = (ctx: TickContext) => GameState | void;

export type TickContext = {
  canEnter: (item: Item, roomId: string) => boolean;
  emit: (ev: TickEvent) => void;
  getPlayerRoomId: () => string;
  getRoomExits: (roomId: string) => Exit[];
  isRoomDark: (roomId: string) => boolean;
  item: Item;
  moveItemToRoom: (itemId: string, roomId: string) => GameState;
  rng: () => number;
  state: GameState;
  turn: number;
};

export type EncounterContext = {
  canEnter: (item: Item, roomId: string) => boolean;
  determineEncounterAction: (roomId: string) => void;
  emit: (ev: TickEvent) => void;
  getPlayerRoomId: () => string;
  getRoomExits: (roomId: string) => Exit[];
  isRoomDark: (roomId: string) => boolean;
  item: Item;
  moveItemToRoom: (itemId: string, roomId: string) => void;
  rng: () => number;
  state: GameState;
  turn: number;
};
