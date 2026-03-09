import {
  AVIARY_ROOM_IDS,
  createInitialAviarySpotlightState,
  isRoomSpotlitByAviary,
} from "@game/engine/ticks/aviaryTick";
import { TickContext } from "@game/types/context";
import { GameState } from "@game/types/gameTypes";
import { Item } from "@game/types/itemTypes";
import { Exit } from "@game/types/roomTypes";

export const AVIARY_RETRY_RESPAWN_ROOM_ID = "ZooOne";

export function getRandomOrganismAudioCue(dirFromPlayer: string): string {
  const r = Math.floor(Math.random() * (100 - 1 + 1)) + 1;
  if (r < 10) {
    return `You hear a faint chittering sound coming from the ${dirFromPlayer}.`;
  }
  if (r < 25) {
    return `You catch the sound of soft, wet slapping noises from the ${dirFromPlayer}.`;
  }
  if (r < 45) {
    return `You hear a low, guttural rustling sound coming from the ${dirFromPlayer}.`;
  }
  if (r < 70) {
    return `You hear a series of quiet, rapid tapping sounds from the ${dirFromPlayer}.`;
  }
  if (r < 90) {
    return `You hear a subtle, rhythmic thudding sound coming from the ${dirFromPlayer}.`;
  }
  return `You hear something moving in the darkness to the ${dirFromPlayer}.`;
}

export const aviaryOrganismItems: Item[] = [
  {
    id: "organism1",
    name: "organism",
    itemCategory: "animate",
    meta: {
      isAlive: true,
      canMove: true,
      vision: "dark",
      hostility: "hostile",
      homeRegion: AVIARY_ROOM_IDS,
      memories: [],
      audioCue: ({ dirFromPlayer }: { dirFromPlayer: string }) =>
        `${getRandomOrganismAudioCue(dirFromPlayer)}`,
    },
    description: "You can't see it...",
    location: "OuterRingNorth",
    vocab: ["organism"],
    itemClass: "solid",
    itemWeight: 8,
    itemSize: 2,
    overrides: {
      tick: ({
        state,
        item,
        rng,
        moveItemToRoom,
        getRoomExits,
        isRoomDark,
        getPlayerRoomId,
        triggerPlayerDeath,
      }: TickContext & {
        triggerPlayerDeath?: (deathMessage: string, cause: string) => void;
      }): GameState | void => {
        return organismOverrideTick(
          item,
          state,
          rng,
          moveItemToRoom,
          getRoomExits,
          isRoomDark,
          getPlayerRoomId,
          triggerPlayerDeath,
        );
      },
    },
  },
];

export function resetAviaryEncounter(state: GameState): GameState {
  const organismRoomPatch = Object.fromEntries(
    aviaryOrganismItems.map((item) => [item.id, item.location]),
  );

  return {
    ...state,
    worldState: {
      ...state.worldState,
      aviarySpotlight: createInitialAviarySpotlightState(),
    },
    itemState: {
      ...state.itemState,
      itemRoomId: {
        ...state.itemState.itemRoomId,
        ...organismRoomPatch,
      },
    },
  };
}

export function getAviaryNextSpotlitRoomId(state: GameState): string | null {
  const spot = state.worldState.aviarySpotlight;
  if (!spot) return null;

  if (spot.turnsLeftHere !== 1) return null;

  const nextIndex = (spot.index + 1) % spot.route.length;
  return spot.route[nextIndex] ?? null;
}

const ORGANISM_ATTACK_MESSAGE = `You can still see the column of light from the Aviary spotlight cutting through the darkness from above, but its light doesn't reach you. You stand in the darkness, listening intently as something moves nearby, perhaps studying you. You spin around, trying to pinpoint the source of the sound but before you even catch a glimpse of it, you feel it land on your back, something large, and heavy, with internal shifting and covered with squirming cilia that cling to the back of your neck, over your shoulders and down your back, all the way down to your legs. Your jaw unhinges as the cilia burrow, then penetrate, through the skin and deep into your flesh. You stare at the moving spotlight as the image splits into two, then three, before fracturing completely into a thousand dancing points of light as your vision fades to black...`;

