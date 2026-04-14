import type { GameState } from "../types/gameTypes";
import type { ItemId } from "../types/ids";
import type { ItemSettings } from "../types/itemTypes";
import {
  type FlashlightSettings,
  getFlashlightSettings as getSharedFlashlightSettings,
  isFlashlightOn as isSharedFlashlightOn,
} from "./flashlightHelpers";

/**
 * Type-safe accessors for item settings to avoid `as any` casts.
 * These functions provide proper type narrowing for discriminated unions.
 */

export function getFlashlightSettings(
  state: GameState,
  itemId: ItemId = "flashlight",
): FlashlightSettings | undefined {
  return getSharedFlashlightSettings(state, itemId);
}

export function isFlashlightOn(
  state: GameState,
  itemId: ItemId = "flashlight",
): boolean {
  return isSharedFlashlightOn(state, itemId);
}

// ============================================================================
// Night Vision Goggles Settings
// ============================================================================

export interface GogglesSettings {
  kind: "goggles";
  isOn: boolean;
}

export function getGogglesSettings(
  state: GameState,
  itemId: ItemId = "NVGoggles",
): GogglesSettings | undefined {
  const settings = state.itemState.itemSettings[itemId];
  if (!settings) return undefined;
  if (settings.kind !== "goggles") return undefined;
  return settings;
}

export function areGogglesOn(
  state: GameState,
  itemId: ItemId = "NVGoggles",
): boolean {
  const settings = getGogglesSettings(state, itemId);
  return settings?.isOn ?? false;
}

// ============================================================================
// Comet Viewer Settings
// ============================================================================

export interface CometViewerSettings {
  kind: "comet-viewer";
  isOn: boolean;
  hasLink: boolean;
}

export function getCometViewerSettings(
  state: GameState,
  itemId: ItemId = "Comet",
): CometViewerSettings | undefined {
  const settings = state.itemState.itemSettings[itemId];
  if (!settings) return undefined;
  if (settings.kind !== "comet-viewer") return undefined;
  return settings;
}

export function isCometViewerOn(
  state: GameState,
  itemId: ItemId = "Comet",
): boolean {
  const settings = getCometViewerSettings(state, itemId);
  return settings?.isOn ?? false;
}

export function hasCometLink(state: GameState, itemId: ItemId = "Comet"): boolean {
  const settings = getCometViewerSettings(state, itemId);
  return settings?.hasLink ?? false;
}

// ============================================================================
// Cooler Settings
// ============================================================================

export interface CoolerSettings {
  kind: "cooler";
  mode: "off" | "cool" | "cold" | "freeze";
}

export function getCoolerSettings(
  state: GameState,
  itemId: ItemId = "Cooler",
): CoolerSettings | undefined {
  const settings = state.itemState.itemSettings[itemId];
  if (!settings) return undefined;
  if (settings.kind !== "cooler") return undefined;
  return settings;
}

export function getCoolerMode(
  state: GameState,
  itemId: ItemId = "Cooler",
): "off" | "cool" | "cold" | "freeze" {
  const settings = getCoolerSettings(state, itemId);
  return settings?.mode ?? "off";
}

// ============================================================================
// Camera Gun Viewer Settings
// ============================================================================

export interface CameraGunViewerSettings {
  kind: "camera-gun-viewer";
  currentViewIndex: number;
}

export function getCameraGunViewerSettings(
  state: GameState,
  itemId: ItemId,
): CameraGunViewerSettings | undefined {
  const settings = state.itemState.itemSettings[itemId];
  if (!settings) return undefined;
  if (settings.kind !== "camera-gun-viewer") return undefined;
  return settings;
}

// ============================================================================
// Safe Settings
// ============================================================================

export interface SafeSettings {
  kind: "safe";
  dials: number[];
}

export function getSafeSettings(
  state: GameState,
  itemId: ItemId,
): SafeSettings | undefined {
  const settings = state.itemState.itemSettings[itemId];
  if (!settings) return undefined;
  if (settings.kind !== "safe") return undefined;
  return settings;
}

// ============================================================================
// Transmitter Settings
// ============================================================================

export interface TransmitterSettings {
  kind: "transmitter";
  code: string;
}

export function getTransmitterSettings(
  state: GameState,
  itemId: ItemId,
): TransmitterSettings | undefined {
  const settings = state.itemState.itemSettings[itemId];
  if (!settings) return undefined;
  if (settings.kind !== "transmitter") return undefined;
  return settings;
}

// ============================================================================
// Generic Settings Accessor
// ============================================================================

/**
 * Generic accessor that returns any item settings.
 * Use specific accessors above when you need type narrowing.
 */
export function getItemSettings(
  state: GameState,
  itemId: ItemId,
): ItemSettings | undefined {
  return state.itemState.itemSettings[itemId];
}

/**
 * Type guard to check if settings exist for an item.
 */
export function hasItemSettings(state: GameState, itemId: ItemId): boolean {
  return state.itemState.itemSettings[itemId] !== undefined;
}
