import type { DNAResult } from "../rules/dnaReader";
import type { JuicyTopic, PlayerContact, PlayerTrivia } from "../types/gameTypes";

export function previewText(body: string, maxChars = 80): string {
  const text = (body ?? "").replace(/\s+/g, " ").trim();
  return text.length <= maxChars ? text : text.slice(0, maxChars).trimEnd() + "...";
}

export function formatTopicType(type: JuicyTopic["type"]): string {
  return type === "secret" ? "Secret" : "Gossip";
}

export function formatTriviaBody(fact: PlayerTrivia): string {
  return [`Answer: ${fact.answer}`, ...(fact.body ? [fact.body] : []),
    ...(fact.source ? [`Source: ${fact.source}`] : [])].join("\n\n");
}

export function contactName(contact: PlayerContact): string {
  return contact.name || "Unidentified extension";
}

export function formatContactBody(contact: PlayerContact): string {
  return [contactName(contact), `Extension: ${contact.extension}`,
    ...(contact.description ? [contact.description] : [])].join("\n\n");
}

/** The body available when a player opens a banked DNA sample. */
export function formatDNASampleBody(sample: DNAResult): string {
  return `DNA Analysis Results:\n--------------------\nName: ${sample.name}\nGender: ${sample.gender}\nAge: ${sample.age}\nOccupation: ${sample.occupation}\nCause of Death: ${sample.causeOfDeath}\nAdditional Info: ${sample.info}`;
}
