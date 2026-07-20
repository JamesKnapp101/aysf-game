import {
  buildLooseRoomItemsDescription,
  buildRoomItemsDescription,
  getItemSceneryDescription,
} from "@game/helpers/descriptionHelpers";
import { canPlayerSeeInRoom } from "../helpers/visibilityHelpers";
import {
  arrangeRegisteredSceneryText,
  getRegisteredAdditionalRoomItems,
  getRegisteredAttachedRoomDescription,
  getRegisteredRoomDescriptionAdditions,
} from "@game/registries/roomDescriptionRegistry";
import { generateTerminalTpadDescription } from "../helpers/gameHelpers";
import { isItemOpen } from "../rules/containers";
import { formatNameList } from "../rules/items";
import {
  getContainerContentsItems,
  getSurfaceItems,
} from "../selectors/containerSelectors";
import {
  getDoorDescriptionForRoom,
  getVisibleDoorsInRoom,
} from "../selectors/doorSelectors";
import { getItemsInRoom } from "../selectors/roomSelectors";
import type { GameState } from "../types/gameTypes";

type RoomDescriptionMode = "log" | "panel";

type BuildRoomDescriptionOptions = {
  mode?: RoomDescriptionMode;
  forceFull?: boolean;
  omitItems?: boolean;
};

type BuildTranscriptRoomDescriptionOptions = {
  isFirstVisit?: boolean;
};

