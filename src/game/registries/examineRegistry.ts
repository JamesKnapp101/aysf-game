import type { ActionResult } from "@game/types/actionsTypes";
import type { GameNotificationDraft, GameState } from "@game/types/gameTypes";
import type { Item } from "@game/types/itemTypes";

export type ExamineItemContext = {
  item: Item;
  state: GameState;
  postCloseNotifications: GameNotificationDraft[];
  withImmediateGossip: (state: GameState) => GameState;
};

type SpecialExamineHandler = {
  matches: (item: Item) => boolean;
  handle: (ctx: ExamineItemContext) => ActionResult;
};

export function withPostCloseNotifications<T extends Record<string, unknown>>(
  overlay: T,
  postCloseNotifications: GameNotificationDraft[],
) {
  return postCloseNotifications.length > 0
    ? { ...overlay, postCloseNotifications }
    : overlay;
}

function handleReflectiveExamine(ctx: ExamineItemContext): ActionResult {
  let next = ctx.state;
  let reflectMsg = "";

  reflectMsg =
    "You regard your reflection for a moment and are taken aback as you realize you've seen that face before. It's the same exact face you saw on one of the dead bodies you found, you're him, or he was you? How is this possible?";

  if (next.player.mirror.hasHair) {
    reflectMsg =
      "You regard your reflection for a moment, feeling a glimmer of recognition. Your skin is fresh and unblemished, your head covered in a shock of blond hair that sprouts from a receding hairline. Your eyebrows are on the bushy side, and stubble has formed on your face and neck.";
  } else {
    reflectMsg =
      "You regard your reflection for a moment, feeling a glimmer of recognition. Your skin is fresh and unblemished, your head smooth, and hairless. You don't even have eyebrows.";
  }

  if (next.player.memoriesTriggered.seen_self) {
    reflectMsg +=
      "\n\nYou regard your reflection for a moment and are taken aback as you realize you've seen that face before. It's the same exact face you saw on one of the dead bodies you found, you're him, or he was you? How is this possible?";
  }

  next = {
    ...next,
    player: {
      ...next.player,
      memoriesTriggered: {
        ...next.player.memoriesTriggered,
        own_image: true,
      },
    },
  };

  return {
    state: ctx.withImmediateGossip(next),
    message: reflectMsg,
  };
}

function buildMessageMachineOverlay(ctx: ExamineItemContext): ActionResult {
  return {
    state: ctx.state,
    overlay: withPostCloseNotifications(
      {
        kind: "message-machine" as const,
        messages: ctx.item.meta?.messages,
        messagesPlayedById: {},
      },
      ctx.postCloseNotifications,
    ),
  };
}

function buildCameraGunOverlay(ctx: ExamineItemContext): ActionResult {
  return {
    state: ctx.state,
    overlay: withPostCloseNotifications(
      {
        kind: "camera-gun-viewer" as const,
        currentViewIndex: 0,
      },
      ctx.postCloseNotifications,
    ),
  };
}

function buildHydroponicsTerminalOverlay(
  ctx: ExamineItemContext,
): ActionResult {
  return {
    state: ctx.state,
    overlay: withPostCloseNotifications(
      {
        kind: "hydroponics-admin-terminal" as const,
      },
      ctx.postCloseNotifications,
    ),
  };
}

function buildPowerStationOverlay(ctx: ExamineItemContext): ActionResult {
  if (!ctx.state.worldState.powerRestoredSections["power-initialized"]) {
    return {
      state: ctx.withImmediateGossip(ctx.state),
      message: ctx.item.meta?.onNoPower ?? "The screen is dark.",
    };
  }

  return {
    state: ctx.state,
    overlay: withPostCloseNotifications(
      {
        kind: "power-station-terminal" as const,
        isOn: true,
      },
      ctx.postCloseNotifications,
    ),
  };
}

function buildMatterTransmitterOverlay(ctx: ExamineItemContext): ActionResult {
  return {
    state: ctx.state,
    overlay: withPostCloseNotifications(
      {
        kind: "matter-transmitter" as const,
        isOn: true,
      },
      ctx.postCloseNotifications,
    ),
  };
}

function buildMensLockersOverlay(ctx: ExamineItemContext): ActionResult {
  return {
    state: ctx.state,
    overlay: withPostCloseNotifications(
      {
        kind: "mens-lockers" as const,
      },
      ctx.postCloseNotifications,
    ),
  };
}

function buildWomensLockersOverlay(ctx: ExamineItemContext): ActionResult {
  return {
    state: ctx.state,
    overlay: withPostCloseNotifications(
      {
        kind: "womens-lockers" as const,
      },
      ctx.postCloseNotifications,
    ),
  };
}

function buildTeleportationTerminalOverlay(
  ctx: ExamineItemContext,
): ActionResult {
  return {
    state: ctx.state,
    overlay: withPostCloseNotifications(
      {
        kind: "teleportation-terminal" as const,
      },
      ctx.postCloseNotifications,
    ),
  };
}

function buildGamePreserveTerminalOverlay(
  ctx: ExamineItemContext,
): ActionResult {
  return {
    state: ctx.state,
    overlay: withPostCloseNotifications(
      {
        kind: "game-preserve-terminal" as const,
      },
      ctx.postCloseNotifications,
    ),
  };
}

function buildBarJukeboxOverlay(ctx: ExamineItemContext): ActionResult {
  return {
    state: ctx.state,
    overlay: withPostCloseNotifications(
      {
        kind: "bar-jukebox" as const,
      },
      ctx.postCloseNotifications,
    ),
  };
}

const SPECIAL_EXAMINE_HANDLERS: SpecialExamineHandler[] = [
  {
    matches: (item) => item.isReflective === true,
    handle: handleReflectiveExamine,
  },
  {
    matches: (item) =>
      item.id === "TelepadTerminal" ||
      item.meta?.kind === "teleportation-terminal",
    handle: buildTeleportationTerminalOverlay,
  },
  {
    matches: (item) => item.meta?.kind === "game-preserve-terminal",
    handle: buildGamePreserveTerminalOverlay,
  },
  {
    matches: (item) => item.meta?.kind === "bar-jukebox",
    handle: buildBarJukeboxOverlay,
  },
  {
    matches: (item) => item.meta?.kind === "phone",
    handle: buildMessageMachineOverlay,
  },
  {
    matches: (item) => item.meta?.kind === "camera-gun-viewer",
    handle: buildCameraGunOverlay,
  },
  {
    matches: (item) => item.meta?.kind === "hydroponics-admin-terminal",
    handle: buildHydroponicsTerminalOverlay,
  },
  {
    matches: (item) => item.meta?.kind === "power-station-terminal",
    handle: buildPowerStationOverlay,
  },
  {
    matches: (item) => item.meta?.kind === "matter-transmitter",
    handle: buildMatterTransmitterOverlay,
  },
  {
    matches: (item) => item.meta?.kind === "mens-lockers",
    handle: buildMensLockersOverlay,
  },
  {
    matches: (item) => item.meta?.kind === "womens-lockers",
    handle: buildWomensLockersOverlay,
  },
];

export function tryHandleRegisteredExamine(
  ctx: ExamineItemContext,
): ActionResult | null {
  const handler = SPECIAL_EXAMINE_HANDLERS.find((entry) =>
    entry.matches(ctx.item),
  );
  return handler ? handler.handle(ctx) : null;
}
