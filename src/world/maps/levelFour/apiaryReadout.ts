import type { GameState } from "@game/types/gameTypes";
import { getApiaryTrayBeeSpecs, isDeactivatedBeeOnApiaryTray } from "./Apiary";
import type { BeeSpecs } from "./Greenhouse";

export function buildBeeSpecRows(specs: BeeSpecs) {
  return [
    { label: "Id", value: specs.id },
    { label: "Model", value: specs.model },
    { label: "Version", value: specs.version },
    { label: "Uptime", value: String(specs.uptime) },
    { label: "Ping freq", value: `${specs.pingFrequencyMs}ms` },
    { label: "Last ping", value: String(specs.lastPing) },
    { label: "Last objective", value: specs.objective },
    { label: "Trips", value: String(specs.trips) },
    { label: "Total payloads", value: `${specs.totalPayloadGrams.toFixed(3)}g` },
    { label: "Status", value: specs.status },
    { label: "Error Code", value: specs.errorCode },
    { label: "Req Shutdown?", value: String(specs.requiresShutdown) },
    { label: "Shutdown freq", value: `${specs.shutdownFrequencyMHz.toFixed(4)}MHz` },
    { label: "Swarm ID", value: String(specs.swarmId) },
    { label: "Hive ID", value: specs.hiveId },
    { label: "Region", value: specs.region },
    { label: "Section", value: String(specs.section) },
    { label: "Last log", value: specs.log },
  ];
}

export function apiaryReadout(state: GameState): string {
  const specs = getApiaryTrayBeeSpecs(state);
  const body = !isDeactivatedBeeOnApiaryTray(state) ? "Place Unit on Tray"
    : !specs ? "Unit data unavailable"
    : buildBeeSpecRows(specs).map(row => `${row.label}: ${row.value}`).join("\n");
  return `OMNI-BEE\nPollination Unit Diagnostic Terminal\n${body}`;
}
