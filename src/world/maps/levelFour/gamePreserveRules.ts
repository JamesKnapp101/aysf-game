import type {
  GamePreserveDifficulty,
  PreserveActorId,
  PreserveExitRuleId,
  PreserveSense,
  PreserveStructureStateId,
  PreserveTraversalActorId,
} from "@game/preserve/preserveTypes";

export type PreserveRoomRule = {
  allowedActors?: PreserveTraversalActorId[];
  blockedActors?: PreserveTraversalActorId[];
  concealsPlayerFromSenses?: PreserveSense[];
  dislodgeAttachedActors?: PreserveActorId[];
  entryMessage?: string;
  masksPlayerScentTurns?: number;
};

export type PreserveExitRule = {
  allowedActors?: PreserveTraversalActorId[];
  blockedActors?: PreserveTraversalActorId[];
  blockMessage?: string;
  entryMessage?: string;
  structureGate?: {
    mustEqual: string;
    structureId: PreserveStructureStateId;
  };
};

export type PreserveAnimalProfile = {
  actorId: PreserveActorId;
  attachmentAttack?: {
    attachedRoomDescription: string;
    attachedTurnMessage: string;
    damagePerTurn: number;
    deathMessage: string;
    dislodgeMessage: string;
    dislodgeStunnedTurns: number;
    pounceMessage: string;
    recoveryRoomId: string;
    recoveryStunnedTurns: number;
    safeRoomIds: readonly string[];
    shoreMessage?: string;
    trophyItemId: string;
    waterResolutionMessage: string;
  };
  bullCharge?: {
    chargeMoveRooms: number;
    closeContactDeathChance: number;
    cooldownTurnsAfterCharge: number;
    cooldownTurnsAfterCrash: number;
    crashStunnedTurns: number;
    triggerRadius: number;
  };
  displayName: string;
  followingStartedMessage: string;
  followingStoppedMessage: string;
  idleBehavior?: "patrol" | "wait";
  initialPatrolTargetRoomId?: string;
  initialRoomId: string;
  loseTrackAfterTurns: number;
  moveEveryTurns: number;
  movesPerTurn?: number;
  persistentPursuit?: boolean;
  patrolRoomIds: readonly string[];
  proximityRadius: number;
  senses: PreserveSense[];
  sightRadius?: number;
  soundCues: {
    approaching: string;
    close: string;
    idle: string;
  };
  visibleDescription: string;
  whistleEnrage?: {
    countdownId: string;
    movesPerTurn: number;
    turns: number;
  };
};

export const GAME_PRESERVE_ROOM_IDS = [
  "GamePreserveEntrance",
  "OpenSavanna",
  "ObservationTower",
  "ObservationTowerTop",
  "RockyRidge",
  "TallGrass",
  "Thicket",
  "Waterhole",
  "UnusedPen",
  "Mudflats",
  "RuinedWall",
  "DrainagePipe",
  "DeadOak",
  "DeadOakPerch",
  "TrophyRoom",
  "GamePreserveStaging",
] as const;

export const GAME_PRESERVE_SPAWN_ROOM_ID = "UnusedPen";
export const GAME_PRESERVE_STAGING_ROOM_ID = "GamePreserveStaging";

export const GAME_PRESERVE_DIFFICULTY_ANIMAL_MAP: Record<
  GamePreserveDifficulty,
  PreserveActorId
> = {
  "very-easy": "badger",
  easy: "boar",
  moderate: "bull",
  hard: "bear",
  "very-hard": "barry",
};

const BADGER_PATROL_ROOM_IDS = [] as const;

const BOAR_PATROL_ROOM_IDS = [
  "OpenSavanna",
  "RockyRidge",
  "TallGrass",
  "UnusedPen",
  "Mudflats",
  "RuinedWall",
  "DrainagePipe",
  "DeadOak",
] as const;

const BULL_PATROL_ROOM_IDS = [
  "OpenSavanna",
  "ObservationTower",
  "RockyRidge",
  "TallGrass",
  "Thicket",
  "UnusedPen",
  "Mudflats",
  "RuinedWall",
  "DeadOak",
] as const;

const BEAR_PATROL_ROOM_IDS = [
  "OpenSavanna",
  "ObservationTower",
  "RockyRidge",
  "TallGrass",
  "Thicket",
  "Waterhole",
  "UnusedPen",
  "Mudflats",
  "RuinedWall",
  "DeadOak",
  "DeadOakPerch",
] as const;

const BARRY_PATROL_ROOM_IDS = [
  "OpenSavanna",
  "ObservationTower",
  "RockyRidge",
  "TallGrass",
  "Thicket",
  "Waterhole",
  "UnusedPen",
  "Mudflats",
  "RuinedWall",
  "DrainagePipe",
  "DeadOak",
  "DeadOakPerch",
] as const;

export const GAME_PRESERVE_ANIMAL_PROFILES: Record<
  PreserveActorId,
  PreserveAnimalProfile
