import { appendLog } from "@game/engine/log";
import { getItemsInCurrentRoom } from "@game/selectors/roomSelectors";
import type { GameState } from "@game/types/gameTypes";

export const NPC_IDLE_ACTION_CHANCE = 0.2;

function randomIndex(length: number, rng: () => number): number {
  return Math.min(length - 1, Math.floor(rng() * length));
}

function getIdleActionsInCurrentRoom(state: GameState): string[][] {
  return getItemsInCurrentRoom(state)
    .filter((item) => !state.itemState.frozenItems[item.id])
    .map((item) =>
      (item.getIdleActions?.(state, item) ?? item.idleActions ?? []).filter(
        (action) => action.trim().length > 0,
      ),
    )
    .filter((actions) => actions.length > 0);
}

export function tickNpcIdleActions(state: GameState): GameState {
  const idlePools = getIdleActionsInCurrentRoom(state);
  if (idlePools.length === 0 || state.rng() <= 1 - NPC_IDLE_ACTION_CHANCE) {
    return state;
  }

  const actions = idlePools[randomIndex(idlePools.length, state.rng)];
  const action = actions[randomIndex(actions.length, state.rng)];

  return appendLog(state, action);
}
