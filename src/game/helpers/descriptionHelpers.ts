import { isItemOpen } from "@game/rules/containers";
import { formatNameList } from "@game/rules/items";
import {
  getContainerContentsItems,
  getSurfaceItems,
} from "@game/selectors/containerSelectors";
import { getItemsInRoom } from "@game/selectors/roomSelectors";
import { GameState } from "@game/types/gameTypes";
import { DescriptionContext, Item } from "@game/types/itemTypes";
import { canPlayerSeeInRoom } from "./visibilityHelpers";

export function getItemDescription(
  state: GameState,
  item: Item,
  ctx: DescriptionContext,
): string {
  if (item.describe) return item.describe(state, item, ctx);
  return item.description ?? "";
}

export function getItemSceneryDescription(
  state: GameState,
  item: Item,
  ctx: DescriptionContext,
): string {
  if (item.describeScenery) return item.describeScenery(state, item, ctx);
  return item.sceneryDescription ?? "";
}

export function getItemNpcDescription(
  state: GameState,
  item: Item,
  ctx: DescriptionContext,
): string {
  if (item.npcDescribe) return item.npcDescribe(state, item, ctx);
  return item.npcDescription ?? "";
}

export function getItemInitialDescription(
  state: GameState,
  item: Item,
  ctx: DescriptionContext,
): string {
  if (item.describeInitial) return item.describeInitial(state, item, ctx);
  return item.initialDescription ?? "";
}

export function buildLooseRoomItemsDescription(
  state: GameState,
  nonSceneryItems: Item[],
  ctx: Extract<DescriptionContext, { kind: "npc" }>,
): string {
  const parts: string[] = [];

  // Fresh initial descriptions (non-scenery)
  const seen = state.itemState.pickedUpByPlayer ?? {};
  const freshItems = nonSceneryItems.filter(
    (it) => Boolean(it.initialDescription?.trim()) && !seen[it.id],
  );

  if (freshItems.length > 0) {
    parts.push(
      freshItems.map((it) => it.initialDescription!.trim()).join("\n\n"),
    );
  }

  // Basic listing, with richer prose for animate NPCs when provided.
  const listItems = nonSceneryItems.filter(
    (it) => !freshItems.some((f) => f.id === it.id),
  );
  const describedNpcIds = new Set<string>();
  const npcDescriptions: string[] = [];

  for (const item of listItems) {
    if (item.itemCategory !== "animate") continue;

    const description = getItemNpcDescription(state, item, ctx).trim();
    if (!description) continue;

    describedNpcIds.add(item.id);
    npcDescriptions.push(description);
  }

  if (npcDescriptions.length > 0) {
    parts.push(npcDescriptions.join("\n\n"));
  }

  const genericListItems = listItems.filter(
    (item) => !describedNpcIds.has(item.id),
  );

  if (genericListItems.length > 0) {
    const names = genericListItems.map(
      (it) => it.named?.(state, it) ?? it.name,
    );

    if (names.length === 1) {
      parts.push(`There is ${names[0]} here.`);
    } else {
      parts.push(`There are ${formatNameList(names)} here.`);
    }
  }

  return parts.join("\n\n");
}

export function buildRoomItemsDescription(
  state: GameState,
  roomId: string,
): string {
  if (!canPlayerSeeInRoom(state, roomId)) return "";

  const rawItemsHere = getItemsInRoom(state, roomId);
  const itemsHere = Array.from(
    new Map(rawItemsHere.map((it) => [it.id, it])).values(),
  );

  const nonSceneryItems = itemsHere.filter(
    (item) => item.itemCategory !== "scenery",
  );

  const parts: string[] = [];

  const looseItemText = buildLooseRoomItemsDescription(
    state,
    nonSceneryItems,
    {
      kind: "npc",
      mode: "log",
      roomId,
    },
  );

  if (looseItemText) {
    parts.push(looseItemText);
  }

  // Things in other things
  const containersHere = itemsHere.filter((item) => item.isContainer);
  const containerLines: string[] = [];

  for (const container of containersHere) {
    if (!isItemOpen(state, container.id)) continue;

    const contents = getContainerContentsItems(state, container);
    if (contents.length === 0) continue;

    const names = contents.map((c) => c.named?.(state, c) ?? c.name);
    const list = formatNameList(names);
    containerLines.push(
      `Inside the ${container.name.toLowerCase()} you can see ${list}.`,
    );
  }

  if (containerLines.length > 0) parts.push(containerLines.join(" "));

  // Things on other things
  const surfacesHere = itemsHere.filter((item) => item.isSurface);
  const surfaceLines: string[] = [];

  for (const surface of surfacesHere) {
    const contents = getSurfaceItems(state, surface);
    if (contents.length === 0) continue;

    const names = contents.map((c) => c.named?.(state, c) ?? c.name);
    const list = formatNameList(names);
    surfaceLines.push(
      `On the ${surface.name.toLowerCase()} you can see ${list}.`,
    );
  }

  if (surfaceLines.length > 0) parts.push(surfaceLines.join(" "));

  return parts.join("\n\n");
}
