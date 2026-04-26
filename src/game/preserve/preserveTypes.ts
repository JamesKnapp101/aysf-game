import type { Direction } from "@game/types/roomTypes";

export const PRESERVE_ACTOR_IDS = [
  "badger",
  "boar",
  "bull",
  "bear",
  "barry",
] as const;

export type PreserveActorId = (typeof PRESERVE_ACTOR_IDS)[number];
export type PreserveTraversalActorId = PreserveActorId | "player";

export const PRESERVE_EXIT_RULE_IDS = [
  "rocky-slope-descent",
  "observation-tower-ladder",
  "dead-oak-climb",
  "drainage-pipe-crawl",
  "ruined-wall-breach",
] as const;

export type PreserveExitRuleId = (typeof PRESERVE_EXIT_RULE_IDS)[number];

export type GamePreserveDifficulty =
  | "very-easy"
  | "easy"
  | "moderate"
  | "hard"
  | "very-hard";

export type PreserveSense = "sight" | "scent";
export type PreserveTrackingReason = PreserveSense | "food" | "sound";

export type AnimalStatusId =
  | "stunned"
  | "fed"
  | "distracted"
  | "agitated"
  | "attached";

export type AnimalStatusEffect = {
  id: AnimalStatusId;
  intensity?: number;
  remainingTurns?: number;
  source?: string;
};

export type PreserveActorIntent =
  | { kind: "idle" }
  | { kind: "closeAttack" }
  | {
      kind: "charge";
      direction: Direction;
      targetRoomId: string;
    }
  | {
      kind: "investigate";
      reason: PreserveSense | "food" | "sound";
      targetRoomId: string;
    }
  | {
      kind: "move";
      targetRoomId: string;
    };

export type PreserveActorMemory = {
  lastKnownPlayerRoomId?: string;
  lastKnownPlayerSense?: PreserveTrackingReason;
  lastKnownPlayerTurn?: number;
  lastVisitedRoomId?: string;
  patrolTargetRoomId?: string;
};

export type PreserveActorRuntime = {
  actorId: PreserveActorId;
  countdowns: Record<string, number>;
  flags: Record<string, boolean>;
  intent: PreserveActorIntent;
  memory: PreserveActorMemory;
};

export type PreservePlayerRuntime = {
  scentMaskedTurns: number;
};

export type PreserveStructuresState = {
  deadOakState: "standing" | "collapsed";
  feedDispenserChargesRemaining: number;
  ruinedWallState: "intact" | "toppled";
};

export type PreserveStructureStateId = keyof PreserveStructuresState;

export type PreserveRunState = {
  activeAnimalId: PreserveActorId;
  actors: Record<PreserveActorId, PreserveActorRuntime>;
  difficulty: GamePreserveDifficulty;
  playerRuntime: PreservePlayerRuntime;
  structures: PreserveStructuresState;
};

export function isPreserveActorId(value: string): value is PreserveActorId {
  return (PRESERVE_ACTOR_IDS as readonly string[]).includes(value);
}
