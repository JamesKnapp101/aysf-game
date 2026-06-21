import { getRetryableEncounterDeathOverride } from "@game/encounters/retryableEncounters";
import { appendLog } from "@game/engine/log";
import { recordBarBotCellarDeathWitness } from "@game/helpers/barBotAwareness";
import { refreshPlayerOxygenForEnvironment } from "@game/helpers/environmentHelpers";
import { isAnyFlashlightOn } from "@game/helpers/flashlightHelpers";
import {
  getExitDestinationRoomId,
  getRoomExits,
} from "@game/helpers/itemHelpers";
import { useUIEffectsStore } from "@game/store/store";
import { secretOrganismMessage } from "@game/text/secretOrganismMessage";
import { ScriptContext, ScriptedEvent } from "@game/types/eventTypes";
import { GameState } from "@game/types/gameTypes";
import { Item } from "@game/types/itemTypes";
import { isGamePreserveRoomId } from "src/world/maps/levelFour/gamePreserveRules";

// Maximum number of player death husks to keep in the world
// Older husks are removed to prevent world.items array from growing unbounded
const MAX_PLAYER_DEATH_HUSKS = 10;

export function triggerTeleportFlash(el: HTMLElement | null) {
  if (!el) return;
  el.classList.remove("teleport-flash");
  void el.offsetWidth;
  el.classList.add("teleport-flash");
}

export function anyIn<T>(arrayA: T[], arrayB: T[]): boolean {
  const setA = new Set(arrayA);
  return arrayB.some((item) => setA.has(item));
}

type PowerRestoredSections = Record<string, boolean>;

const TPAD_COLORS_IN_ORDER = [
  "green",
  "blue",
  "yellow",
  "violet",
  "white",
  "maroon",
] as const;

export function generateTerminalTpadDescription(
  power: PowerRestoredSections,
): string {
  const onColors = TPAD_COLORS_IN_ORDER.filter(
    (c) => power[`teleport-pads-${c}`] === true,
  );

  const base = `Mounted along the platform are a row of large, glossy disks colored green, blue, yellow, violet, white, and maroon, each ringed by a shiny metallic band. The disks are large enough, and look sturdy enough, to stand on.`;

  const glowTail = "lit, emitting a serene glow.";

  if (onColors.length === 0) {
    return base; // none powered; don't add a second sentence
  }

  if (onColors.length === TPAD_COLORS_IN_ORDER.length) {
    return `${base} Each of the disks is ${glowTail}`;
  }

  const list = formatColorList(onColors);
  const plural = onColors.length > 1 ? "are" : "is";
  return `${base} Of the disks, the ${list} one${
    onColors.length > 1 ? "s" : ""
  } ${plural} ${glowTail}`;
}

function formatColorList(colors: readonly string[]): string {
  if (colors.length === 1) return colors[0];
  if (colors.length === 2) return `${colors[0]} and ${colors[1]}`;
  // Oxford comma
  return `${colors.slice(0, -1).join(", ")}, and ${colors[colors.length - 1]}`;
}

export function getItemRoomId(
  state: GameState,
  itemOrId: Item | string,
): string | undefined {
  const id = typeof itemOrId === "string" ? itemOrId : itemOrId.id;

  // runtime truth first
  const live = state.itemState.itemRoomId?.[id];
  if (live) return live;

  // fallback for items not yet “materialized” in itemState
  if (typeof itemOrId !== "string") return itemOrId.location;

  // if caller passed only an id, you could optionally look up the item def here
  return undefined;
}

export const flashlightOn = (state: GameState) => {
  return isAnyFlashlightOn(state);
};

const MAX_RECENT_MOVES = 5;

type PlayerMoveEvent = {
  fromRoomId: string;
  toRoomId: string;
  via?: string; // direction like "n", "south", etc.
  atTurn?: number; // optional, only if you track turns
};

export function movePlayerToRoom(
  state: GameState,
  toRoomId: string,
  opts?: { fromRoomId?: string; via?: string },
) {
  const fromRoomId = opts?.fromRoomId ?? state.player.roomId;
  const via = opts?.via;

  // If something tries to "move" to same room, don't pollute history.
  if (fromRoomId === toRoomId) return state;

  const atTurn = state.moves;

  const prevMoves = state.player.recentMoves ?? [];
  const nextEvent: PlayerMoveEvent = { fromRoomId, toRoomId, via, atTurn };
  const recentMoves = [nextEvent, ...prevMoves].slice(0, MAX_RECENT_MOVES);

  const next = {
    ...state,
    player: {
      ...state.player,
      roomId: toRoomId,
      prevRoomId: fromRoomId,
      recentMoves,
    },
  };

  return refreshPlayerOxygenForEnvironment(next);
}

