import { playerMemoryMap, playerScoreMap } from "@game/constants";
import { ItemId, RoomId } from "@game/types/ids";
import { RadioVoice } from "@game/types/npcTypes";
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
  conversation?: {
    radio?: {
      activeVoice?: RadioVoice;

      // how long the connection lasts
      turnsRemaining?: number;

      // optional: prevents repeat spam
      topicsUsed?: Record<string, true>;
      queuedLog?: string[];
    };
  };
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
  | "dreaming"
  | "death"
  | "superhorny"
  | "pheromoned";

export interface StatusEffect {
  id: StatusId;
  intensity: number;
  remainingTurns?: number;
  source?: string;
}

type PendingNarration = {
  afterRoomDescription: string[];
};

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
  | "teleport-pads-orange"
  | "teleport-pads-violet"
  | "teleport-pads-white"
  | "teleport-pads-maroon"
  | "park-security"
  | "engine-room-power-lock"
  | "weapons-system"
  | "loading-dock-door"
  | "loading-grid"
  | "cryo-labs"
  | "cryo-sleep"
  | "power-key-turned"
  | "power-initialized";

type PlayerMoveEvent = {
  fromRoomId: string;
  toRoomId: string;
  via?: string;
  atTurn?: number;
};

export type PlayerLogEntry = {
  source: string;
  title: string;
  loggedAtTurn: number;
  body: string;
};

export interface PlayerState {
  roomId: string;
  prevRoomId?: string;
  recentMoves?: PlayerMoveEvent[];
  inventory: {
    general: string[];
    badges: string[];
    keys: string[];
  };
  log: PlayerLogEntry[];
  vitals: PlayerVitals;
  statusEffects: StatusEffect[];
  memoriesTriggered: Record<PlayerMemoryId, boolean>;
}

export interface Countdown {
  id: string;
  remainingTurns: number;
  isActive: boolean;
}

export type OctopusState = {
  rootRoomId: string;
  occupiedRoomIds: string[]; // segments
  tipRoomIds: string[]; // endpoints
  maxSegments: number; // 8
  movesPerTick: number; // 1 or 2
  retreatTicks: number; // e.g., 0/1 if prod causes a skipped tick
  lastSeenPlayerRoomId?: string;
  trailQueue: string[];
};

export type AviarySpotlightState = {
  route: string[];
  index: number; // current route index
  turnsLeftHere: 1 | 2; // stays 2 turns per room
  pauseWhenPlayerNotInAviary: boolean; // config
  hintCooldown: number; // turns until next hint
};

export type HydroponicsSpiderState = {
  isAlive: boolean;
  turnsSinceLastBreath: number;
};

export type BrainSlugState = {
  isHydrated: boolean;
  attachedTo: string;
};

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

export interface DamagedFlashlightState {
  isOn: boolean;
  maxCharge: number;
  currentCharge: number;
  chargeRate: number;
}

export interface SyringeState {
  loadedCartridgeId?: string;
}

type PlayerDeath = {
  cause: string;
  bodyDescription?: string;
};

export interface WorldState {
  pendingNarration?: PendingNarration;
  scriptedEventsTripped: Record<string, boolean>;
  conditionalTriggers: Record<string, boolean>;
  playerDeaths: Record<RoomId, PlayerDeath>;
  doors: Record<string, DoorState>;
  darkRooms: Record<string, boolean>;
  gravityOffRooms: Record<string, boolean>;
  noPowerRooms: Record<string, boolean>;
  powerRestoredSections: Record<PowerSectionId, boolean>;
  visitedRooms: Record<string, boolean>;
  scoresTriggered: Record<PlayerScoreId, boolean>;
  octopusState: OctopusState;
  aviarySpotlight: AviarySpotlightState;
  hydroponicsSpider: HydroponicsSpiderState;
  brainSlug: BrainSlugState;
  damagedFlashlight: DamagedFlashlightState;
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
  mensLockerContents: {
    menLocker1: ItemId[];
    menLocker2: ItemId[];
    menLocker3: ItemId[];
    menLocker4: ItemId[];
    menLocker5: ItemId[];
    menLocker6: ItemId[];
    menLocker7: ItemId[];
    menLocker8: ItemId[];
    menLocker9: ItemId[];
    menLocker10: ItemId[];
    menLocker11: ItemId[];
    menLocker12: ItemId[];
    menLocker13: ItemId[];
    menLocker14: ItemId[];
    menLocker15: ItemId[];
    menLocker16: ItemId[];
  };
  mensLockersOpened: {
    menLocker1: false;
    menLocker2: false;
    menLocker3: false;
    menLocker4: false;
    menLocker5: false;
    menLocker6: false;
    menLocker7: false;
    menLocker8: false;
    menLocker9: false;
    menLocker10: false;
    menLocker11: false;
    menLocker12: false;
    menLocker13: false;
    menLocker14: false;
    menLocker15: false;
    menLocker16: false;
  };
  womensLockerContents: {
    womenLocker1: ItemId[];
    womenLocker2: ItemId[];
    womenLocker3: ItemId[];
    womenLocker4: ItemId[];
    womenLocker5: ItemId[];
    womenLocker6: ItemId[];
    womenLocker7: ItemId[];
    womenLocker8: ItemId[];
    womenLocker9: ItemId[];
    womenLocker10: ItemId[];
    womenLocker11: ItemId[];
    womenLocker12: ItemId[];
    womenLocker13: ItemId[];
    womenLocker14: ItemId[];
    womenLocker15: ItemId[];
    womenLocker16: ItemId[];
  };
  womensLockersOpened: {
    womenLocker1: false;
    womenLocker2: false;
    womenLocker3: false;
    womenLocker4: false;
    womenLocker5: false;
    womenLocker6: false;
    womenLocker7: false;
    womenLocker8: false;
    womenLocker9: false;
    womenLocker10: false;
    womenLocker11: false;
    womenLocker12: false;
    womenLocker13: false;
    womenLocker14: false;
    womenLocker15: false;
    womenLocker16: false;
  };
}
