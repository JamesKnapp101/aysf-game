import { dismissNotification } from "@game/rules/notifications";
import { useEffect, useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { GameState } from "../types/gameTypes";

const NOTIFICATION_DURATION_MS = 5200;

export function NotificationHost({
  state,
  setGameState,
}: {
  state: GameState;
  setGameState: Dispatch<SetStateAction<GameState>>;
}) {
  const notifications = state.uiState.notifications;
  const timeoutsRef = useRef<Record<number, number>>({});

  useEffect(() => {
    for (const notification of notifications) {
      if (timeoutsRef.current[notification.id]) continue;

      timeoutsRef.current[notification.id] = window.setTimeout(() => {
        delete timeoutsRef.current[notification.id];
        setGameState((prev) => dismissNotification(prev, notification.id));
      }, NOTIFICATION_DURATION_MS);
    }

    const activeIds = new Set(notifications.map((notification) => notification.id));

    for (const key of Object.keys(timeoutsRef.current)) {
      const notificationId = Number(key);
      if (activeIds.has(notificationId)) continue;

      window.clearTimeout(timeoutsRef.current[notificationId]);
      delete timeoutsRef.current[notificationId];
    }
  }, [notifications, setGameState]);

  useEffect(() => {
    return () => {
      for (const timeoutId of Object.values(timeoutsRef.current)) {
        window.clearTimeout(timeoutId);
      }
      timeoutsRef.current = {};
    };
  }, []);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="game-notifications" aria-live="polite" aria-atomic="true">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`game-notification game-notification--${notification.kind}`}
          role="status"
        >
          {notification.text}
        </div>
      ))}
    </div>
  );
}
