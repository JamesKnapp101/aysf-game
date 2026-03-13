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
  | "to"
  | "through";

export type ParsedCommand =
  | { type: "inventory" }
  | { type: "diagnose" }
  | { type: "wait" }
  | { direction: Direction; type: "move" }
  | {
      direct?: string;
      indirect?: string;
      preposition?: Preposition;
      raw: string;
      type: "action";
      verb: string;
    }
  | { raw: string; type: "unknown" };
