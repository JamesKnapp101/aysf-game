import { playerMemoryMap, playerScoreMap } from "@game/constants";
import type { CometPersonalityMode as SharedCometPersonalityMode } from "@game/constants/cometPersonalities";
import type {
  GamePreserveDifficulty as ImportedGamePreserveDifficulty,
  PreserveRunState,
} from "@game/preserve/preserveTypes";
import type { DNAResult } from "@game/rules/dnaReader";
import type { ItemId, RoomId } from "@game/types/ids";
import type { NpcConversationState, RadioState } from "@game/types/npcTypes";
import type { DoorDefinition, DoorState } from "./doorTypes";
import type { Item, ItemState } from "./itemTypes";
import type { Direction, Room } from "./roomTypes";
import type { TeleportPadDefinition } from "./tpadTypes";

export interface GameState {
  conversation?: ConversationState;
  itemState: ItemState;
  log: string[];
  moves: number;
  player: PlayerState;
  radio?: RadioState;
  rating: number;
  rng: () => number;
  score: number;
  uiState: GameUiState;
  world: World;
  worldState: WorldState;
}

export type ConversationState = {
  npcs?: Record<string, NpcConversationState>;
};

export interface PlayerVitals {
  brainActivity: number;
  drunkenness?: number;
  health: number;
  oxygen: number;
  temperature: number;
  theSickness?: number;
}

