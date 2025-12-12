import type { GameState, StatusId, SyringeState } from "./gameTypes";

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
  doses?: number;
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
  /** Can only accept these item IDs (used for syringe). */
  allowedContentsIds?: string[];
  /** True if this item can be injected with the syringe. */
  isInjectable?: boolean;
  /** Optional effect key applied when this item is injected. */
  injectionEffectId?: StatusId;
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

export type ItemOverrides = Partial<Record<ItemOverrideVerb, string>>;

export interface ItemState {
  // Syringe-specific state
  syringe: SyringeState; // was: top-level syringe

  // Dynamic bits keyed by item id
  openItems: Record<string, boolean>; // was: top-level openItems
  spentCartridges: Record<string, boolean>; // was: top-level spentCartridges

  openContainers: Record<string, boolean>;
  containerContents: Record<string, string[]>;
}
