import type {
  CharacterProfile,
  CompactCharacterProfile,
  ConversationEntry,
  GossipContext,
  LegacyCharacterProfile,
  NpcSecretContext,
  PlayerInput,
} from "../services/claudeService.js";

export interface ConversationRequest {
  npcId: string;
  assistantContext?: string;
  characterProfile: CharacterProfile;
  conversationHistory: ConversationEntry[];
  playerInput: PlayerInput;
  gossipContext?: GossipContext;
}

type ValidationResult =
  | { ok: true; request: ConversationRequest }
  | { ok: false; reason: string };

const MAX_NPC_ID_LENGTH = 80;
const MAX_TOPIC_LENGTH = 500;
const MAX_ASSISTANT_CONTEXT_LENGTH = 16_000;
const MAX_HISTORY_ENTRIES = 24;
const MAX_HISTORY_RESPONSE_LENGTH = 2_000;
const MAX_PROFILE_NAME_LENGTH = 120;
const MAX_PROFILE_TEXT_LENGTH = 4_000;
const MAX_PROFILE_ARRAY_ITEMS = 40;
const MAX_PROFILE_ARRAY_TEXT_LENGTH = 1_000;
const MAX_GOSSIP_IDS = 80;
const MAX_GOSSIP_ID_LENGTH = 120;
const MAX_SECRET_TEXT_LENGTH = 2_000;
const MAX_LEGACY_GOSSIP_INVENTORY = 80;

const TOP_LEVEL_FIELDS = new Set([
  "assistantContext",
  "characterProfile",
  "conversationHistory",
  "gossipContext",
  "npcId",
  "playerInput",
]);

