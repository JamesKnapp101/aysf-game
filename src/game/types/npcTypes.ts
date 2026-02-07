import { Item } from "@game/types/itemTypes";

export type RadioVoice = {
  id: string; // "call1_dave"
  name: string; // "Dave"
  vocab?: string[]; // ["dave", "voice", "operator"]
};

export type ConversationTarget =
  | { kind: "radioVoice"; voice: RadioVoice }
  | { kind: "item"; item: Item };

export type RadioDialogId = string;

/**
 * Your keys are arrays like ["what hell"] but they end up as plain string keys.
 * So the actual runtime type is just string -> string.
 */
export type RadioAskMap = Record<string, string>;

/**
 * ping is numeric keys (1,2,3...) but in JS object keys become strings anyway.
 * This type allows 1,2,3 etc as keys.
 */
export type RadioPingMap = Record<number, string>;

export type RadioDialogEntry = {
  ask: Record<string, string>;
  tell: Record<string, string>;
  ping: string[];
  signOff: string;
};

export type RadioDialog = Record<string, RadioDialogEntry>;
