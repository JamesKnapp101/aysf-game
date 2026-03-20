import { isItemOpen } from "@game/rules/containers";
import { getItemById } from "@game/selectors/itemSelectors";
import { resolveDoorByNoun, resolveItemByNoun } from "../../rules/scope";
import type { ActionResult } from "../../types/actionsTypes";
import type { GameNotificationDraft, GameState } from "../../types/gameTypes";
import type { Item } from "../../types/itemTypes";

export type ExamineItemContext = {
  item: Item;
  state: GameState;
  postCloseNotifications: GameNotificationDraft[];
  withImmediateGossip: (state: GameState) => GameState;
};

type ResolvedExamineTarget =
  | { kind: "item"; item: Item }
  | { kind: "result"; result: ActionResult };

type SpecialExamineHandler = {
  matches: (item: Item) => boolean;
  handle: (ctx: ExamineItemContext) => ActionResult;
};

function withPostCloseNotifications<T extends Record<string, unknown>>(
  overlay: T,
  postCloseNotifications: GameNotificationDraft[],
) {
  return postCloseNotifications.length > 0
    ? { ...overlay, postCloseNotifications }
    : overlay;
}

function markSeenSelf(next: GameState): GameState {
  return {
    ...next,
    player: {
      ...next.player,
      memoriesTriggered: {
        ...next.player.memoriesTriggered,
        seen_self: true,
      },
    },
  };
}

function handleReflectiveExamine(ctx: ExamineItemContext): ActionResult {
  let next = ctx.state;
  let reflectMsg = "";

  if (!next.player.memoriesTriggered.own_image) {
    if (next.player.memoriesTriggered.seen_self) {
      reflectMsg =
        "You regard your reflection for a moment and are taken aback as you realize you've seen that face before. It's the same exact face you saw on one of the dead bodies you found, you're him, or he was you? How is this possible?";
    } else {
      reflectMsg =
        "You regard your reflection for a moment, feeling a glimmer of recognition. Your skin is fresh and unblemished, your head smooth, and hairless. You don't even have eyebrows.";
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

  return {
    state: ctx.withImmediateGossip(next),
    message: "Still looking good!",
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

function buildHydroponicsTerminalOverlay(ctx: ExamineItemContext): ActionResult {
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

function buildCometOverlay(ctx: ExamineItemContext): ActionResult {
  return {
    state: ctx.state,
    overlay: withPostCloseNotifications(
      {
        kind: "comet-viewer" as const,
        isOn: (ctx.state.itemState.itemSettings["Comet"] as any)?.isOn,
        hasLink: (ctx.state.itemState.itemSettings["Comet"] as any)?.hasLink,
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

const SPECIAL_EXAMINE_HANDLERS: SpecialExamineHandler[] = [
  {
    matches: (item) => item.isReflective === true,
    handle: handleReflectiveExamine,
  },
  {
    matches: (item) => item.id === "TelepadTerminal",
    handle: buildTeleportationTerminalOverlay,
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
    matches: (item) => item.meta?.kind === "comet-viewer",
    handle: buildCometOverlay,
  },
  {
    matches: (item) => item.id === "PowerStationMonitor",
    handle: buildPowerStationOverlay,
  },
  {
    matches: (item) => item.id === "MatterTransmitter",
    handle: buildMatterTransmitterOverlay,
  },
  {
    matches: (item) => item.id === "MensLockers",
    handle: buildMensLockersOverlay,
  },
  {
    matches: (item) => item.id === "WomensLockers",
    handle: buildWomensLockersOverlay,
  },
];

export function resolveExamineTarget(
  state: GameState,
  direct: string,
): ResolvedExamineTarget {
  const item =
    direct !== "water"
      ? resolveItemByNoun(state, direct)
      : getItemById(state, "water");

  if (item) {
    return { kind: "item", item };
  }

  const door = resolveDoorByNoun(state, direct);
  if (door) {
    return {
      kind: "result",
      result: {
        state,
        message:
          door.def.describe?.(state, {
            kind: "door",
            doorId: door.def.id,
            roomId: state.player.roomId,
          }) ?? door.def.description,
      },
    };
  }

  return {
    kind: "result",
    result: { state, message: "You don't see that here." },
  };
}

export function applyExamineSideEffects(
  state: GameState,
  item: Item,
): GameState {
  if (item.id === "FallenCorpse") {
    return markSeenSelf(state);
  }

  return state;
}

export function tryHandleSpecialExamine(
  ctx: ExamineItemContext,
): ActionResult | null {
  const handler = SPECIAL_EXAMINE_HANDLERS.find((entry) => entry.matches(ctx.item));
  return handler ? handler.handle(ctx) : null;
}

export function buildExamineDescription(
  state: GameState,
  item: Item,
): string {
  let itemDesc = item.describe
    ? item.describe(state, item, {
        kind: "examine",
        roomId: state.player.roomId,
      })
    : item.meta?.conditionalDescription &&
        (state.worldState.conditionalTriggers?.[`searched-${item.id}`] === false ||
          state.worldState.conditionalTriggers?.[`searched-${item.id}`] === undefined)
      ? item.meta.conditionalDescription
      : item.description?.trim() || "You see nothing special.";

  if (item.isContainer && state.itemState.containerFilled[item.id]) {
    itemDesc += ` The ${item.name} is filled with ${state.itemState.containerFilled[item.id]}.`;
  } else if (item.isContainer && isItemOpen(state, item.id)) {
    const containerNames = (state.itemState.containerContents[item.id] ?? [])
      .map((itemId) => getItemById(state, itemId)?.name)
      .filter((name): name is string => Boolean(name))
      .join(", ");

    itemDesc += ` Inside the ${item.name} you see ${containerNames}.`;
  }

  return itemDesc;
}

export function buildGenericExamineResult(
  ctx: ExamineItemContext,
): ActionResult {
  const itemDesc = buildExamineDescription(ctx.state, ctx.item);
  const ex = ctx.item.overrides?.examine;

  if (!ex) {
    return {
      state: ctx.withImmediateGossip(ctx.state),
      message: itemDesc,
    };
  }

  if (typeof ex === "string") {
    return {
      state: ctx.withImmediateGossip(ctx.state),
      message: ex.trim() || itemDesc,
    };
  }

  const out = ex({ item: ctx.item, state: ctx.state });

  if (typeof out === "string") {
    return {
      state: ctx.withImmediateGossip(ctx.state),
      message: out.trim() || itemDesc,
    };
  }

  const nextState = out.state ?? ctx.state;

  if (ctx.item.id === "Cooler") {
    const coolerSetting = nextState.itemState.itemSettings["Cooler"];
    const mode =
      coolerSetting && coolerSetting.kind === "cooler"
        ? coolerSetting.mode
        : "off";

    return {
      state: nextState,
      overlay: withPostCloseNotifications(
        {
          kind: "cooler" as const,
          mode,
        },
        ctx.postCloseNotifications,
      ),
    };
  }

  return {
    state: ctx.withImmediateGossip(nextState),
    message: (out.message ?? itemDesc).trim() || itemDesc,
  };
}
