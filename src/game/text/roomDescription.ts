import { isRoomSpotlitByAviary } from "@game/engine/ticks/aviaryTick";
import { getItemSceneryDescription } from "@game/helpers/descriptionHelpers";
import { getAviaryNextSpotlitRoomId } from "src/world/Items/creatures/aviaryOrganisms";
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
};

export function buildRoomDescription(
  state: GameState,
  roomId: string,
  opts: BuildRoomDescriptionOptions = {},
): string {
  const room = state.world.rooms.find((room) => room.id === roomId);
  if (!room) return "You are nowhere. (Bug: room not found.)";

  const isDark = Boolean(state.worldState.darkRooms[room.id]);

  const nightVisionActive = state.player.statusEffects.some(
    (se) => se.id === "nightvision-active",
  );

  const flashlightOn = (() => {
    if (!state.player.inventory.includes("flashlight")) return false;
    const fs = state.itemState.itemSettings["flashlight"];
    return Boolean(fs && "isOn" in fs && fs.isOn === true);
  })();

  const damagedFlashlightOn = (() => {
    if (!state.player.inventory.includes("damagedFlashlight")) return false;
    const fs = state.itemState.itemSettings["damagedFlashlight"];
    return Boolean(
      fs &&
      "isOn" in fs &&
      fs.isOn === true &&
      state.worldState.damagedFlashlight.currentCharge > 1,
    );
  })();

  const canSee =
    !isDark || nightVisionActive || flashlightOn || damagedFlashlightOn;
  isRoomSpotlitByAviary(state, roomId) ||
    getAviaryNextSpotlitRoomId(state) === roomId;
  if (!canSee) return "It's pitch black in here, you can't see a thing.";

  const visitedRooms = state.worldState.visitedRooms ?? {};
  const isFirstVisit = !visitedRooms[roomId];

  const mode: RoomDescriptionMode = opts.mode ?? "log";

  // Panel should always be "full" (include scenery every time)
  // LOOK should always be "full" (even in log)
  const forceFull = Boolean(opts.forceFull) || mode === "panel";

  const rawItemsHere = getItemsInRoom(state, roomId);
  const itemsHere = Array.from(
    new Map(rawItemsHere.map((it) => [it.id, it])).values(),
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

  const sceneryText = sceneryItems
    .map((it) =>
      getItemSceneryDescription(state, it, { kind: "scenery", roomId }),
    )
    .filter((s): s is string => Boolean(s && s.trim()))
    .map((s) =>
      s
        .replace(/\n\n/g, "\n")
        .replace(/[ \t]+\n/g, "\n")
        .replace(/\n[ \t]+/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim(),
    )
    .join(" ")
    .replaceAll("[[newline]]", `\n\n`);

  const token = "[[SCENERY]]";

  // Decide whether this render should include scenery:
  // - full if first visit
  // - OR forced full (panel, or explicit LOOK)
  const includeScenery = forceFull || isFirstVisit;

  // Decide base description text for this render:
  // - On revisit in the LOG, prefer descriptionShort (if provided)
  // - Otherwise use full description
  const useShortBase = !includeScenery && mode === "log" && !isFirstVisit;
  let base = room.describe
    ? room.describe(state, room, {
        kind: "roomBase",
        roomId: room.id,
        mode: "panel",
      })
    : ((useShortBase && room.descriptionShort
        ? room.descriptionShort
        : room.description) ?? "wtf");
  base = base.trim();

  // Apply scenery token rules:
  // - If we include scenery: inject/append it
  // - If we don't: strip token (and do NOT append scenery)
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

  // Things in other things
  const containersHere = itemsHere.filter((item) => item.isContainer);
  const containerLines: string[] = [];

  for (const container of containersHere) {
    if (!isItemOpen(state, container.id)) continue;

    const contents = getContainerContentsItems(state, container);
    if (contents.length === 0) continue;

    const names = contents.map((c) => c.name);
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

    const names = contents.map((c) => c.name);
    const list = formatNameList(names);

    surfaceLines.push(
      `On the ${surface.name.toLowerCase()} you can see ${list}.`,
    );
  }

  if (surfaceLines.length > 0) {
    parts.push(surfaceLines.join(" "));
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

  const seen = state.itemState.pickedUpByPlayer ?? {};
  const freshItems = nonSceneryItems.filter(
    (it) => Boolean(it.initialDescription?.trim()) && !seen[it.id],
  );

  if (freshItems.length > 0) {
    const initialText = freshItems
      .map((it) => it.initialDescription!.trim())
      .join("\n\n");
    parts.push(initialText);
  }

  const listItems = nonSceneryItems.filter(
    (it) => !freshItems.some((f) => f.id === it.id),
  );

  if (listItems.length > 0) {
    if (listItems.length === 1) {
      parts.push(`There is ${listItems[0].name} here.`);
    } else {
      const names = formatNameList(listItems.map((it) => it.name));
      parts.push(`There are ${names} here.`);
    }
  }

  return parts.join("\n\n");
}
