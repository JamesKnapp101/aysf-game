export interface GameState {
  // Static world definition (rooms, items, doors, etc.)
  world: World;

  // Meta / progression
  moves: number; // was: moves
  score: number; // was: score
  rating: number; // was: rating

  // Output log for the UI
  log: string[];

  // Dynamic slices
  player: PlayerState;
  worldState: WorldState;
  itemState: ItemState;
}

export interface PlayerVitals {
  health: number; // 0–100
  oxygen: number; // 0–100 (stub for later)
  temperature: number;
  brainActivity: number; // 1: "normal" 2: "excited" 3: "slowed" 4: "stoned" 5: "possessed"
  radiation: number;
  theSickness: number; // Invisible stat, affects diagnosis
}

export type StatusId =
  | "bleeding"
  | "drunk"
  | "nanites"
  | "smokeInhalation"
  | "radiation"
  | "blind"
  | "virus"
  | "trixophine"
  | "vanitrax"
  | "seritroxin"
  | "pentatrosin"
  | "innoculant"
  | "xantophol"
  | "dreaming";

export interface StatusEffect {
  id: StatusId;
  intensity: number; // 1–3 or whatever you like
  remainingTurns?: number; // optional: undefined = indefinite
  source?: string; // item id, event id, etc.
}

export interface PlayerMemories {
  memoryScore: number; // replaces top-level `memory`
  revealedFlags: Set<string>; // e.g. "knowsName", "remembersKiraParty"
}

export interface PlayerState {
  // Where the player is
  roomId: string; // was: playerRoomId

  // Inventory is just item ids you already use
  inventory: string[]; // was: top-level inventory

  // Core condition
  vitals: PlayerVitals;
  statuses: StatusEffect[];

  // Narrative progress
  memories: PlayerMemories;
}

export interface Countdown {
  id: string;
  remainingTurns: number;
  isActive: boolean;
}

export interface WorldState {
  // Doors keyed by door id instead of an array
  doors: Record<string, DoorState>; // was: doorStates: DoorState[]

  // Threat timers, hazard countdowns, etc. (stubbed for now)
  threatTimers?: {
    engineMeltdown?: Countdown;
    reactorOverload?: Countdown;
    hullBreach?: Countdown;
  };

  // Global environmental conditions (easy extension point)
  globalConditions?: {
    shipPressure: "normal" | "low" | "vacuum";
    radiationLevel: number; // 0–100
  };

  // Later: biosigns, power state per deck, etc.
}

export interface ItemState {
  // Syringe-specific state
  syringe: SyringeState; // was: top-level syringe

  // Dynamic bits keyed by item id
  openItems: Record<string, boolean>; // was: top-level openItems
  spentCartridges: Record<string, boolean>; // was: top-level spentCartridges

  // Extension point for more per-item flags later
  // e.g. hackedConsoles, repairedPanels, etc.
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
export type clothingSlots =
  | "head"
  | "torso"
  | "legs"
  | "feet"
  | "jewelry"
  | "full"; // full is for things like the space suit

export interface Item {
  id: string;
  name: string;
  description: string;
  location: string; // room id or "INVENTORY"
  vocab: string[];
  initialDescription?: string;
  itemClass: ItemClass;
  itemCategory: ItemCategory;
  itemWeight: number;
  itemSize: number;
  isWearable: boolean;
  clothingSlot?: clothingSlots;
  isReadable: boolean;
  readableText?: string;
  isContainer: boolean;
  isOpenable?: boolean;
  capacity?: number;
  contains?: string[];
  hasDose?: boolean;
  sceneryDescription?: string;
  hasEffect?: (state: GameState, item: Item) => GameState;
  isSwitchable?: boolean;
  isOn?: boolean;
  remainingCharge?: number;
  providesLight?: boolean;
  overrides?: ItemOverrides;
  isContagious?: boolean;
  isRadioactive?: boolean;
  isEdible?: boolean;
}

export type ItemOverrideVerb =
  | "open"
  | "close"
  | "insert"
  | "remove"
  | "take"
  | "drop"
  | "get"
  | "smell"
  | "taste"
  | "wear"
  | "lookunder"
  | "knock"
  | "light"
  | "siton"
  | "enter"
  | "use"
  | "kiss"
  | "push"
  | "pull"
  | "lift"
  | "lower"
  | "listen"
  | "touch"
  | "attack"
  | "cut"
  | "switch"
  | "search"
  | "climb"
  | "eat"
  | "move"
  | "examine";

export type ItemOverrides = Partial<Record<ItemOverrideVerb, string>>;

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
  teleportPads: TeleportPadDefinition[];
}
export interface SyringeState {
  loadedCartridgeId?: string;
}
