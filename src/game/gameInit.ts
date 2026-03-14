import { initializeEncounterStateOnEnter } from "@game/encounters/retryableEncounters";
import { createInitialAviarySpotlightState } from "@game/engine/ticks/aviaryTick";
import { deriveRoomCoordMaps } from "@game/helpers/coordHelpers";
import { bucketForItem, inventoryHas } from "@game/rules/state";
import { createInitialBullEncounterState } from "src/world/Items/creatures/bull";
import {
  AQUARIUM_BREATHER_CORPSE_ITEM_ID,
  AQUARIUM_BREATHER_ITEM_ID,
  AQUARIUM_ELECTRIC_PROD_CORPSE_ITEM_ID,
  AQUARIUM_ELECTRIC_PROD_ITEM_ID,
  createInitialOctopusState,
} from "src/world/Items/creatures/octopus";
import { createInitialHydroponicsSpiderState } from "src/world/maps/levelSix/hydroponicsEncounterState";
import { mergeWorldChunks, type WorldChunkId } from "../world/World";
import {
  INITIAL_CONTAINER_CONTENTS,
  INITIAL_SURFACE_CONTENTS,
  INITIAL_UNDER_CONTENTS,
} from "./containerContents";
import { seedItemRoomLocations } from "./helpers/itemHelpers";
import type { DoorDefinition, DoorState } from "./types/doorTypes";
import type { GameState, World, WorldChunk } from "./types/gameTypes";

export const FINAL_PLAYER_START_ROOM_ID = "LevelThreeCorridorThree"; //"VeterinaryCenter";

// Set this to a room id while testing another area. Leave undefined for the
// normal game start at FINAL_PLAYER_START_ROOM_ID.
export const DEV_PLAYER_START_ROOM_ID: string | undefined = undefined;

export const INITIAL_PLAYER_ROOM_ID =
  DEV_PLAYER_START_ROOM_ID ?? FINAL_PLAYER_START_ROOM_ID;

