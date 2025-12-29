import type { DoorDefinition, DoorState } from "./doorTypes";
import type { Item, ItemState } from "./itemTypes";
import type { Room } from "./roomTypes";
import type { TeleportPadDefinition } from "./tpadTypes";

export interface GameState {
  world: World;
  moves: number;
  score: number;
  rating: number;
  log: string[];
  player: PlayerState;
  worldState: WorldState;
  itemState: ItemState;
  rng: () => number;
}

export interface PlayerVitals {
  health: number;
  oxygen: number;
  temperature: number;
  brainActivity: number;
  drunkenness?: number;
  theSickness?: number;
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
  | "regenerationWoozies"
  | "possessed"
  | "nightvision-active"
  | "dreaming";

export interface StatusEffect {
  id: StatusId;
  intensity: number;
  remainingTurns?: number;
  source?: string;
}

export interface PlayerMemories {
  memoryScore: number;
  revealedFlags: Set<string>;
}

export interface PlayerState {
  roomId: string;
  inventory: string[];
  vitals: PlayerVitals;
  statusEffects: StatusEffect[];
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
  doors: Record<string, DoorState>;
  darkRooms: Record<string, boolean>;
  threatTimers?: {
    engineMeltdown?: Countdown;
    reactorOverload?: Countdown;
    hullBreach?: Countdown;
  };
  globalConditions?: {
    shipPressure: "normal" | "low" | "vacuum";
    radiationLevel: number;
  };
}
