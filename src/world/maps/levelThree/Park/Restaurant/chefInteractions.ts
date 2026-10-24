import { queueAfterRoomDescription } from "@game/helpers/gameHelpers";
import { resolveItemByNoun } from "@game/rules/scope";
import { getItemsInRoom } from "@game/selectors/roomSelectors";
import type { ActionResult } from "@game/types/actionsTypes";
import type { ScriptedEvent } from "@game/types/eventTypes";
import type { GameState } from "@game/types/gameTypes";
import type { Item, ItemCommandOverrideContext } from "@game/types/itemTypes";
import type { ParsedCommand } from "@game/types/parserTypes";
import { extractChefSample } from "./chefSample";

const HEAD_CUT_REFUSAL = `The chef's eyes, though dim, implore you.\n\n"Must you? I have so little..."`;
const INFECTED_IDLE_ACTIONS = [
  `"You...it's in you, too...I can feel it..."`,
  `"It's in you...I feel it...find a way to stop it...or end up...like me..."`,
];

function canChefSpeak(state: GameState, chef: Item): boolean {
  return chef.meta?.isAlive === true && !state.itemState.frozenItems[chef.id];
}

export function getChefIdleActions(state: GameState, chef: Item): string[] {
  if (!canChefSpeak(state, chef)) return [];
  const original = chef.idleActions ?? [];
  return state.player.statusEffects.some((effect) => effect.id === "syndrome x")
    ? [...original, ...INFECTED_IDLE_ACTIONS]
    : original;
}

/** Head/possessive grammar stays local; ordinary CUT still takes samples. */
function headCutTarget(cmd: ParsedCommand): string | undefined {
  if (cmd.type !== "action" || !["cut", "sever", "decapitate"].includes(cmd.verb))
    return undefined;
  const target = cmd.raw.trim().toLowerCase().replace(/\s+/g, " ")
    .replace(/^(?:cut|carve|slice|sever|decapitate) /, "")
    .replace(/ with .+$/, "")
    .replace(/^off /, "")
    .replace(/ off$/, "")
    .replace(/^(?:the|a|an) /, "");
  if (cmd.verb === "decapitate") return target;
  if (target === "head") return "head";
  const owner = /^(.*?)['’]s head$/.exec(target)?.[1]
    ?? /^head (?:of|from|off) (.+)$/.exec(target)?.[1]
    ?? /^(.+) head$/.exec(target)?.[1];
  return owner?.replace(/^(?:the|a|an) /, "");
}

export function cutChef(context: ItemCommandOverrideContext): ActionResult {
  return headCutTarget(context.cmd)
    ? { state: context.state, message: HEAD_CUT_REFUSAL }
    : extractChefSample(context);
}

export function handleChefHeadCut(
  state: GameState,
  cmd: ParsedCommand,
): ActionResult | undefined {
  const target = headCutTarget(cmd);
  if (!target) return undefined;
  const chef = resolveItemByNoun(state, target);
  if (chef?.id !== "DoomedChef") return undefined;
  return chef.overrides?.cut?.({ state, item: chef, cmd });
}

export const chefScriptedEvents: ScriptedEvent[] = [
  {
    id: "doomed_chef_walk_in_entry",
    once: false,
    when: (state, ctx) =>
      ctx.kind === "onEnterRoom" &&
      ctx.roomId === "WalkIn" &&
      ctx.fromRoomId !== ctx.roomId &&
      getItemsInRoom(state, "WalkIn").some(
        (item) => item.id === "DoomedChef" && canChefSpeak(state, item),
      ),
    run: (state) => queueAfterRoomDescription(
      state,
      `Something stirs in the freezer.\n\n"Hello?" a weak voice calls. "Who is there..?"`,
    ),
  },
];
