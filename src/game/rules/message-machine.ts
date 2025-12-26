import type { GameState } from "../types/gameTypes";

export function setMessageListened(
  state: GameState,
  messageId: string
): GameState {
  return {
    ...state,
    itemState: {
      ...state.itemState,
      messagesPlayed: {
        ...state.itemState.messagesPlayed,
        [messageId]: true,
      },
    },
  };
}
