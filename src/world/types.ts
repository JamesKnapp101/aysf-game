export interface GameState {
  world: World;
  playerRoomId: string;

  inventory: string[];
  log: string[];
  score: number;
  memory: number;
  rating: number;
  moves: number;
  health: number;
  doorStates: DoorState[];
}

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

export type ItemClass = "solid" | "liquid" | "gas";
export type ItemCategory = "scenery" | "collectable" | "fluid";

export interface Item {
  id: string;
  name: string;
  description: string;
  location: string; // room id or "INVENTORY"
  vocab: string[];

  itemClass: ItemClass;
  itemCategory: ItemCategory;
  itemWeight: number;
  itemSize: number;

  isWearable: boolean;
  isReadable: boolean;
  isContainer: boolean;

  hasEffect?: (state: any) => any;
}

export type DoorKind =
  | "standard" // open/close, optionally locked
  | "keyed" // needs a specific item
  | "badgeScanner" // needs a badge in inventory
  | "airlock" // special behavior on open
  | "scripted"; // fully custom hook

export interface DoorDefinition {
  id: string;
  name: string;
  // fallback description if side-specific ones aren’t set
  description?: string;

  // optional side-specific descriptions
  descriptionFromA?: string;
  descriptionFromB?: string;
  vocab: string[];
  // where does this door actually live
  connects: {
    roomAId: string;
    roomBId: string;
  };

  // optional: which direction in each room (for flavor / messages)
  directions?: {
    fromA: Direction;
    fromB: Direction;
  };

  kind: DoorKind;

  initiallyOpen?: boolean;
  initiallyLocked?: boolean;

  // for keyed/badge doors
  keyItemId?: string; // e.g. "EngineRoomKey"
  badgeItemId?: string; // e.g. "GreenBadge"
  checkBadgeOnDir?: string;

  // for scripted / special doors
  scriptId?: string; // engine can dispatch to a script table

  // flavor text overrides (optional)
  openVerb?: string; // "slide open", "irises open", etc.
  closeVerb?: string; // "slides shut", etc.
}

export interface DoorState {
  id: string;
  isOpen: boolean;
  isLocked: boolean;
}

export type TeleportPadId = string;
export type TeleportRingId = string;

export interface TeleportPadDefinition {
  id: TeleportPadId;
  ringId: TeleportRingId; // "green-disk", "red-disk", etc
  order: number; // 0, 1, 2… within the ring
  roomId: string; // where this pad lives
  label: string; // "green disk", for messaging
  autoTriggerOnEnter?: boolean; // optional: pad fires when you enter the room
}

export interface World {
  rooms: Room[];
  items: Item[];
  doors: DoorDefinition[];
  teleportPads: TeleportPadDefinition[];
}

/** A chunk of world data (one level, one deck, etc.) */
export interface WorldChunk {
  rooms: Room[];
  items: Item[];
  doors: DoorDefinition[];
}
