import { getItemById } from "@game/helpers/itemHelpers";
import type { GameState } from "@game/types/gameTypes";
import type { Item } from "@game/types/itemTypes";

export const CAT_ID = "cat";
export const IGGY_COLLAR_ID = "IggyCollar";

export function getCatItem(state: GameState): Item | undefined {
  return getItemById(state, CAT_ID);
}

export function getCatRoomId(state: GameState): string | undefined {
  return state.itemState.itemRoomId[CAT_ID] ?? getCatItem(state)?.location;
}

export function getCatHomeRegion(state: GameState): string[] {
  const homeRegion = getCatItem(state)?.meta?.homeRegion;
  return Array.isArray(homeRegion)
    ? homeRegion.filter((roomId): roomId is string => typeof roomId === "string")
    : [];
}

export function getCatSafeRoomId(state: GameState): string | undefined {
  const home = getCatHomeRegion(state);
  return home.includes("LevelThreeSecretRoom")
    ? "LevelThreeSecretRoom"
    : home[0];
}

export function isRoomInCatHome(state: GameState, roomId: string): boolean {
  return getCatHomeRegion(state).includes(roomId);
}

export function isCatHeld(state: GameState): boolean {
  return state.itemState.attachedTo[CAT_ID] === "PLAYER";
}

export function isCatInRoom(
  state: GameState,
  roomId = state.player.roomId,
): boolean {
  if (isCatHeld(state)) return roomId === state.player.roomId;
  return getCatRoomId(state) === roomId;
}

function normalizeNoun(noun: string | undefined): string | undefined {
  return noun?.trim().toLowerCase().replace(/^(the|a|an)\s+/, "");
}

export function isCatNoun(noun: string | undefined): boolean {
  const normalized = normalizeNoun(noun);
  return normalized === "cat" || normalized === "kitty" || normalized === "kitten" || normalized === "iggy";
}

export function isCatCollarNoun(noun: string | undefined): boolean {
  const normalized = normalizeNoun(noun);
  return normalized === "collar" || normalized === "pendant";
}

export function isWornCatCollarTarget(
  state: GameState,
  itemId: string,
): boolean {
  return (
    itemId === IGGY_COLLAR_ID &&
    state.worldState.catState.isWearingCollar &&
    isCatInRoom(state)
  );
}

export function clearCatHeldTurns(state: GameState): GameState {
  if (state.worldState.catState.heldTurns == null) return state;

  return {
    ...state,
    worldState: {
      ...state.worldState,
      catState: {
        ...state.worldState.catState,
        heldTurns: undefined,
      },
    },
  };
}
