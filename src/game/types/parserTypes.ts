import type { Direction } from "./roomTypes";

export type Preposition =
  | "in"
  | "into"
  | "on"
  | "with"
  | "from"
  | "at"
  | "about"
  | "to";

export type ParsedCommand =
  | { type: "look" }
  | { type: "inventory" }
  | { type: "move"; direction: Direction }
  | {
      type: "action";
      verb: string; // normalized verb: "take", "inject", "open", etc.
      direct?: string; // first noun phrase
      preposition?: Preposition;
      indirect?: string; // second noun phrase
      raw: string;
    }
  | { type: "unknown"; raw: string };