export function buildRoomDescription(
  state: GameState,
  roomId: string,
  opts: BuildRoomDescriptionOptions = {},
): string {
  const room = state.world.rooms.find((room) => room.id === roomId);
  if (!room) return "You are nowhere. (Bug: room not found.)";

  const attachedRoomDescription = getRegisteredAttachedRoomDescription(
    state,
    roomId,
  );
  if (attachedRoomDescription) return attachedRoomDescription;

  const canSee = canPlayerSeeInRoom(state, roomId);

  if (!canSee) return "It's pitch black in here, you can't see a thing.";

  const visitedRooms = state.worldState.visitedRooms ?? {};
  const isFirstVisit = !visitedRooms[roomId];

  const mode: RoomDescriptionMode = opts.mode ?? "log";

  const forceFull = Boolean(opts.forceFull) || mode === "panel";

  const rawItemsHere = getItemsInRoom(state, roomId);
  const baseItemsHere = Array.from(
    new Map(rawItemsHere.map((it) => [it.id, it])).values(),
  );
  const registeredAdditionalItems = getRegisteredAdditionalRoomItems(
    state,
    roomId,
  );
  const itemsHere = Array.from(
    new Map(
      [...baseItemsHere, ...registeredAdditionalItems].map((it) => [
        it.id,
        it,
      ]),
    ).values(),
  );

  const sceneryItems = itemsHere
    .filter((item) => item.itemCategory === "scenery")
    .sort((a, b) => {
      const ao = a.meta?.sceneryDescriptionOrder ?? Number.POSITIVE_INFINITY;
      const bo = b.meta?.sceneryDescriptionOrder ?? Number.POSITIVE_INFINITY;
      if (ao !== bo) return ao - bo;

      const an = a.name.toLowerCase();
      const bn = b.name.toLowerCase();
      if (an !== bn) return an.localeCompare(bn);
      return a.id.localeCompare(b.id);
    });

  const nonSceneryItems = itemsHere.filter(
    (item) => item.itemCategory !== "scenery",
  );

  const doorsHere = getVisibleDoorsInRoom(state, roomId);

  const parts: string[] = [];

  const sceneryEntries = sceneryItems
    .map((item) => ({
      item,
      text: getItemSceneryDescription(state, item, {
        kind: "scenery",
        roomId,
      }),
    }))
    .filter(
      (entry): entry is { item: (typeof sceneryItems)[number]; text: string } =>
        Boolean(entry.text && entry.text.trim()),
    )
    .map((entry) => ({
      ...entry,
      text: entry.text
        .replace(/[ \t]+\n/g, "\n")
        .replace(/\n[ \t]+/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim(),
    }));

  let sceneryText = sceneryEntries.map((entry) => entry.text).join(" ");

  sceneryText = arrangeRegisteredSceneryText(
    roomId,
    sceneryEntries,
    sceneryText,
  );

  sceneryText = sceneryText.replaceAll("[[newline]]", `\n\n`);

  const token = "[[SCENERY]]";

  const includeScenery = forceFull || isFirstVisit;

  const useShortBase = !includeScenery && mode === "log" && !isFirstVisit;
  let base = room.describe
    ? room.describe(state, room, {
        kind: "roomBase",
        roomId: room.id,
        mode,
      })
    : ((useShortBase && room.descriptionShort
        ? room.descriptionShort
        : room.description) ?? "You see nothing notable here.");
  base = base.trim();

  if (includeScenery) {
    if (base.includes(token)) {
      base = base.replace(token, sceneryText ? `${sceneryText}` : " ");
    } else {
      if (sceneryText) base = `${base}\n\n${sceneryText}`;
    }
  } else {
    if (base.includes(token)) base = base.replace(token, "").trim();
  }

  if (base) parts.push(base);

  if (doorsHere.length > 0) {
    const doorText = doorsHere
      .map((door) => getDoorDescriptionForRoom(state, door, roomId))
      .filter((t): t is string => Boolean(t && t.trim()))
      .join("");
    if (doorText) parts.push(doorText);
  }

  // Certain scenery props can be powered up
  const isTpadTerminal = room.id === "TPADTerminal";

  // If we're in TPADTerminal, emit one aggregated description and skip per-disk "onPowered" text.
  if (isTpadTerminal) {
    parts.push(
      generateTerminalTpadDescription(state.worldState.powerRestoredSections),
    );
  } else {
    for (const sceneryItem of sceneryItems) {
      if (sceneryItem.meta?.teleport) {
        const section = sceneryItem.meta.teleport.section;
        const sectionKey =
          section as unknown as keyof typeof state.worldState.powerRestoredSections;
        if (sectionKey && state.worldState.powerRestoredSections[sectionKey]) {
          parts.push(sceneryItem.meta?.onPowered);
        }
      }
      // Other cases go here...
      if (sceneryItem?.meta?.onPowered) {
        const powerKey = sceneryItem.meta
          .powerKey as unknown as keyof typeof state.worldState.powerRestoredSections;
        if (powerKey && state.worldState.powerRestoredSections[powerKey]) {
          parts.push(sceneryItem.meta?.onPowered);
        }
      }
    }
  }

  if (opts.omitItems) {
    return parts.join("\n\n");
  }
  const looseItemText = buildLooseRoomItemsDescription(
    state,
    nonSceneryItems,
    {
      kind: "npc",
      mode,
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

  if (containerLines.length > 0) {
    parts.push(containerLines.join(" "));
  }

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

  if (surfaceLines.length > 0) {
    parts.push(surfaceLines.join(" "));
  }

  parts.push(...getRegisteredRoomDescriptionAdditions(state, roomId));

  return parts.join("\n\n");
}

export function buildTranscriptRoomDescription(
  state: GameState,
  roomId: string,
  opts: BuildTranscriptRoomDescriptionOptions = {},
): string {
  const canSee = canPlayerSeeInRoom(state, roomId);
  if (!canSee) {
    return buildRoomDescription(state, roomId, { mode: "log" });
  }

  const visitedRooms = state.worldState.visitedRooms ?? {};
  const isFirstVisit = opts.isFirstVisit ?? !visitedRooms[roomId];

  if (isFirstVisit) {
    return buildRoomDescription(state, roomId, {
      mode: "panel",
      forceFull: true,
    });
  }

  return buildRoomItemsDescription(state, roomId);
}
