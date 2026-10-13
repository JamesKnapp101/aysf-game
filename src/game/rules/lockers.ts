import { getItemById } from "../helpers/itemHelpers";
import type { GameState } from "../types/gameTypes";
import { updateItemLocation } from "./items";
import { addToInventory } from "./state";

export type LockerType = "men" | "women";
export const LOCKER_COUNT = 16;

export function lockerIdFor(type: LockerType, index: number): string {
  return type === "men" ? `menLocker${index}` : `womenLocker${index}`;
}

export function playerHasKeyForLocker(state: GameState, type: LockerType, index: number): boolean {
  const inventory = state.player.inventory;
  const ids = new Set([...inventory.general, ...inventory.badges, ...inventory.keys]);
  return state.world.items.some(item =>
    (ids.has(item.id) || item.location === "INVENTORY" || state.itemState.itemRoomId[item.id] === "INVENTORY") &&
    item.meta?.lockerType === type && item.meta?.lockerIndex === index,
  );
}

export function moveItemIdsToInventory(state: GameState, ids: string[]): GameState {
  return ids.reduce((next, id) => addToInventory(updateItemLocation(next, id, "INVENTORY"), id), state);
}

export function getLockerModels(state: GameState, type: LockerType) {
  const opened = type === "men" ? state.worldState.mensLockersOpened : state.worldState.womensLockersOpened;
  return Array.from({ length: LOCKER_COUNT }, (_, i) => {
    const idx = i + 1;
    const lockerId = lockerIdFor(type, idx);
    return { idx, lockerId, opened: Boolean(opened[lockerId as keyof typeof opened]) };
  });
}

export function lockerFoundText(state: GameState, itemId: string): string {
  return `Inside the locker you find a ${getItemById(state, itemId)?.name ?? itemId}`;
}

/** The same keyed click for both grids. No unopened contents in presentation. */
export function openLocker(state: GameState, type: LockerType, index: number) {
  const result = (next: GameState, foundItemIds: string[] = [], message?: string) => ({ state: next, foundItemIds, message });
  if (!Number.isInteger(index) || index < 1 || index > LOCKER_COUNT) return result(state);
  const openedKey = type === "men" ? "mensLockersOpened" : "womensLockersOpened";
  const contentsKey = type === "men" ? "mensLockerContents" : "womensLockerContents";
  const id = lockerIdFor(type, index);
  const opened = state.worldState[openedKey] as Record<string, boolean>;
  const contentsMap = state.worldState[contentsKey] as Record<string, string[]>;
  const contents = contentsMap[id] ?? [];
  const messageResult = (next: GameState, message: string) => result({ ...next, log: [...next.log, message] }, [], message);
  if (opened[id]) return contents.length ? result(state, [...contents]) : messageResult(state, "It's empty.");
  if (!playerHasKeyForLocker(state, type, index)) return messageResult(state, "It won't budge.");

  let next: GameState = { ...state, worldState: { ...state.worldState, [openedKey]: { ...opened, [id]: true } } };
  next = moveItemIdsToInventory(next, contents);
  next = { ...next, worldState: { ...next.worldState, [contentsKey]: { ...contentsMap, [id]: [] } } };
  return contents.length ? result(next, [...contents]) : messageResult(next, "It's empty.");
}
