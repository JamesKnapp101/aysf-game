import {
  PARK_EAST_POWER_KEY_TAKE_SNATCH_MESSAGE,
  shouldHijackParkEastPowerKeyTake,
  triggerParkEastPowerKeySnatch,
} from "@game/helpers/parkKeyHijack";
import type { GameState } from "@game/types/gameTypes";
import type { Item } from "@game/types/itemTypes";

function takePowerStationKey({ state }: { state: GameState }):
  | {
      message: string;
      state: GameState;
    }
  | undefined {
  if (shouldHijackParkEastPowerKeyTake(state, "PowerStationKey")) {
    return {
      state: triggerParkEastPowerKeySnatch(state),
      message: PARK_EAST_POWER_KEY_TAKE_SNATCH_MESSAGE,
    };
  }

  const keyIsLocked =
    state.itemState.containerContents["PowerStationKeyhole"]?.includes(
      "PowerStationKey",
    ) && state.worldState.powerRestoredSections["power-key-turned"];

  if (!keyIsLocked) return undefined;

  return {
    state,
    message:
      "The key appears to be locked in place now, you can't pull it free again.",
  };
}

function turnPowerStationKey({ state }: { state: GameState }): {
  message: string;
  state: GameState;
} {
  const keyIsInserted =
    state.itemState.containerContents["PowerStationKeyhole"]?.includes(
      "PowerStationKey",
    );

  if (!keyIsInserted) {
    return { state, message: "The key isn't in anything." };
  }

  if (state.worldState.powerRestoredSections["power-key-turned"]) {
    return {
      state,
      message:
        "The key seems to be locked in place now, and you can't budge it.",
    };
  }

  return {
    state: {
      ...state,
      worldState: {
        ...state.worldState,
        powerRestoredSections: {
          ...state.worldState.powerRestoredSections,
          ["power-key-turned"]: true,
        },
      },
    },
    message:
      "You turn the key with a heavy click and it locks into place. The red button next to the keyhole begins to flash.",
  };
}

export const powerStationKey: Item = {
  id: "PowerStationKey",
  name: "large yellow and black key",
  description:
    "A large, heavy key with a rectangular grip striped with black and yellow. It's not a door key, it looks more like something from a control room.",
  initialDescription:
    "Lying in the grass near the corpse's stray right hand is a large, heavy key with a rectangular grip that is striped with black and yellow.",
  location: "ParkEast",
  vocab: ["large", "key", "black", "yellow", "rectangular"],
  itemClass: "solid",
  itemCategory: "collectable",
  itemWeight: 1,
  itemSize: 1,
  isTurnable: true,
  isContainer: false,
  meta: {
    kind: "key",
  },
  overrides: {
    take: takePowerStationKey,
    turn: turnPowerStationKey,
  },
  scoreId: "obtained_power_key",
};
