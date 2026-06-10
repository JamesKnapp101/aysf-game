import { appendLog } from "@game/engine/log";
import { isRoomDark, moveItemToRoom } from "@game/helpers/itemHelpers";
import { GameState } from "@game/types/gameTypes";
import { ItemId } from "@game/types/ids";
import { Room } from "@game/types/roomTypes";

export const AVIARY_SPOTLIGHT_ROUTE: string[] = [
  "AviaryMaintenance",
  "InnerRingSouth",
  "OuterRingBottomEastBend",
  "OuterRingSouthEastBend",
  "InnerRingEast",
  "OuterRingNorthEastBend",
  "OuterRingTopEastBend",
  "InnerRingNorth",
  "OuterRingNorth",
  "OuterRingTopWestBend",
  "OuterRingNorthWestBend",
  "OuterRingSouthWestBend",
  "OuterRingBottomWestBend",
  "OuterRingSouth",
  "InnerRingSouth",
  "InnerRingWest",
];

export const AVIARY_ROOM_IDS = new Set<string>([
  "OuterRingNorth",
  "OuterRingTopEastBend",
  "OuterRingTopWestBend",
  "OuterRingNorthEastBend",
  "OuterRingNorthWestBend",
  "OuterRingSouthWestBend",
  "OuterRingSouthEastBend",
  "OuterRingBottomWestBend",
  "OuterRingBottomEastBend",
  "OuterRingSouth",
  "InnerRingNorth",
  "InnerRingEast",
  "InnerRingWest",
  "InnerRingSouth",
  "AviaryMaintenance",
]);

export function createInitialAviarySpotlightState(): GameState["worldState"]["aviarySpotlight"] {
  return {
    route: AVIARY_SPOTLIGHT_ROUTE,
    index: 0,
    turnsLeftHere: 1,
    pauseWhenPlayerNotInAviary: true,
    hintCooldown: 0,
  };
}

function isInAviary(roomId?: string | null): boolean {
  return typeof roomId === "string" && AVIARY_ROOM_IDS.has(roomId);
}

function pushLog(state: GameState, text: string): GameState {
  return appendLog(state, text);
}

function getRoomById(state: GameState, roomId: string): Room | undefined {
  const anyState = state as any;
  if (anyState.world?.roomsById?.[roomId])
    return anyState.world.roomsById[roomId];
  const rooms: Room[] | undefined = anyState.world?.rooms;
  return rooms?.find((r) => r.id === roomId);
}

function directionFromTo(
  state: GameState,
  fromRoomId: string,
  toRoomId: string,
): string | null {
  const from = getRoomById(state, fromRoomId);
  if (!from) return null;
  const ex = from.exits.find((e: any) => e.toRoomId === toRoomId);
  return ex?.direction ?? null;
}

function ensureAviarySpotlight(state: GameState): GameState {
  if (state.worldState.aviarySpotlight) return state;

  return {
    ...state,
    worldState: {
      ...state.worldState,
      aviarySpotlight: createInitialAviarySpotlightState(),
    },
  };
}

function getItemRoomId(state: GameState, itemId: string): string | undefined {
  return (state as any).itemState?.itemRoomId?.[itemId];
}

function isAviaryHostileOrganism(item: any): boolean {
  return (
    item?.itemCategory === "animate" &&
    item?.meta?.isAlive === true &&
    item?.meta?.hostility === "hostile" &&
    item?.meta?.vision === "dark"
  );
}

function findNearestDarkAviaryRoom(
  state: GameState,
  startRoomId: string,
  isRoomDarkFn: (roomId: string) => boolean,
): string | null {
  const visited = new Set<string>([startRoomId]);
  const queue: string[] = [startRoomId];

  while (queue.length) {
    const cur = queue.shift()!;
    const room = getRoomById(state, cur);
    if (!room) continue;

    for (const ex of room.exits) {
      const to = ex.toRoomId;
      if (!to) continue;
      if (!isInAviary(to)) continue;
      if (visited.has(to)) continue;
      visited.add(to);

      if (to !== startRoomId && isRoomDarkFn(to)) return to;
      queue.push(to);
    }
  }

  return null;
}

