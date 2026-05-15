import { triggerScoreOnce } from "@game/rules/score";
import { GameState } from "../../types/gameTypes";
import { Item } from "../../types/itemTypes";

export function tryTurnItem(
  state: GameState,
  prep: string,
  item: Item,
): { state: GameState; message: string } {
  let next: GameState = state;

  const turnOverride = item.overrides?.turn;
  if (typeof turnOverride === "function") {
    const out = turnOverride({ state, item, prep });

    if (typeof out === "string") {
      return { state, message: out };
    }

    return {
      state: out?.state ?? state,
      message: out?.message ?? "Nothing happens.",
    };
  }

  if (typeof turnOverride === "string") {
    return { state, message: turnOverride };
  }

  if (item.id === "EeglerWallFixture") {
    const isOpen = state.worldState.conditionalTriggers.EeglerSecretLabOpen;
    next = {
      ...state,
      worldState: {
        ...state.worldState,
        conditionalTriggers: {
          ...state.worldState.conditionalTriggers,
          EeglerSecretLabOpen: !isOpen,
        },
      },
    };
    next = triggerScoreOnce(next, "found_secret_lab");

    return {
      state: next,
      message: isOpen
        ? "You rotate the wall fixture back. The floor panel slides shut, hiding the stairs again."
        : "You rotate the wall fixture. Somewhere beneath the bed, machinery clicks and a panel in the floor slides open, revealing stairs leading down.",
    };
  }

  if (item.id === "PowerStationKey") {
    if (
      !state.itemState.containerContents["PowerStationKeyhole"]?.includes(
        "PowerStationKey",
      )
    ) {
      return { state, message: "The key isn't in anything." };
    }
    if (
      state.itemState.containerContents["PowerStationKeyhole"]?.includes(
        "PowerStationKey",
      ) &&
      state.worldState.powerRestoredSections["power-key-turned"]
    ) {
      return {
        state,
        message:
          "The key seems to be locked in place now, and you can't budge it.",
      };
    }
    const turnPowerKeyMsg =
      "You turn the key with a heavy click and it locks into place. The red button next to the keyhole begins to flash.";
    next = {
      ...next,
      worldState: {
        ...next.worldState,
        powerRestoredSections: {
          ...next.worldState.powerRestoredSections,
          ["power-key-turned"]: true,
        },
      },
    };
    return { state: next, message: turnPowerKeyMsg };
  }

  return {
    state: next,
    message: "You can't turn that.",
  };
}
