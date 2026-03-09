import { triggerScoreOnce } from "@game/rules/score";
import { addToInventory, inventoryHas } from "@game/rules/state";
import type {
  GameState,
  HydroponicsCocoonPuzzleState,
} from "@game/types/gameTypes";
import type { HintLeafNode, HintMenuNode } from "@game/types/hintTypes";

export type HydroponicsEmployeeProfile = {
  id: string;
  name: string;
  gender: "male" | "female";
  build: "thin" | "athletic" | "heavyset";
  height: "short" | "medium height" | "tall";
  hair?: {
    color: "red" | "blonde" | "gray" | "black" | "brown";
    texture: "straight" | "curly" | "wavy";
    length: "short" | "long";
  };
  features?: string[];
};

export const HYDROPONICS_AREA_ROOM_IDS = [
  "HydroponicsPlatform",
  "HydroponicsPlatformAdmin",
  "HydroponicsPlatformMid",
  "HydroponicsPlatformBottom",
  "UnderWebOne",
  "UnderWebTwo",
  "UnderWebThree",
  "UnderWebFour",
] as const;

export const HYDROPONICS_COCOON_ROOM_IDS = [
  "HydroponicsPlatformBottom",
  "UnderWebOne",
  "UnderWebTwo",
  "UnderWebThree",
  "UnderWebFour",
] as const;

const HYDROPONICS_ESCAPE_MOVES_TO_PLATFORM: Record<
  (typeof HYDROPONICS_AREA_ROOM_IDS)[number],
  number
> = {
  HydroponicsPlatform: 0,
  HydroponicsPlatformAdmin: 1,
  HydroponicsPlatformMid: 1,
  HydroponicsPlatformBottom: 2,
  UnderWebOne: 3,
  UnderWebTwo: 3,
  UnderWebThree: 3,
  UnderWebFour: 3,
};

export const HYDROPONICS_EMPLOYEE_PROFILES: HydroponicsEmployeeProfile[] = [
  {
    id: "DizzyTsoukann",
    name: "Dizzy Tsoukann",
    gender: "female",
    build: "thin",
    height: "medium height",
    hair: { color: "red", texture: "straight", length: "short" },
    features: ["a leaf tattoo on the right shoulder"],
  },
  {
    id: "OrgrillPinthwell",
    name: "Orgrill Pinthwell",
    gender: "male",
    build: "athletic",
    height: "tall",
    features: ["missing part of the index finger"],
  },
  {
    id: "GaGaLizSotte",
    name: "Ga-Ga Liz-Sotte",
    gender: "female",
    build: "athletic",
    height: "short",
    hair: { color: "blonde", texture: "straight", length: "long" },
    features: ["a cat tattoo on the midriff"],
  },
  {
    id: "ErnwithGob",
    name: "Ernwith Gob",
    gender: "male",
    build: "thin",
    height: "tall",
    hair: { color: "gray", texture: "straight", length: "short" },
    features: ["spectacles", "webbed toes"],
  },
  {
    id: "SlandryTexMex",
    name: "Slandry Tex-Mex",
    gender: "male",
    build: "heavyset",
    height: "medium height",
    hair: { color: "black", texture: "curly", length: "short" },
    features: ["a tribal tattoo on one arm"],
  },
  {
    id: "BuglousWimbly",
    name: "Buglous Wimbly",
    gender: "male",
    build: "heavyset",
    height: "short",
    hair: { color: "brown", texture: "wavy", length: "short" },
  },
  {
    id: "XiXiBo",
    name: "Xi-Xi Bo",
    gender: "female",
    build: "thin",
    height: "medium height",
    hair: { color: "black", texture: "straight", length: "short" },
    features: ["spectacles"],
  },
  {
    id: "MistopherBreen",
    name: "Mistopher Breen",
    gender: "male",
    build: "thin",
    height: "tall",
    hair: { color: "blonde", texture: "wavy", length: "short" },
  },
  {
    id: "CrenchfordMothworthy",
    name: "Crenchford Mothworthy",
    gender: "male",
    build: "athletic",
    height: "medium height",
    features: ["six fingers on the right hand"],
  },
  {
    id: "SillithLeSconce",
    name: "Sillith LeSconce",
    gender: "female",
    build: "athletic",
    height: "tall",
    hair: { color: "red", texture: "straight", length: "long" },
    features: ["a bionic replacement knee"],
  },
  {
    id: "DaschentDwong",
    name: "Daschent Dwong",
    gender: "male",
    build: "heavyset",
    height: "tall",
    hair: { color: "blonde", texture: "curly", length: "long" },
    features: ["one bionic replacement eye"],
  },
  {
    id: "WooZhangkWoo",
    name: "Woo-Zhangk Woo",
    gender: "female",
    build: "thin",
    height: "medium height",
    hair: { color: "black", texture: "straight", length: "long" },
  },
];

