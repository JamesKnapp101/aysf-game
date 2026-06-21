import { appendLog } from "@game/engine/log";
import { removeItemFromPlacementLists } from "@game/helpers/itemPlacement";
import { inventoryHas, removeFromAllBuckets } from "@game/rules/state";
import type { GameState } from "@game/types/gameTypes";
import type { Item, ItemState } from "@game/types/itemTypes";

export const INITIAL_PLAYER_HUSK_NUMBER = 8;
export const PLAYER_HUSK_LIFESPAN_TURNS = 20;

export type PlayerHuskMeta = {
  createdAtMove?: number;
  number: number;
  turnsRemaining: number;
};

export function formatPlayerHuskNumber(number: number): string {
  return Math.max(0, Math.floor(number)).toString().padStart(3, "0");
}

export function createPlayerHuskMeta(
  number: number,
  createdAtMove?: number,
): PlayerHuskMeta {
  return {
    createdAtMove,
    number,
    turnsRemaining: PLAYER_HUSK_LIFESPAN_TURNS,
  };
}

export function getPlayerHuskMeta(item: Item): PlayerHuskMeta | undefined {
  const candidate = item.meta?.playerHusk as
    | Partial<PlayerHuskMeta>
    | undefined;
  if (!candidate || typeof candidate.number !== "number") return undefined;
  if (typeof candidate.turnsRemaining !== "number") return undefined;

  return candidate as PlayerHuskMeta;
}

export function getPlayerHuskPlateDescription(number: number): string {
  return `A tiny number plate fixed to its back displays ${formatPlayerHuskNumber(number)}.`;
}

export function getPlayerHuskNumberVocab(number: number): string[] {
  const naturalNumber = Math.max(0, Math.floor(number)).toString();
  const plateNumber = formatPlayerHuskNumber(number);
  return [
    `husk ${naturalNumber}`,
    `husk ${plateNumber}`,
    `${naturalNumber}`,
    `${plateNumber}`,
  ];
}

function withoutKey<T>(
  record: Record<string, T>,
  itemId: string,
): Record<string, T> {
  const next = { ...record };
  delete next[itemId];
  return next;
}

function removeHuskFromPlacements(
  lists: Record<string, string[]>,
  itemId: string,
): Record<string, string[]> {
  return withoutKey(removeItemFromPlacementLists(lists, itemId), itemId);
}

function removeHuskFromItemState(
  itemState: ItemState,
  itemId: string,
): ItemState {
  const attachedTo = withoutKey(itemState.attachedTo, itemId);
  for (const [childId, hostId] of Object.entries(attachedTo)) {
    if (hostId === itemId) delete attachedTo[childId];
  }

  return {
    ...itemState,
    activeGelCameras: withoutKey(itemState.activeGelCameras, itemId),
    animalDisposition: withoutKey(itemState.animalDisposition, itemId),
    attachedTo,
    containerContents: removeHuskFromPlacements(
      itemState.containerContents,
      itemId,
    ),
    containerFilled: removeHuskFromPlacements(
      itemState.containerFilled,
      itemId,
    ),
    frozenItems: withoutKey(itemState.frozenItems, itemId),
    itemRoomId: withoutKey(itemState.itemRoomId, itemId),
    itemSettings: withoutKey(itemState.itemSettings, itemId),
    messagesPlayed: withoutKey(itemState.messagesPlayed, itemId),
    mindGunMemoryIndex: withoutKey(itemState.mindGunMemoryIndex, itemId),
    openItems: withoutKey(itemState.openItems, itemId),
    pickedUpByPlayer: withoutKey(itemState.pickedUpByPlayer, itemId),
    revealedUnder: withoutKey(itemState.revealedUnder, itemId),
    searchableContents: removeHuskFromPlacements(
      itemState.searchableContents,
      itemId,
    ),
    surfaceContents: removeHuskFromPlacements(
      itemState.surfaceContents,
      itemId,
    ),
    underContents: removeHuskFromPlacements(itemState.underContents, itemId),
  };
}

function dissolvePlayerHusk(
  state: GameState,
  item: Item,
  meta: PlayerHuskMeta,
): GameState {
  const isCarried = inventoryHas(state.player.inventory, item.id);
  const roomId = state.itemState.itemRoomId[item.id] ?? item.location;
  const isInPlayerRoom = !isCarried && roomId === state.player.roomId;

  let next: GameState = {
    ...state,
    player: {
      ...state.player,
      inventory: removeFromAllBuckets(state.player.inventory, item.id),
    },
    world: {
      ...state.world,
      items: state.world.items.filter((candidate) => candidate.id !== item.id),
    },
    itemState: removeHuskFromItemState(state.itemState, item.id),
  };

  if (isCarried) {
    next = appendLog(
      next,
      `The lifeless husk marked ${formatPlayerHuskNumber(meta.number)} twitches inside your inventory, softens into an oily smear, and dissolves into nothing.`,
    );
  } else if (isInPlayerRoom) {
    next = appendLog(
      next,
      `The lifeless husk marked ${formatPlayerHuskNumber(meta.number)} twitches, collapses into an oily smear, and dissolves into nothing.`,
    );
  }

  return next;
}

export function tickPlayerHusks(state: GameState): GameState {
  let next = state;
  const husks = state.world.items.filter((item) => getPlayerHuskMeta(item));

  for (const husk of husks) {
    const currentItem = next.world.items.find((item) => item.id === husk.id);
    if (!currentItem) continue;

    const meta = getPlayerHuskMeta(currentItem);
    if (!meta || meta.createdAtMove === next.moves) continue;

    const turnsRemaining = meta.turnsRemaining - 1;
    if (turnsRemaining <= 0) {
      next = dissolvePlayerHusk(next, currentItem, meta);
      continue;
    }

    next = {
      ...next,
      world: {
        ...next.world,
        items: next.world.items.map((item) =>
          item.id === currentItem.id
            ? {
                ...item,
                meta: {
                  ...item.meta,
                  playerHusk: { ...meta, turnsRemaining },
                },
              }
            : item,
        ),
      },
    };
  }

  return next;
}
