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

// world types
export interface RoomExit {
  direction: Direction;
  toRoomId: string;
  doorId?: string; // <-- if present, movement is gated by this door
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
  exits: Exit[];
}
