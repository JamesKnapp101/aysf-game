import type { GameState } from "@game/types/gameTypes";

export const HYDROPONICS_SPIDER_INITIAL_DOOR_HEALTH = 3;

export function createInitialHydroponicsSpiderState(): GameState["worldState"]["hydroponicsSpider"] {
  return {
    isAlive: true,
    turnsSinceLastBreath: 0,
    sensitivity: 0,
    pendingAcidTarget: "none",
    doorHealth: HYDROPONICS_SPIDER_INITIAL_DOOR_HEALTH,
    lastTrackedHydroponicsRoomId: undefined,
  };
}
