import { isItemOpen } from "../rules/containers";
import { formatNameList } from "../rules/items";
import { getContainerContentsItems } from "../selectors/containerSelectors";
import {
  getDoorDescriptionForRoom,
  getVisibleDoorsInRoom,
} from "../selectors/doorSelectors";
import { getItemsInRoom } from "../selectors/roomSelectors";
import type { GameState } from "../types/gameTypes";

export function buildRoomDescription(state: GameState, roomId: string): string {
  const room = state.world.rooms.find((room) => room.id === roomId);
  if (!room) return "You are nowhere. (Bug: room not found.)";

  // 0) Items in room, deduped by id
  const rawItemsHere = getItemsInRoom(state, roomId);
  const itemsHere = Array.from(
    new Map(rawItemsHere.map((it) => [it.id, it])).values()
  );

  const sceneryItems = itemsHere.filter(
    (item) => item.itemCategory === "scenery"
  );
  const nonSceneryItems = itemsHere.filter(
    (item) => item.itemCategory !== "scenery"
  );

  const doorsHere = getVisibleDoorsInRoom(state, roomId);

  const parts: string[] = [];

  // 1) Base room description
  parts.push(`${room.description.trim()}`);

  // 2) Scenery item descriptions
  if (sceneryItems.length > 0) {
    const sceneryText = sceneryItems
      .map((item) => item.sceneryDescription?.trim())
      .filter(Boolean)
      .join("\n\n");
    if (sceneryText) {
      parts.push(sceneryText);
    }
  }

  // 3) Door descriptions
  if (doorsHere.length > 0) {
    const doorText = doorsHere
      .map((door) => getDoorDescriptionForRoom(door, roomId))
      .filter((t): t is string => Boolean(t && t.trim()))
      .join("\n\n");

    if (doorText) {
      parts.push(doorText);
    }
  }

  // 4) Open containers + their contents (based on deduped itemsHere)
  const containersHere = itemsHere.filter((item) => item.isContainer);
  const containerLines: string[] = [];

  for (const container of containersHere) {
    if (!isItemOpen(state, container.id)) continue;

    const contents = getContainerContentsItems(state, container);
    if (contents.length === 0) continue;

    const names = contents.map((c) => c.name);
    const list = formatNameList(names);

    containerLines.push(
      `Inside the ${container.name.toLowerCase()} you can see ${list}.`
    );
  }

  if (containerLines.length > 0) {
    parts.push(containerLines.join(" "));
  }

  // 5) Non-scenery items list (stuff on the floor / not scenery)
  if (nonSceneryItems.length > 0) {
    const names = nonSceneryItems.map((item) => item.name).join(", ");
    parts.push(`You can also see ${names}.`);
  }

  return parts.join("\n\n");
}
