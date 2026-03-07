import { resolveDoorByNoun, resolveItemByNoun } from "@game/rules/scope";
import { buildRoomDescription } from "@game/text/roomDescription";
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
