import { applyPlayerDamage } from "@game/rules/damage";
import { updateItemLocation } from "@game/rules/items";
import { triggerScoreOnce } from "@game/rules/score";
import {
  addToInventory,
  inventoryHas,
  removeFromAllBuckets,
} from "@game/rules/state";
import type { GameState } from "@game/types/gameTypes";
import type { Item } from "@game/types/itemTypes";
import type { ParsedCommand } from "@game/types/parserTypes";

export const BAR_BULL_ADHESIVE_TRIGGER = "BarBullAdhesiveApplied";
export const BAR_BULL_RIDE_SCORE_ID = "completed_bar_bull_ride";
export const BAR_BULL_RIDE_PRIZE_MESSAGE = `The bartender gives you a free drink ticket.\n\n"It looks like it's not for this bar, sorry, but keep it for next rotation."`;
export const FREE_DRINK_TICKET_ID = "FreeDrinkTicket";

const BAR_MECHANICAL_BULL_ID = "BarMechanicalBull";

function setBarTrigger(
  state: GameState,
  triggerId: string,
  value: boolean,
): GameState {
  return {
    ...state,
    worldState: {
      ...state.worldState,
      conditionalTriggers: {
        ...state.worldState.conditionalTriggers,
        [triggerId]: value,
      },
    },
  };
}

export function isBarBullAdhesiveApplied(state: GameState): boolean {
  return state.worldState.conditionalTriggers?.[BAR_BULL_ADHESIVE_TRIGGER] === true;
}

export function applyAdhesiveToBull(
  state: GameState,
  item: Item,
  cmd?: ParsedCommand,
): { state: GameState; message: string } {
  const target =
    cmd?.type === "action" ? (cmd.indirect?.toLowerCase().trim() ?? "") : "";
  if (!target) {
    return { state, message: "Apply it to what?" };
  }

  if (!target.includes("bull")) {
    return {
      state,
      message:
        "You think better of spreading powerful adhesive around at random.",
    };
  }

  if (state.player.roomId !== "Bar") {
    return { state, message: "You don't see the mechanical bull here." };
  }

  if (isBarBullAdhesiveApplied(state)) {
    return {
      state,
      message: "The mechanical bull is already tacky with adhesive.",
    };
  }

  const next = setBarTrigger(state, BAR_BULL_ADHESIVE_TRIGGER, true);

  return {
    state: next,
    message:
      "You spread a glossy layer of adhesive across the mechanical bull's worn leather saddle. It flashes wetly for a moment, then turns clear and tacky.",
  };
}

export function getAttachedBullPantsName(
  state: GameState,
): string | undefined {
  const pantsId = Object.entries(state.itemState.attachedTo ?? {}).find(
    ([, hostId]) => hostId === BAR_MECHANICAL_BULL_ID,
  )?.[0];

  if (!pantsId) return undefined;

  return state.world.items.find((item) => item.id === pantsId)?.name;
}

export function rideBarMechanicalBull(state: GameState): {
  state: GameState;
  message: string;
} {
  if (!isBarBullAdhesiveApplied(state)) {
    return {
      state: applyPlayerDamage(state, 5),
      message:
        "You climb onto the mechanical bull. For one gentle second it seems manageable, then the machine bucks hard, twists under you, and launches you sideways into the bar. You hit the floor in a deeply educational way.",
    };
  }

  const pantsId = state.itemState.wornByPlayer.legs;

  if (!pantsId) {
    return {
      state,
      message: "I don't think that's such a good idea with no pants on",
    };
  }

  const pants = state.world.items.find((item) => item.id === pantsId);
  let next: GameState = {
    ...state,
    player: {
      ...state.player,
      inventory: removeFromAllBuckets(state.player.inventory, pantsId),
    },
    itemState: {
      ...state.itemState,
      attachedTo: {
        ...state.itemState.attachedTo,
        [pantsId]: BAR_MECHANICAL_BULL_ID,
      },
      wornByPlayer: {
        ...state.itemState.wornByPlayer,
        legs: undefined,
      },
    },
  };

  next = updateItemLocation(next, pantsId, "Bar");
  next = triggerScoreOnce(next, BAR_BULL_RIDE_SCORE_ID);

  const shouldAwardTicket =
    !inventoryHas(next.player.inventory, FREE_DRINK_TICKET_ID) &&
    next.itemState.pickedUpByPlayer[FREE_DRINK_TICKET_ID] !== true;

  if (shouldAwardTicket) {
    next = updateItemLocation(next, FREE_DRINK_TICKET_ID, "INVENTORY");
    next = addToInventory(next, FREE_DRINK_TICKET_ID);
  }

  return {
    state: next,
    message: `You climb onto the mechanical bull and hold on. The adhesive does most of the work, keeping you planted through every buck, spin, and spiteful little lurch. When the machine finally winds down, you peel yourself free, but ${
      pants?.name ?? "your pants"
    } stay behind, hopelessly stuck to the saddle.${
      shouldAwardTicket ? `\n\n${BAR_BULL_RIDE_PRIZE_MESSAGE}` : ""
    }`,
  };
}
