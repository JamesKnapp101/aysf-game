import type { Direction } from "./roomTypes";

export type Preposition =
  | "in"
  | "into"
  | "on"
  | "with"
  | "from"
  | "at"
  | "about"
  | "over"
  | "to";

export type ParsedCommand =
  | { type: "look" }
  | { type: "inventory" }
  | { type: "diagnose" }
  | { type: "wait" }
  | { type: "move"; direction: Direction }
  | {
      type: "action";
      verb: string;
      direct?: string;
      preposition?: Preposition;
      indirect?: string;
      raw: string;
    }
  | { type: "unknown"; raw: string };