function isTripped(state: GameState, id: string) {
  return state.worldState.scriptedEventsTripped?.[id] === true;
}

function markTripped(state: GameState, id: string): GameState {
  return {
    ...state,
    worldState: {
      ...state.worldState,
      scriptedEventsTripped: {
        ...state.worldState.scriptedEventsTripped,
        [id]: true,
      },
    },
  };
}

export function runScriptedEvents(
  state: GameState,
  ctx: ScriptContext,
  events: ScriptedEvent[],
): GameState {
  let next = state;

  for (const ev of events) {
    const once = ev.once !== false;
    if (once && isTripped(next, ev.id)) continue;
    if (!ev.when(next, ctx)) continue;

    next = ev.run(next, ctx);
    if (once) next = markTripped(next, ev.id);
  }

  return next;
}

export function queueAfterRoomDescription(state: GameState, text: string) {
  const existing =
    state.worldState.pendingNarration?.afterRoomDescription ?? [];
  return {
    ...state,
    worldState: {
      ...state.worldState,
      pendingNarration: {
        ...state.worldState.pendingNarration,
        afterRoomDescription: [...existing, text],
      },
    },
  };
}

export function flushAfterRoomDescription(state: GameState): GameState {
  const lines = state.worldState.pendingNarration?.afterRoomDescription ?? [];
  if (lines.length === 0) return state;

  let next = state;
  for (const line of lines) next = appendLog(next, line);

  return {
    ...next,
    worldState: {
      ...next.worldState,
      pendingNarration: {
        ...next.worldState.pendingNarration,
        afterRoomDescription: [],
      },
    },
  };
}

export function triggerPlayerDeath(
  state: GameState,
  deathMessage: string,
  cause: string,
): GameState {
  let next = state;
  const roomId = state.player.roomId;
  const retryableEncounterOverride = getRetryableEncounterDeathOverride(
    state,
    cause,
    roomId,
  );

  const rebootMessage = `${deathMessage}\n\n\n *** You have died *** \n\n\n...What feels like an instant later you find yourself laying on your back, disoriented, and suck in a panicked breath. You check yourself frantically but whatever happened, you seem to be all in one piece again now. You stand up, confused. How did you get back here?\n\n`;

  next = appendLog(next, rebootMessage);

  const adjacentRoomIds = getRoomExits(state, roomId)
    .map((exit) => getExitDestinationRoomId(state, roomId, exit))
    .filter((id): id is string => Boolean(id));

  const uniqueAdjacentRoomIds = Array.from(new Set(adjacentRoomIds));

  const potentialRegenRoomIds = uniqueAdjacentRoomIds.filter(
    (candidateRoomId) => {
      const isVisited = state.worldState.visitedRooms[candidateRoomId] === true;
      const isLit = !state.worldState.darkRooms[candidateRoomId];
      return isVisited && isLit && candidateRoomId !== roomId;
    },
  );

  const fallbackRegenRoomIds = Object.entries(state.worldState.visitedRooms)
    .filter(([candidateRoomId, visited]) => {
      if (!visited) return false;
      if (candidateRoomId === roomId) return false;
      return !state.worldState.darkRooms[candidateRoomId];
    })
    .map(([candidateRoomId]) => candidateRoomId);

  const regenPool =
    potentialRegenRoomIds.length > 0
      ? potentialRegenRoomIds
      : fallbackRegenRoomIds;

  const randomIndex =
    regenPool.length > 0 ? Math.floor(next.rng() * regenPool.length) : -1;
  const selectedRegenRoom =
    randomIndex >= 0 ? regenPool[randomIndex] : "PowerGrid";

  const selectedRoomIsValid =
    selectedRegenRoom !== roomId &&
    state.worldState.visitedRooms[selectedRegenRoom] === true &&
    !state.worldState.darkRooms[selectedRegenRoom];

  const finalRegenRoom = selectedRoomIsValid ? selectedRegenRoom : "PowerGrid";
  const finalRoomIsDark = !!state.worldState.darkRooms[finalRegenRoom];

  // Absolute safety: never respawn into the death room or a dark room.
  const safeRegenRoom =
    retryableEncounterOverride?.respawnRoomId ??
    (finalRegenRoom !== roomId && !finalRoomIsDark
      ? finalRegenRoom
      : "PowerGrid");

  const shouldCreateDeathHusk = !isGamePreserveRoomId(roomId);

  let itemsToKeep = state.world.items;
  let nextHusk: Item | undefined;

  if (shouldCreateDeathHusk) {
    const existingHusks = state.world.items.filter((item) =>
      item.id.startsWith("playerRegenHusk"),
    );

    nextHusk = {
      id: `playerRegenHusk${Object.keys(next.worldState.playerDeaths).length}`,
      location: safeRegenRoom,
      name: "a lifeless husk",
      description:
        "It's identical to the one you found when you first woke up.",
      initialDescription:
        "Curled up on the floor nearby you see what looks like a dead bug, or spider.",
      vocab: ["husk", "lifeless husk", "bug husk"],
      itemClass: "solid",
      itemCategory: "collectable",
      itemWeight: 0,
      itemSize: 0,
    };

    if (existingHusks.length >= MAX_PLAYER_DEATH_HUSKS) {
      const husksToRemove = existingHusks.slice(
        0,
        existingHusks.length - MAX_PLAYER_DEATH_HUSKS + 1,
      );
      const huskIdsToRemove = new Set(husksToRemove.map((h) => h.id));
      itemsToKeep = state.world.items.filter(
        (item) => !huskIdsToRemove.has(item.id),
      );
    }
  }

  let nextState: GameState = {
    ...next,
    player: {
      ...state.player,
      roomId: safeRegenRoom,
    },
    world: {
      ...state.world,
      items: nextHusk ? [...itemsToKeep, nextHusk] : itemsToKeep,
    },
    worldState: {
      ...state.worldState,
      playerDeaths: {
        ...state.worldState.playerDeaths,
        [roomId]: { cause, bodyDescription: `` },
      },
    },
  };

  if (retryableEncounterOverride) {
    nextState = retryableEncounterOverride.reset(nextState);
  }

  const barBotWitness = recordBarBotCellarDeathWitness(nextState, {
    deathRoomId: roomId,
    respawnRoomId: safeRegenRoom,
  });
  nextState = barBotWitness.state;
  if (barBotWitness.immediateMessage) {
    nextState = appendLog(nextState, barBotWitness.immediateMessage);
  }

  if (cause === "organism") {
    const seed = Date.now();
    const key = "FUNCTIONING"; // hinted in-world later

    const cipher = encryptVigenere(secretOrganismMessage, key);
    const display = formatCipherBlocks(cipher, 25);
    useUIEffectsStore.getState().playOrganismDeath({
      title: "SIGNAL RECEIVED",
      cipherText: encryptVigenere(display, key),
      seed,
      revealMode: "random-chunks",
      chunkMs: 5,
      chunkSize: 5,
    });
  }

  return nextState;
}

