import { GameState } from "@game/types/gameTypes";
import { DescriptionContext } from "@game/types/itemTypes";

export type Direction =
  | "north"
  | "south"
  | "east"
  | "west"
  | "up"
  | "down"
  | "northeast"
  | "northwest"
  | "southeast"
  | "southwest"
  | "in"
  | "out";

export interface CompassProps {
  exits: Direction[];
}

export interface RoomExit {
  direction: Direction;
  toRoomId: string;
  doorId?: string;
}

export interface Exit {
  direction: Direction;
  toRoomId?: string;
  doorId?: string;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  describe?: (state: GameState, room: Room, ctx: DescriptionContext) => string;
  descriptionShort?: string;
  exits: Exit[];
}

export type Coord = { x: number; y: number; z: number };
export type CoordMap = Record<string, Coord>; // roomId -> coord
export type CoordKey = `${number},${number},${number}`;
export type ReverseCoordMap = Record<CoordKey, string>; // "x,y,z" -> roomId

export interface WorldMeta {
  transmitter?: {
    coordByRoomId: CoordMap;
    roomIdByCoord: ReverseCoordMap;
  };
}
