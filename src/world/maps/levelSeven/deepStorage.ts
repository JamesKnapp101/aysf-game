import { movePlayerToRoom } from "@game/helpers/gameHelpers";
import { updateItemLocation } from "@game/rules/items";
import {
  buildDangerNotification,
  enqueueNotification,
} from "@game/rules/notifications";
import { removeFromInventory } from "@game/rules/state";
import type { ActionResult } from "@game/types/actionsTypes";
import type { GameState } from "@game/types/gameTypes";
import type { Item } from "@game/types/itemTypes";
import type { ParsedCommand } from "@game/types/parserTypes";
import type { Direction } from "@game/types/roomTypes";

export const DEEP_STORAGE_GRID_ROOM_ID = "DeepStorageGrid";
export const DEEP_STORAGE_SUIT_ITEM_ID = "ColdSuit";
export const DEEP_STORAGE_GRID_SIZE = 26;
export const DEEP_STORAGE_HYPOTHERMIA_CAUSE = "deep storage hypothermia";
export const DEEP_STORAGE_FATAL_TEMPERATURE = 70;
export const DEEP_STORAGE_MAX_EXPOSURE_TURNS = 5;
export const DEEP_STORAGE_TEMP_LOSS_PER_TURN = 1.5;
export const DEEP_STORAGE_SUIT_MAX_OXYGEN = 100;
export const DEEP_STORAGE_SUIT_OXYGEN_LOSS_PER_TURN = 1;
export const DEEP_STORAGE_SUIT_GRACE_TURNS = 2;

type DeepStorageCoord = {
  x: number;
  y: number;
};

type DeepStorageDock = {
  coord: DeepStorageCoord;
  label: string;
  roomId: string;
};

const DEEP_STORAGE_PRIMARY_DOCK_ROOM_ID = "Stasis";

const DEEP_STORAGE_DOCKS: DeepStorageDock[] = [
  {
    coord: { x: 0, y: 0 },
    label: "Primary Stasis Dock",
    roomId: DEEP_STORAGE_PRIMARY_DOCK_ROOM_ID,
  },
  {
    coord: { x: 17, y: 19 },
    label: "Biostasis Service Dock",
    roomId: "DeepStorageMedVault",
  },
  {
    coord: { x: 7, y: 23 },
    label: "Deep Archive Dock",
    roomId: "DeepStorageArchiveDock",
  },
];

const DEEP_STORAGE_HIDDEN_ROOM_TO_DOCK: Record<string, string> = {
  DeepStorageMedVault: "DeepStorageMedVault",
  DeepStorageRecordsBay: "DeepStorageMedVault",
  DeepStorageArchiveDock: "DeepStorageArchiveDock",
  DeepStorageSpecimenGallery: "DeepStorageArchiveDock",
};

const CARDINAL_DELTAS: Partial<Record<Direction, { dx: number; dy: number }>> =
  {
    north: { dx: 0, dy: -1 },
    south: { dx: 0, dy: 1 },
    east: { dx: 1, dy: 0 },
    west: { dx: -1, dy: 0 },
  };

export function createInitialDeepStorageState() {
  return {
    coord: { x: 0, y: 0 },
    exposureTurns: 0,
    lastDockRoomId: DEEP_STORAGE_PRIMARY_DOCK_ROOM_ID,
    oxygenGraceTurns: 0,
  };
}

export function getDeepStorageState(state: GameState) {
  return {
    ...createInitialDeepStorageState(),
    ...(state.worldState.deepStorage ?? {}),
    coord: state.worldState.deepStorage?.coord ?? { x: 0, y: 0 },
  };
}

function withDeepStorageState(
  state: GameState,
  patch: Partial<ReturnType<typeof createInitialDeepStorageState>>,
): GameState {
  const current = getDeepStorageState(state);

  return {
    ...state,
    worldState: {
      ...state.worldState,
      deepStorage: {
        ...current,
        ...patch,
        coord: patch.coord ?? current.coord,
      },
    },
  };
}

