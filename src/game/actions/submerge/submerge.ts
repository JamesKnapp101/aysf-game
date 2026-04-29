import { submergeAttachedBadger } from "@game/preserve/preserveAnimals";
import type { ActionResult } from "@game/types/actionsTypes";
import type { GameState } from "@game/types/gameTypes";
import type { ParsedCommand } from "@game/types/parserTypes";

const SUBMERGE_VERBS = new Set(["dive", "submerge", "drown"]);

function isBadgerTarget(value: string | undefined): boolean {
  if (!value) return false;
  return value
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .includes("badger");
}

export function doSubmerge(
  state: GameState,
  cmd: ParsedCommand,
): ActionResult {
  if (cmd.type !== "action" || !SUBMERGE_VERBS.has(cmd.verb)) {
    return { state, message: "You can't do that." };
  }

  if (cmd.verb === "drown" && !isBadgerTarget(cmd.direct)) {
    return { state, message: "Drown what?" };
  }

  return submergeAttachedBadger(state);
}
