import { isAnyFlashlightOn } from "@game/helpers/flashlightHelpers";
import { TickContext } from "@game/types/context";
import { GameState } from "@game/types/gameTypes";
import { Item } from "@game/types/itemTypes";
import { Exit } from "@game/types/roomTypes";
import { getRandomOrganismAudioCue } from "src/world/Items/creatures/aviaryOrganisms";

export const engineeringOrganismItems: Item[] = [
  {
    id: "organism6",
    name: "organism-eng",
    itemCategory: "animate",
    meta: {
      isAlive: true,
      canMove: true,
      vision: "dark",
      hostility: "hostile",
      homeRegion: [],
      memories: [],
      audioCue: ({ dirFromPlayer }: { dirFromPlayer: string }) =>
        `${getRandomOrganismAudioCue(dirFromPlayer)}`,
    },
    description: "You can't see it...",
    location: "ShuttleBay",
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

export function organismOverrideTick(
  item: Item,
  state: GameState,
  rng: () => number,
  moveItemToRoom: (itemId: string, roomId: string) => GameState,
  getRoomExits: (roomId: string) => Exit[],
  isRoomDark: (roomId: string) => boolean,
  getPlayerRoomId: () => string,
  triggerPlayerDeath?: (deathMessage: string, cause: string) => void,
): GameState | void {
  // Basic guards
  if (!item.meta?.isAlive) return;
  if (!item.meta?.canMove) return;

  const playerFlashlightOn = isAnyFlashlightOn(state);
  const orgRoom = state.itemState.itemRoomId[item.id] ?? item.location;
  const playerRoom = getPlayerRoomId();

  if (!orgRoom) return;

  const orgInDark = isRoomDark(orgRoom);
  const playerInDark = playerFlashlightOn ? false : isRoomDark(playerRoom);
  const darkNeighbors = (roomId: string) =>
    getRoomExits(roomId)
      .map((e) => e.toRoomId)
      .filter((rid): rid is string => Boolean(rid))
      .filter((rid) => isRoomDark(rid));

  // If we're in the same room as the player:
  if (orgRoom === playerRoom) {
    if (orgInDark && playerInDark && triggerPlayerDeath) {
      triggerPlayerDeath(
        `In the dark, something touches you and your body goes rigid. You feel the sensation of something cold and sticky brushing over your bare skin, then a tingle, then everything gets washed away with stark, bright light. You stare into the blinding white void for only a second before being all at once replaced by sudden, final darkness.`,
        "organism",
      );
      return;
    }

    // Player is here but it's lit: refuse to engage in light; try to slip back into dark.
    const retreatOptions = darkNeighbors(orgRoom);
    if (retreatOptions.length > 0) {
      const next = retreatOptions[Math.floor(rng() * retreatOptions.length)];
      return moveItemToRoom(item.id, next);
    }
    return; // nowhere dark to go, so it just "endures" the light
  }

  // If we are currently in a lit room (should be rare), immediately move to any adjacent dark room.
  if (!orgInDark) {
    const retreatOptions = darkNeighbors(orgRoom);
    if (retreatOptions.length > 0) {
      const next = retreatOptions[Math.floor(rng() * retreatOptions.length)];
      return moveItemToRoom(item.id, next);
    }
    return; // trapped in light, can't satisfy the rule
  }

  // Target selection:
  // - If player is in dark, target playerRoom directly
  // - If player is in light, target any dark room adjacent to the player (stalk at the boundary)
  const targetRooms = new Set<string>();
  if (playerInDark) {
    targetRooms.add(playerRoom);
  } else {
    for (const r of darkNeighbors(playerRoom)) targetRooms.add(r);
  }

  if (targetRooms.size === 0) {
    // Player is in light and has no adjacent dark rooms; can't approach while staying in dark.
    // Option: remain still, or loiter in darkness.
    return;
  }

  // BFS through DARK rooms only, to find shortest path to any target room.
  // We want the next step from orgRoom.
  const visited = new Set<string>([orgRoom]);
  const queue: Array<{ roomId: string; firstStep?: string }> = [
    { roomId: orgRoom },
  ];

  while (queue.length > 0) {
    const cur = queue.shift()!;
    if (targetRooms.has(cur.roomId) && cur.firstStep) {
      return moveItemToRoom(item.id, cur.firstStep);
    }

    const exits = getRoomExits(cur.roomId);

    // Only traverse to rooms that are dark (stay in darkness)
    const nextRooms = exits
      .map((e) => e.toRoomId)
      .filter((rid): rid is string => Boolean(rid))
      .filter((rid) => isRoomDark(rid));

    // Small randomization so it doesn't feel like a perfect chess engine when ties occur
    for (let i = nextRooms.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [nextRooms[i], nextRooms[j]] = [nextRooms[j], nextRooms[i]];
    }

    for (const next of nextRooms) {
      if (visited.has(next)) continue;
      visited.add(next);
      queue.push({
        roomId: next,
        firstStep: cur.firstStep ?? next, // record the first hop out of orgRoom
      });
    }
  }

  // No dark-only path toward the player boundary.
  // Optional: drift to a random adjacent dark room (still "stays in darkness")
  const wander = darkNeighbors(orgRoom);
  if (wander.length > 0) {
    const next = wander[Math.floor(rng() * wander.length)];
    return moveItemToRoom(item.id, next);
  }

  return;
}
