import { moveItemToRoom } from "@game/helpers/itemHelpers";
import { stashItemInContainer } from "@game/helpers/itemPlacement";
import { updateItemLocation } from "@game/rules/items";
import type { GameState } from "@game/types/gameTypes";

const PARK_EAST_ROOM_ID = "ParkEast";
const PARK_CENTER_ROOM_ID = "ParkCenter";
const POWER_STATION_KEY_ID = "PowerStationKey";
const TRASH_BOT_ID = "TrashBot";
const TRASH_BOT_BIN_ID = "TrashBotBin";

export const PARK_EAST_POWER_KEY_SNATCH_EVENT_ID = "parkeast_first_key_get";
export const PARK_EAST_POWER_KEY_SNATCH_ARMED_EVENT_ID =
  "parkeast_key_snatch_armed";
export const PARK_EAST_POWER_KEY_TAKE_SNATCH_MESSAGE =
  "The trashbot ran in from out of nowhere and took it!.";
export const PARK_EAST_POWER_KEY_DELAYED_SNATCH_MESSAGE =
  "A trashbot suddenly darts in, whisks the large key into its wire bin, and putters off toward the center of the park.";

function getPowerStationKeyRoomId(state: GameState): string | undefined {
  return (
    state.itemState.itemRoomId?.[POWER_STATION_KEY_ID] ??
    state.world.items.find((item) => item.id === POWER_STATION_KEY_ID)?.location
  );
}

export function hasParkEastPowerKeyBeenSnatched(state: GameState): boolean {
  return (
    state.worldState.scriptedEventsTripped?.[
      PARK_EAST_POWER_KEY_SNATCH_EVENT_ID
    ] === true
  );
}

export function isParkEastPowerKeySnatchArmed(state: GameState): boolean {
  return (
    state.worldState.scriptedEventsTripped?.[
      PARK_EAST_POWER_KEY_SNATCH_ARMED_EVENT_ID
    ] === true
  );
}

export function canTriggerParkEastPowerKeySnatch(state: GameState): boolean {
  return (
    getPowerStationKeyRoomId(state) === PARK_EAST_ROOM_ID &&
    !hasParkEastPowerKeyBeenSnatched(state)
  );
}

export function shouldArmParkEastPowerKeySnatch(
  state: GameState,
  roomId: string | undefined,
): boolean {
  return (
    roomId === PARK_EAST_ROOM_ID &&
    canTriggerParkEastPowerKeySnatch(state) &&
    !isParkEastPowerKeySnatchArmed(state)
  );
}

export function armParkEastPowerKeySnatch(state: GameState): GameState {
  if (isParkEastPowerKeySnatchArmed(state)) return state;

  return {
    ...state,
    worldState: {
      ...state.worldState,
      scriptedEventsTripped: {
        ...state.worldState.scriptedEventsTripped,
        [PARK_EAST_POWER_KEY_SNATCH_ARMED_EVENT_ID]: true,
      },
    },
  };
}

export function shouldHijackParkEastPowerKeyTake(
  state: GameState,
  itemId: string,
): boolean {
  return (
    itemId === POWER_STATION_KEY_ID &&
    state.player.roomId === PARK_EAST_ROOM_ID &&
    canTriggerParkEastPowerKeySnatch(state)
  );
}

export function triggerParkEastPowerKeySnatch(state: GameState): GameState {
  if (!canTriggerParkEastPowerKeySnatch(state)) return state;

  let next = state;

  next = stashItemInContainer(next, POWER_STATION_KEY_ID, TRASH_BOT_BIN_ID);
  next = updateItemLocation(next, TRASH_BOT_BIN_ID, PARK_CENTER_ROOM_ID);
  next = moveItemToRoom(next, TRASH_BOT_ID, PARK_CENTER_ROOM_ID);

  return {
    ...next,
    itemState: {
      ...next.itemState,
      attachedTo: {
        ...next.itemState.attachedTo,
        [TRASH_BOT_BIN_ID]: TRASH_BOT_ID,
      },
    },
    worldState: {
      ...next.worldState,
      scriptedEventsTripped: {
        ...next.worldState.scriptedEventsTripped,
        [PARK_EAST_POWER_KEY_SNATCH_EVENT_ID]: true,
        [PARK_EAST_POWER_KEY_SNATCH_ARMED_EVENT_ID]: false,
      },
      trashBot: {
        ...next.worldState.trashBot,
        cooldownTurns: 1,
      },
    },
  };
}

export const PARK_EAST_FIRST_KEY_GET_EVENT_ID =
  PARK_EAST_POWER_KEY_SNATCH_EVENT_ID;
export const PARK_EAST_FIRST_KEY_GET_MESSAGE =
  PARK_EAST_POWER_KEY_TAKE_SNATCH_MESSAGE;

export function hijackParkEastPowerKeyTake(state: GameState): GameState {
  return triggerParkEastPowerKeySnatch(state);
}