export function formatDeepStorageCoord(coord: DeepStorageCoord): string {
  const column = String.fromCharCode("A".charCodeAt(0) + coord.x);
  return `${column}${coord.y + 1}`;
}

export function getDeepStorageDockAtCoord(
  coord: DeepStorageCoord,
): DeepStorageDock | undefined {
  return DEEP_STORAGE_DOCKS.find(
    (dock) => dock.coord.x === coord.x && dock.coord.y === coord.y,
  );
}

export function getCurrentDeepStorageDock(
  state: GameState,
): DeepStorageDock | undefined {
  return getDeepStorageDockAtCoord(getDeepStorageState(state).coord);
}

export function getDeepStorageDockForRoom(
  roomId: string,
): DeepStorageDock | undefined {
  return DEEP_STORAGE_DOCKS.find((dock) => dock.roomId === roomId);
}

function getDockRoomForHiddenRoom(roomId: string): string | undefined {
  return DEEP_STORAGE_HIDDEN_ROOM_TO_DOCK[roomId];
}

export function isDeepStorageHiddenRoomId(roomId: string): boolean {
  return Boolean(getDockRoomForHiddenRoom(roomId));
}

export function isWearingDeepStorageSuit(state: GameState): boolean {
  return state.itemState.wornByPlayer.body === DEEP_STORAGE_SUIT_ITEM_ID;
}

export function isDeepStorageSuitOverlayActive(state: GameState): boolean {
  return (
    isWearingDeepStorageSuit(state) &&
    state.player.roomId === DEEP_STORAGE_GRID_ROOM_ID
  );
}

export function getDeepStorageAvailableDirections(state: GameState) {
  const { coord } = getDeepStorageState(state);

  return {
    north: coord.y > 0,
    south: coord.y < DEEP_STORAGE_GRID_SIZE - 1,
    east: coord.x < DEEP_STORAGE_GRID_SIZE - 1,
    west: coord.x > 0,
  };
}

function isSuitNoun(noun: string | undefined): boolean {
  if (!noun) return false;
  const normalized = noun.trim().toLowerCase();
  return [
    "suit",
    "cryonic suit",
    "cold suit",
    "space suit",
    "coldsuit",
  ].includes(normalized);
}

export function getDeepStorageActionGuard(
  state: GameState,
  cmd: ParsedCommand,
): { consumesTurn: boolean; message: string } | undefined {
  if (!isDeepStorageSuitOverlayActive(state)) return undefined;
  if (cmd.type !== "action") return undefined;
  if (cmd.verb === "remove" && isSuitNoun(cmd.direct)) return undefined;

  return {
    consumesTurn: false,
    message:
      "The suit's sealed controls ignore the command. In this thing, all you can do is move or remove it at a dock.",
  };
}

function setDeepStorageSuitWorn(state: GameState, worn: boolean): GameState {
  return {
    ...state,
    itemState: {
      ...state.itemState,
      wornByPlayer: {
        ...state.itemState.wornByPlayer,
        body: worn ? DEEP_STORAGE_SUIT_ITEM_ID : undefined,
      },
    },
  };
}

function moveSuitToLocation(state: GameState, location: string): GameState {
  let next = removeFromInventory(state, DEEP_STORAGE_SUIT_ITEM_ID);
  next = updateItemLocation(next, DEEP_STORAGE_SUIT_ITEM_ID, location);
  return next;
}

