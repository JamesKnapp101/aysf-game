import { triggerPlayerDeath } from "@game/helpers/gameHelpers";
import {
  buildDangerNotification,
  enqueueNotification,
} from "@game/rules/notifications";
import type { RuleResult } from "@game/rules/result";
import { triggerScoreOnce } from "@game/rules/score";
import { inventoryHas } from "@game/rules/state";
import type { ActionResult } from "@game/types/actionsTypes";
import type { DoorInteractionHook } from "@game/types/doorTypes";
import type { GameState } from "@game/types/gameTypes";
import type { ItemSettings } from "@game/types/itemTypes";
import type { Preposition } from "@game/types/parserTypes";
import {
  LEVEL_SIX_AIRLOCK_ROOM_ID,
  LEVEL_SIX_BREACH_ITEM_ID,
  LEVEL_SIX_BREACH_SCORE_ID,
  LEVEL_SIX_BREACH_SEALED_TRIGGER,
  LEVEL_SIX_FLEX_PLUG_ID,
  LEVEL_SIX_SPACE_SUIT_ID,
  LEVEL_SIX_STORAGE_ROOM_IDS,
} from "./airlockAndStorageConstants";

const LEVEL_SIX_SUIT_MAX_OXYGEN = 100;
const LEVEL_SIX_SUIT_OXYGEN_LOSS_PER_TURN = 1;
const LEVEL_SIX_SUIT_GRACE_TURNS = 5;
const LEVEL_SIX_VACUUM_DEATH_CAUSE = "level six vacuum exposure";
const LEVEL_SIX_DEPRESSURIZATION_DEATH_MESSAGE =
  "The outer seal breaks with a brutal metallic cough. The airlock empties in one invisible punch, hauling the breath out of your lungs and slamming you into the nearest wall as everything goes black.";
const LEVEL_SIX_VACUUM_DEATH_MESSAGE =
  "Hard vacuum finds every soft part of you at once. Your last breath leaves without permission, your vision tunnels to white sparks, and then there is no air left for panic.";

type AirlockDoorId = "InnerDoor" | "OuterDoor";
type LeverPosition = "open" | "close";
type LevelSixSuitSettings = Extract<
  ItemSettings,
  { kind: "level-six-space-suit" }
>;

const STORAGE_ROOM_ID_SET = new Set<string>(LEVEL_SIX_STORAGE_ROOM_IDS);
const WEIGHTLESS_STORAGE_MOVEMENT_ROOM_IDS = new Set<string>([
  ...LEVEL_SIX_STORAGE_ROOM_IDS.filter((roomId) => roomId !== "RIFT"),
  "3DPrintingFacility",
]);

const OPEN_WEIGHTLESS_STORAGE_PATHS = new Set(
  [
    ["StorageQuadOne", "StorageQuadThree"],
    ["StorageQuadTwo", "StorageQuadThree"],
    ["StorageQuadTwo", "StorageQuadTwoMid"],
    ["StorageQuadFour", "StorageQuadFourMid"],
    ["StorageQuadOneMid", "StorageQuadThreeMid"],
    ["StorageQuadOneMid", "StorageQuadTwoMid"],
    ["StorageQuadOneMid", "StorageQuadOneTop"],
    ["StorageQuadThreeMid", "StorageQuadThreeTop"],
    ["StorageQuadFourMid", "StorageQuadFourTop"],
    ["StorageQuadOneTop", "StorageQuadThreeTop"],
    ["StorageQuadOneTop", "StorageQuadFourTop"],
    ["StorageQuadFourTop", "3DPrintingFacility"],
  ].flatMap(([fromRoomId, toRoomId]) => [
    `${fromRoomId}->${toRoomId}`,
    `${toRoomId}->${fromRoomId}`,
  ]),
);

function getLevelSixSuitSettings(state: GameState): LevelSixSuitSettings {
  const settings = state.itemState.itemSettings[LEVEL_SIX_SPACE_SUIT_ID];
  if (settings?.kind === "level-six-space-suit") return settings;

  return { kind: "level-six-space-suit", oxygenGraceTurns: 0 };
}

