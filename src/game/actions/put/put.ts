import { tryPutItem } from "@game/actions/put/tryPutItem";
import {
  GAME_PRESERVE_TROPHY_DAIS_ID,
  handleGamePreserveEmptyHandReturn,
} from "@game/preserve/preserveTrophies";
import { inventoryHas } from "@game/rules/state";
import { resolveItemByNoun } from "../../rules/scope";
import type { ActionResult } from "../../types/actionsTypes";
import type { GameState } from "../../types/gameTypes";
import type { ParsedCommand, Preposition } from "../../types/parserTypes";

type PutPrep = Extract<Preposition, "in" | "into" | "on">;

function normalizePutPrep(p?: Preposition): PutPrep | null {
  if (p === "in" || p === "into" || p === "on") return p;
  return null;
}

export function doPut(state: GameState, cmd: ParsedCommand): ActionResult {
  if (cmd.type !== "action" || cmd.verb !== "put") {
    return { state, message: "You can't do that." };
  }

  const direct = cmd.direct?.trim();
  const indirect = cmd.indirect?.trim();

  if (!direct) {
    return { state, message: "Put what?" };
  }

  const prep = normalizePutPrep(cmd.preposition);
  if (!prep) {
    return {
      state,
      message: "Try: put X in Y, put X into Y, or put X on Y.",
    };
  }

  if (!indirect) {
    return { state, message: "Put it where?" };
  }

  if (prep === "on" && isEmptyHandNoun(direct)) {
    const host = resolveItemByNoun(state, indirect);
    if (host?.id === GAME_PRESERVE_TROPHY_DAIS_ID) {
      return handleGamePreserveEmptyHandReturn(state, state.player.roomId);
    }
  }

  const item = resolveItemByNoun(state, direct);
  if (!item) {
    return { state, message: "You don't see that here." };
  }

  if (!inventoryHas(state.player.inventory, item.id)) {
    return { state, message: "You aren't carrying that." };
  }

  const host = resolveItemByNoun(state, indirect);
  if (!host) {
    return { state, message: "You don't see that here." };
  }

  return tryPutItem(state, {
    itemId: item.id,
    hostId: host.id,
    preposition: prep,
  });
}

function isEmptyHandNoun(value: string): boolean {
  const normalized = value.toLowerCase().trim();
  return [
    "hand",
    "hands",
    "empty hand",
    "empty hands",
    "bare hand",
    "bare hands",
  ].includes(normalized);
}