function withPlayerOxygen(state: GameState, oxygen: number): GameState {
  const nextOxygen = Math.max(
    0,
    Math.min(DEEP_STORAGE_SUIT_MAX_OXYGEN, Math.round(oxygen)),
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

function refillDeepStorageSuitOxygen(state: GameState): GameState {
  return withDeepStorageState(
    withPlayerOxygen(state, DEEP_STORAGE_SUIT_MAX_OXYGEN),
    { oxygenGraceTurns: 0 },
  );
}

function enqueueDeepStorageOxygenWarning(
  state: GameState,
  text: string,
): GameState {
  return enqueueNotification(state, buildDangerNotification(text));
}

export function returnDeepStorageSuitHome(
  state: GameState,
  mode: "manual" | "oxygen" = "manual",
): ActionResult {
  if (!isWearingDeepStorageSuit(state)) {
    return {
      state,
      message: "The cryonic suit HOME recall is not available.",
      consumesTurn: false,
    };
  }

  const primaryDock = getDeepStorageDockForRoom(
    DEEP_STORAGE_PRIMARY_DOCK_ROOM_ID,
  )!;
  let next = setDeepStorageSuitWorn(state, false);
  next = moveSuitToLocation(next, primaryDock.roomId);
  next = withDeepStorageState(next, {
    coord: primaryDock.coord,
    exposureTurns: 0,
    lastDockRoomId: primaryDock.roomId,
    oxygenGraceTurns: 0,
  });
  next = withPlayerOxygen(next, DEEP_STORAGE_SUIT_MAX_OXYGEN);
  next = movePlayerToRoom(next, primaryDock.roomId, {
    fromRoomId: state.player.roomId,
    via: mode === "manual" ? "suit home" : "suit emergency recall",
  });

  return {
    state: next,
    consumesTurn: false,
    message:
      mode === "oxygen"
        ? "The visor whites out as the suit catches your failing breath. Emergency recall fires, and the stasis dock slams into place around you as oxygen floods the lines."
        : "You hit HOME. The suit folds the frozen grid into a flash of hard white light, and the stasis dock catches you with a magnetic thud.",
  };
}

export function wearDeepStorageSuit({
  state,
}: {
  item: Item;
  state: GameState;
}): ActionResult {
  if (isWearingDeepStorageSuit(state)) {
    return {
      state,
      message: "You are already sealed inside the cryonic suit.",
    };
  }

  if (state.itemState.wornByPlayer.body) {
    return {
      state,
      message: "You are already wearing something bulky over your body.",
    };
  }

  const dock = getDeepStorageDockForRoom(state.player.roomId);
  if (!dock) {
    return {
      state,
      message:
        "The cryonic suit is too heavy to seal properly without a dock cradle.",
    };
  }

  let next = moveSuitToLocation(state, "PLAYER");
  next = setDeepStorageSuitWorn(next, true);
  next = withDeepStorageState(next, {
    coord: dock.coord,
    exposureTurns: 0,
    lastDockRoomId: dock.roomId,
    oxygenGraceTurns: 0,
  });
  next = withPlayerOxygen(next, DEEP_STORAGE_SUIT_MAX_OXYGEN);
  next = movePlayerToRoom(next, DEEP_STORAGE_GRID_ROOM_ID, {
    fromRoomId: state.player.roomId,
    via: "wear",
  });

  return {
    state: next,
    message:
      "You climb into the cryonic suit. The dock clamps release, the helmet seals with a hard click, and the visor wakes in layered green light.",
  };
}

export function removeDeepStorageSuit({
  state,
}: {
  item: Item;
  state: GameState;
}): ActionResult {
  if (!isWearingDeepStorageSuit(state)) {
    return {
      state,
      message: "You are not wearing the cryonic suit.",
    };
  }

  const dock = getCurrentDeepStorageDock(state);
  if (!dock || state.player.roomId !== DEEP_STORAGE_GRID_ROOM_ID) {
    return {
      state,
      message:
        "The collar seal stays locked. The suit will not open away from a dock cradle.",
    };
  }

  let next = setDeepStorageSuitWorn(state, false);
  next = moveSuitToLocation(next, dock.roomId);
  next = withDeepStorageState(next, {
    coord: dock.coord,
    exposureTurns: 0,
    lastDockRoomId: dock.roomId,
    oxygenGraceTurns: 0,
  });
  next = withPlayerOxygen(next, DEEP_STORAGE_SUIT_MAX_OXYGEN);
  next = movePlayerToRoom(next, dock.roomId, {
    fromRoomId: state.player.roomId,
    via: "remove suit",
  });

  return {
    state: next,
    message:
      "The dock collar catches the suit with a magnetic thunk. The seals relax, and you climb out into blessedly ordinary air.",
  };
}

function moveDeepStorageCoord(
  state: GameState,
  coord: DeepStorageCoord,
): GameState {
  const dock = getDeepStorageDockAtCoord(coord);
  const next = withDeepStorageState(state, {
    coord,
    exposureTurns: isWearingDeepStorageSuit(state)
      ? 0
      : getDeepStorageState(state).exposureTurns,
    lastDockRoomId: dock?.roomId ?? getDeepStorageState(state).lastDockRoomId,
    oxygenGraceTurns: dock ? 0 : getDeepStorageState(state).oxygenGraceTurns,
  });

  return dock && isWearingDeepStorageSuit(next)
    ? refillDeepStorageSuitOxygen(next)
    : next;
}

function describeDeepStorageMove(
  state: GameState,
  direction: Direction,
  coord: DeepStorageCoord,
): string {
  const marker = formatDeepStorageCoord(coord);
  const dock = getDeepStorageDockAtCoord(coord);
  const movement = isWearingDeepStorageSuit(state)
    ? `The suit servos carry you ${direction} through the frozen aisle.`
    : `You force yourself ${direction}, breath sawing in your throat as the cold bites deeper.`;
  const dockText = dock
    ? ` A dock cradle glows beside the marker: ${dock.label.toUpperCase()}.`
    : "";

  return `${movement} The wall marker ahead reads ${marker}.${dockText}`;
}

export function resolveDeepStorageMovement(
  state: GameState,
  ctx: {
    destinationRoomId: string;
    direction: string;
    fromRoomId: string;
  },
) {
  const direction = ctx.direction as Direction;
  const wearingSuit = isWearingDeepStorageSuit(state);

  if (
    wearingSuit &&
    ctx.fromRoomId === DEEP_STORAGE_PRIMARY_DOCK_ROOM_ID &&
    direction === "north"
  ) {
    return {
      kind: "block" as const,
      message:
        "The suit is far too broad for the north hatch. Its shoulder plating knocks against both sides before you can even start through.",
      state,
    };
  }

  const entryDock = getDeepStorageDockForRoom(ctx.fromRoomId);
  if (entryDock && ctx.destinationRoomId === DEEP_STORAGE_GRID_ROOM_ID) {
    const next = withDeepStorageState(state, {
      coord: entryDock.coord,
      exposureTurns: wearingSuit ? 0 : getDeepStorageState(state).exposureTurns,
      lastDockRoomId: entryDock.roomId,
      oxygenGraceTurns: 0,
    });

    return {
      kind: "allow" as const,
      message: wearingSuit
        ? "The suit steps down from the dock cradle into the cryogenic grid."
        : "You step into the cryogenic grid. The cold hits like a physical impact.",
      state: wearingSuit ? refillDeepStorageSuitOxygen(next) : next,
    };
  }

  if (ctx.fromRoomId !== DEEP_STORAGE_GRID_ROOM_ID) return undefined;

  if (direction === "out") {
    const dock = getCurrentDeepStorageDock(state);
    if (!dock) {
      return {
        kind: "block" as const,
        message: "There is no dock hatch here.",
        state,
      };
    }

    if (wearingSuit) {
      return {
        kind: "block" as const,
        message:
          "The dock is here, but the suit will only release through the collar seal. Use the suit release.",
        state,
      };
    }

    const next = movePlayerToRoom(state, dock.roomId, {
      fromRoomId: state.player.roomId,
      via: "out",
    });

    return {
      kind: "block" as const,
      message: "You stumble back through the dock hatch.",
      state: next,
    };
  }

  const delta = CARDINAL_DELTAS[direction];
  if (!delta) return undefined;

  const current = getDeepStorageState(state).coord;
  const nextCoord = {
    x: current.x + delta.dx,
    y: current.y + delta.dy,
  };

  if (
    nextCoord.x < 0 ||
    nextCoord.y < 0 ||
    nextCoord.x >= DEEP_STORAGE_GRID_SIZE ||
    nextCoord.y >= DEEP_STORAGE_GRID_SIZE
  ) {
    return {
      kind: "block" as const,
      message: wearingSuit
        ? "The visor paints a hard boundary line across the aisle. The grid does not continue that way."
        : "You find only sealed cryo racks and frost-caked wall in that direction.",
      state,
    };
  }

  const next = moveDeepStorageCoord(state, nextCoord);

  return {
    kind: "allow" as const,
    message: describeDeepStorageMove(state, direction, nextCoord),
    state: next,
  };
}

export function describeDeepStorageGrid(state: GameState): string {
  const { coord } = getDeepStorageState(state);
  const marker = formatDeepStorageCoord(coord);
  const dock = getDeepStorageDockAtCoord(coord);
  const suitText = isWearingDeepStorageSuit(state)
    ? " Through the helmet port, the room bows subtly at the edges, the suit optics compressing the long aisles into a cold green tunnel."
    : " The air hurts immediately; every breath feels sharp enough to leave splinters.";
  const dockText = dock
    ? ` A recessed dock cradle is set into the wall below the marker, its status strip reading ${dock.label.toUpperCase()}.`
    : "";

  return `The cryogenic deep freeze stretches away in a strict repeating grid of coffin-sized storage chambers. The walls, ceiling, and floor all share the same hard industrial rhythm: sealed pods, frosted conduits, dim LCD glows, and white vapor crawling along the deck. The only unique feature is the coordinate marker stenciled on the wall: ${marker}.${suitText}${dockText}`;
}

function tickDeepStorageSuitOxygen(state: GameState): {
  handled: boolean;
  messages: string[];
  state: GameState;
} {
  if (!isDeepStorageSuitOverlayActive(state)) {
    return { handled: false, messages: [], state };
  }

  if (getCurrentDeepStorageDock(state)) {
    return {
      handled: true,
      messages: [],
      state: refillDeepStorageSuitOxygen(state),
    };
  }

  const oxygen = Math.max(0, Math.min(100, state.player.vitals.oxygen));
  if (oxygen > 0) {
    const nextOxygen = Math.max(
      0,
      oxygen - DEEP_STORAGE_SUIT_OXYGEN_LOSS_PER_TURN,
    );
    const next = withDeepStorageState(withPlayerOxygen(state, nextOxygen), {
      oxygenGraceTurns: 0,
    });
    const warning =
      nextOxygen === 25 || nextOxygen === 10
        ? `The suit oxygen reserve drops to ${nextOxygen}%.`
        : nextOxygen === 0
          ? "The suit oxygen reserve hits 0%. The next breath is thin, sour, and not enough."
          : undefined;

    return {
      handled: true,
      messages: [],
      state: warning ? enqueueDeepStorageOxygenWarning(next, warning) : next,
    };
  }

  const storage = getDeepStorageState(state);
  if (storage.oxygenGraceTurns < DEEP_STORAGE_SUIT_GRACE_TURNS) {
    const graceTurns = storage.oxygenGraceTurns + 1;
    const warning =
      graceTurns === 1
        ? "The suit gives you nothing but stale pressure. You gasp and keep moving."
        : "Your lungs hitch against an empty tank. The HOME recall indicator begins flashing hard red.";
    return {
      handled: true,
      messages: [],
      state: enqueueDeepStorageOxygenWarning(
        withDeepStorageState(state, { oxygenGraceTurns: graceTurns }),
        warning,
      ),
    };
  }

  const recalled = returnDeepStorageSuitHome(state, "oxygen");
  return {
    handled: true,
    messages: [],
    state: recalled.message
      ? enqueueDeepStorageOxygenWarning(recalled.state, recalled.message)
      : recalled.state,
  };
}

export function tickDeepStorageExposure(state: GameState): {
  messages: string[];
  state: GameState;
} {
  const suitOxygen = tickDeepStorageSuitOxygen(state);
  if (suitOxygen.handled) {
    return {
      messages: suitOxygen.messages,
      state: suitOxygen.state,
    };
  }

  if (
    state.player.roomId !== DEEP_STORAGE_GRID_ROOM_ID ||
    isWearingDeepStorageSuit(state)
  ) {
    const current = getDeepStorageState(state);
    if (current.exposureTurns === 0) return { state, messages: [] };
    return {
      state: withDeepStorageState(state, { exposureTurns: 0 }),
      messages: [],
    };
  }

  const current = getDeepStorageState(state);
  const exposureTurns = current.exposureTurns + 1;
  const temperature = Number(
    Math.max(
      50,
      state.player.vitals.temperature - DEEP_STORAGE_TEMP_LOSS_PER_TURN,
    ).toFixed(1),
  );
  const next = withDeepStorageState(
    {
      ...state,
      player: {
        ...state.player,
        vitals: {
          ...state.player.vitals,
          temperature,
        },
      },
    },
    { exposureTurns },
  );

  if (
    temperature <= DEEP_STORAGE_FATAL_TEMPERATURE ||
    exposureTurns >= DEEP_STORAGE_MAX_EXPOSURE_TURNS
  ) {
    return { state: next, messages: [] };
  }

  return {
    state: next,
    messages: [
      `The deep-freeze air claws heat out of you. Your body temperature drops to ${temperature.toFixed(
        1,
      )} F.`,
    ],
  };
}

export function shouldDeepStorageExposureKill(state: GameState): boolean {
  if (state.player.roomId !== DEEP_STORAGE_GRID_ROOM_ID) return false;
  if (isWearingDeepStorageSuit(state)) return false;

  const storage = getDeepStorageState(state);
  return (
    state.player.vitals.temperature <= DEEP_STORAGE_FATAL_TEMPERATURE ||
    storage.exposureTurns >= DEEP_STORAGE_MAX_EXPOSURE_TURNS
  );
}

export function getDeepStorageDeathMessage(state: GameState): string {
  const marker = formatDeepStorageCoord(getDeepStorageState(state).coord);
  return `At marker ${marker}, the cold finally gets deeper than pain. Your hands stop obeying you, your thoughts slow to syrup, and the white frost of the cryogenic grid fills your vision.`;
}

export function getDeepStorageRespawnDockRoomId(
  state: GameState,
  deathRoomId: string,
): string {
  const hiddenDockRoomId = getDockRoomForHiddenRoom(deathRoomId);
  if (hiddenDockRoomId) return hiddenDockRoomId;

  const coord =
    deathRoomId === DEEP_STORAGE_GRID_ROOM_ID
      ? getDeepStorageState(state).coord
      : getDeepStorageState(state).coord;

  let nearestDock = DEEP_STORAGE_DOCKS[0];
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const dock of DEEP_STORAGE_DOCKS) {
    const distance =
      Math.abs(dock.coord.x - coord.x) + Math.abs(dock.coord.y - coord.y);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestDock = dock;
    }
  }

  return nearestDock.roomId;
}

export function resetDeepStorageAfterDeath(state: GameState): GameState {
  const dock =
    getDeepStorageDockForRoom(state.player.roomId) ??
    getDeepStorageDockForRoom(DEEP_STORAGE_PRIMARY_DOCK_ROOM_ID)!;

  let next = setDeepStorageSuitWorn(state, false);
  next = moveSuitToLocation(next, dock.roomId);
  next = withDeepStorageState(next, {
    coord: dock.coord,
    exposureTurns: 0,
    lastDockRoomId: dock.roomId,
    oxygenGraceTurns: 0,
  });

  return {
    ...next,
    player: {
      ...next.player,
      vitals: {
        ...next.player.vitals,
        health: 100,
        oxygen: 100,
        temperature: 98.6,
      },
    },
  };
}

export function matchesDeepStorageRetryableDeath(
  _state: GameState,
  cause: string,
  roomId: string,
): boolean {
  return (
    cause === DEEP_STORAGE_HYPOTHERMIA_CAUSE ||
    isDeepStorageHiddenRoomId(roomId)
  );
}