function withLevelSixSuitSettings(
  state: GameState,
  patch: Partial<LevelSixSuitSettings>,
): GameState {
  const current = getLevelSixSuitSettings(state);

  return {
    ...state,
    itemState: {
      ...state.itemState,
      itemSettings: {
        ...state.itemState.itemSettings,
        [LEVEL_SIX_SPACE_SUIT_ID]: {
          ...current,
          ...patch,
          kind: "level-six-space-suit",
        },
      },
    },
  };
}

function withPlayerOxygen(state: GameState, oxygen: number): GameState {
  const nextOxygen = Math.max(
    0,
    Math.min(LEVEL_SIX_SUIT_MAX_OXYGEN, Math.round(oxygen)),
  );

  if (state.player.vitals.oxygen === nextOxygen) return state;

  return {
    ...state,
    player: {
      ...state.player,
      vitals: {
        ...state.player.vitals,
        oxygen: nextOxygen,
      },
    },
  };
}

function setRoomAirQuality(
  state: GameState,
  roomId: string,
  quality: "clean" | "vacuum",
): GameState {
  return {
    ...state,
    worldState: {
      ...state.worldState,
      roomAirQuality: {
        ...state.worldState.roomAirQuality,
        [roomId]: quality,
      },
    },
  };
}

function setDoorOpen(
  state: GameState,
  doorId: AirlockDoorId,
  isOpen: boolean,
): GameState {
  const current = state.worldState.doors[doorId];
  if (!current) return state;

  let next: GameState = {
    ...state,
    worldState: {
      ...state.worldState,
      doors: {
        ...state.worldState.doors,
        [doorId]: { ...current, isOpen },
      },
    },
  };

  if (doorId === "OuterDoor") {
    next = setRoomAirQuality(
      next,
      LEVEL_SIX_AIRLOCK_ROOM_ID,
      isOpen ? "vacuum" : "clean",
    );
  }

  return next;
}

function getDoorPosition(
  state: GameState,
  doorId: AirlockDoorId,
): LeverPosition {
  return state.worldState.doors[doorId]?.isOpen ? "open" : "close";
}

function formatPosition(position: LeverPosition): string {
  return position.toUpperCase();
}

function getInterlockBlockMessage(
  state: GameState,
  doorId: AirlockDoorId,
  desiredPosition: LeverPosition,
): string | undefined {
  if (desiredPosition !== "open") return undefined;

  if (doorId === "InnerDoor" && state.worldState.doors.OuterDoor?.isOpen) {
    return "The interlock refuses the command. The outer airlock door is open, and the inner door will not open onto vacuum.";
  }

  if (doorId === "OuterDoor" && state.worldState.doors.InnerDoor?.isOpen) {
    return "The interlock refuses the command. The inner airlock door is open, and the outer door will not open until it is sealed again.";
  }

  return undefined;
}

function parseLeverPositionFromCommand(
  raw: string | undefined,
): LeverPosition | undefined {
  const normalized = raw?.toLowerCase().trim() ?? "";
  if (/\bopen\b/.test(normalized)) return "open";
  if (/\bclose\b|\bclosed\b/.test(normalized)) return "close";
  return undefined;
}

function describeControlledDoor(doorId: AirlockDoorId): string {
  return doorId === "OuterDoor" ? "outer airlock door" : "inner airlock door";
}

function setAirlockOverridePosition(
  state: GameState,
  doorId: AirlockDoorId,
  desiredPosition: LeverPosition,
): ActionResult {
  const currentPosition = getDoorPosition(state, doorId);
  if (currentPosition === desiredPosition) {
    return {
      state,
      message: `The lever is already set to ${formatPosition(
        desiredPosition,
      )}.`,
    };
  }

  const blocked = getInterlockBlockMessage(state, doorId, desiredPosition);
  if (blocked) return { state, message: blocked };

  const next = setDoorOpen(state, doorId, desiredPosition === "open");
  const doorName = describeControlledDoor(doorId);
  const action =
    desiredPosition === "open"
      ? "grinds open somewhere beyond the wall"
      : "grinds shut with a heavy sealed thud";

  return {
    state: next,
    message: `You move the override lever to ${formatPosition(
      desiredPosition,
    )}. The ${doorName} ${action}.`,
  };
}