function organismOverrideTick(
  item: Item,
  state: GameState,
  rng: () => number,
  moveItemToRoom: (itemId: string, roomId: string) => void,
  getRoomExits: (roomId: string) => Exit[],
  isRoomDark: (roomId: string) => boolean,
  getPlayerRoomId?: () => string | null,
  triggerPlayerDeath?: (deathMessage: string, cause: string) => void,
): void {
  if (!AVIARY_ROOM_IDS.has(state.player.roomId)) return; // Don't bother running them if player not in aviary

  const meta = item.meta ?? {};
  if (!meta.isAlive || !meta.canMove) return;

  const here = state.itemState.itemRoomId[item.id];
  if (!here) return;

  const playerRoomId = getPlayerRoomId
    ? getPlayerRoomId()
    : ((state as any).player?.roomId ?? (state as any).playerRoomId);
  if (!playerRoomId) return;

  const die = () => {
    if (triggerPlayerDeath) {
      triggerPlayerDeath(ORGANISM_ATTACK_MESSAGE, "organismAttack");
    } else {
      console.log("TODO: What do I want to do in this case?");
    }
  };

  if (here === playerRoomId) {
    die();
    return;
  }

  if (!isRoomDark(here)) return;

  const regionRaw = meta.homeRegion as unknown;
  const region =
    regionRaw instanceof Set
      ? regionRaw
      : new Set<string>(Array.isArray(regionRaw) ? regionRaw : []);
  if (!region.has(here)) return;

  const inSameRegion = region.has(playerRoomId);

  const exitsFrom = (roomId: string): string[] =>
    (getRoomExits(roomId) ?? [])
      .map((e: any) => e?.toRoomId)
      .filter((to: string | undefined): to is string => !!to);

  const reservedLitRoom = getAviaryNextSpotlitRoomId(state);

  const legalDarkNeighbors = (roomId: string): string[] => {
    const out: string[] = [];
    for (const to of exitsFrom(roomId)) {
      if (!region.has(to)) continue;
      if (reservedLitRoom && to === reservedLitRoom) continue; // NEW
      if (!isRoomDark(to)) continue;
      out.push(to);
    }
    return out;
  };

  const moveTo = (toRoomId: string) => {
    moveItemToRoom(item.id, toRoomId);

    if (toRoomId === playerRoomId) {
      die();
    }
  };

  const wander = () => {
    const choices = legalDarkNeighbors(here);
    if (choices.length === 0) return;
    const pick = choices[Math.floor(rng() * choices.length)];
    moveTo(pick);
  };

  if (!inSameRegion) {
    wander();
    return;
  }

  if (!isRoomDark(playerRoomId)) {
    wander();
    return;
  }

  const playerWillBeLit = reservedLitRoom === playerRoomId;

  if (playerWillBeLit) {
    wander();
    return;
  }

  const queue: string[] = [here];
  const prev = new Map<string, string | null>();
  prev.set(here, null);

  const MAX_VISITS = 64;
  let visits = 0;

  while (queue.length && visits++ < MAX_VISITS) {
    const cur = queue.shift()!;
    if (cur === playerRoomId) break;

    for (const nxt of legalDarkNeighbors(cur)) {
      if (prev.has(nxt)) continue;
      prev.set(nxt, cur);
      queue.push(nxt);
    }
  }

  if (!prev.has(playerRoomId)) {
    wander();
    return;
  }

  let step = playerRoomId;
  let p = prev.get(step);
  while (p && p !== here) {
    step = p;
    p = prev.get(step) ?? null;
  }

  const legal = new Set(legalDarkNeighbors(here));
  if (!legal.has(step)) {
    wander();
    return;
  }
  if (step === playerRoomId && isRoomSpotlitByAviary(state, step)) {
    return; // don't move into spotlighted room
  }
  moveTo(step);
}
