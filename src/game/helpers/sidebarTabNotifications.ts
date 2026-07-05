import { getVisibleObjectives } from "@game/rules/objectives";
import { getRadiationIntensity } from "@game/selectors/statusSelectors";
import type { GameState } from "@game/types/gameTypes";

export type NotifiableSidebarTab =
  | "inventory"
  | "status"
  | "objectives"
  | "log";

export type SidebarTabNotificationMap = Partial<
  Record<NotifiableSidebarTab, boolean>
>;

export type SidebarTabSignatureMap = Record<NotifiableSidebarTab, string>;

export const NOTIFIABLE_SIDEBAR_TABS: readonly NotifiableSidebarTab[] = [
  "inventory",
  "status",
  "objectives",
  "log",
];

export function isNotifiableSidebarTab(
  tab: string,
): tab is NotifiableSidebarTab {
  return NOTIFIABLE_SIDEBAR_TABS.includes(tab as NotifiableSidebarTab);
}

function sorted(value: string[]): string[] {
  return [...value].sort((a, b) => a.localeCompare(b));
}

function band(
  value: number,
  thresholds: Array<{ label: string; max: number }>,
  fallback: string,
): string {
  const numericValue = Number.isFinite(value) ? value : 0;
  return thresholds.find((threshold) => numericValue <= threshold.max)?.label ?? fallback;
}

function getHealthBand(value: number): string {
  return band(
    value,
    [
      { label: "critical", max: 25 },
      { label: "low", max: 50 },
      { label: "hurt", max: 99 },
    ],
    "ok",
  );
}

function getOxygenBand(value: number): string {
  return band(
    value,
    [
      { label: "empty", max: 0 },
      { label: "critical", max: 10 },
      { label: "low", max: 25 },
      { label: "reduced", max: 75 },
    ],
    "ok",
  );
}

function getRadiationBand(value: number): string {
  return band(
    value,
    [
      { label: "none", max: 0 },
      { label: "trace", max: 10 },
      { label: "elevated", max: 50 },
      { label: "danger", max: 100 },
    ],
    "critical",
  );
}

function getTemperatureBand(value: number): string {
  return band(
    value,
    [
      { label: "cold", max: 95 },
      { label: "normal", max: 99.9 },
      { label: "warm", max: 102.9 },
      { label: "hot", max: 105.9 },
    ],
    "critical",
  );
}

function getInventorySignature(state: GameState): string {
  const { badges, general, keys } = state.player.inventory;

  return [
    `badges:${sorted(badges).join(",")}`,
    `general:${sorted(general).join(",")}`,
    `keys:${sorted(keys).join(",")}`,
  ].join("|");
}

function getStatusSignature(state: GameState): string {
  const activeStatusIds = sorted(
    state.player.statusEffects
      .filter((effect) => effect.id !== "none")
      .map((effect) => effect.id),
  );

  return [
    `effects:${activeStatusIds.join(",")}`,
    `health:${getHealthBand(state.player.vitals.health)}`,
    `oxygen:${getOxygenBand(state.player.vitals.oxygen)}`,
    `radiation:${getRadiationBand(getRadiationIntensity(state))}`,
    `temp:${getTemperatureBand(state.player.vitals.temperature)}`,
  ].join("|");
}

function getObjectivesSignature(state: GameState): string {
  return getVisibleObjectives(state)
    .map(
      (objective) =>
        `${objective.id}:${objective.status}:${objective.completedAtTurn ?? ""}`,
    )
    .join("|");
}

function getLogSignature(state: GameState): string {
  const entries = (state.player.log ?? []).map(
    (entry) => `${entry.loggedAtTurn}:${entry.source}:${entry.title}`,
  );
  const gossip = (state.player.spiltTea ?? []).map(
    (topic) => `${topic.id}:${topic.type}`,
  );
  const dna = (state.player.dnaBank ?? []).map(
    (sample) => `${sample.loggedAtTurn}:${sample.id}:${sample.title}`,
  );

  return [
    `entries:${entries.join(",")}`,
    `gossip:${gossip.join(",")}`,
    `dna:${dna.join(",")}`,
  ].join("|");
}

export function getSidebarTabSignatures(
  state: GameState,
): SidebarTabSignatureMap {
  return {
    inventory: getInventorySignature(state),
    status: getStatusSignature(state),
    objectives: getObjectivesSignature(state),
    log: getLogSignature(state),
  };
}

export function mergeSidebarTabNotifications(args: {
  activeTab: string;
  current: SidebarTabNotificationMap;
  nextSignatures: SidebarTabSignatureMap;
  previousSignatures: SidebarTabSignatureMap | null;
}): SidebarTabNotificationMap {
  const { activeTab, current, nextSignatures, previousSignatures } = args;
  if (!previousSignatures) return current;

  let didChange = false;
  const next: SidebarTabNotificationMap = { ...current };

  for (const tab of NOTIFIABLE_SIDEBAR_TABS) {
    if (previousSignatures[tab] === nextSignatures[tab]) continue;

    if (activeTab === tab) {
      if (next[tab]) {
        next[tab] = false;
        didChange = true;
      }
      continue;
    }

    if (!next[tab]) {
      next[tab] = true;
      didChange = true;
    }
  }

  return didChange ? next : current;
}

export function clearSidebarTabNotification(
  current: SidebarTabNotificationMap,
  tab: string,
): SidebarTabNotificationMap {
  if (!isNotifiableSidebarTab(tab) || !current[tab]) return current;

  return {
    ...current,
    [tab]: false,
  };
}
