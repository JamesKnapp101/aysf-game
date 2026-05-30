import { useUIEffectsStore } from "@game/store/store";
import type { GameState, LevelTwoBombState } from "@game/types/gameTypes";

export const LEVEL_TWO_BOMB_DETONATED_TRIGGER_ID = "LevelTwoBombDetonated";
export const LEVEL_TWO_BOMB_INITIAL_TURNS = 180;

export function createInitialLevelTwoBombState(): LevelTwoBombState {
  return {
    detonated: false,
    id: "level-two-bomb",
    isActive: true,
    remainingTurns: LEVEL_TWO_BOMB_INITIAL_TURNS,
  };
}

export function getLevelTwoBombState(state: GameState): LevelTwoBombState {
  return state.worldState.levelTwoBomb ?? createInitialLevelTwoBombState();
}

export function hasLevelTwoBombDetonated(state: GameState): boolean {
  const bomb = getLevelTwoBombState(state);
  return (
    bomb.detonated ||
    state.worldState.conditionalTriggers?.[
      LEVEL_TWO_BOMB_DETONATED_TRIGGER_ID
    ] === true
  );
}

export function formatLevelTwoBombTimerDisplay(state: GameState): string {
  const bomb = getLevelTwoBombState(state);
  const remaining = hasLevelTwoBombDetonated(state)
    ? 0
    : Math.max(0, bomb.remainingTurns);
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0",
  )}`;
}

export function describeLevelTwoBombTimer(state: GameState): string {
  const display = formatLevelTwoBombTimerDisplay(state);

  if (hasLevelTwoBombDetonated(state)) {
    return `It is a small digital timer, its cheap plastic case scratched and tacky with dried blood. The display is frozen at ${display}. Whatever it was counting down to has already happened.`;
  }

  return `It is a small digital timer, its cheap plastic case scratched and tacky with dried blood. The display is still counting down: ${display}.`;
}

export function readLevelTwoBombTimer(state: GameState): string {
  return formatLevelTwoBombTimerDisplay(state);
}

function getLevelTwoExplosionMessage(state: GameState): string {
  if (state.player.roomId === "RobotRefuge") {
    return "You jump as a loud, low BOOM rolls through the ship from somewhere up above. The floor bucks underneath you, the wall panels chatter in their frames, and the conveyor's jammed scrap tears loose with a metallic shriek. For a moment the belt shudders in place, then it starts crawling forward.";
  }

  if (state.player.roomId === "L3Warehouse") {
    return "You jump as a loud, low BOOM rolls through the ship from somewhere up above. The concrete floor bucks underneath you, the racks rattle hard enough to shed dust, and somewhere behind the east wall a conveyor motor coughs, catches, and starts running.";
  }

  return "You jump as a loud, low BOOM rolls through the ship, struggling to determine exactly where it came from. The floor bucks underneath you, the walls vibrate, and a long metallic groan fades into the distance as the shock passes.";
}

export function tickLevelTwoBomb(state: GameState): {
  messages: string[];
  state: GameState;
} {
  const bomb = getLevelTwoBombState(state);

  if (hasLevelTwoBombDetonated(state) || !bomb.isActive) {
    return { state, messages: [] };
  }

  const remainingTurns = Math.max(0, bomb.remainingTurns - 1);
  if (remainingTurns > 0) {
    return {
      state: {
        ...state,
        worldState: {
          ...state.worldState,
          levelTwoBomb: {
            ...bomb,
            remainingTurns,
          },
        },
      },
      messages: [],
    };
  }

  const next: GameState = {
    ...state,
    worldState: {
      ...state.worldState,
      conditionalTriggers: {
        ...state.worldState.conditionalTriggers,
        [LEVEL_TWO_BOMB_DETONATED_TRIGGER_ID]: true,
      },
      levelTwoBomb: {
        ...bomb,
        detonated: true,
        isActive: false,
        remainingTurns: 0,
      },
    },
  };

  useUIEffectsStore.getState().triggerScreenShake();

  return {
    state: next,
    messages: [getLevelTwoExplosionMessage(state)],
  };
}
