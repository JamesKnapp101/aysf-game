import type { Direction } from "./roomTypes";

export type DoorKind =
  | "standard" // open/close, optionally locked
  | "keyed" // needs a specific item
  | "badgeScanner" // needs a badge in inventory
  | "airlock" // special behavior on open
  | "scripted"; // fully custom hook

export interface DoorDefinition {
  id: string;
  name: string;
  // fallback description if side-specific ones aren’t set
  description?: string;

  // optional side-specific descriptions
  descriptionFromA?: string;
  descriptionFromB?: string;
  vocab: string[];
  // where does this door actually live
  connects: {
    roomAId: string;
    roomBId: string;
  };

  // optional: which direction in each room (for flavor / messages)
  directions?: {
    fromA: Direction;
    fromB: Direction;
  };

  kind: DoorKind;

  initiallyOpen?: boolean;
  initiallyLocked?: boolean;

  // for keyed/badge doors
  keyItemId?: string; // e.g. "EngineRoomKey"
  badgeItemId?: string; // e.g. "GreenBadge"
  checkBadgeOnDir?: string;

  // for scripted / special doors
  scriptId?: string; // engine can dispatch to a script table

  // flavor text overrides (optional)
  openVerb?: string; // "slide open", "irises open", etc.
  closeVerb?: string; // "slides shut", etc.
}

export interface DoorState {
  id: string;
  isOpen: boolean;
  isLocked: boolean;
}
