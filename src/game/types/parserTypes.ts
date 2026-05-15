import type { Direction } from "./roomTypes";

export type Preposition =
  | "in"
  | "into"
  | "on"
  | "off"
  | "with"
  | "from"
  | "for"
  | "at"
  | "about"
  | "over"
  | "under"
  | "to"
  | "through";

export type ParsedCommand =
  | { type: "inventory" }
  | { type: "diagnose" }
  | { type: "comet" }
  | { type: "help" }
  | { type: "save" }
  | { type: "restore" }
  | { type: "restart" }
  | { raw: string; type: "developerMode" }
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