export function describeAirlockOverridePanel(
  state: GameState,
  doorId: AirlockDoorId,
  label: string,
): string {
  const position = getDoorPosition(state, doorId);
  const doorName = describeControlledDoor(doorId);

  return `The wall panel is labeled "${label}" in blocky industrial lettering. A squat lever sits between two positions, OPEN and CLOSE. It is currently set to ${formatPosition(
    position,
  )}, matching the ${doorName}.`;
}

export function setAirlockOverridePanel(
  state: GameState,
  doorId: AirlockDoorId,
  rawPosition: string | undefined,
): ActionResult {
  const desiredPosition = parseLeverPositionFromCommand(rawPosition);
  if (!desiredPosition) {
    return {
      state,
      message: "Set the override lever to OPEN or CLOSE.",
      consumesTurn: false,
    };
  }

  return setAirlockOverridePosition(state, doorId, desiredPosition);
}

export function turnAirlockOverridePanel(
  state: GameState,
  doorId: AirlockDoorId,
): ActionResult {
  const currentPosition = getDoorPosition(state, doorId);
  const desiredPosition = currentPosition === "open" ? "close" : "open";
  return setAirlockOverridePosition(state, doorId, desiredPosition);
}

export const blockInnerDoorOpenIfOuterOpen: DoorInteractionHook = (state) => {
  if (!state.worldState.doors.OuterDoor?.isOpen) return undefined;

  return {
    state,
    message: "You pull at the handle, but it won't budge.",
  };
};

export const blockOuterDoorOpenIfInnerOpen: DoorInteractionHook = (state) => {
  if (!state.worldState.doors.InnerDoor?.isOpen) return undefined;

  return {
    state,
    message:
      "The outer door refuses to open while the inner airlock door is open.",
  };
};

export const markAirlockPressurizedAfterOuterDoorCloses: DoorInteractionHook = (
  state,
) => {
  const next = setRoomAirQuality(state, LEVEL_SIX_AIRLOCK_ROOM_ID, "clean");
  return {
    state: next,
    message:
      "The outer steel door closes with a deep, gasketed thud. The red panel over the inner door flickers, then steadies.",
  };
};

export const handleInnerDoorClosed: DoorInteractionHook = (state) => {
  if (state.player.roomId !== LEVEL_SIX_AIRLOCK_ROOM_ID) return undefined;
  if (state.worldState.doors.OuterDoor?.isOpen) return undefined;

  return {
    state,
    message:
      "The inner steel door closes with a sealed metallic thump. A hard hiss runs through the airlock as the pressure adjusts around you.",
  };
};

export const handleOuterDoorOpened: DoorInteractionHook = (state) => {
  let next = setRoomAirQuality(state, LEVEL_SIX_AIRLOCK_ROOM_ID, "vacuum");

  if (
    state.player.roomId === LEVEL_SIX_AIRLOCK_ROOM_ID &&
    !isWearingLevelSixSpaceSuit(state)
  ) {
    next = triggerPlayerDeath(
      next,
      LEVEL_SIX_DEPRESSURIZATION_DEATH_MESSAGE,
      LEVEL_SIX_VACUUM_DEATH_CAUSE,
    );

    return {
      state: next,
      message: LEVEL_SIX_DEPRESSURIZATION_DEATH_MESSAGE,
    };
  }

  return {
    state: next,
    message:
      "The outer steel door opens with a heavy seal-breaking cough. The air beyond it is perfectly, terribly still.",
  };
};

export function isWearingLevelSixSpaceSuit(state: GameState): boolean {
  return state.itemState.wornByPlayer.body === LEVEL_SIX_SPACE_SUIT_ID;
}

export function isLevelSixStorageRoomId(roomId: string): boolean {
  return STORAGE_ROOM_ID_SET.has(roomId);
}

export function isLevelSixVacuumRoom(
  state: GameState,
  roomId = state.player.roomId,
): boolean {
  return state.worldState.roomAirQuality[roomId] === "vacuum";
}

function wasPreviousRoomVacuum(state: GameState): boolean {
  const previousMove = state.player.recentMoves?.[0];
  if (!previousMove) return false;

  return isLevelSixVacuumRoom(state, previousMove.fromRoomId);
}

function resetLevelSixSuitGrace(state: GameState): GameState {
  const settings = getLevelSixSuitSettings(state);
  if (settings.oxygenGraceTurns === 0) return state;
  return withLevelSixSuitSettings(state, { oxygenGraceTurns: 0 });
}

