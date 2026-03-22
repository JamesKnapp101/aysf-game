import type { ConversationHistoryEntry } from "../types/npcTypes";
import { COMET_MAX_INPUT_WORDS } from "./cometHelpers";

export type CometDisplayOptions = {
  analysisBlock?: string;
  confidenceLabel?: string;
  confidenceScore?: number;
  idBase?: string;
  pendingText?: string;
};

export type CometDisplayMessageRole = "assistant" | "system" | "user";

export type CometDisplayMessageTone =
  | "analysis"
  | "confidence"
  | "default"
  | "pending"
  | "status"
  | "welcome";

export type CometDisplayMessage = {
  id: string;
  label: string;
  role: CometDisplayMessageRole;
  text: string;
  tone: CometDisplayMessageTone;
};

function buildMessage(
  id: string,
  role: CometDisplayMessageRole,
  text: string,
  tone: CometDisplayMessageTone,
  label: string,
): CometDisplayMessage {
  return {
    id,
    label,
    role,
    text,
    tone,
  };
}

function buildUserMessage(idBase: string, text: string): CometDisplayMessage {
  return buildMessage(`${idBase}-user`, "user", text, "default", "YOU");
}

function buildAssistantMessage(
  idBase: string,
  text: string,
  tone: CometDisplayMessageTone = "default",
): CometDisplayMessage {
  return buildMessage(`${idBase}-assistant`, "assistant", text, tone, "COMET");
}

function buildSystemMessage(
  idBase: string,
  text: string,
  tone: CometDisplayMessageTone,
  label: string,
): CometDisplayMessage {
  return buildMessage(`${idBase}-system`, "system", text, tone, label);
}

export function renderLibraryText(raw: string): string {
  const stripped = raw.replace(/~/g, "");
  const withBreaks = stripped.replace(/\^\^/g, "\n\n").replace(/\^/g, "\n");

  return withBreaks.trim();
}

export function historyToDisplayMessages(
  history: ConversationHistoryEntry[],
): CometDisplayMessage[] {
  return history.flatMap((entry, index) => {
    const idBase = `turn-${entry.turn}-${index}`;
    return [
      buildUserMessage(idBase, entry.topic),
      buildAssistantMessage(idBase, renderLibraryText(entry.response)),
    ];
  });
}

export function buildCometExchangeMessages(
  input: string,
  response: string,
  opts?: CometDisplayOptions,
): CometDisplayMessage[] {
  const idBase = opts?.idBase ?? "exchange";
  const messages: CometDisplayMessage[] = [buildUserMessage(idBase, input)];

  if (opts?.analysisBlock) {
    messages.push(
      buildSystemMessage(
        `${idBase}-analysis`,
        opts.analysisBlock,
        "analysis",
        "ANALYSIS",
      ),
    );
  }

  if (
    typeof opts?.confidenceScore === "number" &&
    typeof opts.confidenceLabel === "string"
  ) {
    messages.push(
      buildSystemMessage(
        `${idBase}-confidence`,
        `Confidence Score: ${opts.confidenceScore}/100 (${opts.confidenceLabel})`,
        "confidence",
        "CONFIDENCE",
      ),
    );
  }

  messages.push(
    buildAssistantMessage(idBase, renderLibraryText(response)),
  );

  return messages;
}

export function buildCometPendingMessages(
  input: string,
  opts?: CometDisplayOptions,
): CometDisplayMessage[] {
  const idBase = opts?.idBase ?? "pending";
  const messages: CometDisplayMessage[] = [buildUserMessage(idBase, input)];

  if (opts?.analysisBlock) {
    messages.push(
      buildSystemMessage(
        `${idBase}-analysis`,
        opts.analysisBlock,
        "analysis",
        "ANALYSIS",
      ),
    );
  }

  if (opts?.pendingText) {
    messages.push(
      buildAssistantMessage(`${idBase}-pending`, opts.pendingText, "pending"),
    );
  }

  return messages;
}

export function getCometWelcomeMessages(): CometDisplayMessage[] {
  return [
    buildAssistantMessage(
      "welcome",
      "Hello, I'm Comet, your AI Assistant. How can I help you today?",
      "welcome",
    ),
  ];
}

export function buildCometStatusMessages(
  text: string,
  tone: CometDisplayMessageTone = "status",
  label = "STATUS",
): CometDisplayMessage[] {
  return [buildSystemMessage(`status-${tone}`, text, tone, label)];
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
