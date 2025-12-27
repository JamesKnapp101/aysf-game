import { appendLog } from "../engine/handleCommand";
import {
  getContainerContentsIds,
  getContainerContentsItems,
} from "../selectors/containerSelectors";
import {
  getItemsInInventory,
  getPlayerLiquidContainers,
  getWaterSourcesInRoom,
} from "../selectors/itemSelectors";
import {
  getCurrentRoom,
  getItemsInCurrentRoom,
} from "../selectors/roomSelectors";
import type { GameState } from "../types/gameTypes";
import type { Item, ItemOverrideVerb } from "../types/itemTypes";
import type { ParsedCommand } from "../types/parserTypes";
import { isItemOpen, setItemClosed, setItemOpen } from "./containers";
import {
  addLiquidToFillableContainer,
  removeLiquidFromFillableContainer,
} from "./liquids";
import type { RuleResult } from "./result";
import { resolveItemInScopeByNoun } from "./scope";
import { addToInventory, removeFromInventory } from "./state";
import { applyStatusEffectToPlayer } from "./status";

export function describeActionResult(
  item: Item,
  verb: ItemOverrideVerb,
  fallback: string
): string {
  return item.overrides?.[verb] ?? fallback;
}

export function formatNameList(names: string[]): string {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

export function updateItemLocation(
  state: GameState,
  itemId: string,
  location: string
): GameState {
  return {
    ...state,
    world: {
      ...state.world,
      items: state.world.items.map((it) =>
        it.id === itemId ? { ...it, location } : it
      ),
    },
  };
}

export function tryTakeItem(
  state: GameState,
  noun: string,
  indirect: string
): RuleResult {
  const lower = noun.toLowerCase();
  const itemsHere = getItemsInCurrentRoom(state);
  const itemOnFloor = itemsHere.find(
    (i) => i.vocab.includes(lower) || i.name.toLowerCase() === lower
  );

  if (noun === "water") {
    const waterSourcesInRoom = getWaterSourcesInRoom(state);
    if (waterSourcesInRoom.length === 0) {
      return { state, message: "There isn't any good source of water here." };
    }
    return {
      state,
      message: `You can't just scoop it up with your hands, you'll need to find something to fill with it.`,
    };
  }

  if (itemOnFloor) {
    if (itemOnFloor.itemCategory === "scenery") {
      return { state, message: "You can’t take that." };
    }

    let next = updateItemLocation(state, itemOnFloor.id, "INVENTORY");
    next = addToInventory(next, itemOnFloor.id);

    return { state: next, message: "Taken." };
  }

  const room = getCurrentRoom(state);
  const containersHere = state.world.items.filter(
    (i) =>
      i.isContainer &&
      (i.location === room.id || state.player.inventory.includes(i.id))
  );

  for (const container of containersHere) {
    if (!isItemOpen(state, container.id)) continue;

    const contentsItems = getContainerContentsItems(state, container);
    const found = contentsItems.find(
      (i) => i.vocab.includes(lower) || i.name.toLowerCase() === lower
    );

    if (!found) continue;

    if (found.itemCategory === "scenery") {
      return { state, message: "You can’t take that." };
    }

    const seededIds = getContainerContentsIds(state, container);
    const updatedContentsIds = seededIds.filter((id) => id !== found.id);

    let next = updateItemLocation(state, found.id, "INVENTORY");
    next = addToInventory(next, found.id);

    next = {
      ...next,
      itemState: {
        ...next.itemState,
        containerContents: {
          ...next.itemState.containerContents,
          [container.id]: updatedContentsIds,
        },
      },
    };

    return { state: next, message: "Taken." };
  }
  return { state, message: "You don't see that here." };
}

export function tryDropItem(state: GameState, noun: string): RuleResult {
  const invItems = getItemsInInventory(state);
  const lower = noun.toLowerCase();

  const item = invItems.find(
    (i) => i.name.toLowerCase() === lower || i.vocab.includes(lower)
  );

  if (!item) {
    return { state, message: "You aren't carrying that." };
  }

  let next = updateItemLocation(state, item.id, state.player.roomId);
  next = removeFromInventory(next, item.id);

  return { state: next, message: "Dropped." };
}

export function isItemOpenable(item: Item): boolean {
  return !!item.isContainer;
}

export function tryOpenItem(
  state: GameState,
  item: Item
): { state: GameState; message: string } {
  if (!isItemOpenable(item)) {
    return { state, message: "You can't open that." };
  }
  if (isItemOpen(state, item.id)) {
    return { state, message: "It's already open." };
  }
  let next = setItemOpen(state, item.id, true);

  const contents = getContainerContentsItems(next, item);

  const baseMsg = item.overrides?.open ?? "You open the " + item.name;

  let revealMsg = "";
  if (contents.length > 0) {
    const names = contents.map((c) => c.name);
    const joined =
      names.length === 1
        ? names[0]
        : names.length === 2
        ? `${names[0]} and ${names[1]}`
        : `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;

    revealMsg = `, revealing ${joined}`;
  } else {
    revealMsg = ", but it's empty";
  }

  return {
    state: next,
    message: baseMsg + revealMsg + ".",
  };
}

export function tryCloseItem(
  state: GameState,
  item: Item
): { state: GameState; message: string } {
  if (!isItemOpenable(item)) {
    return { state, message: "You can't close that." };
  }

  if (!isItemOpen(state, item.id)) {
    return { state, message: "It's already closed." };
  }

  let next = setItemClosed(state, item.id, true);

  const msg = item.overrides?.open ?? "You close the " + item.name;

  return {
    state: next,
    message: msg + ".",
  };
}

export function isItemConsumable(item: Item): boolean {
  return !!item.meta?.consumable;
}

function setItemDoses(
  state: GameState,
  itemId: string,
  doses: number
): GameState {
  return {
    ...state,
    world: {
      ...state.world,
      items: state.world.items.map((it) =>
        it.id === itemId ? { ...it, doses } : it
      ),
    },
  };
}

export function tryDrinkItem(
  state: GameState,
  item: Item
): { state: GameState; message: string } {
  if (!isItemConsumable(item)) {
    return { state, message: "You can't drink that." };
  }

  const doses = item.doses ?? 0;
  if (doses <= 0) {
    const msg =
      item.meta?.consumable?.onEmpty
        ?.map((eff: { type: string; text: any }) =>
          eff.type === "message" ? String(eff.text) : ""
        )
        .filter(Boolean)
        .join(" ") || "It's empty.";
    return { state, message: msg };
  }

  let next = state;
  let baseMsg = "";

  const perDoseEffects = item.meta?.consumable?.perDose || [];
  for (const effect of perDoseEffects) {
    if (effect.type === "status") {
      next = applyStatusEffectToPlayer(
        next,
        effect.id,
        effect.intensity ?? 0,
        effect.duration ?? 0
      );
    } else if (effect.type === "message") {
      baseMsg += String(effect.text);
    }
  }

  const newDoses = Math.max(0, doses - 1);
  next = setItemDoses(next, item.id, newDoses);

  return {
    state: next,
    message: baseMsg || "You take a drink.",
  };
}

export function tryEatItem(
  state: GameState,
  item: Item
): { state: GameState; message: string } {
  if (!isItemConsumable(item)) {
    return { state, message: "You can't eat that." };
  }

  const doses = item.doses ?? 0;
  if (doses <= 0) {
    const msg =
      item.meta?.consumable?.onEmpty
        ?.map((eff: { type: string; text: any }) =>
          eff.type === "message" ? String(eff.text) : ""
        )
        .filter(Boolean)
        .join(" ") || `That's the last of the ${item.name}`;
    return { state, message: msg };
  }

  let next = state;
  let baseMsg = "";

  const perDoseEffects = item.meta?.consumable?.perDose || [];
  for (const effect of perDoseEffects) {
    if (effect.type === "status") {
      next = applyStatusEffectToPlayer(
        next,
        effect.id,
        effect.intensity ?? 0,
        effect.duration ?? 0
      );
    } else if (effect.type === "message") {
      baseMsg += String(effect.text);
    }
  }

  const newDoses = Math.max(0, doses - 1);
  next = setItemDoses(next, item.id, newDoses);

  return {
    state: next,
    message: baseMsg || "You take a bite.",
  };
}

export function tryEmptyItem(
  state: GameState,
  item: Item,
  cmd: ParsedCommand
): { state: GameState; message: string } {
  if (cmd.type !== "action") {
    return { state, message: "You can't do that." };
  }
  const preposition = cmd.preposition?.trim();
  const indirect = cmd.indirect?.trim();
  let next = state;
  let baseMsg = "";
  const liquid2Empty = state.itemState.containerFilled[item.id];
  // The item doesn't even hold liquid
  if (!item.meta?.container?.holds?.includes("liquid")) {
    return { state, message: "You can't do that." };
  }
  // The item is already empty
  if (!liquid2Empty) {
    return { state, message: `The ${item.name} is already empty.` };
  }
  // Otherwise do the emptying...
  if (
    item.meta?.container?.holds?.includes("liquid") &&
    state.itemState.containerFilled[item.id]
  )
    if (!preposition && !indirect) {
      // Just empty item with no further context, so dump it
      next = removeLiquidFromFillableContainer(state, item);
      baseMsg += `You empty the ${cmd.direct} out onto the floor.`;
    }
  if (preposition && !indirect) {
    return { state, message: `Empty it ${preposition} what?` };
  }

  // Secondary item included
  if (indirect && indirect !== "") {
    const indirectItem = resolveItemInScopeByNoun(next, indirect);

    // Empty item on item
    if (
      preposition === "on" ||
      preposition === "onto" ||
      preposition === "over"
    ) {
      // This is where puzzle cases can live, like pour water on coals, etc but default is to lose the liquid
      next = removeLiquidFromFillableContainer(next, item);
      return {
        state: next,
        message: `You dump the ${liquid2Empty} out onto the ${indirect}, but it doesn't really accomplish anything.`,
      };
    }

    // Empty item into item
    if (preposition === "in" || preposition === "into") {
      if (!indirectItem?.meta?.container?.holds?.includes("liquid")) {
        return { state, message: `The ${indirect} can't hold that.` };
      } else if (
        indirectItem?.meta?.container?.holds?.includes("liquid") &&
        state.itemState.containerFilled[indirectItem.id]
      ) {
        return {
          state,
          message: `The ${indirect} is already full of ${
            state.itemState.containerFilled[indirectItem.id]
          }.`,
        };
      } else if (
        indirectItem?.meta?.container?.holds?.includes("liquid") &&
        !state.itemState.containerFilled[indirectItem.id]
      ) {
        next = removeLiquidFromFillableContainer(next, item);
        next = addLiquidToFillableContainer(
          next,
          indirectItem,
          liquid2Empty[0]
        );
        baseMsg += `You carefully pour the ${liquid2Empty[0]} from the ${item.id} to the ${indirect}`;
      }
    } else {
      return { state, message: `That won't work.` };
    }
  }
  return {
    state: next,
    message: baseMsg,
  };
}

export function tryFillItem(
  state: GameState,
  item: Item,
  cmd: ParsedCommand
): { state: GameState; message: string } {
  if (cmd.type !== "action") {
    return { state, message: "You can't do that." };
  }
  const preposition = cmd.preposition?.trim();
  const liquid2Get = cmd.indirect?.trim();
  let next = state;
  let baseMsg = "";
  // Bad syntax
  if (preposition && preposition !== "with") {
    return { state, message: `I don't understand that.` };
  }
  // The item doesn't hold liquid
  if (!item.meta?.container?.holds?.includes("liquid")) {
    return {
      state,
      message: `The ${item.name} won't hold any sort of liquid.`,
    };
  }
  // The item is already full
  if (state.itemState.containerFilled[item.id]) {
    return {
      state,
      message: `The ${item.id} is already full of ${
        state.itemState.containerFilled[item.id][0]
      }.`,
    };
  }
  // Else do the filling...
  if (liquid2Get === "water") {
    const waterSourcesInRoom = getWaterSourcesInRoom(state);
    if (waterSourcesInRoom.length === 0) {
      return { state, message: "There isn't any good source of water here." };
    }
    const playerLiquidContainers = getPlayerLiquidContainers(state);
    const desiredVessel = playerLiquidContainers.filter(
      (lc) => lc.name === item.name
    )[0];
    if (!desiredVessel) {
      return { state, message: "You don't have that container on you." };
    } else {
      let next = state;
      return {
        state: {
          ...next,
          itemState: {
            ...next.itemState,
            containerFilled: {
              [desiredVessel.id]: ["water"],
            },
          },
        },
        message: waterSourcesInRoom[0]?.meta?.watersource?.onTake
          ? `${waterSourcesInRoom[0]?.meta?.watersource?.onTake} using the ${desiredVessel.name}`
          : "You scoop up some of the water",
      };
    }
  }

  return {
    state: next,
    message: baseMsg,
  };
}

export function tryPourItem(
  state: GameState,
  item: Item,
  cmd: ParsedCommand
): { state: GameState; message: string } {
  if (cmd.type !== "action") {
    return { state, message: "You can't do that." };
  }
  const direct = cmd?.direct?.trim();
  const preposition = cmd.preposition?.trim();
  const indirect = cmd.indirect?.trim();
  let next = state;
  let baseMsg = "";

  if (direct === "water") {
    const playerLiquidContainers = getPlayerLiquidContainers(state);
    const waterContainer = playerLiquidContainers.filter(
      (lc) => state.itemState.containerFilled[lc.id]?.[0] === "water"
    );
    if (!waterContainer) {
      return { state, message: `You're not carrying any water at the minute.` };
    }
    if (!preposition) {
      return { state, message: `Pour it where, or on what?` };
    }
    if (preposition && !indirect) {
      return { state, message: `I don't understand that.` };
    }
    if (preposition && indirect) {
      const indirectItem = resolveItemInScopeByNoun(state, indirect);
      if (!indirectItem) {
        return { state, message: `You don't see any ${indirect} here.` };
      }
      if (
        preposition === "on" ||
        preposition === "over" ||
        preposition === "onto"
      ) {
        // Puzzle solutions can go here, by default it just dumps it out
        next = removeLiquidFromFillableContainer(state, waterContainer[0]);
        baseMsg += `You pour the water ${preposition} the ${indirect}, but it doesn't really accomplish much.`;
      }
      if (preposition === "in" || preposition === "into") {
        if (!indirectItem?.meta?.container?.holds?.includes("liquid")) {
          return { state: next, message: `The ${indirect} can't hold that.` };
        } else if (
          indirectItem?.meta?.container?.holds?.includes("liquid") &&
          state.itemState.containerFilled[indirectItem.id]
        ) {
          return {
            state: next,
            message: `The ${indirect} is already full of ${
              state.itemState.containerFilled[indirectItem.id]
            }.`,
          };
        } else if (
          indirectItem?.meta?.container?.holds?.includes("liquid") &&
          !state.itemState.containerFilled[indirectItem.id]
        ) {
          next = removeLiquidFromFillableContainer(next, waterContainer[0]);
          next = addLiquidToFillableContainer(next, indirectItem, "water");
          baseMsg += `You carefully pour the water from the ${item.id} to the ${indirect}`;
        }
      }
    }
  }

  return {
    state: next,
    message: baseMsg,
  };
}

export function tryWearItem(
  state: GameState,
  item: Item
): { state: GameState; message: string } {
  if (!item.isWearable || !item.clothingSlot) {
    return { state, message: "You can't wear that." };
  }
  // Does it fit?

  // Is the player already wearing something in that slot?
  if (state.itemState.wornByPlayer[item.clothingSlot]) {
    return {
      state,
      message: `You're already wearing something on your ${item.clothingSlot}`,
    };
  }
  let next = state;
  let baseMsg =
    item?.meta?.clothing?.wearMessage ??
    item?.overrides?.wear ??
    `You put on the ${item.name}`;

  next = {
    ...next,
    itemState: {
      ...state.itemState,
      wornByPlayer: {
        ...state.itemState.wornByPlayer,
        [item.clothingSlot]: item.id,
      },
    },
  };

  return {
    state: next,
    message: baseMsg,
  };
}

export function tryRemoveItem(
  state: GameState,
  item: Item
): { state: GameState; message: string } {
  if (!item.isWearable || !item.clothingSlot) {
    return { state, message: "You can't remove that." };
  }

  // Is the player even wearing it?
  if (state.itemState.wornByPlayer[item.clothingSlot] !== item.id) {
    return {
      state,
      message: `You aren't wearing the ${item.name}`,
    };
  }
  let next = state;
  let baseMsg =
    item?.meta?.clothing?.removeMessage ??
    item?.overrides?.remove ??
    `You remove the ${item.name}`;

  next = {
    ...next,
    itemState: {
      ...state.itemState,
      wornByPlayer: {
        ...state.itemState.wornByPlayer,
        [item.clothingSlot]: undefined,
      },
    },
  };

  return {
    state: next,
    message: baseMsg,
  };
}

export function trySwitchItem(
  state: GameState,
  item: Item
): { state: GameState; message: string } {
  if (!item.isSwitchable) {
    return { state, message: "You can't switch that." };
  }

  const currentSettings = state.itemState.itemSettings[item.id];
  const currentlyOn = !!(currentSettings as any)?.isOn;
  const newIsOn = !currentlyOn;

  const next: GameState = {
    ...state,
    itemState: {
      ...state.itemState,
      itemSettings: {
        ...state.itemState.itemSettings,
        [item.id]: {
          ...(state.itemState.itemSettings[item.id] as any),
          isOn: newIsOn,
        },
      },
    },
  };

  const baseMsg = `You switch the ${item.name} ${newIsOn ? "on" : "off"}`;

  return {
    state: next,
    message: baseMsg,
  };
}

export function describeScotchBottle(item: Item): string {
  const doses = item.doses ?? 0;

  if (doses === 17) {
    return `
A tall bottle with a clean label and an unbroken seal.
The glass is clear, the contents dark and untouched.
`;
  }

  if (doses > 12) {
    return `
The bottle has been opened.
Most of the scotch is still there, sloshing darkly inside.
`;
  }

  if (doses > 6) {
    return `
The bottle is noticeably lighter now.
The label is smudged, and the liquid sits below the midpoint.
`;
  }

  if (doses > 1) {
    return `
Only a few fingers of scotch remain.
You’d have to tip the bottle to get a proper drink.
`;
  }

  if (doses === 1) {
    return `
Just a swallow left at the bottom of the bottle.
The glass smells sharply of alcohol.
`;
  }

  return `
An empty bottle.
It smells faintly of scotch.
`;
}
