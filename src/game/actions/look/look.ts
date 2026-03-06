import { resolveDoorByNoun, resolveItemByNoun } from "@game/rules/scope";
import { buildRoomDescription } from "@game/text/roomDescription";
import type { ActionResult } from "../../types/actionsTypes";
import type { GameState } from "../../types/gameTypes";
import type { Item } from "../../types/itemTypes";
import type { ParsedCommand } from "../../types/parserTypes";
import { doExamine } from "../examine/examine";

function getLookThroughText(state: GameState, item: Item): string | undefined {
  if (item.describeLookThrough) {
    return item.describeLookThrough(state, item, {
      kind: "lookThrough",
      roomId: state.player.roomId,
    });
  }

  if (typeof item.lookThroughDescription === "string") {
    return item.lookThroughDescription;
  }

  const override = item.overrides?.lookthrough;
  if (typeof override === "string") {
    return override;
  }

  if (typeof override === "function") {
    const out = override({ item, state });
    if (typeof out === "string") return out;
    return out?.message;
  }

  return undefined;
}

export function doLook(state: GameState, cmd: ParsedCommand): ActionResult {
  if (cmd.type !== "action" || cmd.verb !== "look") {
    return { state, message: "You can't do that." };
  }

  const direct = cmd.direct?.trim();
  const indirect = cmd.indirect?.trim();
  const preposition = cmd.preposition?.trim();
  let next = state;

  if (preposition === "through") {
    const target = indirect ?? direct;
    if (!target) {
      return { state, message: "Look through what?", consumesTurn: false };
    }

    const item = resolveItemByNoun(state, target);
    if (item) {
      const text = getLookThroughText(state, item)?.trim();
      return {
        state: next,
        message: text || "You can't see anything useful through that.",
        consumesTurn: false,
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