> = {
  badger: {
    actorId: "badger",
    attachmentAttack: {
      attachedRoomDescription: "All you can see is angry, snapping badger!",
      attachedTurnMessage:
        "The badger continues to hold onto your face, scratching and snapping!",
      damagePerTurn: 3,
      deathMessage:
        "The badger worries at your face and scalp with horrible, tireless focus until the world narrows to teeth, claws, and then nothing.",
      dislodgeMessage:
        "You hammer at the badger until it tears loose from your face and hits the ground stunned, still snarling.",
      dislodgeStunnedTurns: 2,
      pounceMessage:
        "The low, black-and-white shape launches at you in a blur and clamps onto your face, claws digging in as it snaps and thrashes!",
      recoveryRoomId: "Mudflats",
      recoveryStunnedTurns: 3,
      safeRoomIds: [
        "GamePreserveEntrance",
        "ObservationTower",
        "ObservationTowerTop",
        "Waterhole",
        "TrophyRoom",
      ],
      shoreMessage:
        "The badger stops at the edge of the water, screeching and snapping in frustrated fury.",
      trophyItemId: "BadgerClaw",
      waterResolutionMessage:
        "You plunge under the murky water with the badger still attached. The struggle becomes a boiling knot of bubbles, claws, and muffled screeching before it finally rips free and kicks away. Something tears loose and stays lodged in your scalp as the badger thrashes to shore, collapses in the mud, and lies there panting.",
    },
    displayName: "badger",
    followingStartedMessage:
      "Something low to the ground has caught your trail and starts tearing after you.",
    followingStoppedMessage:
      "The furious scrabbling loses focus and fades back into the preserve.",
    idleBehavior: "wait",
    initialRoomId: "Mudflats",
    loseTrackAfterTurns: 3,
    moveEveryTurns: 1,
    movesPerTurn: 1,
    persistentPursuit: true,
    patrolRoomIds: BADGER_PATROL_ROOM_IDS,
    proximityRadius: 2,
    senses: ["sight"],
    sightRadius: 5,
    soundCues: {
      approaching:
        "Low, vicious rustling carries {locale}, moving your way through the cover.",
      close:
        "Something small and furious is thrashing through brush {locale}.",
      idle:
        "You hear quick, angry scrabbling {locale}, too low in the cover to identify.",
    },
    visibleDescription:
      "a compact black-and-white shape ripping through the low cover",
    whistleEnrage: {
      countdownId: "whistleRageTurns",
      movesPerTurn: 2,
      turns: 3,
    },
  },
  boar: {
    actorId: "boar",
    displayName: "boar",
    followingStartedMessage:
      "A bristling shape catches your trail and wheels hard in your direction.",
    followingStoppedMessage:
      "The sharp squeals and brush-crashes veer away, no longer tracking you.",
    initialRoomId: GAME_PRESERVE_SPAWN_ROOM_ID,
    initialPatrolTargetRoomId: "TallGrass",
    loseTrackAfterTurns: 3,
    moveEveryTurns: 1,
    patrolRoomIds: BOAR_PATROL_ROOM_IDS,
    proximityRadius: 2,
    senses: ["scent"],
    soundCues: {
      approaching:
        "Brush snaps and churns {locale}, the movement angling toward you.",
      close: "Something heavy and low snorts through the brush {locale}.",
      idle: "You hear coarse snuffling and tusks scraping bark {locale}.",
    },
    visibleDescription:
      "a bristly brown boar shouldering through the grass with its tusks low",
  },
  bull: {
    actorId: "bull",
    bullCharge: {
      chargeMoveRooms: 2,
      closeContactDeathChance: 0.5,
      cooldownTurnsAfterCharge: 2,
      cooldownTurnsAfterCrash: 3,
      crashStunnedTurns: 2,
      triggerRadius: 2,
    },
    displayName: "bull",
    followingStartedMessage:
      "The bull jerks its head up, squares itself to you, and starts coming your way.",
    followingStoppedMessage:
      "The heavy hoofbeats slow, then drift back into a restless patrol.",
    initialRoomId: GAME_PRESERVE_SPAWN_ROOM_ID,
    initialPatrolTargetRoomId: "OpenSavanna",
    loseTrackAfterTurns: 3,
    moveEveryTurns: 1,
    patrolRoomIds: BULL_PATROL_ROOM_IDS,
    proximityRadius: 3,
    senses: ["sight"],
    sightRadius: 5,
    soundCues: {
      approaching:
        "Heavy hooves hammer through the preserve {locale}, closing on your position.",
      close: "You hear a huge animal snort and scrape at the ground {locale}.",
      idle:
        "You hear the slow churn of heavy hooves moving through the preserve {locale}.",
    },
    visibleDescription:
      "a large, black bull moving across the preserve with its head low",
  },
  bear: {
    actorId: "bear",
    displayName: "bear",
    followingStartedMessage:
      "A massive shape turns with sudden purpose and begins bearing down on you.",
    followingStoppedMessage:
      "The heavy, rolling movement eases off and becomes aimless again.",
    initialRoomId: GAME_PRESERVE_SPAWN_ROOM_ID,
    initialPatrolTargetRoomId: "Waterhole",
    loseTrackAfterTurns: 3,
    moveEveryTurns: 1,
    patrolRoomIds: BEAR_PATROL_ROOM_IDS,
    proximityRadius: 2,
    senses: ["sight", "scent"],
    sightRadius: 4,
    soundCues: {
      approaching:
        "A huge body moves {locale}, brush and branches breaking as it closes in.",
      close: "You hear wet breathing and heavy paws shifting {locale}.",
      idle: "You catch heavy, rolling movement somewhere {locale}.",
    },
    visibleDescription:
      "a big brown bear moving with ugly patience through the preserve",
  },
  barry: {
    actorId: "barry",
    displayName: "Barry",
    followingStartedMessage:
      "The confused figure spots you and starts moving with alarming confidence.",
    followingStoppedMessage:
      "The erratic footsteps wander off, no longer aimed at you.",
    initialRoomId: GAME_PRESERVE_SPAWN_ROOM_ID,
    initialPatrolTargetRoomId: "Thicket",
    loseTrackAfterTurns: 3,
    moveEveryTurns: 1,
    patrolRoomIds: BARRY_PATROL_ROOM_IDS,
    proximityRadius: 2,
    senses: ["sight"],
    sightRadius: 4,
    soundCues: {
      approaching:
        "Bare feet slap through the preserve {locale}, somehow getting closer.",
      close: "You hear ragged breathing and muttered panic {locale}.",
      idle: "You hear uneven footsteps wandering around {locale}.",
    },
    visibleDescription:
      "a naked, bewildered man moving through the preserve like he belongs here",
  },
};

