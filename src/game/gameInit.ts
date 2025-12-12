import type { DoorDefinition, DoorState } from "./types/doorTypes";
import type { GameState, World } from "./types/gameTypes";

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
  // Normalize / dedupe items by id in case any world-building merged them twice
  const uniqueItems = Array.from(
    new Map(world.items.map((it) => [it.id, it])).values()
  );

  const normalizedWorld: World = {
    ...world,
    items: uniqueItems,
  };

  // Initialize doorStates as a map keyed by door id
  const initialDoorStatesArray = initDoorStates(normalizedWorld.doors);
  const doors: Record<string, DoorState> = {};
  for (const ds of initialDoorStatesArray) {
    doors[ds.id] = ds;
  }

  // Anything defined with location === "INVENTORY" should start in the player's inventory
  const startingInventoryIds = normalizedWorld.items
    .filter((it) => it.location === "INVENTORY")
    .map((it) => it.id);

  return {
    world: normalizedWorld,
    log: getOpeningSplashLogs(),
    score: 0,
    rating: 0,
    moves: 0,

    player: {
      roomId: "LivingQuartersFiveEast",
      inventory: startingInventoryIds,
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
      statusEffects: [
        {
          id: "radiation",
          intensity: 57,
        },
      ],
    },

    worldState: {
      doors,
    },

    itemState: {
      syringe: { loadedCartridgeId: undefined },
      spentCartridges: {},
      openItems: {},
      openContainers: {},
      containerContents: {},
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