function enqueueLevelSixOxygenWarning(
  state: GameState,
  text: string,
): GameState {
  return enqueueNotification(state, buildDangerNotification(text));
}

function isWeightlessStorageMovementRoom(roomId: string): boolean {
  return WEIGHTLESS_STORAGE_MOVEMENT_ROOM_IDS.has(roomId);
}

function isOpenWeightlessStoragePath(
  fromRoomId: string,
  destinationRoomId: string,
): boolean {
  return OPEN_WEIGHTLESS_STORAGE_PATHS.has(
    `${fromRoomId}->${destinationRoomId}`,
  );
}

export function tickLevelSixStorageVacuum(state: GameState): {
  messages: string[];
  state: GameState;
} {
  if (state.worldState.gameOver) return { state, messages: [] };

  const inVacuum = isLevelSixVacuumRoom(state);
  const wearingSuit = isWearingLevelSixSpaceSuit(state);

  if (!inVacuum) {
    if (!wearingSuit) {
      return { state: resetLevelSixSuitGrace(state), messages: [] };
    }

    const shouldNarrateRefill =
      state.player.vitals.oxygen < LEVEL_SIX_SUIT_MAX_OXYGEN ||
      wasPreviousRoomVacuum(state);
    const refilled = resetLevelSixSuitGrace(
      withPlayerOxygen(state, LEVEL_SIX_SUIT_MAX_OXYGEN),
    );

    return {
      state: refilled,
      messages: shouldNarrateRefill
        ? [
            "The space suit's oxygen tank refills with a crisp hiss as breathable air floods the intake.",
          ]
        : [],
    };
  }

  if (!wearingSuit) {
    return {
      state: triggerPlayerDeath(
        state,
        LEVEL_SIX_VACUUM_DEATH_MESSAGE,
        LEVEL_SIX_VACUUM_DEATH_CAUSE,
      ),
      messages: [],
    };
  }

  const oxygen = Math.max(0, Math.min(100, state.player.vitals.oxygen));
  if (oxygen > 0) {
    const nextOxygen = Math.max(
      0,
      oxygen - LEVEL_SIX_SUIT_OXYGEN_LOSS_PER_TURN,
    );
    const next = resetLevelSixSuitGrace(withPlayerOxygen(state, nextOxygen));
    const warning =
      nextOxygen === 25 || nextOxygen === 10
        ? `The space suit oxygen reserve drops to ${nextOxygen}%.`
        : nextOxygen === 0
          ? "The space suit oxygen reserve hits 0%. The next breath is thin and metallic."
          : undefined;

    return {
      state: warning ? enqueueLevelSixOxygenWarning(next, warning) : next,
      messages: [],
    };
  }

  const settings = getLevelSixSuitSettings(state);
  if (settings.oxygenGraceTurns < LEVEL_SIX_SUIT_GRACE_TURNS) {
    const oxygenGraceTurns = settings.oxygenGraceTurns + 1;
    const warning =
      oxygenGraceTurns === 1
        ? "The space suit gives you nothing but stale pressure. You gasp and keep moving."
        : oxygenGraceTurns === LEVEL_SIX_SUIT_GRACE_TURNS
          ? "The empty oxygen tank clicks softly against your back. Your vision sparkles at the edges."
          : undefined;

    let next = withLevelSixSuitSettings(state, { oxygenGraceTurns });
    if (warning) next = enqueueLevelSixOxygenWarning(next, warning);

    return { state: next, messages: [] };
  }

  return {
    state: triggerPlayerDeath(
      state,
      "The suit has no breath left to give. Your hands drift loose, your thoughts smear into a single bright point, and hard vacuum finishes the rest.",
      LEVEL_SIX_VACUUM_DEATH_CAUSE,
    ),
    messages: [],
  };
}

