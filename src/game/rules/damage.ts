import {
  buildDamageNotification,
  enqueueNotification,
} from "@game/rules/notifications";
import type { GameState } from "@game/types/gameTypes";

export function applyPlayerDamage(state: GameState, amount: number): GameState {
  if (amount <= 0) return state;

  const nextHealth = Math.max(0, state.player.vitals.health - amount);
  const nextState: GameState = {
    ...state,
    player: {
      ...state.player,
      vitals: {
        ...state.player.vitals,
        health: nextHealth,
      },
    },
  };

  return enqueueNotification(nextState, buildDamageNotification(amount));
}
