import { appendLog } from "@game/engine/handleCommand";
import { getAdjacentItemContacts } from "@game/helpers/adjacentContacts";
import { GameState } from "@game/types/gameTypes";
import { Direction } from "@game/types/roomTypes";

export type AudioCueContext = {
  state: GameState;
  item: any;
  dirFromPlayer: Direction;
};

export type AudioCue =
  | string
  | ((ctx: AudioCueContext) => string | null | undefined);

export type AudioCueRegistry = Record<string, AudioCue>; // keyed by itemId

export type ResolvedAdjacentAudioCue = {
  dirFromPlayer: Direction;
  itemId: string;
  text: string;
};

export function formatAudioDirectionMovement(dir: Direction | string): string {
  if (dir === "down") return "down below";
  if (dir === "up") return "up above";
  return `to the ${dir}`;
}

export function formatAudioDirectionSource(dir: Direction | string): string {
  if (dir === "down") return "from down below";
  if (dir === "up") return "from up above";
  return `from the ${dir}`;
}

export function resolveAudioCue(
  ctx: AudioCueContext,
  registry?: AudioCueRegistry,
): string | null {
  const { item, dirFromPlayer } = ctx;

  const metaCue: AudioCue | undefined = item?.meta?.audioCue;
  if (typeof metaCue === "function") return metaCue(ctx) ?? null;
  if (typeof metaCue === "string")
    return metaCue.replace("${dir}", dirFromPlayer);

  const regCue = registry?.[item.id];
  if (typeof regCue === "function") return regCue(ctx) ?? null;
  if (typeof regCue === "string")
    return regCue.replace("${dir}", dirFromPlayer);

  const hostility = item?.meta?.hostility;
  if (hostility === "hostile")
    return `You hear something moving ${formatAudioDirectionMovement(
      dirFromPlayer,
    )}.`;

  if (item?.id?.toLowerCase()?.includes("bomb")) {
    return `You hear a ticking sound coming ${formatAudioDirectionSource(
      dirFromPlayer,
    )}.`;
  }
  if (item?.id?.toLowerCase()?.includes("organism")) {
    return `You hear a strange shifting sound coming ${formatAudioDirectionSource(
      dirFromPlayer,
    )}. There's something in the darkness there.`;
  }
  return null;
}

export function getResolvedAdjacentAudioCues(
  state: GameState,
  opts?: {
    includeItem?: (item: any) => boolean;
    registry?: AudioCueRegistry;
    region?: Set<string>;
  },
): ResolvedAdjacentAudioCue[] {
  const playerRoomId = state.player.roomId;
  const region = opts?.region;

  if (region && !region.has(playerRoomId)) {
    return [];
  }

  const includeItem =
    opts?.includeItem ??
    ((item: any) =>
      item?.itemCategory === "animate" ||
      typeof item?.meta?.audioCue === "string" ||
      typeof item?.meta?.audioCue === "function" ||
      item?.id?.toLowerCase()?.includes("bomb"));

  const contacts = getAdjacentItemContacts(state, includeItem);
  if (contacts.length === 0) {
    return [];
  }

  const candidates: ResolvedAdjacentAudioCue[] = [];

  for (const contact of contacts) {
    const item = (state.world.items as any[]).find(
      (candidate) => candidate.id === contact.itemId,
    );
    if (!item) continue;

    const text = resolveAudioCue(
      { state, item, dirFromPlayer: contact.dirFromPlayer },
      opts?.registry,
    );
    if (!text) continue;

    candidates.push({
      dirFromPlayer: contact.dirFromPlayer,
      itemId: contact.itemId,
      text,
    });
  }

  return candidates;
}

export function emitAdjacentAudioCues(
  state: GameState,
  opts?: {
    includeItem?: (item: any) => boolean;
    registry?: AudioCueRegistry;
    maxLinesPerTick?: number;
    chance?: number;
    region?: Set<string>;
  },
): GameState {
  const maxLinesPerTick = opts?.maxLinesPerTick ?? 1;
  const chance = opts?.chance ?? 0.65;
  let updatedAudioState = state;

  const rng = (state as any).rng ?? Math.random;
  const roll = typeof rng === "function" ? rng() : Math.random();
  if (roll > chance) return state;

  const region = opts?.region;
  const playerRoomId = state.player.roomId;
  if (region && !region.has(playerRoomId)) return state;

  const includeItem =
    opts?.includeItem ??
    ((item: any) =>
      item?.itemCategory === "animate" ||
      typeof item?.meta?.audioCue === "string" ||
      typeof item?.meta?.audioCue === "function" ||
      item?.id?.toLowerCase()?.includes("bomb"));

  const contacts = getAdjacentItemContacts(state, includeItem);
  if (contacts.length === 0) return state;

  const candidates = getResolvedAdjacentAudioCues(state, {
    includeItem,
    registry: opts?.registry,
  });

  if (candidates.length === 0) {
    if (contacts.length === 0) {
      updatedAudioState = {
        ...updatedAudioState,
        worldState: {
          ...updatedAudioState.worldState,
          roomAudioLevel: {
            ...updatedAudioState.worldState.roomAudioLevel,
            [playerRoomId]:
              updatedAudioState.worldState.roomAudioLevel?.[playerRoomId] - 2 ||
              0,
          },
        },
      };
      return updatedAudioState;
    } else {
      updatedAudioState = {
        ...updatedAudioState,
        worldState: {
          ...updatedAudioState.worldState,
          roomAudioLevel: {
            ...updatedAudioState.worldState.roomAudioLevel,
            [playerRoomId]: 2,
          },
        },
      };
    }
    return updatedAudioState;
  }
  updatedAudioState = {
    ...updatedAudioState,
    worldState: {
      ...updatedAudioState.worldState,
      roomAudioLevel: {
        ...updatedAudioState.worldState.roomAudioLevel,
        [playerRoomId]: 2,
      },
    },
  };

  // Pick up to N (random-ish)
  // let next = state;
  const remainingCandidates = [...candidates];
  for (
    let i = 0;
    i < Math.min(maxLinesPerTick, remainingCandidates.length);
    i++
  ) {
    const idx = Math.floor(
      (typeof rng === "function" ? rng() : Math.random()) *
        remainingCandidates.length,
    );
    const [picked] = remainingCandidates.splice(idx, 1);
    updatedAudioState = appendLog(updatedAudioState, picked.text);
  }

  return updatedAudioState;
}
