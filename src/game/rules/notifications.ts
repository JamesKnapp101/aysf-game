import { playerScoreMap } from "@game/constants";
import type {
  GameNotificationDraft,
  GameState,
  PlayerScoreId,
} from "@game/types/gameTypes";

export const GOSSIP_NOTIFICATION_TEXT = "You obtained some salacious gossip!";

function getNextNotificationId(state: GameState): number {
  return state.uiState?.nextNotificationId ?? 1;
}

function getNotifications(state: GameState) {
  return state.uiState?.notifications ?? [];
}

export function enqueueNotification(
  state: GameState,
  notification: GameNotificationDraft,
): GameState {
  const nextId = getNextNotificationId(state);

  return {
    ...state,
    uiState: {
      ...(state.uiState ?? {
        cometPersonality: "default",
        cometTextSize: "smaller",
        visualEffectsMode: "full",
        notifications: [],
        nextNotificationId: 1,
      }),
      notifications: [
        ...getNotifications(state),
        {
          id: nextId,
          ...notification,
        },
      ],
      nextNotificationId: nextId + 1,
    },
  };
}

export function enqueueNotifications(
  state: GameState,
  notifications: GameNotificationDraft[],
): GameState {
  let next = state;

  for (const notification of notifications) {
    next = enqueueNotification(next, notification);
  }

  return next;
}

export function dismissNotification(
  state: GameState,
  notificationId: number,
): GameState {
  const notifications = getNotifications(state);

  if (
    !notifications.some((notification) => notification.id === notificationId)
  ) {
    return state;
  }

  return {
    ...state,
    uiState: {
      ...(state.uiState ?? {
        cometPersonality: "default",
        cometTextSize: "smaller",
        visualEffectsMode: "full",
        notifications: [],
        nextNotificationId: 1,
      }),
      notifications: notifications.filter(
        (notification) => notification.id !== notificationId,
      ),
    },
  };
}

export function buildScoreNotification(
  scoreId: PlayerScoreId,
): GameNotificationDraft {
  return {
    kind: "score",
    text: `Your score has just went up by ${
      playerScoreMap[scoreId]?.value ?? 0
    } points!`,
  };
}

export function buildMemoryNotification(points: number): GameNotificationDraft {
  return {
    kind: "memory",
    text: `Your memory rating just went up by ${points} points!`,
  };
}

export function buildGossipNotification(): GameNotificationDraft {
  return {
    kind: "gossip",
    text: GOSSIP_NOTIFICATION_TEXT,
  };
}

export function getGossipNotifications(
  obtainedNewTea: boolean,
): GameNotificationDraft[] {
  return obtainedNewTea ? [buildGossipNotification()] : [];
}

export function buildLogNotification(text: string): GameNotificationDraft {
  return {
    kind: "log",
    text,
  };
}
