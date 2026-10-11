import type { DNAResult } from "../rules/dnaReader";
import type { JuicyTopic } from "../types/gameTypes";

export function previewText(body: string, maxChars = 80): string {
  const text = (body ?? "").replace(/\s+/g, " ").trim();
  return text.length <= maxChars ? text : text.slice(0, maxChars).trimEnd() + "...";
}

export function formatTopicType(type: JuicyTopic["type"]): string {
  return type === "secret" ? "Secret" : "Gossip";
}

/** The body available when a player opens a banked DNA sample. */
export function formatDNASampleBody(sample: DNAResult): string {
  return `DNA Analysis Results:\n--------------------\nName: ${sample.name}\nGender: ${sample.gender}\nAge: ${sample.age}\nOccupation: ${sample.occupation}\nAdditional Info: ${sample.info}`;
}
