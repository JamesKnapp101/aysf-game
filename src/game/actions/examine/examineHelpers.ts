import { isItemOpen } from "@game/rules/containers";
import {
  tryHandleRegisteredExamine,
  withPostCloseNotifications,
  type ExamineItemContext,
} from "@game/registries/examineRegistry";
import { getItemById } from "@game/selectors/itemSelectors";
import { resolveDoorByNoun, resolveItemByNoun } from "../../rules/scope";
import type { ActionResult } from "../../types/actionsTypes";
import type { GameState } from "../../types/gameTypes";
import type { Item } from "../../types/itemTypes";

type ResolvedExamineTarget =
  | { kind: "item"; item: Item }
  | { kind: "result"; result: ActionResult };

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
  return tryHandleRegisteredExamine(ctx);
}

export function buildExamineDescription(state: GameState, item: Item): string {
  let itemDesc = item.describe
    ? item.describe(state, item, {
        kind: "examine",
        roomId: state.player.roomId,
      })
    : item.meta?.conditionalDescription &&
        (state.worldState.conditionalTriggers?.[`searched-${item.id}`] ===
          false ||
          state.worldState.conditionalTriggers?.[`searched-${item.id}`] ===
            undefined)
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