export function resolveLevelSixStorageMovement(
  state: GameState,
  ctx: {
    destinationRoomId: string;
    direction: string;
    fromRoomId: string;
  },
) {
  if (
    isWeightlessStorageMovementRoom(ctx.fromRoomId) &&
    isWeightlessStorageMovementRoom(ctx.destinationRoomId) &&
    !isOpenWeightlessStoragePath(ctx.fromRoomId, ctx.destinationRoomId)
  ) {
    return {
      kind: "block" as const,
      message:
        "You push off toward that gap, but a slow-moving raft of weightless containers bumps together and blocks the way.",
      state,
    };
  }

  if (
    isLevelSixVacuumRoom(state, ctx.destinationRoomId) &&
    !isWearingLevelSixSpaceSuit(state)
  ) {
    const deathMessage =
      ctx.fromRoomId === LEVEL_SIX_AIRLOCK_ROOM_ID
        ? LEVEL_SIX_DEPRESSURIZATION_DEATH_MESSAGE
        : LEVEL_SIX_VACUUM_DEATH_MESSAGE;

    return {
      kind: "block" as const,
      message: deathMessage,
      state: triggerPlayerDeath(
        state,
        deathMessage,
        LEVEL_SIX_VACUUM_DEATH_CAUSE,
      ),
    };
  }

  return undefined;
}

export function wearLevelSixSpaceSuit({
  state,
}: {
  state: GameState;
}): ActionResult {
  if (isWearingLevelSixSpaceSuit(state)) {
    return { state, message: "You are already sealed inside the space suit." };
  }

  if (state.itemState.wornByPlayer.body) {
    return {
      state,
      message: "You are already wearing something bulky over your body.",
    };
  }

  const next = resetLevelSixSuitGrace(
    withPlayerOxygen(
      {
        ...state,
        itemState: {
          ...state.itemState,
          wornByPlayer: {
            ...state.itemState.wornByPlayer,
            body: LEVEL_SIX_SPACE_SUIT_ID,
          },
        },
      },
      LEVEL_SIX_SUIT_MAX_OXYGEN,
    ),
  );

  return {
    state: next,
    message:
      "You pull on the space suit. The seals close around you with a rubbery snap, and the wrist gauge steadies at 100% oxygen.",
  };
}

function commandMatchesBreachPatch(
  state: GameState,
  command: {
    direct: string;
    indirect: string;
    preposition: Extract<Preposition, "in" | "into" | "on" | "over" | "with">;
  },
): boolean {
  const direct = command.direct.toLowerCase().trim();
  const indirect = command.indirect.toLowerCase().trim();

  const adhesiveFirst =
    (command.preposition === "on" || command.preposition === "over") &&
    direct.includes("adhesive") &&
    indirect.includes("breach");
  const breachFirst =
    command.preposition === "with" &&
    (direct.includes("breach") ||
      direct.includes("rift") ||
      direct.includes("hull")) &&
    (indirect.includes("adhesive") || indirect.includes("flex"));

  if (!adhesiveFirst && !breachFirst) return false;

  return (
    state.player.roomId === "RIFT" ||
    state.itemState.itemRoomId[LEVEL_SIX_BREACH_ITEM_ID] === state.player.roomId
  );
}

export function handleLevelSixBreachPatchCommand(
  state: GameState,
  command: {
    direct: string;
    indirect: string;
    preposition: Extract<Preposition, "in" | "into" | "on" | "over" | "with">;
  },
): RuleResult | undefined {
  if (!commandMatchesBreachPatch(state, command)) return undefined;

  if (!inventoryHas(state.player.inventory, LEVEL_SIX_FLEX_PLUG_ID)) {
    return {
      state,
      message: "You would need something broad, flexible, and adhesive.",
    };
  }

  if (state.worldState.conditionalTriggers[LEVEL_SIX_BREACH_SEALED_TRIGGER]) {
    return {
      state,
      message:
        "The Flex-Plug patch is already sealed over the breach, black and glossy against the torn hull.",
    };
  }

  const withTrigger: GameState = {
    ...state,
    worldState: {
      ...state.worldState,
      conditionalTriggers: {
        ...state.worldState.conditionalTriggers,
        [LEVEL_SIX_BREACH_SEALED_TRIGGER]: true,
      },
    },
  };
  const next = triggerScoreOnce(withTrigger, LEVEL_SIX_BREACH_SCORE_ID);

  return {
    state: next,
    message:
      "You peel the backing off the black strip of Flex-Plug and slap it over the breach. The adhesive grabs instantly, flattening hard against the torn hull until the patch looks painted on.",
  };
}
