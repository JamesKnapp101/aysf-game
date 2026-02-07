import { GameState } from "@game/types/gameTypes";
import { DescriptionContext } from "@game/types/itemTypes";
import type { Direction } from "./roomTypes";

export type DoorKind =
  | "blocked"
  | "standard"
  | "keyed"
  | "badgeScanner"
  | "airlock"
  | "scripted";

export interface DoorDefinition {
  id: string;
  name: string;
  description?: string;
  describe?: (state: GameState, ctx: DescriptionContext) => string;
  descriptionFromA?: string;
  descriptionFromB?: string;
  describeFromA?: (state: GameState, ctx: DescriptionContext) => string;
  describeFromB?: (state: GameState, ctx: DescriptionContext) => string;
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
  blockMsg?: string;
}

export interface DoorState {
  id: string;
  isOpen: boolean;
  isLocked: boolean;
}
