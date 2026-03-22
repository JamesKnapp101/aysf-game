import { audioRegistry } from "@game/audioRegistry";
import { Moan } from "@game/engine/ticks/hydroponicsTick";
import { getResolvedAdjacentAudioCues } from "@game/helpers/audioCues";
import { playerHasBadge } from "@game/rules/doors";
import {
  getDoorState,
  getVisibleDoorsInRoom,
} from "@game/selectors/doorSelectors";
import { getCurrentRoom, getItemsInRoom } from "@game/selectors/roomSelectors";
import { buildRoomDescription } from "@game/text/roomDescription";
import type { GameState } from "../types/gameTypes";
import type { DoorDefinition } from "../types/doorTypes";
import type { Direction, Exit, Room } from "../types/roomTypes";
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

type CometDoorContext = {
  searchTexts: string[];
  summaries: string[];
};

type CometAmbientCueContext = {
  searchTexts: string[];
  summaries: string[];
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
  const doorContext = buildVisibleDoorContext(state, room);
  const ambientCueContext = buildAmbientCueContext(state, room.id);

  const roomContextMatches = useRoomContext
    ? findRelevantCometEntries(entryList, [
        ...itemTexts,
        ...doorContext.searchTexts,
        ...ambientCueContext.searchTexts,
      ])
    : [];

  const combinedMatches = dedupeMatches([
    ...queryMatches,
    ...roomContextMatches,
  ]);
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
    "- Treat matched library entries as current Central Library records unless an entry explicitly describes the information as historical, archival, obsolete, or outdated.",
    "- The UI will display any numeric confidence score separately, so do not output a numeric confidence score yourself.",
    `- Current room: ${room.name}`,
    `- Room description: ${sanitizePromptLine(roomDescription)}`,
    `- Visible room items: ${
      itemNames.length > 0 ? itemNames.join(", ") : "none detected"
    }`,
    formatPromptSection("Visible doors", doorContext.summaries),
    formatPromptSection("Ambient cues", ambientCueContext.summaries),
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

function buildVisibleDoorContext(
  state: GameState,
  room: Room,
): CometDoorContext {
  const searchTexts: string[] = [];
  const summaries = getVisibleDoorsInRoom(state, room.id).map((door) => {
    const summary = buildDoorPromptSummary(state, room, door);
    searchTexts.push(summary, door.name, ...door.vocab);

    if (door.badgeItemId) {
      searchTexts.push(...buildRequiredItemSearchTexts(state, door.badgeItemId));
    }

    return summary;
  });

  return { searchTexts, summaries };
}

function buildDoorPromptSummary(
  state: GameState,
  room: Room,
  door: DoorDefinition,
): string {
  const exit = getDoorExitFromRoom(room, door.id);
  const parts = [
    `${exit?.direction ?? inferDoorDirection(door, room.id)}: ${door.name}`,
  ];
  const doorState = getDoorState(state, door.id);

  if (door.kind === "blocked") {
    parts.push("blocked");
    return sanitizePromptLine(parts.join("; "));
  }

  if (doorState?.isOpen) {
    parts.push("open");
  } else if (doorState?.isLocked) {
    parts.push("locked");
  } else if (doorState) {
    parts.push("closed");
  }

  if (door.kind === "airlock") {
    parts.push("airlock");
  }

  if (door.kind === "keyed" && doorState?.isLocked) {
    parts.push("requires a key");
  }

  if (door.kind === "badgeScanner") {
    const scannerAppliesHere = exit
      ? door.checkBadgeOnDir === undefined ||
        door.checkBadgeOnDir === exit.direction
      : true;

    if (scannerAppliesHere && door.badgeItemId) {
      const badgeLabel = formatRequiredItemLabel(state, door.badgeItemId);
      parts.push(`badge scanner keyed to ${badgeLabel}`);
      parts.push(
        playerHasBadge(state, door.badgeItemId)
          ? "you have the required badge"
          : "you do not have the required badge",
      );
    }
  }

  return sanitizePromptLine(parts.join("; "));
}

function getDoorExitFromRoom(room: Room, doorId: string): Exit | undefined {
  return room.exits.find((exit) => exit.doorId === doorId);
}

function inferDoorDirection(door: DoorDefinition, roomId: string): Direction {
  if (roomId === door.connects.roomAId && door.directions?.fromA) {
    return door.directions.fromA;
  }

  if (roomId === door.connects.roomBId && door.directions?.fromB) {
    return door.directions.fromB;
  }

  return "out";
}

function formatRequiredItemLabel(state: GameState, itemId: string): string {
  const itemName = state.world.items.find((item) => item.id === itemId)?.name;
  if (itemName) {
    return itemName.replace(/^an?\s+/i, "");
  }

  if (itemId.toLowerCase().endsWith("badge")) {
    return `${itemId.slice(0, -5)} badge`;
  }

  return itemId.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
}

function buildRequiredItemSearchTexts(
  state: GameState,
  itemId: string,
): string[] {
  const displayLabel = formatRequiredItemLabel(state, itemId);
  const searchTexts = [displayLabel, itemId];

  if (itemId.toLowerCase().endsWith("badge")) {
    const simplifiedLabel = `${itemId.slice(0, -5)} badge`;
    searchTexts.push(simplifiedLabel);
  }

  return Array.from(new Set(searchTexts));
}

function buildAmbientCueContext(
  state: GameState,
  roomId: string,
): CometAmbientCueContext {
  const currentRoomCue = getCurrentRoomAmbientCue(state, roomId);
  const adjacentCues = getResolvedAdjacentAudioCues(state, {
    registry: audioRegistry,
  }).map((cue) => sanitizePromptLine(cue.text));

  const cues = Array.from(
    new Set(
      [currentRoomCue, ...adjacentCues].filter(
        (cue): cue is string => Boolean(cue),
      ),
    ),
  ).slice(0, 3);

  return {
    searchTexts: cues,
    summaries: cues,
  };
}

function getCurrentRoomAmbientCue(
  state: GameState,
  roomId: string,
): string | null {
  if (!state.worldState.hydroponicsSpider.isAlive) {
    return null;
  }

  const turn = state.worldState.hydroponicsSpider.turnsSinceLastBreath % 6;
  if (turn < 3) {
    return null;
  }

  return Moan[roomId]?.[turn]?.moanMsg ?? null;
}

function formatPromptSection(label: string, values: string[]): string {
  if (values.length === 0) {
    return `- ${label}: none detected`;
  }

  return [`- ${label}:`, ...values.map((value) => `  - ${value}`)].join("\n");
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