const HYDROPONICS_ROOM_ID_SET = new Set<string>(HYDROPONICS_AREA_ROOM_IDS);
const HYDROPONICS_COCOON_ROOM_ID_SET = new Set<string>(
  HYDROPONICS_COCOON_ROOM_IDS,
);
const HYDROPONICS_BODY_ID_SET = new Set<string>(
  HYDROPONICS_EMPLOYEE_PROFILES.map((profile) => profile.id),
);

function formatFeatureList(features: string[]): string {
  if (features.length === 0) return "";
  if (features.length === 1) return features[0];
  if (features.length === 2) return `${features[0]} and ${features[1]}`;
  return `${features.slice(0, -1).join(", ")}, and ${features[features.length - 1]}`;
}

function buildEmployeeRecord(profile: HydroponicsEmployeeProfile): string {
  const lines = [
    `Name: ${profile.name}`,
    `Sex: ${profile.gender === "male" ? "Male" : "Female"}`,
    `Build: ${profile.build[0].toUpperCase()}${profile.build.slice(1)}`,
    `Height: ${profile.height[0].toUpperCase()}${profile.height.slice(1)}`,
    `Hair: ${profile.hair ? `${profile.hair.color}, ${profile.hair.texture}, ${profile.hair.length}` : "Bald"}`,
  ];

  if (profile.features?.length) {
    lines.push(`Notable Traits: ${formatFeatureList(profile.features)}`);
  }

  return lines.join("\n");
}

function getPuzzleState(
  state: GameState,
): HydroponicsCocoonPuzzleState {
  return state.worldState.hydroponicsCocoonPuzzle;
}