export interface PlayerMirrorState {
  hasHair: boolean;
  injuredByBadger: boolean;
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
  | "explosive follicle growth"
  | "pheromoned";

export interface StatusEffect {
  id: StatusId;
  intensity: number;
  remainingTurns?: number;
  source?: string;
}

export type GameNotificationKind = "score" | "gossip" | "log" | "system";

export type GameNotificationDraft = {
  kind: GameNotificationKind;
  text: string;
};

export type GameNotification = GameNotificationDraft & {
  id: number;
};

export type CometPersonalityMode = SharedCometPersonalityMode;
export type CometTextSizeMode = "smaller" | "larger";
export type VisualEffectsMode = "full" | "reduced" | "off";

export interface GameUiState {
  cometPersonality: CometPersonalityMode;
  cometTextSize: CometTextSizeMode;
  visualEffectsMode: VisualEffectsMode;
  nextNotificationId: number;
  notifications: GameNotification[];
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
  atTurn?: number;
  fromRoomId: string;
  toRoomId: string;
  via?: string;
};

export type PlayerLogEntry = {
  body: string;
  loggedAtTurn: number;
  source: string;
  title: string;
};

export type PlayerInventory = {
  badges: string[];
  general: string[];
  keys: string[];
};

export interface PlayerState {
  dnaBank: DNAResult[];
  inventory: PlayerInventory;
  log: PlayerLogEntry[];
  memoriesTriggered: Record<PlayerMemoryId, boolean>;
  prevRoomId?: string;
  recentMoves?: PlayerMoveEvent[];
  roomId: string;
  spiltTea: JuicyTopic[];
  statusEffects: StatusEffect[];
  vitals: PlayerVitals;
  mirror: PlayerMirrorState;
}

export interface Countdown {
  id: string;
  isActive: boolean;
  remainingTurns: number;
}

export type OctopusArmState = {
  id: string;
  path: string[];
  stunnedTurns: number;
};

export type OctopusState = {
  arms: OctopusArmState[];
  isAware: boolean;
  lastSeenPlayerRoomId?: string;
  lastWarningLevel: number;
  maxSegments: number; // 8
  moveEveryTurns: number; // game turns between advances
  movesPerTick: number; // rooms advanced when the octopus does move
  occupiedRoomIds: string[]; // segments
  returnChokeActive: boolean;
  retreatTicks: number; // reserved for future global retreat/cooldown tuning
  rootRoomId: string;
  tipRoomIds: string[]; // endpoints
  trailQueue: string[];
  turnsUntilMove: number; // countdown until the next advance
};

export type AviarySpotlightState = {
  hintCooldown: number; // turns until next hint
  index: number; // current route index
  pauseWhenPlayerNotInAviary: boolean; // config
  route: string[];
  turnsLeftHere: 1 | 2; // stays 2 turns per room
};

export type HydroponicsSpiderState = {
  doorHealth: number;
  isAlive: boolean;
  lastTrackedHydroponicsRoomId?: string;
  pendingAcidTarget: "none" | "door" | "player" | "gapPlayer";
  sensitivity: number;
  turnsSinceLastBreath: number;
};

export type HydroponicsCocoonPuzzleState = {
  graceTurnsRemaining: number;
  initialized: boolean;
  openedBodyIds: Record<string, boolean>;
  powerWorkerBodyId?: string;
  resolved: boolean;
};

export type GamePreserveDifficulty = ImportedGamePreserveDifficulty;

export type GamePreserveState = {
  completedDifficulties: Partial<Record<GamePreserveDifficulty, boolean>>;
  run: PreserveRunState | null;
  selectedDifficulty: GamePreserveDifficulty;
};

export type BullEncounterState = {
  chargeCooldown: number;
  pendingCharge?: {
    dir: string;
    targetRoomId: string;
  };
  stunnedTurns: number;
};

export type TrashBotMode =
  | "wandering"
  | "returning_to_maintenance"
  | "door_open_for_entry"
  | "inside_waiting_to_dump"
  | "inside_waiting_to_exit"
  | "door_open_for_exit"
  | "outside_waiting_to_close";

export type TrashBotState = {
  cooldownTurns: number;
  mode: TrashBotMode;
};

export type BrainSlugState = {
  attachedTo: string;
  isHydrated: boolean;
};

export type CatState = {
  heldTurns?: number;
  isWearingCollar: boolean;
  settleTurns?: number;
  suppressRoomListOnce?: boolean;
};

export type NpcSecretState = {
  gossipSharedIds: string[]; // Which gossip IDs have been shared
  secretRevealed: boolean; // Whether the NPC has revealed their secret
};

export interface World {
  doors: DoorDefinition[];
  items: Item[];
  meta?: Record<string, any>;
  rooms: Room[];
  teleportPads: TeleportPadDefinition[];
}

export interface WorldChunk {
  doors: DoorDefinition[];
  items: Item[];
  rooms: Room[];
  teleportPads: TeleportPadDefinition[];
}

export interface DamagedFlashlightState {
  chargeRate: number;
  currentCharge: number;
  isOn: boolean;
  maxCharge: number;
}

export interface SyringeState {
  loadedCartridgeId?: string;
}

type PlayerDeath = {
  bodyDescription?: string;
  cause: string;
};

type ConditionalExit = {
  blockMsg: string;
  conditionalTriggers?: string[];
  direction: Direction;
  passMsg: string;
  roomId: string;
  unlockTriggers: string[];
};

export type JuicyTopic = {
  id: string;
  summary: string;
  tags: string[];
  title: string;
  type: "gossip" | "secret";
};

type MensLockerId =
  | "menLocker1"
  | "menLocker2"
  | "menLocker3"
  | "menLocker4"
  | "menLocker5"
  | "menLocker6"
  | "menLocker7"
  | "menLocker8"
  | "menLocker9"
  | "menLocker10"
  | "menLocker11"
  | "menLocker12"
  | "menLocker13"
  | "menLocker14"
  | "menLocker15"
  | "menLocker16";

type WomensLockerId =
  | "womenLocker1"
  | "womenLocker2"
  | "womenLocker3"
  | "womenLocker4"
  | "womenLocker5"
  | "womenLocker6"
  | "womenLocker7"
  | "womenLocker8"
  | "womenLocker9"
  | "womenLocker10"
  | "womenLocker11"
  | "womenLocker12"
  | "womenLocker13"
  | "womenLocker14"
  | "womenLocker15"
  | "womenLocker16";

type LockerContents<TLockerId extends string> = Record<TLockerId, ItemId[]>;
type LockerOpenedState<TLockerId extends string> = Record<TLockerId, boolean>;
type RoomAirQuality =
  | "clean"
  | "gas emmissions"
  | "foreign particles"
  | "smoke"
  | "thin"
  | "vaccum";
type RoomTemperature =
  | "freezing"
  | "cold"
  | "cool"
  | "temperate"
  | "warm"
  | "hot"
  | "scorching";

export interface WorldState {
  aviarySpotlight: AviarySpotlightState;
  brainSlug: BrainSlugState;
  bullEncounter: BullEncounterState;
  catState: CatState;
  conditionalExits: Record<RoomId, ConditionalExit>;
  conditionalTriggers: Record<string, boolean>;
  damagedFlashlight?: DamagedFlashlightState;
  darkRooms: Record<string, boolean>;
  doors: Record<string, DoorState>;
  gamePreserve: GamePreserveState;
  hydroponicsCocoonPuzzle: HydroponicsCocoonPuzzleState;
  hydroponicsSpider: HydroponicsSpiderState;
  mensLockerContents: LockerContents<MensLockerId>;
  mensLockersOpened: LockerOpenedState<MensLockerId>;
  npcSecrets: Record<string, NpcSecretState>; // Track NPC secret states by NPC ID
  octopusState: OctopusState;
  pendingNarration?: PendingNarration;
  playerDeaths: Record<RoomId, PlayerDeath>;
  powerRestoredSections: Record<PowerSectionId, boolean>;
  roomAirQuality: Record<string, RoomAirQuality>;
  roomAudioLevel: Record<string, number>;
  roomTemp: Record<string, RoomTemperature>;
  scoresTriggered: Record<PlayerScoreId, boolean>;
  scriptedEventsTripped: Record<string, boolean>;
  trashBot: TrashBotState;
  visitedRooms: Record<string, boolean>;
  womensLockerContents: LockerContents<WomensLockerId>;
  womensLockersOpened: LockerOpenedState<WomensLockerId>;
}
