import { getItemById } from "../selectors/itemSelectors";
import type { ActionResult } from "../types/actionsTypes";
import type { GameState } from "../types/gameTypes";
import type { CoolerMode } from "../types/itemTypes";
import { setItemFrozen } from "./liquids";
import { resolveItemInScopeByNoun } from "./scope";

type SettableMessage = { type: "message"; text: string };

type CoolerItemLike = {
  meta?: {
    settable?: Partial<Record<CoolerMode, SettableMessage>>;
  };
};

export function setCoolerMode(
  state: GameState,
  mode: CoolerMode,
  coolerItem?: CoolerItemLike
): ActionResult {
  const next: GameState = {
    ...state,
    itemState: {
      ...state.itemState,
      itemSettings: {
        ...state.itemState.itemSettings,
        Cooler: { kind: "cooler", mode },
      },
    },
  };

  const msg = coolerItem?.meta?.settable?.[mode]?.text;

  return {
    state: next,
    message: msg ?? `You set the cooler to '${mode}'.`,
  };
}

export function setCoolerModeInState(
  state: GameState,
  mode: CoolerMode
): GameState {
  return {
    ...state,
    itemState: {
      ...state.itemState,
      itemSettings: {
        ...state.itemState.itemSettings,
        Cooler: { kind: "cooler", mode },
      },
    },
  };
}

export function handleSetCoolerMode(
  state: GameState,
  mode: CoolerMode
): ActionResult {
  let next = state;
  next = setCoolerModeInState(state, mode);
  const coolerContents = next.itemState.containerContents["Cooler"];
  for (const content of coolerContents) {
    if (state.itemState.containerFilled[content]) {
      const containerLiquid = state.itemState.containerFilled[content];
      if (mode === "freeze") {
        if (containerLiquid?.[0] === "water") {
          const item = getItemById(next, "water");
          if (!item) {
            return { state, message: `I see no water here.` };
          }
          next = setItemFrozen(state, item);
        }
      }
    }
  }

  const msg = {
    off: "You set the cooler to 'off,' and it emits a soft hiss.",
    cool: "You set the cooler to 'cool,' and it emits a low electronic tone.",
    cold: "You set the cooler to 'cold,' and it emits a moderate electronic tone.",
    freeze:
      "You set the cooler to 'freeze' and it emits a high-pitched electronic tone.",
  }[mode];

  return { state: next, message: msg };
}
