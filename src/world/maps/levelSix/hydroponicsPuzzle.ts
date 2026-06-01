import { triggerScoreOnce } from "@game/rules/score";
import { addToInventory, inventoryHas } from "@game/rules/state";
import type {
  GameState,
  HydroponicsCocoonPuzzleState,
} from "@game/types/gameTypes";
import type { MenuBranchNode, MenuLeafNode } from "@game/types/menuTypes";
import { createInitialHydroponicsSpiderState } from "./hydroponicsEncounterState";

export type HydroponicsEmployeeProfile = {
  id: string;
  employeeId: string;
  name: string;
  age: number;
  gender: "male" | "female" | "non-binary";
  pronoun: "he/him" | "she/her" | "they/them";
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
    employeeId: "E1026630DT",
    age: 26,
    name: "Dizzy Tsoukann",
    gender: "female",
    pronoun: "she/her",
    build: "thin",
    height: "medium height",
    hair: { color: "red", texture: "straight", length: "short" },
    features: ["a leaf tattoo on the right shoulder"],
  },
  {
    id: "OrgrillPinthwell",
    employeeId: "E6630914OP",
    age: 47,
    name: "Orgrill Pinthwell",
    gender: "male",
    pronoun: "he/him",
    build: "athletic",
    height: "tall",
    features: ["missing part of the index finger"],
  },
  {
    id: "GaGaLizSotte",
    employeeId: "E1128991GL",
    age: 33,
    name: "Ga-Ga Liz-Sotte",
    gender: "female",
    pronoun: "he/him",
    build: "athletic",
    height: "short",
    hair: { color: "blonde", texture: "straight", length: "long" },
    features: ["a cat tattoo on the midriff"],
  },
  {
    id: "ErnwithGob",
    employeeId: "E5550912EG",
    age: 61,
    name: "Ernwith Gob",
    gender: "male",
    pronoun: "he/him",
    build: "thin",
    height: "tall",
    hair: { color: "gray", texture: "straight", length: "short" },
    features: ["spectacles", "webbed toes"],
  },
  {
    id: "SlandryTexMex",
    employeeId: "E3199250ST",
    age: 25,
    name: "Slandry Tex-Mex",
    gender: "male",
    pronoun: "he/him",
    build: "heavyset",
    height: "medium height",
    hair: { color: "black", texture: "curly", length: "short" },
    features: ["a tribal tattoo on one arm"],
  },
  {
    id: "BuglousWimbly",
    employeeId: "E4218833BW",
    age: 44,
    name: "Buglous Wimbly",
    gender: "male",
    pronoun: "he/him",
    build: "heavyset",
    height: "short",
    hair: { color: "brown", texture: "wavy", length: "short" },
  },
  {
    id: "XiXiBo",
    employeeId: "E7435209XB",
    age: 29,
    name: "Xi-Xi Bo",
    gender: "non-binary",
    pronoun: "they/them",
    build: "thin",
    height: "medium height",
    hair: { color: "black", texture: "straight", length: "short" },
    features: ["spectacles"],
  },
  {
    id: "MistopherBreen",
    employeeId: "E0861121MB",
    age: 30,
    name: "Mistopher Breen",
    gender: "male",
    pronoun: "he/him",
    build: "thin",
    height: "tall",
    hair: { color: "blonde", texture: "wavy", length: "short" },
  },
  {
    id: "CrenchfordMothworthy",
    employeeId: "E6791022CM",
    age: 55,
    name: "Crenchford Mothworthy",
    gender: "male",
    pronoun: "he/him",
    build: "athletic",
    height: "medium height",
    features: ["six fingers on the right hand"],
  },
  {
    id: "SillithLeSconce",
    employeeId: "E0001294SL",
    age: 56,
    name: "Sillith LeSconce",
    gender: "female",
    pronoun: "she/her",
    build: "athletic",
    height: "tall",
    hair: { color: "red", texture: "straight", length: "long" },
    features: ["a bionic replacement knee"],
  },
  {
    id: "DaschentDwong",
    employeeId: "E4349455DD",
    age: 24,
    name: "Daschent Dwong",
    gender: "male",
    pronoun: "he/him",
    build: "heavyset",
    height: "tall",
    hair: { color: "blonde", texture: "curly", length: "long" },
    features: ["one bionic replacement eye"],
  },
  {
    id: "WooZhangkWoo",
    employeeId: "E9531800WW",
    age: 31,
    name: "Woo-Zhangk Woo",
    gender: "female",
    pronoun: "she/her",
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

const sexMap = {
  male: "man",
  female: "woman",
  "non-binary": "person of indeterminate sex",
};

function formatFeatureList(features: string[]): string {
  if (features.length === 0) return "";
  if (features.length === 1) return features[0];
  if (features.length === 2) return `${features[0]} and ${features[1]}`;
  return `${features.slice(0, -1).join(", ")}, and ${features[features.length - 1]}`;
}

function buildEmployeeRecord(profile: HydroponicsEmployeeProfile): string {
  const [pA] = profile.pronoun.split("/");
  const isBald = profile?.hair === undefined;
  const hairDesc =
    isBald === true
      ? `with a bald head.`
      : `with ${profile.hair?.length ?? "shoulder-length"} ${profile.hair?.texture ?? "wispy"} ${profile.hair?.color ?? "brown"} hair.`;
  const lines = [
    `Employee ID: ${profile.employeeId}`,
    `Name: ${profile.name}`,
    `Age: ${profile.age}`,
    `Sex: ${profile.gender[0].toUpperCase()}${profile.gender.slice(1)}\n`,
    `The employee record includes a photo of ${profile.name.split(" ")[0]}, where ${pA} stands against a neutral backdrop, facing front. ${profile.name.split(" ")[0]} is a ${profile.height}, ${profile.build} ${sexMap[profile.gender]} ${hairDesc}\n`,
  ];

  if (profile.features?.length) {
    lines.push(`Notable Traits: ${formatFeatureList(profile.features)}`);
  }

  return lines.join("\n");
}

function getPuzzleState(state: GameState): HydroponicsCocoonPuzzleState {
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

function hasResolvedOrangeBadge(state: GameState): boolean {
  return (
    inventoryHas(state.player.inventory, "orangebadge") ||
    state.worldState.scoresTriggered.obtained_orange_badge === true
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

  const alreadySolved = hasResolvedOrangeBadge(state);

  return {
    ...state,
    itemState: {
      ...state.itemState,
      itemRoomId: {
        ...state.itemState.itemRoomId,
        ...bodyRoomPatch,
        ...(alreadySolved ? {} : { orangebadge: powerWorkerBodyId }),
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

export function resetHydroponicsEncounter(state: GameState): GameState {
  const resetPuzzleState = resetHydroponicsCocoonPuzzle({
    ...state,
    worldState: {
      ...state.worldState,
      hydroponicsSpider: createInitialHydroponicsSpiderState(),
      conditionalTriggers: {
        ...state.worldState.conditionalTriggers,
        EscapedWithOrangeBadge: false,
      },
      roomAudioLevel: {
        ...state.worldState.roomAudioLevel,
        ...Object.fromEntries(
          HYDROPONICS_AREA_ROOM_IDS.map((roomId) => [roomId, 0]),
        ),
      },
    },
  });

  return resetPuzzleState;
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

  return `The sign-in tablet shows the most recent visitor entry: ${profile.name}, Zoology Department. Clipped across the front of the visitor's coveralls is an orange plastic security badge.`;
}

export function buildHydroponicsTerminalMenu(state: GameState): MenuBranchNode {
  const powerWorkerBodyId = getPuzzleState(state).powerWorkerBodyId;
  const employeeRecords: MenuLeafNode[] = HYDROPONICS_EMPLOYEE_PROFILES.filter(
    (profile) => profile.id !== powerWorkerBodyId,
  ).map((profile) => ({
    kind: "leaf",
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
            EscapedWithOrangeBadge: true,
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

  if (hasResolvedOrangeBadge(workingState)) {
    return {
      state: workingState,
      message:
        "You've already got the orange badge. Cutting open another cocoon would only be morbid.",
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

  let next = addToInventory(workingState, "orangebadge");
  next = triggerScoreOnce(next, "obtained_orange_badge");
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
      "The cocoon parts under your hands and an orange plastic badge comes away with the loosened silk. Somewhere overhead the web canopy begins to shiver. Whatever is sleeping above you has noticed. If you move now, you might just make it back to the upper platform before the whole nest erupts.",
  };
}
