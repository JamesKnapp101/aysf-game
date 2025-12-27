import type {
  GameState,
  StatusEffect,
  StatusId,
  SyringeState,
} from "./gameTypes";
import type { ItemId } from "./ids";

export type ItemClass = "solid" | "liquid" | "gas";
export type ItemCategory = "scenery" | "collectable" | "fluid";
export type clothingSlots =
  | "head"
  | "face"
  | "neck"
  | "torso"
  | "legs"
  | "feet"
  | "waist"
  | "wrist"
  | "body"; // full is for things like the space suit

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
  isWearable?: boolean;
  clothingSlot?: clothingSlots;
  isReadable?: boolean;
  readableText?: string;
  isOpenable?: boolean;
  capacity?: number;
  isContainer?: boolean;
  isSurface?: boolean;
  canHideUnder?: boolean;
  capacityIn?: number;
  capacityOn?: number;
  doses?: number;
  sceneryDescription?: string;
  hasEffect?: (state: GameState, item: Item) => GameState;
  meta?: Record<string, any>;
  isSwitchable?: boolean;
  isSettable?: boolean;
  isSearchable?: boolean;
  isOn?: boolean;
  remainingCharge?: number;
  providesLight?: boolean;
  overrides?: ItemOverrides;
  isContagious?: boolean;
  isRadioactive?: boolean;
  isConsumable?: boolean;
  isUseable?: boolean;
  allowedContentsIds?: string[];
  isInjectable?: boolean;
  injectionEffectId?: StatusId;
  injectionRemoveEffectId?: StatusId;
  isSyringeCartridge?: boolean;
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

export type ItemOverrides = Partial<Record<ItemOverrideVerb, any>>;
export type CoolerMode = "off" | "cool" | "cold" | "freeze";

export type ItemSettings =
  | { kind: "cooler"; mode: CoolerMode }
  | { kind: "safe"; dials: number[] } // e.g. [3, 7, 1, 9]
  | { kind: "transmitter"; code: string }
  | { kind: "flashlight"; isOn: boolean }
  | { kind: "goggles"; isOn: boolean }
  | { kind: "camera-gun-viewer"; currentViewIndex: number };

export type PlayerClothes = {
  head: ItemId | undefined;
  face: ItemId | undefined;
  neck: ItemId | undefined;
  torso: ItemId | undefined;
  legs: ItemId | undefined;
  feet: ItemId | undefined;
  wrist: ItemId | undefined;
  waist: ItemId | undefined;
  body: ItemId | undefined;
};

export interface ItemState {
  pickedUpByPlayer: Record<string, boolean>;
  wornByPlayer: PlayerClothes;
  syringe: SyringeState;
  openItems: Record<ItemId, boolean>;
  spentCartridges: Record<ItemId, boolean>;
  containerContents: Record<ItemId, ItemId[]>;
  containerFilled: Record<ItemId, ItemId[]>;
  surfaceContents: Record<ItemId, ItemId[]>;
  underContents: Record<ItemId, ItemId[]>;
  revealedUnder: Record<ItemId, boolean>;
  searchableContents: Record<ItemId, ItemId[]>;
  itemSettings: Partial<Record<ItemId, ItemSettings>>;
  frozenItems: Record<ItemId, boolean>;
  messagesPlayed: Record<string, boolean>;
  activeGelCameras: Record<string, boolean>;
}

type ConsumableEffect =
  | {
      type: "status";
      id: StatusEffect;
      intensity?: number;
      duration?: number;
    }
  | { type: "heal"; amount: number }
  | { type: "damage"; amount: number }
  | { type: "message"; text: string };

export type ConsumableMeta = {
  consumable?: {
    kind: "drink" | "food" | "drug";
    perDose?: ConsumableEffect[];
    onEmpty?: ConsumableEffect[];
  };
};