function shuffle<T>(input: readonly T[], rng: () => number): T[] {
  const next = [...input];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function hasResolvedYellowBadge(state: GameState): boolean {
  return (
    inventoryHas(state.player.inventory, "yellowbadge") ||
    state.worldState.scoresTriggered.obtained_yellow_badge === true
  );
}

function buildRoomSlots(rng: () => number): string[] {
  const baseSlots = HYDROPONICS_COCOON_ROOM_IDS.flatMap((roomId) => [
    roomId,
    roomId,
  ]);
  const extras = [
    HYDROPONICS_COCOON_ROOM_IDS[
      Math.floor(rng() * HYDROPONICS_COCOON_ROOM_IDS.length)
    ],
    HYDROPONICS_COCOON_ROOM_IDS[
      Math.floor(rng() * HYDROPONICS_COCOON_ROOM_IDS.length)
    ],
  ];

  return shuffle([...baseSlots, ...extras], rng);
}

export function isHydroponicsAreaRoom(roomId: string): boolean {
  return HYDROPONICS_ROOM_ID_SET.has(roomId);
}

function getHydroponicsEscapeGraceTurns(roomId: string): number {
  const movesToPlatform =
    HYDROPONICS_ESCAPE_MOVES_TO_PLATFORM[
      roomId as keyof typeof HYDROPONICS_ESCAPE_MOVES_TO_PLATFORM
    ] ?? 0;

  // The timer also ticks at the end of the cocoon-opening turn.
  return movesToPlatform + 1;
}

export function isHydroponicsCocoonRoom(roomId: string): boolean {
  return HYDROPONICS_COCOON_ROOM_ID_SET.has(roomId);
}

export function isHydroponicsBodyId(itemId: string): boolean {
  return HYDROPONICS_BODY_ID_SET.has(itemId);
}

export function getHydroponicsEmployeeProfile(
  bodyId: string | undefined,
): HydroponicsEmployeeProfile | undefined {
  return HYDROPONICS_EMPLOYEE_PROFILES.find((profile) => profile.id === bodyId);
}

export function resetHydroponicsCocoonPuzzle(state: GameState): GameState {
  const bodyIds = HYDROPONICS_EMPLOYEE_PROFILES.map((profile) => profile.id);
  const powerWorkerBodyId =
    bodyIds[Math.floor(state.rng() * bodyIds.length)] ?? bodyIds[0];
  const shuffledBodyIds = shuffle(bodyIds, state.rng);
  const roomSlots = buildRoomSlots(state.rng);
  const bodyRoomPatch = Object.fromEntries(
    shuffledBodyIds.map((bodyId, idx) => [bodyId, roomSlots[idx]]),
  );

  const alreadySolved = hasResolvedYellowBadge(state);

  return {
    ...state,
    itemState: {
      ...state.itemState,
      itemRoomId: {
        ...state.itemState.itemRoomId,
        ...bodyRoomPatch,
        ...(alreadySolved ? {} : { yellowbadge: powerWorkerBodyId }),
      },
    },
    worldState: {
      ...state.worldState,
      hydroponicsCocoonPuzzle: {
        initialized: true,
        powerWorkerBodyId,
        graceTurnsRemaining: 0,
        resolved: alreadySolved,
        openedBodyIds: {},
      },
    },
  };
}

export function maybeInitializeHydroponicsCocoonPuzzle(
  state: GameState,
  roomId: string,
): GameState {
  if (!isHydroponicsAreaRoom(roomId)) return state;
  if (getPuzzleState(state).initialized) return state;
  return resetHydroponicsCocoonPuzzle(state);
}

export function describeHydroponicsSignIn(state: GameState): string {
  const profile = getHydroponicsEmployeeProfile(
    getPuzzleState(state).powerWorkerBodyId,
  );
  if (!profile) {
    return "The tablet display has gone dim, leaving nothing readable on it.";
  }

  return `The sign-in tablet shows the most recent visitor entry: ${profile.name}, Power Department. Clipped across the front of the visitor's coveralls is a yellow plastic security badge.`;
}

export function buildHydroponicsTerminalMenu(state: GameState): HintMenuNode {
  const powerWorkerBodyId = getPuzzleState(state).powerWorkerBodyId;
  const employeeRecords: HintLeafNode[] = HYDROPONICS_EMPLOYEE_PROFILES.filter(
    (profile) => profile.id !== powerWorkerBodyId,
  ).map((profile) => ({
    kind: "hint",
    id: `hydro-record-${profile.id}`,
    title: profile.name,
    description: buildEmployeeRecord(profile),
  }));

  return {
    kind: "menu",
    id: `hydroponics-terminal-${powerWorkerBodyId ?? "none"}`,
    title: "HYDROPONICS ADMIN TERMINAL",
    children: [
      {
        kind: "menu",
        id: "hydroponics-terminal-employee-records",
        title: "Employee Records",
        children: employeeRecords,
      },
    ],
  };
}

export function tickHydroponicsCocoonPuzzle(state: GameState): {
  state: GameState;
  deathMessage?: string;
  deathCause?: string;
} {
  const puzzle = getPuzzleState(state);
  if (!puzzle.initialized || puzzle.graceTurnsRemaining <= 0) {
    return { state };
  }

  const nextGraceTurnsRemaining = Math.max(0, puzzle.graceTurnsRemaining - 1);
  const nextState = {
    ...state,
    worldState: {
      ...state.worldState,
      hydroponicsCocoonPuzzle: {
        ...puzzle,
        graceTurnsRemaining: nextGraceTurnsRemaining,
      },
    },
  };

  if (nextGraceTurnsRemaining > 0) {
    return { state: nextState };
  }

  if (state.player.roomId === "HydroponicsPlatform") {
    const clearedHydroAudio = Object.fromEntries(
      HYDROPONICS_AREA_ROOM_IDS.map((roomId) => [roomId, 0]),
    );

    return {
      state: {
        ...nextState,
        worldState: {
          ...nextState.worldState,
          conditionalTriggers: {
            ...nextState.worldState.conditionalTriggers,
            EscapedWithYellowBadge: true,
          },
          hydroponicsSpider: {
            ...nextState.worldState.hydroponicsSpider,
            isAlive: false,
            sensitivity: 0,
            pendingAcidTarget: "none",
            turnsSinceLastBreath: 0,
            lastTrackedHydroponicsRoomId: undefined,
          },
          roomAudioLevel: {
            ...nextState.worldState.roomAudioLevel,
            ...clearedHydroAudio,
          },
        },
      },
    };
  }

  return {
    state: nextState,
    deathMessage:
      "The surrounding webbing goes taut all at once. A violent shudder tears through the canopy overhead, and before you can move the entire nest convulses around you. Something crashes down through the silk, and the Hydroponics chamber vanishes in a blur of fangs, acid, and thrashing limbs.",
    deathCause: "hydroponics cocoon trap",
  };
}

export function openHydroponicsCocoon(
  state: GameState,
  bodyId: string,
): {
  state: GameState;
  message: string;
  deathMessage?: string;
  deathCause?: string;
} {
  const workingState = getPuzzleState(state).initialized
    ? state
    : resetHydroponicsCocoonPuzzle(state);
  const puzzle = getPuzzleState(workingState);

  if (hasResolvedYellowBadge(workingState)) {
    return {
      state: workingState,
      message:
        "You've already got the yellow badge. Cutting open another cocoon would only be morbid.",
    };
  }

  if (puzzle.openedBodyIds[bodyId]) {
    return {
      state: workingState,
      message: "That cocoon has already been slit open.",
    };
  }

  if (puzzle.powerWorkerBodyId !== bodyId) {
    return {
      state: workingState,
      message:
        "You slice into the cocoon and the body inside jerks loose in a wet slump. For one sick second nothing happens. Then the entire web canopy above you snaps tight as if something massive just woke up.",
      deathMessage:
        "You chose wrong. The webbing overhead whips taut, and a heartbeat later the giant spider drops on a storm of silk. You barely have time to register a blur of legs and churning mouthparts before the chamber erupts around you.",
      deathCause: "hydroponics cocoon trap",
    };
  }

  let next = addToInventory(workingState, "yellowbadge");
  next = triggerScoreOnce(next, "obtained_yellow_badge");
  next = {
    ...next,
    worldState: {
      ...next.worldState,
      hydroponicsCocoonPuzzle: {
        ...puzzle,
        resolved: true,
        graceTurnsRemaining: getHydroponicsEscapeGraceTurns(
          workingState.player.roomId,
        ),
        openedBodyIds: {
          ...puzzle.openedBodyIds,
          [bodyId]: true,
        },
      },
    },
  };

  return {
    state: next,
    message:
      "The cocoon parts under your hands and a yellow plastic badge comes away with the loosened silk. Somewhere overhead the web canopy begins to shiver. Whatever is sleeping above you has noticed. If you move now, you might just make it back to the upper platform before the whole nest erupts.",
  };
}
