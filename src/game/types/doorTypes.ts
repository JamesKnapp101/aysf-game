import type { Direction } from "./roomTypes";

export type DoorKind =
  | "standard"
  | "keyed"
  | "badgeScanner"
  | "airlock"
  | "scripted";

export interface DoorDefinition {
  id: string;
  name: string;
  description?: string;
  descriptionFromA?: string;
  descriptionFromB?: string;
  vocab: string[];
  connects: {
    roomAId: string;
    roomBId: string;
  };
  directions?: {
    fromA: Direction;
    fromB: Direction;
  };
  kind: DoorKind;
  initiallyOpen?: boolean;
  initiallyLocked?: boolean;
  keyItemId?: string;
  badgeItemId?: string;
  checkBadgeOnDir?: string;
  scriptId?: string;
  openVerb?: string;
  closeVerb?: string;
}

export interface DoorState {
  id: string;
  isOpen: boolean;
  isLocked: boolean;
}