export const createInitialState = (world: World): GameState => {
  const uniqueItems = Array.from(
    new Map(world.items.map((it) => [it.id, it])).values(),
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
    },
  );

  const worldWithMeta: World = {
    ...normalizedWorld,
    meta: {
      ...(normalizedWorld as any).meta,
      transmitter: { coordByRoomId, roomIdByCoord },
    },
  };

  // Initialize doorStates as a map keyed by door id
  const doors = buildDoorStateMap(worldWithMeta.doors);

  // Seed all the containers with their starting contents
  // Anything defined with location === "INVENTORY" should start in the player's inventory
  const startingInventory = worldWithMeta.items
    .filter((it) => it.location === "INVENTORY")
    .reduce(
      (acc, it) => {
        const kind = it.meta?.kind;
        if (kind === "security-badge") acc.badges.push(it.id);
        else if (kind === "key") acc.keys.push(it.id);
        else acc.general.push(it.id);
        return acc;
      },
      { general: [] as string[], badges: [] as string[], keys: [] as string[] },
    );

  const initialGameState: GameState = {
    rng: () => Math.random(),
    world: worldWithMeta,
    log: [],
    score: 0,
    rating: 0,
    moves: 0,
    uiState: {
      notifications: [],
      nextNotificationId: 1,
    },
    player: {
      roomId: INITIAL_PLAYER_ROOM_ID,
      inventory: startingInventory,
      log: [],
      dnaBank: [],
      spiltTea: [],
      memoriesTriggered: {
        own_name: false,
        own_image: false,
        own_occupation: false,
        own_voice: false,
        seen_self: false,
        own_handwriting: false,
        aware_of_reincarnation: false,
        aware_of_reincarnation_nature: false,
        aware_of_own_role_in_reincarnation: false,
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
      statusEffects: [],
    },
    worldState: {
      conditionalExits: {
        ParkEntrance: {
          roomId: "ParkEntrance",
          unlockTriggers: ["ParkPass"],
          direction: "west",
          blockMsg: `The robot scans you then repositions itself gently, but firmly, between you and the park entrance.\n\n"Sorry to be a stickler, but I will need to see that park pass." it says.`,
          passMsg: `The robot scans you, then the rendered face lights up with a smile.\n\n"You park pass is valid, enjoy your time in Trinity Park!"`,
        },
        LevelThreeCorridorSeven: {
          roomId: "LevelThreeCorridorSeven",
          unlockTriggers: ["unobtainium"],
          direction: "north",
          blockMsg: `There's no way you'll be able to squeeze through that tiny opening.`,
          passMsg: `[no pass condition]`,
        },
        L3Warehouse: {
          roomId: "L3Warehouse",
          unlockTriggers: [],
          conditionalTriggers: ["RobotRefugeAccess"],
          direction: "east",
          blockMsg: `You can't go that way.`,
          passMsg: `You duck underneath the lowest rack and climb through the opening.`,
        },
        LevelSixCorridorEnd: {
          roomId: "LevelSixCorridorEnd",
          unlockTriggers: [],
          conditionalTriggers: ["HydroponicsDoorUnblocked"],
          direction: "south",
          blockMsg: `The door is jammed tight in the damaged metal frame, with or without a security badge, you'll never get it open.`,
          passMsg: `You step through the large gap that has been burned through the metal.`,
        },
      },
      scriptedEventsTripped: {
        cat_meet: false,
        parkbot_meet: false,
        l3warehouse_visit: false,
        l3warehouse_whistle: false,
      },
      doors,
      darkRooms: {
        LivingQuartersThreeWest: true,
        ThreeWestBath: true,
        ThreeWestBed: true,
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
        // Engineering
        ReactorRoom: true,
        MainReactorPlatform: true,
        MaintenanceDuct: true,
        MaintenanceDuctTwo: true,
        MaintenanceDuctThree: true,
        ReactorCore: true,
        EngCorridorOne: true,
        EngCorridorTwo: true,
        EngCorridorThree: true,
        ShuttleBay: true,
        InsideShuttle: true,
        Warehouse: true,
        LevelFiveStairAccess: true,
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
        "park-security": true,
        "teleport-pads-green": true,
        "teleport-pads-blue": true,
        "teleport-pads-yellow": true,
        "teleport-pads-violet": true,
        "teleport-pads-orange": true,
        "teleport-pads-white": true,
        "teleport-pads-maroon": true,
        "engine-room-power-lock": false,
        "weapons-system": false,
        "loading-dock-door": true,
        "loading-grid": false,
        "cryo-labs": true,
        "cryo-sleep": true,
        "power-key-turned": false,
        "power-initialized": false,
      },
      visitedRooms: {
        PowerGrid: false,
        StairWellSeven: true,
      },
      roomAirQuality: {
        StairWellSeven: "thin",
      },
      roomAudioLevel: {
        PowerGrid: 1,
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
        obtained_ultraviolet_badge: false,
        obtained_blue_badge: false,
        obtained_violet_badge: false,
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
        obtained_maroon_badge: false,
        obtained_park_pass: false,
        obtained_infection_report: false,
        obtained_innoculant: false,
        obtained_lotto_ticket: false,
        obtained_music_box: false,
        obtained_new_z4_detonator: false,
        obtained_nv_goggles: false,
        obtained_orange_badge: false,
        obtained_inframaroon_badge: false,
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
      npcSecrets: {},
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
        ...createInitialOctopusState(),
      },
      catState: {
        isWearingCollar: true,
      },
      brainSlug: {
        isHydrated: false,
        attachedTo: "none",
      },
      playerDeaths: {},
      aviarySpotlight: createInitialAviarySpotlightState(),
      bullEncounter: createInitialBullEncounterState(),
      hydroponicsSpider: {
        ...createInitialHydroponicsSpiderState(),
      },
      hydroponicsCocoonPuzzle: {
        initialized: false,
        powerWorkerBodyId: undefined,
        graceTurnsRemaining: 0,
        resolved: false,
        openedBodyIds: {},
      },
      conditionalTriggers: {
        MysteriousNoteFound: false,
        RobotRefugeAccess: false,
        HydroponicsDoorUnblocked: false,
        EscapedWithYellowBadge: false,
      },
      damagedFlashlight: {
        isOn: false,
        maxCharge: 6,
        currentCharge: 6,
        chargeRate: 1,
      },
    },
    itemState: {
      itemRoomId: Object.fromEntries(
        world.items.map((i) => [i.id, i.location]),
      ),
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
      containerContents: {},
      containerFilled: {},
      surfaceContents: {},
      underContents: {},
      revealedUnder: {},
      searchableContents: {
        FallenCorpse: ["MysteriousNote"],
        [AQUARIUM_BREATHER_CORPSE_ITEM_ID]: [AQUARIUM_BREATHER_ITEM_ID],
        [AQUARIUM_ELECTRIC_PROD_CORPSE_ITEM_ID]: [
          AQUARIUM_ELECTRIC_PROD_ITEM_ID,
        ],
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
      },
    },
  };

  const seededState = seedInitialPlacements(initialGameState);
  return initializeEncounterStateOnEnter(
    seededState,
    seededState.player.roomId,
  );
};

