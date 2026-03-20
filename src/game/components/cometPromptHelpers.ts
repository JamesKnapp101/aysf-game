import { getCurrentRoom, getItemsInRoom } from "@game/selectors/roomSelectors";
import { buildRoomDescription } from "@game/text/roomDescription";
import type { GameState } from "../types/gameTypes";
import { renderLibraryText } from "./cometDisplayHelpers";
import {
  buildCometConfidence,
  COMET_MAX_MATCHES,
  findRelevantCometEntries,
  shouldUseCometRoomContext,
  type CometEntryMatch,
  type CometInteractionMode,
} from "./cometHelpers";
import type { CometEntry } from "./comet-index";

export type CometPromptContext = {
  analysisBlock?: string;
  assistantContext: string;
  confidenceLabel: string;
  confidenceScore: number;
  fallbackResponse: string;
  mode: "guess" | "library";
};

function getItemSearchTerms(
  state: GameState,
  roomId: string,
): {
  itemNames: string[];
  texts: string[];
} {
  const roomItems = getItemsInRoom(state, roomId);
  const itemNames = roomItems.map((item) => item.named?.(state) ?? item.name);
  const texts = roomItems.flatMap((item) => [
    item.named?.(state) ?? item.name,
    ...item.vocab,
  ]);

  return { itemNames, texts };
}

export function buildCometPromptContext(
  state: GameState,
  entryList: CometEntry[],
  rawInput: string,
): CometPromptContext {
  const room = getCurrentRoom(state);
  const roomDescription = buildRoomDescription(state, room.id, {
    mode: "log",
    omitItems: true,
  });

  const queryMatches = findRelevantCometEntries(entryList, [rawInput]);
  const useRoomContext = shouldUseCometRoomContext(
    rawInput,
    queryMatches.length,
  );
  const { itemNames, texts: itemTexts } = getItemSearchTerms(state, room.id);

  const itemMatches = useRoomContext
    ? findRelevantCometEntries(entryList, itemTexts)
    : [];

  const combinedMatches = dedupeMatches([...queryMatches, ...itemMatches]);
  const mode = useRoomContext ? "guess" : "library";
  const confidence = buildCometConfidence(combinedMatches.length, mode);
  const analysisBlock = useRoomContext
    ? buildAnalysisBlock(room.name, itemNames, combinedMatches.length)
    : undefined;

  const assistantContextLines = [
    `- Interaction mode: ${
      useRoomContext
        ? "informed guess from local surroundings"
        : "indexed library response"
    }`,
    useRoomContext
      ? "- You must explicitly say this is a guess based on limited information."
      : "- Answer from the indexed library context when relevant, and say clearly if no relevant entry was found.",
    "- The UI will display any numeric confidence score separately, so do not output a numeric confidence score yourself.",
    `- Current room: ${room.name}`,
    `- Room description: ${sanitizePromptLine(roomDescription)}`,
    `- Visible room items: ${
      itemNames.length > 0 ? itemNames.join(", ") : "none detected"
    }`,
    `- Database matches found: ${combinedMatches.length}`,
    formatPromptEntries(combinedMatches),
  ];

  return {
    analysisBlock,
    assistantContext: assistantContextLines.filter(Boolean).join("\n"),
    confidenceLabel: confidence.label,
    confidenceScore: confidence.score,
    fallbackResponse: buildCometFallbackResponse(combinedMatches, mode),
    mode,
  };
}

function dedupeMatches(matches: CometEntryMatch[]): CometEntryMatch[] {
  const byId = new Map<string, CometEntryMatch>();

  for (const match of matches) {
    const existing = byId.get(match.entry.id);
    if (!existing) {
      byId.set(match.entry.id, match);
      continue;
    }

    byId.set(match.entry.id, {
      entry: existing.entry,
      matchedBy: Array.from(
        new Set([...existing.matchedBy, ...match.matchedBy]),
      ).sort(),
      score: Math.max(existing.score, match.score),
    });
  }

  return Array.from(byId.values())
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.entry.id.localeCompare(b.entry.id);
    })
    .slice(0, COMET_MAX_MATCHES);
}

function buildAnalysisBlock(
  roomName: string,
  itemNames: string[],
  matchCount: number,
): string {
  const itemText =
    itemNames.length > 0 ? itemNames.join(", ") : "none detected";
  const entryText = `${matchCount} ${matchCount === 1 ? "entry" : "entries"} found`;

  return [
    "Comet is analyzing...",
    `  |- Room: ${roomName}`,
    `  |- Items detected: ${itemText}`,
    `  \\- Database matches: ${entryText}`,
  ].join("\n");
}

function formatPromptEntries(matches: CometEntryMatch[]): string {
  if (matches.length === 0) {
    return "Matched library entries:\n- none";
  }

  return [
    "Matched library entries:",
    ...matches.map((match) => {
      const title = match.entry.terms[0] ?? match.entry.id;
      return [
        `- ${title} (${match.entry.id})`,
        `  Matched by: ${match.matchedBy.join(", ")}`,
        `  Entry: ${sanitizePromptLine(match.entry.body)}`,
      ].join("\n");
    }),
  ].join("\n");
}

function sanitizePromptLine(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function buildCometFallbackResponse(
  matches: CometEntryMatch[],
  mode: CometInteractionMode,
): string {
  if (mode === "guess") {
    return "This is only a guess based on your current surroundings and a limited slice of the library, so please treat it cautiously.";
  }

  if (matches.length === 1) {
    return renderLibraryText(matches[0].entry.body);
  }

  if (matches.length > 1) {
    const topics = matches.map(
      (match) => match.entry.terms[0] ?? match.entry.id,
    );
    return `I found several possibly relevant entries: ${topics.join(", ")}. Please narrow the question if you need something more exact.`;
  }

  return "I found no relevant indexed entry for that question.";
}
