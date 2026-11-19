import type { GameState } from "../types/gameTypes";
import type { PhoneMessage } from "../components/MessageMachineModal";
import { collectDiscoveries } from "./discoveries";
import { enqueueNotifications } from "./notifications";

export function setMessageListened(
  state: GameState,
  messageId: string
): GameState {
  if (state.itemState.messagesPlayed[messageId]) return state;
  const message = state.world.items
    .filter(item => item.meta?.kind === "phone" && Array.isArray(item.meta.messages))
    .flatMap(item => item.meta!.messages as PhoneMessage[])
    .find(candidate => candidate.id === messageId);
  const discovered = collectDiscoveries(state, message);
  const next = enqueueNotifications(discovered.state, discovered.notifications);
  return {
    ...next,
    itemState: {
      ...next.itemState,
      messagesPlayed: {
        ...next.itemState.messagesPlayed,
        [messageId]: true,
      },
    },
  };
}