function initDoorStates(doorDefs: DoorDefinition[]): DoorState[] {
  return doorDefs.map((def) => ({
    id: def.id,
    isOpen: def.initiallyOpen ?? false,
    isLocked: def.initiallyLocked ?? false,
  }));
}

function buildDoorStateMap(
  doorDefs: DoorDefinition[],
): Record<string, DoorState> {
  return Object.fromEntries(initDoorStates(doorDefs).map((ds) => [ds.id, ds]));
}

function mergeContents(
  existing: Record<string, string[]>,
  seeds: Record<string, string[]>,
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
  seeds: Record<string, string[]>,
): GameState {
  return {
    ...state,
    itemState: {
      ...state.itemState,
      containerContents: mergeContents(
        state.itemState.containerContents,
        seeds,
      ),
    },
  };
}

export function seedSurfaceContents(
  state: GameState,
  seeds: Record<string, string[]>,
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
  seeds: Record<string, string[]>,
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

export function mergeWorldChunkIntoState(
  state: GameState,
  chunkId: WorldChunkId,
  chunk: WorldChunk,
): GameState {
  const loadedChunkIds = Array.isArray(state.world.meta?.loadedChunkIds)
    ? state.world.meta.loadedChunkIds
    : [];
  const requestedChunkIds = Array.isArray(state.world.meta?.requestedChunkIds)
    ? state.world.meta.requestedChunkIds
    : [];

  if (loadedChunkIds.includes(chunkId)) {
    return state;
  }

  const mergedWorldBase = mergeWorldChunks(state.world, chunk);
  const { coordByRoomId, roomIdByCoord } = deriveRoomCoordMaps(
    mergedWorldBase.rooms,
    mergedWorldBase.doors,
    "InsideShuttle",
    {
      ignoreIslands: true,
      excludeRoomIdPatterns: [/Elevator/i, /Shaft/i],
    },
  );

  const nextItemRoomId = { ...state.itemState.itemRoomId };
  const nextInventory = {
    general: [...state.player.inventory.general],
    badges: [...state.player.inventory.badges],
    keys: [...state.player.inventory.keys],
  };

  for (const item of chunk.items) {
    if (item.location !== "INVENTORY") continue;
    if (inventoryHas(nextInventory, item.id)) continue;

    const bucket = bucketForItem(item);
    nextInventory[bucket].push(item.id);
    delete nextItemRoomId[item.id];
  }

  const mergedDoorStates = {
    ...buildDoorStateMap(mergedWorldBase.doors),
    ...state.worldState.doors,
  };

  const nextState = seedInitialPlacements({
    ...state,
    world: {
      ...mergedWorldBase,
      meta: {
        ...state.world.meta,
        loadedChunkIds: [...loadedChunkIds, chunkId],
        requestedChunkIds: requestedChunkIds.filter(
          (requestedChunkId: string) => requestedChunkId !== chunkId,
        ),
        transmitter: { coordByRoomId, roomIdByCoord },
      },
    },
    player: {
      ...state.player,
      inventory: nextInventory,
    },
    worldState: {
      ...state.worldState,
      doors: mergedDoorStates,
    },
    itemState: {
      ...state.itemState,
      itemRoomId: nextItemRoomId,
    },
  });

  return nextState;
}
