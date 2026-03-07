import { appendLog } from "@game/engine/handleCommand";
import { triggerPlayerDeath } from "@game/helpers/gameHelpers";
import type { ActionResult } from "@game/types/actionsTypes";
import type { GameState } from "@game/types/gameTypes";
import type { Item } from "@game/types/itemTypes";
import { hydroponicsRooms } from "src/world/maps/levelSix/Hydroponics";

export const HYDROPONICS_SPIDER_ROOM_IDS = new Set(
  hydroponicsRooms.map((room) => room.id),
);

export const HYDROPONICS_SPIDER_DOOR_MAX_HP = 3;

const GAP_PEEK_MESSAGES = [
  "Through the narrow gap you can only make out webbing and a churn of shifting shadows deeper inside. Something in there goes still, as if it heard you.",
  "You peer through the gap again. The moving shadows resolve into long, deliberate adjustments in the webbing, and you get the distinct sense that whatever is in there has turned toward the door.",
  "You risk another look and catch a pale, swollen mass shifting behind the web. Several long limbs reposition at once, and a moment later you hear a long inhale followed by a wet, bubbling gurgle.",
];

const DOOR_ACID_MESSAGES = [
  "A jet of acid blasts through the gap and splashes across the damaged door with a violent hiss. Smoke curls up from the metal as the seam darkens and sags.",
  "Another gout of acid slams into the door, chewing deeper into the weakened metal. The frame shrieks as the seam widens another miserable inch.",
  "The next blast hits with enough force to eat straight through the ruined seam. The damaged door softens, buckles, and melts down the middle, opening the way into Hydroponics.",
];

const GAP_FATAL_MESSAGE =
  "You lean in for one look too many. Something on the far side convulses, and a stream of acid lashes through the gap, splashing across your face and chest before you can recoil.";

const HYDROPONICS_FATAL_MESSAGE =
  "The giant spider rears and convulses. A pressurized stream of acid erupts from its mouthparts and catches you before you can move, burning straight through skin, muscle, and bone.";

function updateSpiderState(
  state: GameState,
  updates: Partial<GameState["worldState"]["hydroponicsSpider"]>,
): GameState {
  return {
    ...state,
    worldState: {
      ...state.worldState,
      hydroponicsSpider: {
        ...state.worldState.hydroponicsSpider,
        ...updates,
      },
    },
  };
}

export function isHydroponicsSpiderRoom(roomId: string): boolean {
  return HYDROPONICS_SPIDER_ROOM_IDS.has(roomId);
}

export function lookThroughSpiderGap(state: GameState): ActionResult {
  const spider = state.worldState.hydroponicsSpider;

  if (!spider.isAlive) {
    return {
      state,
      message:
        "Beyond the gap, the web-choked chamber is still. Whatever once moved in there is no longer interested in you.",
      consumesTurn: false,
    };
  }

  if (
    spider.doorHealth <= 0 ||
    state.worldState.conditionalTriggers.HydroponicsDoorUnblocked
  ) {
    return {
      state,
      message:
        "The damaged door has already given way, melted down the middle into a blackened opening. Beyond it, the webbed Hydroponics platform lies exposed.",
      consumesTurn: false,
    };
  }

  if (spider.pendingAcidTarget === "door" && spider.sensitivity >= 3) {
    return {
      state: updateSpiderState(state, {
        pendingAcidTarget: "gapPlayer",
      }),
      message: "",
      consumesTurn: true,
    };
  }

  const nextSensitivity = Math.min(3, spider.sensitivity + 1);
  const nextState = updateSpiderState(state, {
    sensitivity: nextSensitivity,
    pendingAcidTarget:
      nextSensitivity >= 3 ? "door" : spider.pendingAcidTarget ?? "none",
  });

  return {
    state: nextState,
    message: GAP_PEEK_MESSAGES[nextSensitivity - 1] ?? GAP_PEEK_MESSAGES[2],
    consumesTurn: false,
  };
}

