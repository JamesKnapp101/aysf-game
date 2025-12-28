import {
  INITIAL_CONTAINER_CONTENTS,
  INITIAL_SURFACE_CONTENTS,
  INITIAL_UNDER_CONTENTS,
} from "./containerContents";

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

  // Seed all the containers with their starting contents
  // Anything defined with location === "INVENTORY" should start in the player's inventory
  const startingInventoryIds = normalizedWorld.items
    .filter((it) => it.location === "INVENTORY")
    .map((it) => it.id);

  const initialGameState: GameState = {
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
        theSickness: undefined,
      },
      statusEffects: [
        {
          id: "regenerationWoozies",
          intensity: 1,
          remainingTurns: 18,
        },
      ],
    },
    worldState: {
      doors,
      darkRooms: {
        FiveEastBed: true,
      },
    },
    itemState: {
      pickedUpByPlayer: {},
      wornByPlayer: {
        head: undefined,
        face: undefined,
        neck: undefined,
        torso: undefined,
        legs: undefined,
        feet: undefined,
        wrist: undefined,
        waist: undefined,
        body: undefined,
      },
      syringe: { loadedCartridgeId: undefined },
      openItems: {},
      spentCartridges: {},
      containerContents: {},
      containerFilled: {},
      surfaceContents: {},
      underContents: {},
      revealedUnder: {},
      searchableContents: {},
      itemSettings: {
        Cooler: { kind: "cooler", mode: "off" },
        NVGoggles: { kind: "goggles", isOn: false },
        PLT: { kind: "plt-viewer", isOn: true, hasLink: true },
      },
      frozenItems: {},
      messagesPlayed: {},
      activeGelCameras: {
        GelRound1: true,
      },
    },
  };
  return seedInitialPlacements(initialGameState);
};

function initDoorStates(doorDefs: DoorDefinition[]): DoorState[] {
  return doorDefs.map((def) => ({
    id: def.id,
    isOpen: def.initiallyOpen ?? false,
    isLocked: def.initiallyLocked ?? false,
  }));
}

function mergeContents(
  existing: Record<string, string[]>,
  seeds: Record<string, string[]>
): Record<string, string[]> {
  const next: Record<string, string[]> = { ...existing };

  for (const [hostId, seededIds] of Object.entries(seeds)) {
    const current = next[hostId] ?? [];
    next[hostId] = Array.from(new Set([...current, ...seededIds]));
  }

  return next;
}

export function seedContainerContents(
  state: GameState,
  seeds: Record<string, string[]>
): GameState {
  return {
    ...state,
    itemState: {
      ...state.itemState,
      containerContents: mergeContents(
        state.itemState.containerContents,
        seeds
      ),
    },
  };
}

export function seedSurfaceContents(
  state: GameState,
  seeds: Record<string, string[]>
): GameState {
  return {
    ...state,
    itemState: {
      ...state.itemState,
      surfaceContents: mergeContents(state.itemState.surfaceContents, seeds),
    },
  };
}

export function seedUnderContents(
  state: GameState,
  seeds: Record<string, string[]>
): GameState {
  return {
    ...state,
    itemState: {
      ...state.itemState,
      underContents: mergeContents(state.itemState.underContents, seeds),
      revealedUnder: {
        ...state.itemState.revealedUnder,
      },
    },
  };
}

export function seedInitialPlacements(state: GameState): GameState {
  let next = state;
  next = seedContainerContents(next, INITIAL_CONTAINER_CONTENTS);
  next = seedSurfaceContents(next, INITIAL_SURFACE_CONTENTS);
  next = seedUnderContents(next, INITIAL_UNDER_CONTENTS);
  return next;
}
