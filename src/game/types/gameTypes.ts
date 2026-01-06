import { playerMemoryMap, playerScoreMap } from "@game/constants";
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

export type PlayerScoreId = keyof typeof playerScoreMap;
export type PlayerMemoryId = keyof typeof playerMemoryMap;
type PowerSectionId =
  | "lights-level-one"
  | "lights-level-two"
  | "lights-level-three"
  | "lights-level-four"
  | "lights-level-five"
  | "lights-level-six"
  | "lights-level-seven"
  | "gravity-level-one"
  | "gravity-level-two"
  | "gravity-level-three"
  | "gravity-level-four"
  | "gravity-level-five"
  | "gravity-level-six"
  | "gravity-level-seven"
  | "library-power"
  | "teleport-pads-green"
  | "teleport-pads-blue"
  | "teleport-pads-yellow"
  | "teleport-pads-brown"
  | "teleport-pads-white"
  | "teleport-pads-grey"
  | "hub-security"
  | "engine-room-power-lock"
  | "weapons-system"
  | "loading-dock-door"
  | "loading-grid"
  | "cryo-labs"
  | "cryo-sleep"
  | "power-key-turned"
  | "power-initialized";

export interface PlayerState {
  roomId: string;
  inventory: string[];
  vitals: PlayerVitals;
  statusEffects: StatusEffect[];
  memoriesTriggered: Record<PlayerMemoryId, boolean>;
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
  meta?: Record<string, any>;
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
  gravityOffRooms: Record<string, boolean>;
  noPowerRooms: Record<string, boolean>;
  powerRestoredSections: Record<PowerSectionId, boolean>;
  visitedRooms: Record<string, boolean>;
  scoresTriggered: Record<PlayerScoreId, boolean>;
  roomTemp: Record<
    string,
    "freezing" | "cold" | "cool" | "temperate" | "warm" | "hot" | "scorching"
  >;
  roomAirQuality: Record<
    string,
    | "clean"
    | "gas emmissions"
    | "foreign particles"
    | "smoke"
    | "thin"
    | "vaccum"
  >;
  roomAudioLevel: Record<string, number>;
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
