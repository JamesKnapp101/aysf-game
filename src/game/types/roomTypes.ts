import type { GameState } from "@game/types/gameTypes";
import type { PreserveExitRuleId } from "@game/preserve/preserveTypes";
import type { DescriptionContext } from "@game/types/itemTypes";

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

export type AmbientRoomLightLevel = "normal" | "dim" | "very-dim";

export interface CompassProps {
  exits: Direction[];
}

export interface RoomExit {
  direction: Direction;
  doorId?: string;
  toRoomId: string;
}

export interface Exit {
  direction: Direction;
  doorId?: string;
  preserveRuleId?: PreserveExitRuleId;
  toRoomId?: string;
}

export interface Room {
  ambientLightLevel?: AmbientRoomLightLevel;
  description: string;
  descriptionShort?: string;
  describe?: (state: GameState, room: Room, ctx: DescriptionContext) => string;
  exits: Exit[];
  id: string;
  meta?: Record<string, any>;
  name: string;
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
