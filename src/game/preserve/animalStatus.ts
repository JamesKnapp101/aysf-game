import type {
  AnimalStatusEffect,
  AnimalStatusId,
} from "@game/preserve/preserveTypes";
import type { GameState } from "@game/types/gameTypes";
import type { ItemId } from "@game/types/ids";
import type { AnimalDisposition } from "@game/types/itemTypes";

export function getAnimalDisposition(
  state: GameState,
  itemId: ItemId,
): AnimalDisposition {
  return state.itemState.animalDisposition[itemId] ?? {};
}

export function updateAnimalDisposition(
  state: GameState,
  itemId: ItemId,
  updater: (current: AnimalDisposition) => AnimalDisposition,
): GameState {
  const current = getAnimalDisposition(state, itemId);
  const nextDisposition = updater(current);

  return {
    ...state,
    itemState: {
      ...state.itemState,
      animalDisposition: {
        ...state.itemState.animalDisposition,
        [itemId]: nextDisposition,
      },
    },
  };
}

export function getAnimalStatusEffects(
  state: GameState,
  itemId: ItemId,
): AnimalStatusEffect[] {
  return getAnimalDisposition(state, itemId).statusEffects ?? [];
}

export function getAnimalStatus(
  state: GameState,
  itemId: ItemId,
  statusId: AnimalStatusId,
): AnimalStatusEffect | undefined {
  return getAnimalStatusEffects(state, itemId).find(
    (status) => status.id === statusId,
  );
}

export function getAnimalStatusRemainingTurns(
  state: GameState,
  itemId: ItemId,
  statusId: AnimalStatusId,
): number {
  return getAnimalStatus(state, itemId, statusId)?.remainingTurns ?? 0;
}

export function hasAnimalStatus(
  state: GameState,
  itemId: ItemId,
  statusId: AnimalStatusId,
): boolean {
  return Boolean(getAnimalStatus(state, itemId, statusId));
}

export function setAnimalStatus(
  state: GameState,
  itemId: ItemId,
  nextStatus: AnimalStatusEffect,
): GameState {
  if (
    nextStatus.remainingTurns != null &&
    Math.max(0, nextStatus.remainingTurns) === 0
  ) {
    return clearAnimalStatus(state, itemId, nextStatus.id);
  }

  return updateAnimalDisposition(state, itemId, (current) => {
    const existing = current.statusEffects ?? [];
    const withoutCurrent = existing.filter(
      (status) => status.id !== nextStatus.id,
    );

    return {
      ...current,
      statusEffects: [...withoutCurrent, nextStatus],
    };
  });
}

export function clearAnimalStatus(
  state: GameState,
  itemId: ItemId,
  statusId: AnimalStatusId,
): GameState {
  return updateAnimalDisposition(state, itemId, (current) => ({
    ...current,
    statusEffects: (current.statusEffects ?? []).filter(
      (status) => status.id !== statusId,
    ),
  }));
}
