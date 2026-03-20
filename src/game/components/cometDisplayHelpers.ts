import type { ConversationHistoryEntry } from "../types/npcTypes";
import { COMET_MAX_INPUT_WORDS } from "./cometHelpers";

export type CometDisplayOptions = {
  analysisBlock?: string;
  confidenceLabel?: string;
  confidenceScore?: number;
};

export function renderLibraryText(raw: string): string {
  const stripped = raw.replace(/~/g, "");
  const withBreaks = stripped.replace(/\^\^/g, "\n\n").replace(/\^/g, "\n");

  return withBreaks.trim();
}

export function historyToDisplaySegments(
  history: ConversationHistoryEntry[],
): string[] {
  return history.map(
    (entry) =>
      `You: ${entry.topic}\nComet: ${renderLibraryText(entry.response)}`,
  );
}

export function formatDisplaySegment(
  input: string,
  response: string,
  opts?: CometDisplayOptions,
): string {
  const lines = [`You: ${input}`];

  if (opts?.analysisBlock) {
    lines.push(opts.analysisBlock);
  }

  if (
    typeof opts?.confidenceScore === "number" &&
    typeof opts.confidenceLabel === "string"
  ) {
    lines.push(
      `Confidence Score: ${opts.confidenceScore}/100 (${opts.confidenceLabel})`,
    );
  }

  lines.push(`Comet: ${renderLibraryText(response)}`);
  return lines.join("\n");
}

export function getCometWelcomeText(): string {
  return "Comet is online. Ask about indexed topics, or ask for a best-guess assessment of your current surroundings.";
}

export function getCometEditReminderText(): string {
  return "Comet does not accept direct edits. If you would like to change the library, please submit an electronic request.";
}

export function getCometEditSubmittedText(): string {
  return "Your electronic request has been submitted. Please expect a response within six months.";
}

export function getCometWordLimitText(): string {
  return `Please keep requests under ${COMET_MAX_INPUT_WORDS} words so Comet can process them cleanly.`;
}
