import { pendingHeadlessWorldGate } from "../registries/headlessGateRegistry";
import { useUIEffectsStore, useUIOverlayStore } from "../store/store";
import type { GameState } from "../types/gameTypes";
import type { MissingCapabilityDiagnostic } from "./types";
import { supportsSimpleOverlay } from "./simpleOverlays";
import { supportsTerminalOverlay } from "./terminalOverlays";
import { supportsCameraGunOverlay } from "./cameraGun";

const CATEGORIES: Record<string, MissingCapabilityDiagnostic["category"]> = {
  "power-station-terminal": "menu-controls",
  "reactor-control-terminal": "authentication",
  "hydroponics-admin-terminal": "menu-controls",
  "matter-transmitter": "item-transfer",
  "mens-lockers": "locked-container",
  "womens-lockers": "locked-container",
  "camera-gun-viewer": "remote-view",
  "teleportation-terminal": "travel-selection",
  "3d-printer": "crafting",
  "game-preserve-terminal": "hunt-selection",
  "radio-frequency": "frequency-input",
};

export function missingCapabilityDiagnostic(
  state: GameState, originatingCommand: string | null, triggeringActionExecuted: boolean,
): MissingCapabilityDiagnostic | undefined {
  const overlay = useUIOverlayStore.getState().overlay;
  const effects = useUIEffectsStore.getState();
  const worldGate = pendingHeadlessWorldGate(state);
  let kind: string;
  let category: MissingCapabilityDiagnostic["category"];
  if (overlay.kind !== "none" && overlay.kind !== "message-machine" && !supportsSimpleOverlay(overlay.kind) && !supportsTerminalOverlay(overlay.kind) && !supportsCameraGunOverlay(overlay.kind)) {
    kind = overlay.kind;
    category = CATEGORIES[kind] ?? "unknown-interface";
  } else if (effects.organismDeath || effects.mindFlash || effects.syndromeXSignal) {
    kind = effects.organismDeath ? "organism-death" : effects.mindFlash ? "mind-flash" : "syndrome-x-signal";
    category = "automatic-sequence";
  } else if (worldGate) {
    kind = worldGate;
    category = "suit-navigation";
  } else return undefined;
  return Object.freeze({ overlayKind: kind, originatingCommand, category, triggeringActionExecuted, overlayEntered: true });
}
