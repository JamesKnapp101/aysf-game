import type { Item } from "@game/types/itemTypes";

export interface CharacterProfile {
  name: string;
  personality: string;
  background: string;
  knowledge: string[];
  ignorance: string[];
  physicalState: string;
  objectives: string[];
  timeContext: string;
  conversationContext?: string;
}

export type CharacterProfileId = string;

export type ConversationNpc = {
  id: string;
  name: string;
  vocab?: string[];
  aiEnabled?: boolean;
  characterProfileId?: CharacterProfileId;
};

export type ConversationChannel = "radio" | "direct";

export type ConversationTarget =
  | { kind: "npc"; npc: ConversationNpc; via: ConversationChannel; item?: Item }
  | { kind: "item"; item: Item };

export type NpcDialogEntry = {
  ask: Record<string, string>;
  tell: Record<string, string>;
  ping?: string[];
  signOff?: string;
};

export type NpcDialog = Record<string, NpcDialogEntry>;

export interface ConversationHistoryEntry {
  turn: number;
  type: "ask" | "tell";
  topic: string;
  response: string;
}

export interface NpcConversationState {
  topicsUsed?: Record<string, true>;
  conversationHistory?: ConversationHistoryEntry[];
}

export interface RadioState {
  activeNpcId?: string;
  turnsRemaining?: number;
  queuedLog?: string[];
}
