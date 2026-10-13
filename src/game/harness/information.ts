import { isPlayerUnderwater } from "../helpers/environmentHelpers";
import { getDisplayedFlashlightStatus } from "../helpers/flashlightHelpers";
import { canPlayerSeeInRoom, getRoomVisualLightLevel } from "../helpers/visibilityHelpers";
import { getVisibleObjectives } from "../rules/objectives";
import { formatDNASampleBody, formatTopicType, previewText } from "../text/playerKnowledge";
import type { DNAResult } from "../rules/dnaReader";
import type { GameState } from "../types/gameTypes";
import type { InformationView } from "./types";
import { currentRoomText } from "./playerView";
import { shipMapText, type MapInformationOptions } from "../map/shipMapText";

const CHOOSE_RECORD = "Choose a record number from the current list.";

function dnaTitle(sample: DNAResult): string {
  // The engine's unknown-sample placeholder embeds an internal item ID.
  return sample.title?.startsWith("Unknown sample: ")
    ? "Unknown sample"
    : sample.title || "Unknown sample origin";
}

function documentsText(state: GameState): string {
  const entries = state.player.log ?? [];
  return [
    `Log Entries (${entries.length})`,
    ...entries.map((entry, index) => `${index + 1}. ${entry.title || "Untitled"}\n   ${previewText(entry.body, 50)}`),
    ...(entries.length ? ["Review a document with :log <number>."] : ["No log entries yet."]),
  ].join("\n");
}

function gossipText(state: GameState): string {
  const topics = state.player.spiltTea ?? [];
  return [
    `Gossip (${topics.length})`,
    ...topics.map((topic, index) => [
      `${index + 1}. ${formatTopicType(topic.type)}: ${topic.title || "Untitled topic"}`,
      topic.summary || "No summary recorded.",
      ...(topic.tags?.filter(Boolean).length ? [`Tags: ${topic.tags.filter(Boolean).join(" | ")}`] : []),
    ].join("\n")),
    ...(topics.length ? [] : ["No gossip collected yet."]),
  ].join("\n");
}

function dnaText(state: GameState): string {
  const samples = state.player.dnaBank ?? [];
  return [
    `DNA (${samples.length})`,
    ...samples.map((sample, index) =>
      `${index + 1}. ${dnaTitle(sample)}\n${sample.name || "Unknown"}\nCOD: ${sample.causeOfDeath || "Unknown"}\nGender: ${sample.gender || "Unknown"}\nAge: ${sample.age > 0 ? sample.age : "Unknown"}`,
    ),
    ...(samples.length ? ["Review a sample with :dna <number>."] : ["No samples collected yet."]),
  ].join("\n");
}

function objectivesText(state: GameState): string {
  const objectives = getVisibleObjectives(state);
  const completed = objectives.filter(objective => objective.status === "completed").length;
  return [
    `Objectives (${completed}/${objectives.length} completed)`,
    ...objectives.map(objective =>
      `- [${objective.status === "completed" ? "Completed" : "Active"}] ${objective.title}${objective.optional ? " (Optional)" : ""}`,
    ),
    ...(objectives.length ? [] : ["No objectives tracked."]),
  ].join("\n");
}

function roomText(state: GameState): string {
  const flashlight = getDisplayedFlashlightStatus(state);
  const light = getRoomVisualLightLevel(state, state.player.roomId);
  const visibility = canPlayerSeeInRoom(state, state.player.roomId)
    ? light === "dark" ? "Dark, with assisted vision" : light.replaceAll("-", " ")
    : "Pitch black";
  return [
    currentRoomText(state),
    `Visibility: ${visibility}.`,
    `Flashlight: ${flashlight.hasFlashlight ? flashlight.isActive ? "on" : "off" : "none"}.`,
    ...(isPlayerUnderwater(state) ? ["Environment: underwater."] : []),
  ].join("\n\n");
}

/** Read-only projections from player-owned records and the currently mounted UI. */
export function informationText(state: GameState, view: InformationView, record?: number | MapInformationOptions): string {
  if (view === "map") return shipMapText(state, record);
  if (record !== undefined) {
    if (typeof record !== "number" || !Number.isSafeInteger(record) || record < 1) return CHOOSE_RECORD;
    if (view === "log") {
      const entry = state.player.log?.[record - 1];
      return entry ? `${entry.title || "Log Entry"}\n\n${entry.body || ""}` : CHOOSE_RECORD;
    }
    if (view === "dna") {
      const sample = state.player.dnaBank?.[record - 1];
      return sample ? `${dnaTitle(sample)}\n\n${formatDNASampleBody(sample)}` : CHOOSE_RECORD;
    }
    return "Record selection is available only for :log and :dna.";
  }
  switch (view) {
    case "log": return ["Player Log", documentsText(state), gossipText(state), dnaText(state)].join("\n\n");
    case "gossip": return gossipText(state);
    case "dna": return dnaText(state);
    case "objectives": return objectivesText(state);
    case "room": return roomText(state);
    case "history": return ["Recent gameplay messages", ...state.log].join("\n\n");
  }
}