export function drainAfterRoomDescription(state: GameState): {
  state: GameState;
  lines: string[];
} {
  const lines = state.worldState.pendingNarration?.afterRoomDescription ?? [];
  const nextState: GameState = {
    ...state,
    worldState: {
      ...state.worldState,
      pendingNarration: {
        ...state.worldState.pendingNarration,
        afterRoomDescription: [],
      },
    },
  };
  return { state: nextState, lines };
}

/**
 * Classic Vigenère cipher (encryption only)
 *
 * - A–Z alphabet
 * - Non-letters are preserved and do NOT advance the key
 * - Output is uppercase
 */
export function encryptVigenere(plaintext: string, key: string): string {
  const A = "A".charCodeAt(0);

  const cleanKey = key.toUpperCase().replace(/[^A-Z]/g, "");

  if (!cleanKey.length) {
    throw new Error("Vigenère key must contain at least one letter A–Z");
  }

  let keyIndex = 0;

  return plaintext
    .toUpperCase()
    .split("")
    .map((ch) => {
      const code = ch.charCodeAt(0);

      // Only encrypt A–Z
      if (code < A || code > A + 25) {
        return ch;
      }

      const p = code - A;
      const k = cleanKey.charCodeAt(keyIndex % cleanKey.length) - A;

      keyIndex++;

      const c = (p + k) % 26;
      return String.fromCharCode(A + c);
    })
    .join("");
}

export function formatCipherBlocks(
  text: string,
  groupSize = 5,
  groupsPerLine = 9,
): string {
  const letters = text;

  const groups: string[] = [];
  for (let i = 0; i < letters.length; i += groupSize) {
    groups.push(letters.slice(i, i + groupSize));
  }

  const lines: string[] = [];
  for (let i = 0; i < groups.length; i += groupsPerLine) {
    lines.push(groups.slice(i, i + groupsPerLine).join(" "));
  }

  return lines.join(" ");
}
