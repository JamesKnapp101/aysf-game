import { appendLog } from "@game/engine/handleCommand";
import { GameState } from "@game/types/gameTypes";

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
  "brown",
  "white",
  "grey",
] as const;

export function generateTerminalTpadDescription(
  power: PowerRestoredSections
): string {
  const onColors = TPAD_COLORS_IN_ORDER.filter(
    (c) => power[`teleport-pads-${c}`] === true
  );

  const base =
    "Against the wall is a row of colored, glossy disks, side by side, ordered green, blue, yellow, brown, white, and grey. Each of them is large enough to stand on.";

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

export function triggerPlayerDeath(
  state: GameState,
  deathMessage: string,
  cause: string
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

  return nextState;
}