export const GAME_PRESERVE_ROOM_RULES: Partial<Record<string, PreserveRoomRule>> =
  {
    GamePreserveEntrance: {
      allowedActors: ["player"],
      concealsPlayerFromSenses: ["sight"],
    },
    TallGrass: {
      concealsPlayerFromSenses: ["sight"],
      entryMessage:
        "You plunge into the tall grass, just able to see over the top of it. With your head down, you're pretty well hidden.",
    },
    ObservationTower: {
      concealsPlayerFromSenses: ["sight"],
    },
    ObservationTowerTop: {
      allowedActors: ["player"],
      concealsPlayerFromSenses: ["sight", "scent"],
    },
    Thicket: {
      allowedActors: ["player", "bull", "bear", "barry"],
      entryMessage:
        "You step carefully, making your way through the bramble but smaller, less agile creatures might have problems.",
    },
    Waterhole: {
      allowedActors: ["player", "bear", "barry"],
      masksPlayerScentTurns: 3,
    },
    Mudflats: {
      entryMessage:
        "You squelch through the mud, getting plastered in it up to your knees.",
      masksPlayerScentTurns: 3,
    },
    DrainagePipe: {
      allowedActors: ["player", "boar", "badger", "barry"],
      concealsPlayerFromSenses: ["sight"],
    },
    DeadOakPerch: {
      allowedActors: ["player", "bear", "barry"],
    },
    TrophyRoom: {
      allowedActors: ["player"],
      concealsPlayerFromSenses: ["sight"],
    },
  };

export const GAME_PRESERVE_EXIT_RULES: Partial<
  Record<PreserveExitRuleId, PreserveExitRule>
> = {
  "rocky-slope-descent": {
    allowedActors: ["player", "bear", "barry"],
    entryMessage:
      "You slide down the steep ridge, scattering dirt and rocks before splashing down into the water.",
  },
  "observation-tower-ladder": {
    allowedActors: ["player"],
    blockMessage:
      "The tower ladder is too narrow and exposed for anything in the preserve to climb after you.",
  },
  "dead-oak-climb": {
    allowedActors: ["player", "bear", "barry"],
    blockMessage:
      "The dead oak can only be climbed by you or by something with enough raw leverage.",
  },
  "drainage-pipe-crawl": {
    allowedActors: ["player", "boar", "badger", "barry"],
    blockMessage:
      "The drainage pipe is too cramped for anything larger to squeeze through.",
  },
  "ruined-wall-breach": {
    allowedActors: ["player", "boar", "badger", "barry"],
    blockMessage:
      "The cracked wall still blocks the way into the drainage pipe.",
    structureGate: {
      mustEqual: "toppled",
      structureId: "ruinedWallState",
    },
  },
};

export function isGamePreserveRoomId(roomId: string): boolean {
  return (GAME_PRESERVE_ROOM_IDS as readonly string[]).includes(roomId);
}

export function getPreserveAnimalProfile(
  actorId: PreserveActorId,
): PreserveAnimalProfile {
  return GAME_PRESERVE_ANIMAL_PROFILES[actorId];
}