export function tickHydroponicsSpiderThreat(state: GameState): GameState {
  const spider = state.worldState.hydroponicsSpider;
  if (!spider.isAlive) return state;

  const inHydroponics = isHydroponicsSpiderRoom(state.player.roomId);

  if (inHydroponics) {
    if (spider.lastTrackedHydroponicsRoomId !== state.player.roomId) {
      return updateSpiderState(state, {
        sensitivity: 0,
        pendingAcidTarget: "none",
        lastTrackedHydroponicsRoomId: state.player.roomId,
      });
    }
  } else if (spider.lastTrackedHydroponicsRoomId) {
    const shouldClearHydroThreat =
      spider.pendingAcidTarget === "none" || spider.pendingAcidTarget === "player";

    return updateSpiderState(state, {
      sensitivity: shouldClearHydroThreat ? 0 : spider.sensitivity,
      pendingAcidTarget: shouldClearHydroThreat
        ? "none"
        : spider.pendingAcidTarget,
      lastTrackedHydroponicsRoomId: undefined,
    });
  }

  if (
    spider.pendingAcidTarget === "player" ||
    spider.pendingAcidTarget === "gapPlayer"
  ) {
    const armedState = updateSpiderState(state, {
      pendingAcidTarget: "none",
      sensitivity: Math.max(0, spider.sensitivity - 1),
    });
    return triggerPlayerDeath(
      armedState,
      spider.pendingAcidTarget === "gapPlayer"
        ? GAP_FATAL_MESSAGE
        : HYDROPONICS_FATAL_MESSAGE,
      "hydroponics spider acid",
    );
  }

  if (spider.pendingAcidTarget === "door") {
    const nextDoorHealth = Math.max(0, spider.doorHealth - 1);
    let next = updateSpiderState(state, {
      pendingAcidTarget: "none",
      sensitivity: Math.max(0, spider.sensitivity - 1),
      doorHealth: nextDoorHealth,
    });

    if (nextDoorHealth <= 0) {
      next = {
        ...next,
        worldState: {
          ...next.worldState,
          conditionalTriggers: {
            ...next.worldState.conditionalTriggers,
            HydroponicsDoorUnblocked: true,
          },
        },
      };
    }

    const damageIndex = HYDROPONICS_SPIDER_DOOR_MAX_HP - nextDoorHealth - 1;
    return appendLog(next, DOOR_ACID_MESSAGES[damageIndex] ?? DOOR_ACID_MESSAGES[2]);
  }

  const nextSensitivity = inHydroponics
    ? Math.min(3, spider.sensitivity + 1)
    : Math.max(0, spider.sensitivity - 1);

  const nextPendingAcidTarget =
    !spider.pendingAcidTarget || spider.pendingAcidTarget === "none"
      ? inHydroponics && nextSensitivity >= 3
        ? "player"
        : "none"
      : spider.pendingAcidTarget;

  if (
    nextSensitivity === spider.sensitivity &&
    nextPendingAcidTarget === spider.pendingAcidTarget
  ) {
    return state;
  }

  return updateSpiderState(state, {
    sensitivity: nextSensitivity,
    pendingAcidTarget: nextPendingAcidTarget,
    lastTrackedHydroponicsRoomId: inHydroponics
      ? state.player.roomId
      : spider.lastTrackedHydroponicsRoomId,
  });
}

export const giantSpiderItems: Item[] = [
  {
    id: "spider",
    name: "massive spider",
    itemCategory: "animate",
    meta: {
      isAlive: true,
      canMove: false,
      vision: "dark",
      hostility: "neutral",
      homeRegion: [...HYDROPONICS_SPIDER_ROOM_IDS],
      memories: [],
    },
    description:
      "The creature is equal parts hideous and pitiable, its abdomen swollen to painful proportions and its long, slender legs barely able to move.",
    location: "HydroponicsPlatformMid",
    vocab: ["spider", "giant spider", "massive spider"],
    itemClass: "solid",
    itemWeight: 200,
    itemSize: 200,
    overrides: {
      tick: () => {},
    },
  },
];
