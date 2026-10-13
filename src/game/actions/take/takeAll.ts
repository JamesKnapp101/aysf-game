import { canPlayerSeeInRoom } from "@game/helpers/visibilityHelpers";
import { getNpcForItem } from "@game/npcRegistry";
import { formatNameList } from "@game/rules/items";
import { inventoryHas } from "@game/rules/state";
import {
  getContainerContentsItems,
  getSurfaceItems,
} from "@game/selectors/containerSelectors";
import { getItemsInCurrentRoom } from "@game/selectors/roomSelectors";
import type { ActionResult } from "@game/types/actionsTypes";
import type { GameState } from "@game/types/gameTypes";
import type { Item } from "@game/types/itemTypes";
import { canReachContainerContents, getTakeHolders } from "./takeScope";
import { tryTakeItem } from "./tryTakeItem";

function getCandidates(state: GameState): Item[] {
  if (!canPlayerSeeInRoom(state, state.player.roomId)) return [];

  const loose = getItemsInCurrentRoom(state);
  const looseIds = new Set(loose.map((item) => item.id));
  const hostIsVisible = (item: Item) =>
    looseIds.has(item.id) || inventoryHas(state.player.inventory, item.id);
  // Match single TAKE's scope and precedence, but never descend into nested,
  // closed, under, or searchable contents. Contained hosts aren't loose objects.
  const surfaces = getTakeHolders(state, "isSurface").filter(hostIsVisible);
  const containers = getTakeHolders(state, "isContainer").filter(
    (item) => hostIsVisible(item) && canReachContainerContents(state, item),
  );
  const items = [
    ...loose,
    ...surfaces.flatMap((item) => getSurfaceItems(state, item)),
    ...containers.flatMap((item) => getContainerContentsItems(state, item)),
  ];

  return [...new Map(items.map((item) => [item.id, item])).values()].filter(
    (item) =>
      item.itemCategory === "collectable" &&
      item.meta?.isAlive !== true &&
      !getNpcForItem(item) &&
      !inventoryHas(state.player.inventory, item.id),
  );
}

export function doTakeAll(state: GameState): ActionResult {
  // Snapshot once: acquisitions may reveal things, but that isn't a search.
  const candidates = getCandidates(state);
  let next = state;
  const messages: string[] = [];
  let ordinaryNames: string[] = [];
  const flushSummary = () => {
    if (ordinaryNames.length) {
      messages.push(`You take ${formatNameList(ordinaryNames)}.`);
      ordinaryNames = [];
    }
  };

  for (const candidate of candidates) {
    if (next.worldState.gameOver || next.player.roomId !== state.player.roomId) {
      break;
    }
    // Recheck visibility, reachability, category and inventory after each effect.
    const item = getCandidates(next).find((item) => item.id === candidate.id);
    if (!item) continue;

    const name = item.named?.(next, item) ?? item.name;
    const result = tryTakeItem(next, { itemId: item.id });
    next = result.state;
    if (
      result.message === "Taken." &&
      inventoryHas(next.player.inventory, item.id)
    ) {
      ordinaryNames.push(name);
    } else {
      flushSummary();
      if (result.message) messages.push(`${name}: ${result.message}`);
    }
  }
  flushSummary();

  // Acquisition effects run per item; handleCommand owns the single world turn.
  return {
    state: next,
    message: messages.join("\n\n") || "There's nothing here you can take.",
    consumesTurn: true,
  };
}
