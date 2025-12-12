import type { DoorDefinition, DoorState } from "./doorTypes";
import type { Item, ItemState } from "./itemTypes";
import type { Room } from "./roomTypes";
import type { TeleportPadDefinition } from "./tpadTypes";

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
  theSickness: number; // Invisible stat, affects diagnosis
}

export type StatusId =
  | "none"
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
  statusEffects: StatusEffect[];

  // Narrative progress
  memories: PlayerMemories;
}

export interface Countdown {
  id: string;
  remainingTurns: number;
  isActive: boolean;
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
}
