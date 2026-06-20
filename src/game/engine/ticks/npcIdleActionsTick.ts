import { appendLog } from "@game/engine/log";
import { getItemsInCurrentRoom } from "@game/selectors/roomSelectors";
import type { GameState } from "@game/types/gameTypes";
import type { Item } from "@game/types/itemTypes";

export const NPC_IDLE_ACTION_CHANCE = 0.2;

function randomIndex(length: number, rng: () => number): number {
  return Math.min(length - 1, Math.floor(rng() * length));
}

function getIdleNpcsInCurrentRoom(state: GameState): Item[] {
  return getItemsInCurrentRoom(state).filter(
    (item) =>
      !state.itemState.frozenItems[item.id] &&
      item.idleActions?.some((action) => action.trim().length > 0),
  );
}

export function tickNpcIdleActions(state: GameState): GameState {
  const idleNpcs = getIdleNpcsInCurrentRoom(state);
  if (idleNpcs.length === 0 || state.rng() <= 1 - NPC_IDLE_ACTION_CHANCE) {
    return state;
  }

  const npc = idleNpcs[randomIndex(idleNpcs.length, state.rng)];
  const actions = npc.idleActions!.filter((action) => action.trim().length > 0);
  const action = actions[randomIndex(actions.length, state.rng)];

  return appendLog(state, action);
}
