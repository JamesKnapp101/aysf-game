import type { Item } from "@game/types/itemTypes";

export interface CompactCharacterProfile {
  directives?: string[];
  goals: string[];
  identity: string;
  knownFacts: string[];
  name: string;
  scene: string;
  unknownFacts: string[];
  voice: string[];
}

export interface LegacyCharacterProfile {
  background: string;
  conversationContext?: string;
  ignorance: string[];
  knowledge: string[];
  name: string;
  objectives: string[];
  personality: string;
  physicalState: string;
  timeContext: string;
}

export type CharacterProfile = CompactCharacterProfile | LegacyCharacterProfile;

export type CharacterProfileId = string;

export type ConversationNpc = {
  aiEnabled?: boolean;
  characterProfileId?: CharacterProfileId;
  id: string;
  name: string;
  vocab?: string[];
};

export type ConversationChannel = "radio" | "direct";

export type ConversationTarget =
  | { kind: "npc"; item?: Item; npc: ConversationNpc; via: ConversationChannel }
  | { kind: "item"; item: Item };

export type NpcDialogEntry = {
  ask: Record<string, string>;
  ping?: string[];
  signOff?: string;
  tell: Record<string, string>;
};

export type NpcDialog = Record<string, NpcDialogEntry>;

export interface ConversationHistoryEntry {
  response: string;
  topic: string;
  turn: number;
  type: "ask" | "tell";
}

export interface NpcConversationState {
  conversationHistory?: ConversationHistoryEntry[];
  topicsUsed?: Record<string, true>;
  gossipToldIds?: string[]; // Track which gossip IDs have been shared with this NPC
}

export interface RadioState {
  activeNpcId?: string;
  currentFrequency?: number;
  queuedLog?: string[];
  turnsRemaining?: number;
}
