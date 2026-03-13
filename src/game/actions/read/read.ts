import {
  appendGossipNotice,
  collectTeaFromItemResult,
} from "@game/rules/gossip";
import { removeFromAllBuckets } from "@game/rules/state";
import { resolveItemByNoun } from "../../rules/scope";
import type { ActionResult } from "../../types/actionsTypes";
import type { GameState, PlayerLogEntry } from "../../types/gameTypes";
import type { ParsedCommand } from "../../types/parserTypes";

export function doRead(state: GameState, cmd: ParsedCommand): ActionResult {
  if (cmd.type !== "action" || cmd.verb !== "read") {
    return { state, message: "You can't do that." };
  }

  const direct = cmd.direct?.trim();
  if (!direct) {
    return { state, message: "Read what?" };
  }

  const item = resolveItemByNoun(state, direct);
  if (!item || !item.isReadable) {
    return { state, message: "There's nothing to read." };
  }

  const readableText =
    typeof item.readableText === "function"
      ? item.readableText(state, item)
      : item.readableText;
  const text = readableText?.trim();
  if (!text) {
    return { state, message: `The ${item.name} doesn't say anything useful.` };
  }

  const isLoggable = item.isLoggable === true;
  const category = item.itemCategory;

  const teaResult = collectTeaFromItemResult(state, item);
  let next: GameState = teaResult.state;
  let postCloseMessage: string | undefined;

  if (isLoggable) {
    const entry: PlayerLogEntry = {
      source: item.name ?? item.id,
      title: item.readableTitle ?? item.name ?? "Read",
      loggedAtTurn: state.moves,
      body: text,
    };

    next = {
      ...next,
      player: {
        ...next.player,
        log: [...next.player.log, entry],
      },
    };

    postCloseMessage =
      category === "collectable"
        ? "You log the message for future reference, then discard the original."
        : "You log the message for future reference.";
  }

  if (category !== "scenery" && isLoggable && category === "collectable") {
    next = {
      ...next,
      player: {
        ...next.player,
        inventory: removeFromAllBuckets(next.player.inventory, item.id),
      },
      world: {
        ...next.world,
        items: next.world.items.map((it) =>
          it.id === item.id ? { ...it, location: "unknown" } : it,
        ),
      },
    };
  }

  postCloseMessage = appendGossipNotice(
    postCloseMessage,
    teaResult.obtainedNewTea,
  );

  return {
    state: next,
    overlay: {
      kind: "reader",
      title: item.name ?? "Read",
      body: text,
      sourceItemId: item.id,
      postCloseMessage,
    },
  };
}
