import { appendLog } from "@game/engine/handleCommand";
import { moveItemToRoom } from "@game/helpers/itemHelpers";
import { inventoryHas } from "@game/rules/state";
import { useUIEffectsStore } from "@game/store/store";
import { secretOrganismMessage } from "@game/text/secretOrganismMessage";
import { GameState } from "@game/types/gameTypes";
import { Item } from "@game/types/itemTypes";

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
  if (!inventoryHas(state.player.inventory, "flashlight")) return false;
  const fs = state.itemState.itemSettings["flashlight"];
  return Boolean(fs && "isOn" in fs && fs.isOn === true);
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

  const atTurn =
    (state as any).turnNumber ??
    (state.worldState as any).turnNumber ??
    undefined;

  const prevMoves = state.player.recentMoves ?? [];
  const nextEvent: PlayerMoveEvent = { fromRoomId, toRoomId, via, atTurn };
  const recentMoves = [nextEvent, ...prevMoves].slice(0, MAX_RECENT_MOVES);

  return {
    ...state,
    player: {
      ...state.player,
      roomId: toRoomId,
      prevRoomId: fromRoomId,
      recentMoves,
    },
  };
}

export function triggerScriptedEvent(state: GameState): GameState {
  let next: GameState = state;
  const currentRoom = state.player.roomId;
  if (
    currentRoom === "LevelThreeCorridorSeven" &&
    state.worldState.scriptedEventsTripped["cat_meet"] !== true
  ) {
    next = appendLog(
      next,
      `As you enter the room, you see a small, black and white short-haired cat come squirming out from the small opening to the north. It shakes its head rapidly, scatting dust, then looks up at you.`,
    );
    next = moveItemToRoom(next, "cat", currentRoom);
    next = {
      ...next,
      worldState: {
        ...next.worldState,
        scriptedEventsTripped: {
          ...next.worldState.scriptedEventsTripped,
          cat_meet: true,
        },
      },
    };
  }
  return next;
}

export function triggerPlayerDeath(
  state: GameState,
  deathMessage: string,
  cause: string,
): GameState {
  let next = state;
  const roomId = state.player.roomId;

  const rebootMessage = `${deathMessage}\n\n\n *** You have died *** \n\n\n...You feel a cold chill over your body as you drift in and out of sleep...why is it so cold? You grope for a blanket, but can't find it. You have a strange, nagging feeling that keeps picking at you, pulling you from the comfort of sleep...you try and remember...\n\nYou open your eyes suddenly and jerk awake, with one of those brief, panicky flashes where you can't remember where you are...you look slowly down at yourself; you're lying sprawled out on the floor, completely naked.  When you sit up, you feel a sharp pain in your neck that triggers a memory...\n\n"I know this...I've done this before," you whisper to yourself.\n\n...but what happened? The last thing you remember...is it possible you somehow survived it? Could you have crawled here? Did someone carry you here? You try and sort it out; this isn't the first time you've woken up like this, but...you can't remember anything before that...nothing at all...`;

  next = appendLog(next, rebootMessage);

  const potentialRegenRoomIds = state.worldState.visitedRooms;
  console.log("Potential regen rooms:", potentialRegenRoomIds);
  // Pick one of those at random, and move the player, husk, etc there.

  const nextState: GameState = {
    ...next,
    player: {
      ...state.player,
      roomId: "PowerGrid",
    },
    world: {
      ...state.world,
      items: [
        ...state.world.items,
        {
          id: `playerRegenHusk${next.worldState.playerDeaths.length}`,
          location: "PowerGrid",
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
        },
      ],
    },
    worldState: {
      ...state.worldState,
      playerDeaths: {
        ...state.worldState.playerDeaths,
        [roomId]: { cause, bodyDescription: `` },
      },
    },
  };

  if (cause === "organism") {
    const seed = Date.now();
    const key = "FUNCTIONING"; // hinted in-world later

    const cipher = encryptVigenere(secretOrganismMessage, key);
    console.log(cipher);
    const display = formatCipherBlocks(cipher, 5);
    useUIEffectsStore.getState().playOrganismDeath({
      title: "SIGNAL RECEIVED",
      cipherText: encryptVigenere(display, key),
      seed,
      revealMode: "type",
      chunkMs: 22,
      chunkSize: 28,
    });
  }

  return nextState;
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
