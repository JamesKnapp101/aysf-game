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
  if (
    state.worldState.darkRooms[room.id] &&
    state.player.statusEffects.filter((se) => se.id === "nightvision-active")
      ?.length === 0
  ) {
    return "It's pitch black in here, you can't see a thing.";
  }

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

  parts.push(`${room.description.trim()}`);

  if (sceneryItems.length > 0) {
    const sceneryText = sceneryItems
      .map((item) => item.sceneryDescription?.trim())
      .filter(Boolean)
      .join("\n\n");
    if (sceneryText) parts.push(sceneryText);
  }

  if (doorsHere.length > 0) {
    const doorText = doorsHere
      .map((door) => getDoorDescriptionForRoom(door, roomId))
      .filter((t): t is string => Boolean(t && t.trim()))
      .join("\n\n");
    if (doorText) parts.push(doorText);
  }

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

  const seen = state.itemState.pickedUpByPlayer ?? {};
  const freshItems = nonSceneryItems.filter(
    (it) => Boolean(it.initialDescription?.trim()) && !seen[it.id]
  );

  if (freshItems.length > 0) {
    const initialText = freshItems
      .map((it) => it.initialDescription!.trim())
      .join("\n\n");
    parts.push(initialText);
  }

  const listItems = nonSceneryItems.filter(
    (it) => !freshItems.some((f) => f.id === it.id)
  );

  if (listItems.length > 0) {
    const names = listItems.map((item) => item.name).join(", ");
    parts.push(`You can also see ${names}.`);
  }

  return parts.join("\n\n");
}
