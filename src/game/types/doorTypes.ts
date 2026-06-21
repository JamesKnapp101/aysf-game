import type { GameState } from "@game/types/gameTypes";
import type { DescriptionContext } from "@game/types/itemTypes";
import type { Direction } from "./roomTypes";

export type DoorInteractionResult = {
  message?: string;
  state: GameState;
};

export type DoorInteractionHook = (
  state: GameState,
  doorState: DoorState,
) => DoorInteractionResult | undefined;

export type DoorKind =
  | "blocked"
  | "standard"
  | "keyed"
  | "badgeScanner"
  | "airlock"
  | "scripted";

export interface DoorDefinition {
  afterClose?: DoorInteractionHook;
  afterOpen?: DoorInteractionHook;
  badgeItemId?: string;
  beforeClose?: DoorInteractionHook;
  blockMsg?: string;
  checkBadgeOnDir?: string;
  closeVerb?: string;
  connects: {
    roomAId: string;
    roomBId: string;
  };
  describe?: (state: GameState, ctx: DescriptionContext) => string;
  describeFromA?: (state: GameState, ctx: DescriptionContext) => string;
  describeFromB?: (state: GameState, ctx: DescriptionContext) => string;
  description?: string;
  descriptionFromA?: string;
  descriptionFromB?: string;
  directions?: {
    fromA: Direction;
    fromB: Direction;
  };
  id: string;
  initiallyLocked?: boolean;
  initiallyOpen?: boolean;
  keyItemId?: string;
  kind: DoorKind;
  name: string;
  openVerb?: string;
  scriptId?: string;
  vocab: string[];
}

export interface DoorState {
  id: string;
  isLocked: boolean;
  isOpen: boolean;
}
