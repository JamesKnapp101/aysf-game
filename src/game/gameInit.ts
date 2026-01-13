import { deriveRoomCoordMaps } from "@game/helpers/coordHelpers";
import {
  INITIAL_CONTAINER_CONTENTS,
  INITIAL_SURFACE_CONTENTS,
  INITIAL_UNDER_CONTENTS,
} from "./containerContents";
import { seedItemRoomLocations } from "./helpers/itemHelpers";

import { AVIARY_SPOTLIGHT_ROUTE } from "@game/engine/ticks/aviaryTick";
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

  const { coordByRoomId, roomIdByCoord } = deriveRoomCoordMaps(
    normalizedWorld.rooms,
    normalizedWorld.doors,
    "InsideShuttle",
    {
      ignoreIslands: true,
      excludeRoomIdPatterns: [/Elevator/i, /Shaft/i],
    }
  );

  const worldWithMeta: World = {
    ...normalizedWorld,
    meta: {
      ...(normalizedWorld as any).meta,
      transmitter: { coordByRoomId, roomIdByCoord },
    },
  };

  // Initialize doorStates as a map keyed by door id
  const initialDoorStatesArray = initDoorStates(worldWithMeta.doors);
  const doors: Record<string, DoorState> = {};
  for (const ds of initialDoorStatesArray) {
    doors[ds.id] = ds;
  }

  // Seed all the containers with their starting contents
  // Anything defined with location === "INVENTORY" should start in the player's inventory
  const startingInventoryIds = worldWithMeta.items
    .filter((it) => it.location === "INVENTORY")
    .map((it) => it.id);

  const initialGameState: GameState = {
    rng: () => Math.random(),
    world: worldWithMeta,
    log: getOpeningSplashLogs(),
    score: 0,
    rating: 0,
    moves: 0,
    player: {
      roomId: "InnerRingSouth",
      inventory: startingInventoryIds,
      memoriesTriggered: {
        own_name: false,
        own_occupation: false,
        own_voice: false,
        own_handwriting: false,
        aware_of_reincarnation: false,
        aware_of_reincarnation_nature: false,
        aware_of_own_role_in_reincarnation: false,
        gorilla_name: false,
        cat_name: false,
        kira_one: false,
        kira_two: false,
        pinhole_cause: false,
        aware_of_statue_nature: false,
        aware_of_innoculant: false,
        listened_to_music_box: false,
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
        // Aviary rooms
        OuterRingNorth: true,
        OuterRingTopEastBend: true,
        OuterRingTopWestBend: true,
        OuterRingNorthEastBend: true,
        OuterRingNorthWestBend: true,
        OuterRingSouthWestBend: true,
        OuterRingSouthEastBend: true,
        OuterRingBottomWestBend: true,
        OuterRingBottomEastBend: true,
        OuterRingSouth: true,
        InnerRingNorth: true,
        InnerRingEast: true,
        InnerRingWest: true,
        AviaryMaintenance: true,
        InnerRingSouth: true,
      },
      noPowerRooms: {
        // This will basically be everything on some of the floors
        FiveEastBed: true, // for testing
      },
      powerRestoredSections: {
        "lights-level-one": true,
        "lights-level-two": false,
        "lights-level-three": true,
        "lights-level-four": true,
        "lights-level-five": false,
        "lights-level-six": false,
        "lights-level-seven": false,
        "gravity-level-one": true,
        "gravity-level-two": true,
        "gravity-level-three": true,
        "gravity-level-four": true,
        "gravity-level-five": true,
        "gravity-level-six": true,
        "gravity-level-seven": true,
        "library-power": false,
        "hub-security": true,
        "teleport-pads-green": false,
        "teleport-pads-blue": false,
        "teleport-pads-yellow": false,
        "teleport-pads-brown": false,
        "teleport-pads-white": false,
        "teleport-pads-grey": false,
        "engine-room-power-lock": false,
        "weapons-system": false,
        "loading-dock-door": true,
        "loading-grid": false,
        "cryo-labs": true,
        "cryo-sleep": true,
        "power-key-turned": false,
        "power-initialized": false,
      },
      gravityOffRooms: {},
      visitedRooms: {
        PowerGrid: false,
        StairWellSeven: true,
      },
      roomAirQuality: {
        StairWellSeven: "thin",
      },
      roomAudioLevel: {
        PowerGrid: 1,
        StairWellSeven: 1,
      },
      roomTemp: {
        StairWellSeven: "cool",
        WalkIn: "freezing",
      },
      scoresTriggered: {
        accessed_above_quad: false,
        accessed_bridge: false,
        accessed_engine_room: false,
        accessed_hydroponics: false,
        accessed_medical_lab: false,
        accessed_medical_storage: false,
        accessed_power_grid: false,
        accessed_roof: false,
        accessed_shuttle: false,
        accessed_stasis_floor: false,
        accessed_xenolab: false,
        accessed_zoo_two: false,
        activated_level_five_lights: false,
        activated_level_two_lights: false,
        activated_main_power: false,
        activated_movie_projector: false,
        activated_plt_link: false,
        completed_engine_shut_down: false,
        defeated_xl999: false,
        discovered_magic_word: false,
        found_elephant_lamp: false,
        found_i_quit_note: false,
        found_squirrel_cache: false,
        gorilla_in_cryopod: false,
        gorilla_sedated: false,
        initiated_shutdown_from_terminal: false,
        obtained_black_badge: false,
        obtained_blue_badge: false,
        obtained_brown_badge: false,
        obtained_code_from_parrot: false,
        obtained_coord_finder: false,
        obtained_correct_thumb: false,
        obtained_dogtag: false,
        obtained_doll_key: false,
        obtained_emp: false,
        obtained_engine_room_key: false,
        obtained_engine_shutdown_code: false,
        obtained_gravity_boots: false,
        obtained_green_badge: false,
        obtained_grey_badge: false,
        obtained_hub_pass: false,
        obtained_infection_report: false,
        obtained_innoculant: false,
        obtained_lotto_ticket: false,
        obtained_music_box: false,
        obtained_new_z4_detonator: false,
        obtained_nv_goggles: false,
        obtained_pink_badge: false,
        obtained_power_key: false,
        obtained_radiation_cure: false,
        obtained_secret_phone_number_1: false,
        obtained_specimen_report: false,
        obtained_white_badge: false,
        obtained_yellow_badge: false,
        obtained_z4: false,
        opened_safe: false,
        rehydrated_slug: false,
        saved_by_inertial_dampener: false,
        saved_by_zap_protection: false,
        solved_airlock_puzzle: false,
        solved_blocked_engineering_puzzle: false,
        solved_bloodbag_puzzle: false,
        solved_cameragun_puzzle: false,
        solved_flaregun_puzzle: false,
        solved_hydroponics_fire_puzzle: false,
        solved_mindgun_puzzle: false,
        solved_slug_puzzle: false,
        solved_spa_puzzle: false,
        solved_stasis_gun_puzzle: false,
        solved_z4_puzzle: false,
        viewed_ship_log: false,
      },
      mensLockerContents: {
        menLocker1: [],
        menLocker2: [],
        menLocker3: [],
        menLocker4: [],
        menLocker5: ["IResign"],
        menLocker6: ["LottoTicket"],
        menLocker7: [],
        menLocker8: [],
        menLocker9: [],
        menLocker10: [],
        menLocker11: [],
        menLocker12: [],
        menLocker13: ["CoordFinder"],
        menLocker14: ["BrokenLamp"],
        menLocker15: [],
        menLocker16: [],
      },
      womensLockerContents: {
        womenLocker1: ["MagicWord"],
        womenLocker2: [],
        womenLocker3: ["MusicBOX"],
        womenLocker4: [],
        womenLocker5: [],
        womenLocker6: [],
        womenLocker7: [],
        womenLocker8: [],
        womenLocker9: [],
        womenLocker10: [],
        womenLocker11: [],
        womenLocker12: ["PhoneNumber"],
        womenLocker13: [],
        womenLocker14: [],
        womenLocker15: [],
        womenLocker16: [],
      },
      mensLockersOpened: {
        menLocker1: false,
        menLocker2: false,
        menLocker3: false,
        menLocker4: false,
        menLocker5: false,
        menLocker6: false,
        menLocker7: false,
        menLocker8: false,
        menLocker9: false,
        menLocker10: false,
        menLocker11: false,
        menLocker12: false,
        menLocker13: false,
        menLocker14: false,
        menLocker15: false,
        menLocker16: false,
      },
      womensLockersOpened: {
        womenLocker1: false,
        womenLocker2: false,
        womenLocker3: false,
        womenLocker4: false,
        womenLocker5: false,
        womenLocker6: false,
        womenLocker7: false,
        womenLocker8: false,
        womenLocker9: false,
        womenLocker10: false,
        womenLocker11: false,
        womenLocker12: false,
        womenLocker13: false,
        womenLocker14: false,
        womenLocker15: false,
        womenLocker16: false,
      },
      octopusState: {
        rootRoomId: "AqCross",
        occupiedRoomIds: [],
        tipRoomIds: [],
        maxSegments: 0,
        movesPerTick: 0,
        retreatTicks: 0,
        lastSeenPlayerRoomId: undefined,
        trailQueue: [],
      },
      playerDeaths: {},
      aviarySpotlight: {
        route: AVIARY_SPOTLIGHT_ROUTE,
        index: 0,
        turnsLeftHere: 1,
        pauseWhenPlayerNotInAviary: false,
        hintCooldown: 0,
      },
    },
    itemState: {
      itemRoomId: {},
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
      openItems: {
        PowerStationKeyhole: true,
      },
      spentCartridges: {},
      containerContents: {},
      containerFilled: {},
      surfaceContents: {},
      underContents: {},
      revealedUnder: {},
      searchableContents: {
        FallenCorpse: ["MysteriousNote"],
      },
      itemSettings: {
        Cooler: { kind: "cooler", mode: "off" },
        NVGoggles: { kind: "goggles", isOn: false },
        PLT: { kind: "plt-viewer", isOn: false, hasLink: false },
        flashlight: { kind: "flashlight", isOn: false },
      },
      frozenItems: {},
      messagesPlayed: {},
      activeGelCameras: {
        GelRound1: true,
      },
      attachedTo: {},
      mindGunMemoryIndex: {
        cat: 0,
        gorilla: 0,
      },
      animalDisposition: {
        cat: {
          angerLevel: 0,
          hungerLevel: 5,
          fearLevel: 1,
          trustLevel: 0,
          statusEffects: [],
        },
        gorilla: {
          angerLevel: 10,
          hungerLevel: 10,
          fearLevel: 10,
          trustLevel: 0,
          statusEffects: [],
        },
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
  next = seedItemRoomLocations(next);
  return next;
}
