import { removeItemFromPlacementLists } from "@game/helpers/itemPlacement";
import { updateItemLocation } from "@game/rules/items";
import {
  addToInventory,
  inventoryHas,
  removeFromInventory,
} from "@game/rules/state";
import type { GameState } from "@game/types/gameTypes";
import type { Item, ItemCommandOverrideContext } from "@game/types/itemTypes";

export const THREE_D_PRINTING_FACILITY_ROOM_ID = "3DPrintingFacility";
export const THREE_D_PRINTER_ITEM_ID = "3DPrinter";
export const THREE_D_PRINTER_TRAY_ITEM_ID = "3DPrinterTray";
export const PRINTED_WRENCH_ITEM_ID = "PrintedWrench";
export const PRINTED_GLUE_GUN_ITEM_ID = "GlueGun";
export const ATUM_CARTRIDGE_ITEM_ID = "AtumCartridge";
export const ATUM_CARTRIDGE_INITIAL_COUNT = 3;

export type ThreeDPrinterRecipe = {
  atumCost: number;
  id: string;
  itemId?: string;
  name: string;
};

export const THREE_D_PRINTER_RECIPES: ThreeDPrinterRecipe[] = [
  {
    id: "glue-gun",
    name: "GLUE GUN",
    atumCost: 3,
    itemId: PRINTED_GLUE_GUN_ITEM_ID,
  },
  {
    id: "wrench",
    name: "WRENCH",
    atumCost: 15,
    itemId: PRINTED_WRENCH_ITEM_ID,
  },
  { id: "infinite-flashlight", name: "INFINITE FLASHLIGHT", atumCost: 500 },
  {
    id: "xtreme-strength-spider-spray",
    name: "XTREME STRENGTH SPIDER SPRAY",
    atumCost: 1100,
  },
  { id: "screwdriver", name: "SCREWDRIVER", atumCost: 16 },
  { id: "grav-hammer", name: "GRAV HAMMER", atumCost: 345 },
];

export type ThreeDPrinterPrintResult = {
  message: string;
  printed: boolean;
  state: GameState;
};

function getItemById(state: GameState, itemId: string): Item | undefined {
  return state.world.items.find((candidate) => candidate.id === itemId);
}

function normalizeAtumCount(count: unknown): number {
  return typeof count === "number" && Number.isFinite(count)
    ? Math.max(0, Math.floor(count))
    : 0;
}

export function isAtumCartridgeItem(item: Item | undefined): boolean {
  return item?.meta?.kind === "atum-cartridge";
}

export function getAtumCartridgeCount(
  state: GameState,
  itemId = ATUM_CARTRIDGE_ITEM_ID,
): number {
  const settings = state.itemState.itemSettings[itemId];
  if (settings?.kind === "atum-cartridge") {
    return normalizeAtumCount(settings.count);
  }

  const item = getItemById(state, itemId);
  if (!item) return 0;

  return normalizeAtumCount(
    item.meta?.atumCount ??
      (item.id === ATUM_CARTRIDGE_ITEM_ID
        ? ATUM_CARTRIDGE_INITIAL_COUNT
        : 0),
  );
}

export function setAtumCartridgeCount(
  state: GameState,
  count: number,
  itemId = ATUM_CARTRIDGE_ITEM_ID,
): GameState {
  return {
    ...state,
    itemState: {
      ...state.itemState,
      itemSettings: {
        ...state.itemState.itemSettings,
        [itemId]: {
          kind: "atum-cartridge",
          count: normalizeAtumCount(count),
        },
      },
    },
  };
}

export function getAtumCartridgeDisplayName(
  state: GameState,
  item?: Item,
): string {
  const itemId = item?.id ?? ATUM_CARTRIDGE_ITEM_ID;
  return `a cartridge of atums (${getAtumCartridgeCount(state, itemId)})`;
}

function removeItemFromLoosePlacements(
  state: GameState,
  itemId: string,
): GameState {
  return {
    ...state,
    itemState: {
      ...state.itemState,
      containerContents: removeItemFromPlacementLists(
        state.itemState.containerContents,
        itemId,
      ),
      surfaceContents: removeItemFromPlacementLists(
        state.itemState.surfaceContents,
        itemId,
      ),
      underContents: removeItemFromPlacementLists(
        state.itemState.underContents,
        itemId,
      ),
      searchableContents: removeItemFromPlacementLists(
        state.itemState.searchableContents,
        itemId,
      ),
    },
  };
}

function moveItemToInventory(state: GameState, itemId: string): GameState {
  let next = removeItemFromLoosePlacements(state, itemId);
  next = updateItemLocation(next, itemId, "INVENTORY");
  return addToInventory(next, itemId);
}

function hideItem(state: GameState, itemId: string): GameState {
  let next = removeItemFromLoosePlacements(state, itemId);
  next = removeFromInventory(next, itemId);
  return updateItemLocation(next, itemId, "NOWHERE");
}

