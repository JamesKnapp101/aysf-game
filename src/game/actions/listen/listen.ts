import { tryListen } from "@game/actions/listen/tryListen";
import {
  collectTeaFromItemResult,
  queueGossipNotification,
} from "@game/rules/gossip";
import { resolveItemByNoun } from "@game/rules/scope";
import type { ActionResult } from "../../types/actionsTypes";
import type { GameState } from "../../types/gameTypes";
import type { ParsedCommand } from "../../types/parserTypes";

export function doListen(state: GameState, cmd: ParsedCommand): ActionResult {
  if (cmd.type !== "action" || cmd.verb !== "listen") {
    return { state, message: "You can't do that." };
  }

  const direct = cmd.direct?.trim();
  const indirect = cmd.indirect?.trim();

  if (!direct && !indirect) {
    return { state, message: "Listen to what?" };
  }
  const listenee = direct ?? indirect ?? "unknown";
  const item = resolveItemByNoun(state, listenee);

  if (item) {
    const teaResult = collectTeaFromItemResult(state, item);
    const next = queueGossipNotification(
      teaResult.state,
      teaResult.obtainedNewTea,
    );
    const listenOverride = item.overrides?.listen;

    if (typeof listenOverride === "string") {
      return {
        state: next,
        message: listenOverride,
      };
    }

    if (typeof listenOverride === "function") {
      const out = listenOverride({ item, state: next });

      if (typeof out === "string") {
        return {
          state: next,
          message: out,
        };
      }

      return {
        state: out?.state ?? next,
        message: out?.message ?? "It doesn't make any sound.",
      };
    }

    return {
      state: next,
      message: "It doesn't make any sound.",
    };
  }

  return tryListen(state, listenee);
}
