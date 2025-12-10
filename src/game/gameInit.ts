import type {
  DoorDefinition,
  DoorState,
  GameState,
  World,
} from "../world/types";

export function getOpeningSplashLogs(): string[] {
  return [
    "████████████████████████████████████████████████████████████",
    "█ AND YE SHALL FIND — SCIENCE FICTION                      █",
    "████████████████████████████████████████████████████████████",
    "Serial: 000002    Release: 2    Build: 2026.01.01-0201",
    "Copyright (c) 2026 Platypus Pot Pie Productions\n\n",
    "You feel cold, a low, dull cold that seeps into bone.",
    "You awaken slowly, drifting up from a black ocean of half-dreams, your thoughts sticky and sluggish. Something has been tugging at you from the dark edges of sleep, urging you to get up.",
    "You reach for blankets that aren’t there, when suddenly a tremor runs down your spine, and your eyes snap open.",
    "For a heartbeat you feel panic, with no clue where you are, no context, just raw fear. Then details trickle in: you’re on the floor, not a bed. A hard floor. Naked. A sharp ache pulses in your neck like you were dropped here.",
    "You sense dim lighting, and air that smells faintly of smoke.",
    "Where is this place?",
    "More importantly, where were you *supposed* to be?",
    "You reach into the void that should be your memory. A home. A name. A face. Nothing. You don’t know who you are.\n\n",
    "There has to be a reason you're here.",
  ];
}

export const createInitialState = (world: World): GameState => {
  // If initDoorStates still returns an array, convert it to a map here
  const initialDoorStatesArray = initDoorStates(world.doors);
  const doors: Record<string, DoorState> = {};
  for (const ds of initialDoorStatesArray) {
    doors[ds.id] = ds;
  }

  return {
    world,
    log: getOpeningSplashLogs(),
    score: 0,
    rating: 0,
    moves: 0,
    player: {
      roomId: "LivingQuartersFiveEast",
      inventory: [],
      memories: {
        memoryScore: 0,
        revealedFlags: new Set<string>(),
      },
      vitals: {
        health: 100,
        oxygen: 100,
        temperature: 98.6,
        brainActivity: 1,
        theSickness: 0,
      },
      statuses: [
        {
          id: "trixophine",
          intensity: 1,
        },
        {
          id: "vanitrax",
          intensity: 1,
        },
        {
          id: "radiation",
          intensity: 58,
        },
      ],
    },
    worldState: {
      doors,
    },
    itemState: {
      syringe: {
        loadedCartridgeId: undefined,
      },
      spentCartridges: {},
      openItems: {},
    },
  };
};

function initDoorStates(doorDefs: DoorDefinition[]): DoorState[] {
  return doorDefs.map((def) => ({
    id: def.id,
    isOpen: def.initiallyOpen ?? false,
    isLocked: def.initiallyLocked ?? false,
  }));
}
