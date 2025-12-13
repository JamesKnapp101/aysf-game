import type { GameState, StatusId, SyringeState } from "./gameTypes";
import type { ItemId } from "./ids";

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
  isOpenable?: boolean;
  capacity?: number;
  isContainer: boolean; // IN
  isSurface?: boolean; // ON (transmitter pad, table, shelf, etc.)
  canHideUnder?: boolean; // UNDER (rug, mat, pile of trash)
  capacityIn?: number;
  capacityOn?: number;
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

export type ItemOverrides = Partial<Record<ItemOverrideVerb, string>>;

export interface ItemState {
  pickedUpByPlayer: Record<string, boolean>;
  // --- Syringe-specific state ----------------------------------------
  syringe: SyringeState;

  // --- Open / closed tracking ----------------------------------------
  openItems: Record<ItemId, boolean>;

  // --- Consumables ---------------------------------------------------
  spentCartridges: Record<ItemId, boolean>;

  // --- Placement & containment --------------------------------------

  /**
   * Items placed INSIDE other items (containers)
   * key: container item id
   * value: item ids contained within
   */
  containerContents: Record<ItemId, ItemId[]>;

  /**
   * Items placed ON other items (surfaces, pads, tables)
   * key: surface item id
   * value: item ids resting on top
   */
  surfaceContents: Record<ItemId, ItemId[]>;

  /**
   * Items hidden UNDER other items (rugs, mats, debris)
   * key: covering item id
   * value: item ids hidden underneath
   */
  underContents: Record<ItemId, ItemId[]>;

  /**
   * Whether UNDER contents have been revealed for a given item
   * (e.g. rug lifted, mat moved)
   */
  revealedUnder: Record<ItemId, boolean>;
}