const PLAYER_INPUT_FIELDS = new Set(["topic", "type"]);
const HISTORY_ENTRY_FIELDS = new Set(["response", "topic", "turn", "type"]);
const GOSSIP_FIELDS = new Set([
  "gossipSharedWithNpc",
  "npcSecret",
  "playerGossipInventory",
]);
const NPC_SECRET_FIELDS = new Set([
  "currentCount",
  "requiresGossipCount",
  "text",
]);
const COMPACT_PROFILE_FIELDS = new Set([
  "directives",
  "goals",
  "identity",
  "knownFacts",
  "name",
  "scene",
  "unknownFacts",
  "voice",
]);
const LEGACY_PROFILE_FIELDS = new Set([
  "background",
  "conversationContext",
  "ignorance",
  "knowledge",
  "name",
  "objectives",
  "personality",
  "physicalState",
  "timeContext",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasOnlyFields(
  value: Record<string, unknown>,
  allowedFields: Set<string>,
): boolean {
  return Object.keys(value).every((key) => allowedFields.has(key));
}

function boundedString(
  value: unknown,
  fieldName: string,
  maxLength: number,
  minLength = 0,
): { ok: true; value: string } | { ok: false; reason: string } {
  if (typeof value !== "string") {
    return { ok: false, reason: `${fieldName}-must-be-string` };
  }

  const trimmed = value.trim();
  if (trimmed.length < minLength) {
    return { ok: false, reason: `${fieldName}-too-short` };
  }

  if (trimmed.length > maxLength) {
    return { ok: false, reason: `${fieldName}-too-long` };
  }

  return { ok: true, value: trimmed };
}

function boundedStringArray(
  value: unknown,
  fieldName: string,
  maxItems: number,
  maxTextLength: number,
): { ok: true; value: string[] } | { ok: false; reason: string } {
  if (!Array.isArray(value)) {
    return { ok: false, reason: `${fieldName}-must-be-array` };
  }

  if (value.length > maxItems) {
    return { ok: false, reason: `${fieldName}-too-many-items` };
  }

  const values: string[] = [];
  for (const [index, entry] of value.entries()) {
    const parsed = boundedString(
      entry,
      `${fieldName}-${index}`,
      maxTextLength,
    );
    if (!parsed.ok) return parsed;
    values.push(parsed.value);
  }

  return { ok: true, value: values };
}

function optionalString(
  value: unknown,
  fieldName: string,
  maxLength: number,
): { ok: true; value?: string } | { ok: false; reason: string } {
  if (value === undefined) return { ok: true };
  const parsed = boundedString(value, fieldName, maxLength);
  return parsed.ok ? { ok: true, value: parsed.value } : parsed;
}

function parsePlayerInput(
  value: unknown,
): { ok: true; value: PlayerInput } | { ok: false; reason: string } {
  if (!isRecord(value) || !hasOnlyFields(value, PLAYER_INPUT_FIELDS)) {
    return { ok: false, reason: "playerInput-invalid-fields" };
  }

  if (value.type !== "ask" && value.type !== "tell") {
    return { ok: false, reason: "playerInput-type-invalid" };
  }

  const topic = boundedString(
    value.topic,
    "playerInput-topic",
    MAX_TOPIC_LENGTH,
    1,
  );
  if (!topic.ok) return topic;

  return {
    ok: true,
    value: {
      topic: topic.value,
      type: value.type,
    },
  };
}

function parseConversationHistory(
  value: unknown,
): { ok: true; value: ConversationEntry[] } | { ok: false; reason: string } {
  if (value === undefined) return { ok: true, value: [] };

  if (!Array.isArray(value)) {
    return { ok: false, reason: "conversationHistory-must-be-array" };
  }

  if (value.length > MAX_HISTORY_ENTRIES) {
    return { ok: false, reason: "conversationHistory-too-many-items" };
  }

  const history: ConversationEntry[] = [];
  for (const [index, entry] of value.entries()) {
    if (!isRecord(entry) || !hasOnlyFields(entry, HISTORY_ENTRY_FIELDS)) {
      return {
        ok: false,
        reason: `conversationHistory-${index}-invalid-fields`,
      };
    }

    if (entry.type !== "ask" && entry.type !== "tell") {
      return {
        ok: false,
        reason: `conversationHistory-${index}-type-invalid`,
      };
    }

    if (
      typeof entry.turn !== "number" ||
      !Number.isInteger(entry.turn) ||
      entry.turn < 0 ||
      entry.turn > 10_000_000
    ) {
      return {
        ok: false,
        reason: `conversationHistory-${index}-turn-invalid`,
      };
    }

    const topic = boundedString(
      entry.topic,
      `conversationHistory-${index}-topic`,
      MAX_TOPIC_LENGTH,
      1,
    );
    if (!topic.ok) return topic;

    const response = boundedString(
      entry.response,
      `conversationHistory-${index}-response`,
      MAX_HISTORY_RESPONSE_LENGTH,
      1,
    );
    if (!response.ok) return response;

    history.push({
      response: response.value,
      topic: topic.value,
      turn: entry.turn,
      type: entry.type,
    });
  }

  return { ok: true, value: history };
}

function parseCompactProfile(
  value: Record<string, unknown>,
): { ok: true; value: CompactCharacterProfile } | { ok: false; reason: string } {
  if (!hasOnlyFields(value, COMPACT_PROFILE_FIELDS)) {
    return { ok: false, reason: "characterProfile-invalid-fields" };
  }

  const name = boundedString(
    value.name,
    "characterProfile-name",
    MAX_PROFILE_NAME_LENGTH,
    1,
  );
  if (!name.ok) return name;

  const identity = boundedString(
    value.identity,
    "characterProfile-identity",
    MAX_PROFILE_TEXT_LENGTH,
    1,
  );
  if (!identity.ok) return identity;

  const scene = boundedString(
    value.scene,
    "characterProfile-scene",
    MAX_PROFILE_TEXT_LENGTH,
    1,
  );
  if (!scene.ok) return scene;

  const goals = boundedStringArray(
    value.goals,
    "characterProfile-goals",
    MAX_PROFILE_ARRAY_ITEMS,
    MAX_PROFILE_ARRAY_TEXT_LENGTH,
  );
  if (!goals.ok) return goals;

  const knownFacts = boundedStringArray(
    value.knownFacts,
    "characterProfile-knownFacts",
    MAX_PROFILE_ARRAY_ITEMS,
    MAX_PROFILE_ARRAY_TEXT_LENGTH,
  );
  if (!knownFacts.ok) return knownFacts;

  const unknownFacts = boundedStringArray(
    value.unknownFacts,
    "characterProfile-unknownFacts",
    MAX_PROFILE_ARRAY_ITEMS,
    MAX_PROFILE_ARRAY_TEXT_LENGTH,
  );
  if (!unknownFacts.ok) return unknownFacts;

  const voice = boundedStringArray(
    value.voice,
    "characterProfile-voice",
    MAX_PROFILE_ARRAY_ITEMS,
    MAX_PROFILE_ARRAY_TEXT_LENGTH,
  );
  if (!voice.ok) return voice;

  const directives =
    value.directives === undefined
      ? undefined
      : boundedStringArray(
          value.directives,
          "characterProfile-directives",
          MAX_PROFILE_ARRAY_ITEMS,
          MAX_PROFILE_ARRAY_TEXT_LENGTH,
        );
  if (directives && !directives.ok) return directives;

  return {
    ok: true,
    value: {
      directives: directives?.value,
      goals: goals.value,
      identity: identity.value,
      knownFacts: knownFacts.value,
      name: name.value,
      scene: scene.value,
      unknownFacts: unknownFacts.value,
      voice: voice.value,
    },
  };
}

function parseLegacyProfile(
  value: Record<string, unknown>,
): { ok: true; value: LegacyCharacterProfile } | { ok: false; reason: string } {
  if (!hasOnlyFields(value, LEGACY_PROFILE_FIELDS)) {
    return { ok: false, reason: "characterProfile-invalid-fields" };
  }

  const name = boundedString(
    value.name,
    "characterProfile-name",
    MAX_PROFILE_NAME_LENGTH,
    1,
  );
  if (!name.ok) return name;

  const background = boundedString(
    value.background,
    "characterProfile-background",
    MAX_PROFILE_TEXT_LENGTH,
    1,
  );
  if (!background.ok) return background;

  const personality = boundedString(
    value.personality,
    "characterProfile-personality",
    MAX_PROFILE_TEXT_LENGTH,
    1,
  );
  if (!personality.ok) return personality;

  const physicalState = boundedString(
    value.physicalState,
    "characterProfile-physicalState",
    MAX_PROFILE_TEXT_LENGTH,
    1,
  );
  if (!physicalState.ok) return physicalState;

  const timeContext = boundedString(
    value.timeContext,
    "characterProfile-timeContext",
    MAX_PROFILE_TEXT_LENGTH,
    1,
  );
  if (!timeContext.ok) return timeContext;

  const conversationContext = optionalString(
    value.conversationContext,
    "characterProfile-conversationContext",
    MAX_PROFILE_TEXT_LENGTH,
  );
  if (!conversationContext.ok) return conversationContext;

  const knowledge = boundedStringArray(
    value.knowledge,
    "characterProfile-knowledge",
    MAX_PROFILE_ARRAY_ITEMS,
    MAX_PROFILE_ARRAY_TEXT_LENGTH,
  );
  if (!knowledge.ok) return knowledge;

  const ignorance = boundedStringArray(
    value.ignorance,
    "characterProfile-ignorance",
    MAX_PROFILE_ARRAY_ITEMS,
    MAX_PROFILE_ARRAY_TEXT_LENGTH,
  );
  if (!ignorance.ok) return ignorance;

  const objectives = boundedStringArray(
    value.objectives,
    "characterProfile-objectives",
    MAX_PROFILE_ARRAY_ITEMS,
    MAX_PROFILE_ARRAY_TEXT_LENGTH,
  );
  if (!objectives.ok) return objectives;

  return {
    ok: true,
    value: {
      background: background.value,
      conversationContext: conversationContext.value,
      ignorance: ignorance.value,
      knowledge: knowledge.value,
      name: name.value,
      objectives: objectives.value,
      personality: personality.value,
      physicalState: physicalState.value,
      timeContext: timeContext.value,
    },
  };
}

function parseCharacterProfile(
  value: unknown,
): { ok: true; value: CharacterProfile } | { ok: false; reason: string } {
  if (!isRecord(value)) {
    return { ok: false, reason: "characterProfile-must-be-object" };
  }

  if ("identity" in value) {
    return parseCompactProfile(value);
  }

  return parseLegacyProfile(value);
}

function parseGossipContext(
  value: unknown,
): { ok: true; value?: GossipContext } | { ok: false; reason: string } {
  if (value === undefined) return { ok: true };

  if (!isRecord(value) || !hasOnlyFields(value, GOSSIP_FIELDS)) {
    return { ok: false, reason: "gossipContext-invalid-fields" };
  }

  const gossipSharedWithNpc = boundedStringArray(
    value.gossipSharedWithNpc,
    "gossipContext-gossipSharedWithNpc",
    MAX_GOSSIP_IDS,
    MAX_GOSSIP_ID_LENGTH,
  );
  if (!gossipSharedWithNpc.ok) return gossipSharedWithNpc;

  if (
    value.playerGossipInventory !== undefined &&
    (!Array.isArray(value.playerGossipInventory) ||
      value.playerGossipInventory.length > MAX_LEGACY_GOSSIP_INVENTORY)
  ) {
    return { ok: false, reason: "gossipContext-playerGossipInventory-invalid" };
  }

  let npcSecret: NpcSecretContext | undefined;
  if (value.npcSecret !== undefined) {
    if (
      !isRecord(value.npcSecret) ||
      !hasOnlyFields(value.npcSecret, NPC_SECRET_FIELDS)
    ) {
      return { ok: false, reason: "gossipContext-npcSecret-invalid-fields" };
    }

    const text = boundedString(
      value.npcSecret.text,
      "gossipContext-npcSecret-text",
      MAX_SECRET_TEXT_LENGTH,
      1,
    );
    if (!text.ok) return text;

    if (
      typeof value.npcSecret.requiresGossipCount !== "number" ||
      !Number.isInteger(value.npcSecret.requiresGossipCount) ||
      value.npcSecret.requiresGossipCount < 0 ||
      value.npcSecret.requiresGossipCount > 100
    ) {
      return {
        ok: false,
        reason: "gossipContext-npcSecret-requiresGossipCount-invalid",
      };
    }

    if (
      typeof value.npcSecret.currentCount !== "number" ||
      !Number.isInteger(value.npcSecret.currentCount) ||
      value.npcSecret.currentCount < 0 ||
      value.npcSecret.currentCount > 100
    ) {
      return {
        ok: false,
        reason: "gossipContext-npcSecret-currentCount-invalid",
      };
    }

    npcSecret = {
      currentCount: value.npcSecret.currentCount,
      requiresGossipCount: value.npcSecret.requiresGossipCount,
      text: text.value,
    };
  }

  return {
    ok: true,
    value: {
      gossipSharedWithNpc: gossipSharedWithNpc.value,
      npcSecret,
    },
  };
}

export function validateConversationRequest(body: unknown): ValidationResult {
  if (!isRecord(body) || !hasOnlyFields(body, TOP_LEVEL_FIELDS)) {
    return { ok: false, reason: "body-invalid-fields" };
  }

  const npcId = boundedString(body.npcId, "npcId", MAX_NPC_ID_LENGTH, 1);
  if (!npcId.ok) return npcId;

  if (!/^[A-Za-z0-9_.:-]+$/.test(npcId.value)) {
    return { ok: false, reason: "npcId-invalid-characters" };
  }

  const assistantContext = optionalString(
    body.assistantContext,
    "assistantContext",
    MAX_ASSISTANT_CONTEXT_LENGTH,
  );
  if (!assistantContext.ok) return assistantContext;

  const characterProfile = parseCharacterProfile(body.characterProfile);
  if (!characterProfile.ok) return characterProfile;

  const conversationHistory = parseConversationHistory(body.conversationHistory);
  if (!conversationHistory.ok) return conversationHistory;

  const playerInput = parsePlayerInput(body.playerInput);
  if (!playerInput.ok) return playerInput;

  const gossipContext = parseGossipContext(body.gossipContext);
  if (!gossipContext.ok) return gossipContext;

  return {
    ok: true,
    request: {
      assistantContext: assistantContext.value,
      characterProfile: characterProfile.value,
      conversationHistory: conversationHistory.value,
      gossipContext: gossipContext.value,
      npcId: npcId.value,
      playerInput: playerInput.value,
    },
  };
}