export function tickAviarySpotlight(state: GameState): GameState {
  let next = ensureAviarySpotlight(state);
  const spot = next.worldState.aviarySpotlight!;
  const playerRoomId =
    (next as any).player?.roomId ?? (next as any).playerRoomId;
  if (!playerRoomId) return next;

  const playerInAviary = isInAviary(playerRoomId);
  if (spot.pauseWhenPlayerNotInAviary && !playerInAviary) return next;

  const currentRoomId = spot.route[spot.index];
  const nextIndex = (spot.index + 1) % spot.route.length;
  const nextRoomId = spot.route[nextIndex];
  const playerIsLit = playerRoomId === currentRoomId;

  const maybeEmitNotLitHint = (): void => {
    if (!playerInAviary) return;
    if (playerIsLit) return;

    const cooldown = (spot as any).hintCooldown ?? 0;
    if (cooldown > 0) return;

    const playerRoom = getRoomById(next, playerRoomId);
    if (!playerRoom) return;

    const direct = playerRoom.exits.find((e) => e.toRoomId === currentRoomId);
    if (direct?.direction) {
      next = pushLog(
        next,
        `A pale cone of light spills in from the ${direct.direction}.`,
      );
      next = {
        ...next,
        worldState: {
          ...next.worldState,
          aviarySpotlight: {
            ...spot,
            hintCooldown: 2,
          },
        },
      };
      return;
    }

    const maxDepth = 3;
    const visited = new Set<string>([playerRoomId]);
    const queue: Array<{
      roomId: string;
      firstDir: string | null;
      depth: number;
    }> = [];

    for (const ex of playerRoom.exits) {
      if (!isInAviary(ex.toRoomId)) continue;
      queue.push({
        roomId: ex.toRoomId ?? "",
        firstDir: ex.direction,
        depth: 1,
      });
      visited.add(ex.toRoomId ?? "");
    }

    let firstDirToward: string | null = null;

    while (queue.length) {
      const node = queue.shift()!;
      if (node.roomId === currentRoomId) {
        firstDirToward = node.firstDir;
        break;
      }
      if (node.depth >= maxDepth) continue;

      const r = getRoomById(next, node.roomId);
      if (!r) continue;

      for (const ex of r.exits) {
        if (!isInAviary(ex.toRoomId)) continue;
        if (visited.has(ex.toRoomId ?? "")) continue;
        visited.add(ex.toRoomId ?? "");
        queue.push({
          roomId: ex.toRoomId ?? "",
          firstDir: node.firstDir,
          depth: node.depth + 1,
        });
      }
    }

    if (firstDirToward) {
      next = pushLog(
        next,
        `A faint moving glow filters through the foliage to the ${firstDirToward}.`,
      );
      next = {
        ...next,
        worldState: {
          ...next.worldState,
          aviarySpotlight: {
            ...spot,
            hintCooldown: 2,
          },
        },
      };
    }
  };

  const currentCooldown = (spot as any).hintCooldown ?? 0;
  if (currentCooldown > 0) {
    next = {
      ...next,
      worldState: {
        ...next.worldState,
        aviarySpotlight: {
          ...spot,
          hintCooldown: currentCooldown - 1,
        },
      },
    };
  }

  if (spot.turnsLeftHere === 2) {
    next = {
      ...next,
      worldState: {
        ...next.worldState,
        aviarySpotlight: {
          ...(next.worldState.aviarySpotlight as any),
          turnsLeftHere: 1,
        },
      },
    };

    if (playerIsLit) {
      const dir = directionFromTo(next, currentRoomId, nextRoomId);
      const msg = dir
        ? `The spotlight has begun to creep toward the ${dir}. You’d better head that way if you want to keep up with it.`
        : `The spotlight has begun to creep onward. You’d better move if you want to keep up with it.`;
      next = pushLog(next, msg);
    } else {
      maybeEmitNotLitHint();
    }
    return next;
  }

  {
    const roomBecomingLit = nextRoomId;

    if (isInAviary(roomBecomingLit)) {
      const occupants = (next.world.items as any[]).filter((it) => {
        if (!isAviaryHostileOrganism(it)) return false;
        const loc = getItemRoomId(next, it.id);
        return loc === roomBecomingLit;
      });
      if (occupants.length > 0) {
        for (const org of occupants) {
          const escapeTo = findNearestDarkAviaryRoom(
            next,
            roomBecomingLit,
            (rid) => isRoomDark(next, rid),
          );
          if (escapeTo) {
            next = moveItemToRoom(next, org.id as ItemId, escapeTo);
            next = pushLog(
              next,
              `Something skitters away as the light approaches.`,
            );
          } else {
            console.log(
              `Aviary spotlight tick: organism ${org.id} in ${roomBecomingLit} has no dark escape route!`,
            );
          }
        }
      }
    }
  }

  next = {
    ...next,
    worldState: {
      ...next.worldState,
      aviarySpotlight: {
        ...(next.worldState.aviarySpotlight as any),
        index: nextIndex,
        turnsLeftHere: 2,
      },
    },
  };

  if (playerInAviary && playerRoomId !== nextRoomId) {
    const spot2 = next.worldState.aviarySpotlight as any;
    const oldSpot = spot;
    (next.worldState as any).aviarySpotlight = spot2;
    const litRoomNow = spot2.route[spot2.index];
    const playerIsLitNow = playerRoomId === litRoomNow;
    if (!playerIsLitNow) {
      const cooldown = spot2.hintCooldown ?? 0;
      if (cooldown <= 0) {
        const playerRoom = getRoomById(next, playerRoomId);
        if (playerRoom) {
          const direct = playerRoom.exits.find(
            (e) => e.toRoomId === litRoomNow,
          );
          if (direct?.direction) {
            next = pushLog(
              next,
              `Light spills in from the ${direct.direction}.`,
            );
            next = {
              ...next,
              worldState: {
                ...next.worldState,
                aviarySpotlight: {
                  ...spot2,
                  hintCooldown: 2,
                },
              },
            };
          }
        }
      }
    }
    void oldSpot;
  }
  return next;
}

export function getAviarySpotlitRoomId(state: GameState): string | null {
  const spot = state.worldState.aviarySpotlight as any;
  if (!spot) return null;
  return spot.route[spot.index];
}

export function isRoomSpotlitByAviary(
  state: GameState,
  roomId: string,
): boolean {
  const lit = getAviarySpotlitRoomId(state);
  return lit === roomId;
}