export function addAtumsToInventory(
  state: GameState,
  count: number,
  sourceItemId?: string,
): GameState {
  const currentCount = getAtumCartridgeCount(state, ATUM_CARTRIDGE_ITEM_ID);
  let next = setAtumCartridgeCount(
    state,
    currentCount + normalizeAtumCount(count),
    ATUM_CARTRIDGE_ITEM_ID,
  );
  next = moveItemToInventory(next, ATUM_CARTRIDGE_ITEM_ID);

  if (sourceItemId && sourceItemId !== ATUM_CARTRIDGE_ITEM_ID) {
    next = hideItem(next, sourceItemId);
  }

  return next;
}

export function takeAtumCartridge({
  item,
  state,
}: ItemCommandOverrideContext) {
  if (item.id === ATUM_CARTRIDGE_ITEM_ID) {
    return {
      state: moveItemToInventory(state, ATUM_CARTRIDGE_ITEM_ID),
      message: "Taken.",
    };
  }

  return {
    state: addAtumsToInventory(
      state,
      getAtumCartridgeCount(state, item.id),
      item.id,
    ),
    message: "Taken.",
  };
}

function isOutputAvailableToPrint(
  state: GameState,
  recipe: ThreeDPrinterRecipe,
): boolean {
  if (!recipe.itemId) return false;

  const output = state.world.items.find((item) => item.id === recipe.itemId);
  if (!output) return false;

  const location = state.itemState.itemRoomId[recipe.itemId] ?? output.location;
  return location === "seeded" || location === "NOWHERE";
}

function spendAtums(state: GameState, count: number): GameState {
  const remainingCount = getCurrentAtumCount(state) - count;
  let next = setAtumCartridgeCount(
    state,
    remainingCount,
    ATUM_CARTRIDGE_ITEM_ID,
  );

  if (remainingCount <= 0) {
    next = hideItem(next, ATUM_CARTRIDGE_ITEM_ID);
  }

  return next;
}

function moveOutputToPrinterTray(state: GameState, itemId: string): GameState {
  let next: GameState = {
    ...state,
    itemState: {
      ...state.itemState,
      containerContents: removeItemFromPlacementLists(
        state.itemState.containerContents,
        itemId,
      ),
      surfaceContents: removeItemFromPlacementLists(
        state.itemState.surfaceContents,
        itemId,
      ),
      underContents: removeItemFromPlacementLists(
        state.itemState.underContents,
        itemId,
      ),
      searchableContents: removeItemFromPlacementLists(
        state.itemState.searchableContents,
        itemId,
      ),
    },
  };

  next = removeFromInventory(next, itemId);
  next = updateItemLocation(next, itemId, THREE_D_PRINTING_FACILITY_ROOM_ID);

  const currentTrayContents =
    next.itemState.surfaceContents[THREE_D_PRINTER_TRAY_ITEM_ID] ?? [];

  return {
    ...next,
    itemState: {
      ...next.itemState,
      surfaceContents: {
        ...next.itemState.surfaceContents,
        [THREE_D_PRINTER_TRAY_ITEM_ID]: currentTrayContents.includes(itemId)
          ? currentTrayContents
          : [...currentTrayContents, itemId],
      },
    },
  };
}

export function getCurrentAtumCount(state: GameState): number {
  if (!inventoryHas(state.player.inventory, ATUM_CARTRIDGE_ITEM_ID)) return 0;
  return getAtumCartridgeCount(state, ATUM_CARTRIDGE_ITEM_ID);
}

export function getThreeDPrinterRecipe(
  recipeId: string,
): ThreeDPrinterRecipe | undefined {
  return THREE_D_PRINTER_RECIPES.find((recipe) => recipe.id === recipeId);
}

export function canPrintThreeDPrinterRecipe(
  state: GameState,
  recipe: ThreeDPrinterRecipe | undefined,
): boolean {
  if (!recipe) return false;
  if (getCurrentAtumCount(state) < recipe.atumCost) return false;
  return isOutputAvailableToPrint(state, recipe);
}

export function printThreeDPrinterRecipe(
  state: GameState,
  recipeId: string,
): ThreeDPrinterPrintResult {
  const recipe = getThreeDPrinterRecipe(recipeId);
  if (!recipe) {
    return {
      state,
      printed: false,
      message: "The printer cannot find that template.",
    };
  }

  if (getCurrentAtumCount(state) < recipe.atumCost) {
    return {
      state,
      printed: false,
      message: "The printer refuses the job. Insufficient atums.",
    };
  }

  if (!isOutputAvailableToPrint(state, recipe) || !recipe.itemId) {
    return {
      state,
      printed: false,
      message: "The printer reports that template is unavailable.",
    };
  }

  let next = spendAtums(state, recipe.atumCost);
  next = moveOutputToPrinterTray(next, recipe.itemId);

  const itemName =
    next.world.items.find((item) => item.id === recipe.itemId)?.name ??
    recipe.name.toLowerCase();

  return {
    state: next,
    printed: true,
    message: `The 3D printer burns through ${recipe.atumCost} atums in a clean green-white flash. A ${itemName} finishes printing on the tray.`,
  };
}
