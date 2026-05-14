import type { BarBotState, GameState } from "@game/types/gameTypes";

const BAR_ROOM_ID = "Bar";
const BAR_BASEMENT_ROOM_ID = "BarBasement";
const BAR_BOT_NPC_ID = "BarBot";

export const BAR_BOT_CELLAR_DEATH_RETURN_MESSAGE =
  `"You're back! I thought you were killed down there!"`;

export const BAR_BOT_CELLAR_DEATH_REGEN_MESSAGE =
  `"You might want to order a drink for this, but here's what I just witnessed... you went down through that hatch, something terrible happened in the dark, and then you reappeared right here."`;

function getBarBotState(state: GameState): BarBotState {
  return {
    cellarDeathAcknowledged:
      state.worldState.barBot?.cellarDeathAcknowledged ?? false,
    pendingCellarDeathAcknowledgement:
      state.worldState.barBot?.pendingCellarDeathAcknowledgement,
    sawPlayerDieInCellar:
      state.worldState.barBot?.sawPlayerDieInCellar ?? false,
    sawPlayerEnterCellar:
      state.worldState.barBot?.sawPlayerEnterCellar ?? false,
    sawPlayerRegenerateInBar:
      state.worldState.barBot?.sawPlayerRegenerateInBar ?? false,
  };
}

function setBarBotState(
  state: GameState,
  barBot: BarBotState,
): GameState {
  return {
    ...state,
    worldState: {
      ...state.worldState,
      barBot,
    },
  };
}

export function markBarBotSawPlayerEnterCellar(state: GameState): GameState {
  const barBot = getBarBotState(state);
  if (barBot.sawPlayerEnterCellar) return state;

  return setBarBotState(state, {
    ...barBot,
    sawPlayerEnterCellar: true,
  });
}

export function recordBarBotCellarDeathWitness(
  state: GameState,
  ctx: { deathRoomId: string; respawnRoomId: string },
): { immediateMessage?: string; state: GameState } {
  const barBot = getBarBotState(state);

  if (
    ctx.deathRoomId !== BAR_BASEMENT_ROOM_ID ||
    !barBot.sawPlayerEnterCellar
  ) {
    return { state };
  }

  const regeneratedInBar = ctx.respawnRoomId === BAR_ROOM_ID;
  const next = setBarBotState(state, {
    ...barBot,
    cellarDeathAcknowledged: regeneratedInBar,
    pendingCellarDeathAcknowledgement: regeneratedInBar
      ? undefined
      : "returned",
    sawPlayerDieInCellar: true,
    sawPlayerRegenerateInBar:
      barBot.sawPlayerRegenerateInBar || regeneratedInBar,
  });

  return {
    state: next,
    immediateMessage: regeneratedInBar
      ? BAR_BOT_CELLAR_DEATH_REGEN_MESSAGE
      : undefined,
  };
}

export function shouldBarBotAcknowledgeReturnedFromCellarDeath(
  state: GameState,
): boolean {
  return (
    getBarBotState(state).pendingCellarDeathAcknowledgement === "returned"
  );
}

export function acknowledgeBarBotReturnedFromCellarDeath(
  state: GameState,
): GameState {
  const barBot = getBarBotState(state);

  return setBarBotState(state, {
    ...barBot,
    cellarDeathAcknowledged: true,
    pendingCellarDeathAcknowledgement: undefined,
  });
}

export function buildBarBotAssistantContext(
  state: GameState,
  npcId: string,
): string | undefined {
  if (npcId !== BAR_BOT_NPC_ID) return undefined;

  const barBot = getBarBotState(state);
  const lines: string[] = [];

  if (barBot.sawPlayerEnterCellar) {
    lines.push(
      "- You saw Mox go down through the floor hatch into the dark cellar.",
    );
  }

  if (barBot.sawPlayerDieInCellar) {
    lines.push(
      "- You witnessed or heard enough to believe Mox was killed in the cellar after going down there.",
    );
  }

  if (barBot.sawPlayerRegenerateInBar) {
    lines.push(
      "- You saw Mox regenerate back in the bar immediately after the cellar death.",
    );
  }

  if (barBot.pendingCellarDeathAcknowledgement === "returned") {
    lines.push(
      "- Mox has not heard your reaction yet. If this is the first chance to speak after Mox returned to the bar, acknowledge that you thought Mox was killed down there.",
    );
  } else if (barBot.sawPlayerDieInCellar) {
    lines.push(
      "- You have already acknowledged the cellar death directly. Do not greet Mox with surprise about it again unless it is relevant or Mox asks.",
    );
  }

  return lines.length > 0 ? lines.join("\n") : undefined;
}
