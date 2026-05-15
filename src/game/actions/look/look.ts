import { resolveDoorByNoun, resolveItemByNoun } from "@game/rules/scope";
import { buildRoomDescription } from "@game/text/roomDescription";
import { formatNameList, updateItemLocation } from "@game/rules/items";
import { getItemById } from "@game/selectors/itemSelectors";
import type { ActionResult } from "../../types/actionsTypes";
import type { GameState } from "../../types/gameTypes";
import type { Item } from "../../types/itemTypes";
import type { ParsedCommand } from "../../types/parserTypes";
import { doExamine } from "../examine/examine";

function getLookThroughResult(state: GameState, item: Item): ActionResult {
  const override = item.overrides?.lookthrough;
  if (typeof override === "string") {
    return { state, message: override, consumesTurn: false };
  }

  if (typeof override === "function") {
    const out = override({ item, state });
    if (typeof out === "string") {
      return { state, message: out, consumesTurn: false };
    }

    return {
      state: out?.state ?? state,
      message: out?.message,
      consumesTurn: out?.consumesTurn ?? false,
    };
  }

  if (item.describeLookThrough) {
    return {
      state,
      message: item.describeLookThrough(state, item, {
        kind: "lookThrough",
        roomId: state.player.roomId,
      }),
      consumesTurn: false,
    };
  }

  if (typeof item.lookThroughDescription === "string") {
    return { state, message: item.lookThroughDescription, consumesTurn: false };
  }

  return {
    state,
    message: "You can't see anything useful through that.",
    consumesTurn: false,
  };
}

function getLookUnderResult(
  state: GameState,
  item: Item,
  cmd: ParsedCommand,
): ActionResult {
  const hiddenIds = state.itemState.underContents[item.id] ?? [];
  const hiddenItems = hiddenIds
    .map((itemId) => getItemById(state, itemId))
    .filter((hiddenItem): hiddenItem is Item => Boolean(hiddenItem));

  if (hiddenItems.length > 0) {
    let next = state;
    for (const hiddenItem of hiddenItems) {
      next = updateItemLocation(next, hiddenItem.id, state.player.roomId);
    }

    next = {
      ...next,
      itemState: {
        ...next.itemState,
        underContents: {
          ...next.itemState.underContents,
          [item.id]: hiddenIds.filter(
            (hiddenId) =>
              !hiddenItems.some((hiddenItem) => hiddenItem.id === hiddenId),
          ),
        },
        revealedUnder: {
          ...next.itemState.revealedUnder,
          [item.id]: true,
        },
      },
    };

    const names = formatNameList(
      hiddenItems.map((hiddenItem) => hiddenItem.name),
    );
    return {
      state: next,
      message: `You look under the ${item.name} and find ${names}.`,
      consumesTurn: false,
    };
  }

  const override = item.overrides?.lookunder;
  if (typeof override === "string") {
    return { state, message: override, consumesTurn: false };
  }

  if (typeof override === "function") {
    const out = override({ item, state, cmd });
    if (typeof out === "string") {
      return { state, message: out, consumesTurn: false };
    }

    return {
      state: out?.state ?? state,
      message: out?.message,
      consumesTurn: out?.consumesTurn ?? false,
    };
  }

  return {
    state,
    message: `You don't see anything under the ${item.name}.`,
    consumesTurn: false,
  };
}

export function doLook(state: GameState, cmd: ParsedCommand): ActionResult {
  if (cmd.type !== "action" || cmd.verb !== "look") {
    return { state, message: "You can't do that." };
  }

  const direct = cmd.direct?.trim();
  const indirect = cmd.indirect?.trim();
  const preposition = cmd.preposition?.trim();
  const next = state;

  if (preposition === "through") {
    const target = indirect ?? direct;
    if (!target) {
      return { state, message: "Look through what?", consumesTurn: false };
    }

    const item = resolveItemByNoun(state, target);
    if (item) {
      const result = getLookThroughResult(next, item);
      return {
        ...result,
        message: result.message?.trim(),
      };
    }

    const door = resolveDoorByNoun(state, target);
    if (door) {
      return {
        state: next,
        message: "You can't see anything useful through that.",
        consumesTurn: false,
      };
    }

    return {
      state: next,
      message: "You don't see that here.",
      consumesTurn: false,
    };
  }

  if (preposition === "under") {
    const target = indirect ?? direct;
    if (!target) {
      return { state: next, message: "Look under what?", consumesTurn: false };
    }

    const item = resolveItemByNoun(state, target);
    if (!item) {
      return {
        state: next,
        message: "You don't see that here.",
        consumesTurn: false,
      };
    }

    const result = getLookUnderResult(next, item, cmd);
    return {
      ...result,
      message: result.message?.trim(),
    };
  }

  if (!direct && !indirect) {
    if (preposition) {
      return {
        state: next,
        message: `Look ${preposition} what?`,
        consumesTurn: false,
      };
    }

    return {
      state: next,
      message: buildRoomDescription(state, state.player.roomId, {
        mode: "panel",
        forceFull: true,
      }),
      consumesTurn: false,
    };
  }

  return {
    ...doExamine(next, {
      ...cmd,
      type: "action",
      verb: "examine",
      direct: direct ?? indirect,
    }),
    consumesTurn: false,
  };
}
