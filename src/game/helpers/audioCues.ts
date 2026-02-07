import { appendLog } from "@game/engine/handleCommand";
import { getAdjacentItemContacts } from "@game/helpers/adjacentContacts";
import { GameState } from "@game/types/gameTypes";
import { Direction } from "@game/types/roomTypes";

type AudioCueContext = {
  state: GameState;
  item: any;
  dirFromPlayer: Direction;
};

type AudioCue = string | ((ctx: AudioCueContext) => string | null | undefined);

type AudioCueRegistry = Record<string, AudioCue>; // keyed by itemId

function resolveAudioCue(
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
    return `You hear something moving to the ${dirFromPlayer}.`;

  if (item?.id?.toLowerCase()?.includes("bomb")) {
    return `You hear a ticking sound coming from the ${dirFromPlayer}.`;
  }
  if (item?.id?.toLowerCase()?.includes("organism")) {
    return `You hear a strange shifting sound coming from the ${dirFromPlayer}. There's something in the darkness there.`;
  }
  return null;
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

  const candidates: Array<{ itemId: string; text: string }> = [];
  for (const c of contacts) {
    const item = (state.world.items as any[]).find((it) => it.id === c.itemId);
    if (!item) continue;

    const text = resolveAudioCue(
      { state, item, dirFromPlayer: c.dirFromPlayer },
      opts?.registry,
    );
    if (text) candidates.push({ itemId: c.itemId, text });
  }

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
  for (let i = 0; i < Math.min(maxLinesPerTick, candidates.length); i++) {
    const idx = Math.floor(
      (typeof rng === "function" ? rng() : Math.random()) * candidates.length,
    );
    const [picked] = candidates.splice(idx, 1);
    updatedAudioState = appendLog(updatedAudioState, picked.text);
  }

  return updatedAudioState;
}
