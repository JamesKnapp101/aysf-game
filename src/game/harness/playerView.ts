import { getCurrentRoom } from "@game/selectors/roomSelectors";
import { getCurrentMemory, getCurrentScore } from "@game/selectors/scoreSelectors";
import { buildRoomDescription } from "@game/text/roomDescription";
import { getItemById } from "../selectors/itemSelectors";
import {
  describeBodyTemperatureLevel,
  describeSicknessLevel,
  getStatusEffectDiagnostics,
} from "../selectors/statusSelectors";
import { getInventoryCounts, getInventoryItemLabel, getInventoryVisibleContents } from "../text/inventoryPresentation";
import { buildStatusReadings } from "../text/statusPresentation";
import type { Item } from "../types/itemTypes";
import type { GameState } from "@game/types/gameTypes";
import { pendingHeadlessWorldGate } from "../registries/headlessGateRegistry";
import { useUIEffectsStore, useUIOverlayStore } from "../store/store";
import { supportsSimpleOverlay } from "./simpleOverlays";
import { supportsTerminalOverlay } from "./terminalOverlays";
import { supportsCameraGunOverlay } from "./cameraGun";

export const ADAPTER_REQUIRED =
  "This interaction needs a headless gameplay adapter. Reset the session to continue.";

export function playerText(text: string): string {
  return text
    .replace(/\[\[\/?(?:ROOM_NAME|MOVIE_STAGE)\]\]/g, "")
    .trim();
}

/** Full player-visible snapshot; counters are separate from description changes. */
export function currentRoomPresentation(state: GameState) {
  const room = getCurrentRoom(state);
  if (!room.name) throw new Error("Room presentation unavailable.");
  const summary = playerText(`${room.name}\nScore: ${getCurrentScore(state)} | Memory: ${getCurrentMemory(state)}% | Moves: ${state.moves}`);
  const description = playerText(buildRoomDescription(state, room.id, { mode: "panel", forceFull: true }));
  return { summary, description, fullText: playerText(`${summary}\n\n${description}`) };
}

export function currentRoomText(state: GameState, includeDescription = true): string {
  const room = currentRoomPresentation(state);
  return includeDescription ? room.fullText : room.summary;
}

export function inventoryText(state: GameState): string {
  const counts = getInventoryCounts(state);
  const lines = ["Inventory", `Total: ${counts.total}`];
  const listed = new Set<string>();
  function list(item: Item, depth = 0, ancestors = new Set<string>()) {
    if (ancestors.has(item.id)) return;
    const label = getInventoryItemLabel(state, item.id);
    if (!label) return;
    lines.push(`${"  ".repeat(depth)}- ${label}`);
    listed.add(item.id);
    const path = new Set([...ancestors, item.id]);
    for (const child of getInventoryVisibleContents(state, item)) list(child, depth + 1, path);
  }
  for (const [bucket, title] of [["general", "General"], ["badges", "Badges"], ["keys", "Keys"]] as const) {
    lines.push(`${title} (${counts[bucket]}):`);
    const items = state.player.inventory[bucket].flatMap((id) => {
      const item = getItemById(state, id);
      return item ? [item] : [];
    });
    if (!items.length) lines.push("  None.");
    else for (const item of items) list(item);
  }
  const equipped = Object.values(state.itemState.wornByPlayer).flatMap((id) => {
    const item = id && !listed.has(id) ? getItemById(state, id) : undefined;
    return item ? [item] : [];
  });
  if (equipped.length) {
    lines.push("Equipped:");
    for (const item of equipped) list(item);
  }
  return lines.join("\n");
}

export function statusText(state: GameState): string {
  const effects = getStatusEffectDiagnostics(state).map(({ name, message, id, icon }) =>
    `${name === id && icon === "question-marks" ? "Unidentified effect" : name}: ${message}`,
  );
  return [
    "Player status", ...buildStatusReadings(state, useUIEffectsStore.getState().mindFlash !== null),
    "Diagnosis", `General: ${describeSicknessLevel(state)}`,
    `Temperature: ${describeBodyTemperatureLevel(state)}`,
    `Effects: ${effects.length ? effects.join("\n") : "None."}`,
  ].join("\n");
}

// Reader/help overlays are completed immediately. Mounted supported controls
// remain available; every other gameplay UI gate requires an adapter.
export function requiresGameplayAdapter(state: GameState): boolean {
  const effects = useUIEffectsStore.getState();
  const overlay = useUIOverlayStore.getState().overlay;
  return (
    (overlay.kind !== "none" && overlay.kind !== "message-machine" && !supportsSimpleOverlay(overlay.kind) && !supportsTerminalOverlay(overlay.kind) && !supportsCameraGunOverlay(overlay.kind)) ||
    effects.mindFlash !== null ||
    effects.organismDeath !== null ||
    effects.syndromeXSignal !== null ||
    pendingHeadlessWorldGate(state) !== undefined
  );
}
