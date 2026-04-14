import { inventoryHas } from "@game/rules/state";
import type { DamagedFlashlightState, GameState } from "../types/gameTypes";
import type { ItemId } from "../types/ids";

export type FlashlightItemId = "flashlight" | "damagedFlashlight";

export interface FlashlightSettings {
  kind: "flashlight";
  isOn: boolean;
  currentCharge: number;
  maxCharge: number;
  drainRate: number;
  rechargeRate: number;
}

export type FlashlightStatus = {
  hasFlashlight: boolean;
  isActive: boolean;
  itemId?: FlashlightItemId;
  settings?: FlashlightSettings;
};

type FlashlightDefaults = Omit<
  FlashlightSettings,
  "currentCharge" | "isOn" | "kind"
> & {
  initialCharge: number;
};

type LegacyFlashlightSettings = Partial<FlashlightSettings> & {
  chargeRate?: number;
  isOn?: boolean;
  kind?: string;
};

export const FLASHLIGHT_ITEM_IDS: FlashlightItemId[] = [
  "flashlight",
  "damagedFlashlight",
];

const FLASHLIGHT_DEFAULTS: Record<FlashlightItemId, FlashlightDefaults> = {
  flashlight: {
    maxCharge: 100,
    initialCharge: 100,
    drainRate: 0.05,
    rechargeRate: 10,
  },
  damagedFlashlight: {
    maxCharge: 30,
    initialCharge: 30,
    drainRate: 5,
    rechargeRate: 5,
  },
};

const FLASHLIGHT_DISPLAY_PRIORITY: FlashlightItemId[] = [
  "flashlight",
  "damagedFlashlight",
];

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function roundCharge(value: number) {
  return Math.round(value * 100) / 100;
}

function isLegacyFlashlightSettings(
  value: unknown,
): value is LegacyFlashlightSettings {
  return typeof value === "object" && value !== null;
}

export function isFlashlightItemId(itemId: string): itemId is FlashlightItemId {
  return FLASHLIGHT_ITEM_IDS.includes(itemId as FlashlightItemId);
}

export function getFlashlightDefaults(
  itemId: FlashlightItemId,
): FlashlightSettings {
  const defaults = FLASHLIGHT_DEFAULTS[itemId];

  return {
    kind: "flashlight",
    isOn: false,
    currentCharge: defaults.initialCharge,
    maxCharge: defaults.maxCharge,
    drainRate: defaults.drainRate,
    rechargeRate: defaults.rechargeRate,
  };
}

function normalizeFlashlightSettings(
  itemId: FlashlightItemId,
  rawSettings: unknown,
  legacyDamagedFlashlight?: DamagedFlashlightState,
): FlashlightSettings {
  const defaults = getFlashlightDefaults(itemId);
  const legacySettings = isLegacyFlashlightSettings(rawSettings)
    ? rawSettings
    : undefined;
  const legacyWorldState =
    itemId === "damagedFlashlight" ? legacyDamagedFlashlight : undefined;

  const maxCharge = clamp(
    roundCharge(
      Number.isFinite(legacySettings?.maxCharge)
        ? Number(legacySettings?.maxCharge)
        : Number.isFinite(legacyWorldState?.maxCharge)
          ? Number(legacyWorldState?.maxCharge)
          : defaults.maxCharge,
    ),
    0,
    Number.MAX_SAFE_INTEGER,
  );

  const currentCharge = clamp(
    roundCharge(
      Number.isFinite(legacySettings?.currentCharge)
        ? Number(legacySettings?.currentCharge)
        : Number.isFinite(legacyWorldState?.currentCharge)
          ? Number(legacyWorldState?.currentCharge)
          : defaults.currentCharge,
    ),
    0,
    maxCharge,
  );

  const drainRate = clamp(
    roundCharge(
      Number.isFinite(legacySettings?.drainRate)
        ? Number(legacySettings?.drainRate)
        : defaults.drainRate,
    ),
    0,
    Number.MAX_SAFE_INTEGER,
  );

  const rechargeRate = clamp(
    roundCharge(
      Number.isFinite(legacySettings?.rechargeRate)
        ? Number(legacySettings?.rechargeRate)
        : Number.isFinite(legacySettings?.chargeRate)
          ? Number(legacySettings?.chargeRate)
          : Number.isFinite(legacyWorldState?.chargeRate)
            ? Number(legacyWorldState?.chargeRate)
            : defaults.rechargeRate,
    ),
    0,
    Number.MAX_SAFE_INTEGER,
  );

  return {
    kind: "flashlight",
    isOn:
      typeof legacySettings?.isOn === "boolean"
        ? legacySettings.isOn
        : typeof legacyWorldState?.isOn === "boolean"
          ? legacyWorldState.isOn
          : defaults.isOn,
    currentCharge,
    maxCharge,
    drainRate,
    rechargeRate,
  };
}

export function buildFlashlightSettings(
  itemId: FlashlightItemId,
  current: FlashlightSettings | undefined,
  patch: Partial<FlashlightSettings>,
): FlashlightSettings {
  return normalizeFlashlightSettings(itemId, {
    ...(current ?? getFlashlightDefaults(itemId)),
    ...patch,
  });
}

export function getFlashlightSettings(
  state: GameState,
  itemId: ItemId = "flashlight",
): FlashlightSettings | undefined {
  if (!isFlashlightItemId(itemId)) return undefined;

  return normalizeFlashlightSettings(
    itemId,
    state.itemState.itemSettings[itemId],
    state.worldState.damagedFlashlight,
  );
}

export function hasFlashlight(
  state: GameState,
  itemId: FlashlightItemId,
): boolean {
  return inventoryHas(state.player.inventory, itemId);
}

export function isFlashlightOn(
  state: GameState,
  itemId: ItemId = "flashlight",
): boolean {
  const settings = getFlashlightSettings(state, itemId);
  return Boolean(settings?.isOn && settings.currentCharge > 0);
}

export function getActiveFlashlight(
  state: GameState,
): { itemId: FlashlightItemId; settings: FlashlightSettings } | undefined {
  for (const itemId of FLASHLIGHT_DISPLAY_PRIORITY) {
    if (!hasFlashlight(state, itemId)) continue;

    const settings = getFlashlightSettings(state, itemId);
    if (!settings || !settings.isOn || settings.currentCharge <= 0) continue;

    return { itemId, settings };
  }

  return undefined;
}

export function isAnyFlashlightOn(state: GameState): boolean {
  return Boolean(getActiveFlashlight(state));
}

export function getDisplayedFlashlightStatus(
  state: GameState,
): FlashlightStatus {
  const active = getActiveFlashlight(state);
  if (active) {
    return {
      hasFlashlight: true,
      isActive: true,
      itemId: active.itemId,
      settings: active.settings,
    };
  }

  for (const itemId of FLASHLIGHT_DISPLAY_PRIORITY) {
    if (!hasFlashlight(state, itemId)) continue;

    return {
      hasFlashlight: true,
      isActive: false,
      itemId,
      settings: getFlashlightSettings(state, itemId),
    };
  }

  return {
    hasFlashlight: false,
    isActive: false,
  };
}

export function getChargeBarCount(
  chargePercent: number,
  totalBars: number,
): number {
  const clampedPercent = clamp(roundCharge(chargePercent), 0, 100);
  if (clampedPercent <= 0) return 0;

  return clamp(Math.ceil((clampedPercent / 100) * totalBars), 0, totalBars);
}
