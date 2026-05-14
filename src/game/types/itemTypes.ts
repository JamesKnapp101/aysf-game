import type {
  GameState,
  JuicyTopic,
  PlayerScoreId,
  StatusEffect,
  StatusId,
  SyringeState,
} from "./gameTypes";
import type {
  AnimalStatusEffect,
  PreserveActorId,
  PreserveSense,
} from "@game/preserve/preserveTypes";
import type { ItemId } from "./ids";

export type ItemClass = "solid" | "liquid" | "gas";
export type ItemCategory =
  | "scenery"
  | "collectable"
  | "fluid"
  | "animate"
  | "static";
export type clothingSlots =
  | "head"
  | "face"
  | "neck"
  | "torso"
  | "legs"
  | "feet"
  | "waist"
  | "wrist"
  | "body";

export interface Item {
  allowedContentsIds?: string[];
  canHideUnder?: boolean;
  capacity?: number;
  capacityOn?: number;
  clothingSlot?: clothingSlots;
  containsTea?: JuicyTopic[];
  description: string;
  describe?: (state: GameState, item: Item, ctx: DescriptionContext) => string;
  describeInitial?: (
    state: GameState,
    item: Item,
    ctx: DescriptionContext,
  ) => string;
  describeLookThrough?: (
    state: GameState,
    item: Item,
    ctx: DescriptionContext,
  ) => string;
  describeScenery?: (
    state: GameState,
    item: Item,
    ctx: DescriptionContext,
  ) => string;
  doses?: number;
  hasEffect?: (state: GameState, item: Item) => GameState;
  id: string;
  initialDescription?: string;
  injectionEffectId?: StatusId;
  injectionRemoveEffectId?: StatusId;
  isConsumable?: boolean;
  isContainer?: boolean;
  isContagious?: boolean;
  isInjectable?: boolean;
  isLoggable?: boolean;
  isOn?: boolean;
  isOpenable?: boolean;
  isPushable?: boolean;
  isRadioactive?: boolean;
  isReadable?: boolean;
  isReflective?: boolean;
  isSearchable?: boolean;
  isSettable?: boolean;
  isShootable?: boolean;
  isSurface?: boolean;
  isSwitchable?: boolean;
  isSyringeCartridge?: boolean;
  isTurnable?: boolean;
  isUseable?: boolean;
  isWearable?: boolean;
  itemCategory: ItemCategory;
  itemClass: ItemClass;
  itemSize: number;
  itemWeight: number;
  location: string;
  lookThroughDescription?: string;
  meta?: Record<string, any>;
  name: string;
  named?: (state: GameState) => string;
  overrides?: ItemOverrides;
  providesLight?: boolean;
  readableText?: string | ((state: GameState, item: Item) => string);
  readableTitle?: string;
  sceneryDescription?: string;
  scoreId?: PlayerScoreId;
  vocab: string[];
}

export type LivingMeta = {
  canCarryItems?: boolean;
  canMove?: boolean;
  canUseDoors?: boolean;
  homeRegion?: string[];
  hostility?: "neutral" | "avoidant" | "aggressive";
  isAlive: true;
  trackingModes?: PreserveSense[];
  vision?: "normal" | "dark" | "infrared";
  willConsumeConsumables?: boolean;
};

export type DescriptionContext =
  | { kind: "roomBase"; mode: "log" | "panel"; roomId: string }
  | { kind: "scenery"; roomId: string }
  | { kind: "examine"; roomId: string }
  | { kind: "lookThrough"; roomId: string }
  | { doorId: string; kind: "door"; roomId: string; side?: "a" | "b" };

export type ItemOverrideVerb =
  | "tick"
  | "onEncounter"
  | "open"
  | "close"
  | "insert"
  | "remove"
  | "take"
  | "drop"
  | "get"
  | "bounce"
  | "smell"
  | "taste"
  | "wear"
  | "lookunder"
  | "lookthrough"
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
  | "turn"
  | "listen"
  | "touch"
  | "attack"
  | "cut"
  | "switch"
  | "search"
  | "climb"
  | "ride"
  | "eat"
  | "move"
  | "examine";

export type ItemOverrides = Partial<Record<ItemOverrideVerb, any>>;
export type CoolerMode = "off" | "cool" | "cold" | "freeze";

export type ItemSettings =
  | { kind: "cooler"; mode: CoolerMode }
  | { dials: number[]; kind: "safe" }
  | { code: string; kind: "transmitter" }
  | {
      currentCharge: number;
      drainRate: number;
      isOn: boolean;
      kind: "flashlight";
      maxCharge: number;
      rechargeRate: number;
    }
  | { isOn: boolean; kind: "goggles" }
  | { kind: "game-whistle"; mode: PreserveActorId }
  | { angle: number; kind: "gym-treadmill"; speed: number }
  | { currentViewIndex: number; kind: "camera-gun-viewer" }
  | { hasLink: boolean; isOn: boolean; kind: "comet-viewer" };

export type PlayerClothes = {
  body: ItemId | undefined;
  face: ItemId | undefined;
  feet: ItemId | undefined;
  head: ItemId | undefined;
  legs: ItemId | undefined;
  neck: ItemId | undefined;
  torso: ItemId | undefined;
  waist: ItemId | undefined;
  wrist: ItemId | undefined;
};

export type AnimalDisposition = {
  angerLevel?: number;
  fearLevel?: number;
  hungerLevel?: number;
  statusEffects?: AnimalStatusEffect[];
  trustLevel?: number;
};

export type AttachedHostId = ItemId | "PLAYER" | "INVENTORY" | undefined;

export interface ItemState {
  activeGelCameras: Record<string, boolean>;
  animalDisposition: Record<ItemId, AnimalDisposition>;
  attachedTo: Record<ItemId, AttachedHostId>;
  containerContents: Record<ItemId, ItemId[]>;
  containerFilled: Record<ItemId, ItemId[]>;
  frozenItems: Record<ItemId, boolean>;
  itemRoomId: Record<ItemId, string>;
  itemSettings: Partial<Record<ItemId, ItemSettings>>;
  messagesPlayed: Record<string, boolean>;
  mindGunMemoryIndex: Record<ItemId, number>;
  openItems: Record<ItemId, boolean>;
  pickedUpByPlayer: Record<string, boolean>;
  revealedUnder: Record<ItemId, boolean>;
  searchableContents: Record<ItemId, ItemId[]>;
  surfaceContents: Record<ItemId, ItemId[]>;
  syringe: SyringeState;
  underContents: Record<ItemId, ItemId[]>;
  wornByPlayer: PlayerClothes;
}

type ConsumableEffect =
  | {
      duration?: number;
      id: StatusEffect;
      intensity?: number;
      type: "status";
    }
  | { amount: number; type: "heal" }
  | { amount: number; type: "damage" }
  | { text: string; type: "message" };

export type ConsumableMeta = {
  consumable?: {
    kind: "drink" | "food" | "drug";
    onEmpty?: ConsumableEffect[];
    perDose?: ConsumableEffect[];
  };
};

export type SwitchState = "on" | "off" | "locked" | "failure";

export type SwitchStates = Record<string, SwitchState>;
