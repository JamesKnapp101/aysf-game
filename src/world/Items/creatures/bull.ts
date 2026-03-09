import { appendLog } from "@game/engine/handleCommand";
import { moveItemToRoom } from "@game/helpers/itemHelpers";
import { TickContext } from "@game/types/context";
import { GameState } from "@game/types/gameTypes";
import { Item } from "@game/types/itemTypes";

export const BULL_ROOM_IDS = [
  "PresA",
  "PresB",
  "PresC",
  "PresD",
  "PresE",
  "PresF",
  "PresG",
] as const;

export const BULL_INITIAL_ROOM_ID = "PresF";
export const BULL_RETRY_RESPAWN_ROOM_ID = "VeterinaryCenter";

export function createInitialBullEncounterState(): GameState["worldState"]["bullEncounter"] {
  return {
    chargeCooldown: 3,
    stunnedTurns: 0,
    pendingCharge: undefined,
  };
}

export function resetBullEncounter(state: GameState): GameState {
  const next = {
    ...state,
    worldState: {
      ...state.worldState,
      bullEncounter: createInitialBullEncounterState(),
    },
  };

  if (next.itemState.itemRoomId.bull) {
    return moveItemToRoom(next, "bull", BULL_INITIAL_ROOM_ID);
  }

  return {
    ...next,
    itemState: {
      ...next.itemState,
      itemRoomId: {
        ...next.itemState.itemRoomId,
        bull: BULL_INITIAL_ROOM_ID,
      },
    },
  };
}

function getBullRoomId(state: GameState, item: Item): string | undefined {
  return state.itemState.itemRoomId[item.id] ?? item.location ?? undefined;
}

export const bullItems: Item[] = [
  {
    id: "bull",
    name: "big black bull",
    itemCategory: "animate",
    meta: {
      isAlive: true,
      canMove: true,
      vision: "normal",
      hostility: "hostile",
      homeRegion: [...BULL_ROOM_IDS],
      memories: [],
    },
    description:
      "The bull is huge, with a thick, black hide and a powerful, muscular frame. Its horns curve menacingly from its head, and its dark eyes glint, never leaving you for long. It stands with a low, threatening posture, ready to charge at any perceived threat.",
    location: BULL_INITIAL_ROOM_ID,
    vocab: ["bull", "steer"],
    itemClass: "solid",
    itemWeight: 600,
    itemSize: 400,
    overrides: {
      tick: ({
        state,
        item,
        rng,
        moveItemToRoom: moveBullItemToRoom,
        getRoomExits,
        getPlayerRoomId,
        triggerPlayerDeath,
      }: TickContext & {
        triggerPlayerDeath?: (deathMessage: string, cause: string) => void;
      }): GameState | void => {
        let nextState = state;

        const bullRoom = getBullRoomId(nextState, item);
        const playerRoom = getPlayerRoomId
          ? getPlayerRoomId()
          : state.player.roomId;
        if (!bullRoom) return nextState;

        const meta = (item.meta ?? {}) as {
          isAlive?: boolean;
          canMove?: boolean;
          homeRegion?: string[];
        };
        const region: string[] = meta.homeRegion ?? [];
        const inRegion =
          region.includes(playerRoom) && region.includes(bullRoom);
        if (meta.isAlive === false || meta.canMove === false || !inRegion) {
          return nextState;
        }

        let bullEncounter =
          nextState.worldState.bullEncounter ?? createInitialBullEncounterState();

        const commitBullEncounter = () => {
          nextState = {
            ...nextState,
            worldState: {
              ...nextState.worldState,
              bullEncounter: {
                ...bullEncounter,
              },
            },
          };
        };

        const log = (text: string) => {
          nextState = appendLog(nextState, text);
        };

        const rand01 = () =>
          typeof rng === "function" ? rng() : Math.random();

        const getNextRoom = (
          fromRoomId: string,
          dir: string,
        ): string | undefined => {
          const exits = getRoomExits(fromRoomId) ?? [];
          const ex = exits.find((candidate: any) => candidate.direction === dir);
          return ex?.toRoomId;
        };

        const oppositeDir = (dir: string): string => {
          switch (dir) {
            case "north":
              return "south";
            case "south":
              return "north";
            case "east":
              return "west";
            case "west":
              return "east";
            default:
              return dir;
          }
        };

        const traceLine = (
          startRoomId: string,
          dir: string,
          maxSteps: number,
        ): string[] => {
          const rooms: string[] = [];
          let cur = startRoomId;
          for (let i = 0; i < maxSteps; i += 1) {
            const nxt = getNextRoom(cur, dir);
            if (!nxt) break;
            rooms.push(nxt);
            cur = nxt;
          }
          return rooms;
        };

        const findPlayerLine = (): {
          dir: string;
          steps: number;
          path: string[];
        } | null => {
          const dirs = ["north", "south", "east", "west"] as const;
          for (const dir of dirs) {
            const path = traceLine(bullRoom, dir, 4);
            const idx = path.indexOf(playerRoom);
            if (idx >= 0) return { dir, steps: idx + 1, path };
          }
          return null;
        };

        const countBehind = (
          targetRoomId: string,
          dir: string,
          max: number,
        ): number => traceLine(targetRoomId, dir, max).length;

        const moveBullTo = (roomId: string) => {
          nextState = moveBullItemToRoom(item.id, roomId);
        };

        const moveBullAlong = (rooms: string[]) => {
          for (const roomId of rooms) moveBullTo(roomId);
        };

        const pendingCharge = bullEncounter.pendingCharge;
        bullEncounter = {
          ...bullEncounter,
          chargeCooldown: Math.max(0, bullEncounter.chargeCooldown ?? 0),
          stunnedTurns: Math.max(0, bullEncounter.stunnedTurns ?? 0),
        };

        if (bullEncounter.stunnedTurns > 0) {
          bullEncounter = {
            ...bullEncounter,
            stunnedTurns: bullEncounter.stunnedTurns - 1,
          };
          if (bullEncounter.stunnedTurns === 0) {
            log(
              "The bull shakes its head, snorting hard, and regains its footing.",
            );
          } else {
            log(
              "The bull is still stunned, hooves scraping as it tries to steady itself.",
            );
          }
          commitBullEncounter();
          return nextState;
        }

        if (bullEncounter.chargeCooldown > 0 && !pendingCharge) {
          bullEncounter = {
            ...bullEncounter,
            chargeCooldown: bullEncounter.chargeCooldown - 1,
          };

          if (bullRoom === playerRoom) {
            log("The bull looms close, breathing hot through its nostrils.");
          } else if (rand01() < 0.25) {
            log("The bull grazes in tense circles, keeping one eye on you.");
          }

          if (rand01() < 0.15) {
            const exits = getRoomExits(bullRoom) ?? [];
            const candidates = exits
              .map((exit: any) => exit.toRoomId)
              .filter(
                (roomId: string | undefined) =>
                  roomId && region.includes(roomId),
              );

            if (candidates.length > 0) {
              const idx = Math.floor(rand01() * candidates.length);
              moveBullTo(candidates[idx]);
            }
          }

          commitBullEncounter();
          return nextState;
        }

        if (pendingCharge) {
          const { dir, targetRoomId } = pendingCharge;
          bullEncounter = {
            ...bullEncounter,
            pendingCharge: undefined,
          };

          log("The bull lowers its head and charges!");

          const lineNow = traceLine(bullRoom, dir, 4);
          const playerStillInLine = lineNow.includes(playerRoom);

          if (playerStillInLine) {
            if (triggerPlayerDeath) {
              commitBullEncounter();
              triggerPlayerDeath(
                "Too slow-at the last second it corrects course and slams into you with bone-crushing force.",
                "bull",
              );
              return;
            }

            commitBullEncounter();
            return {
              ...nextState,
              player: {
                ...nextState.player,
                roomId: BULL_RETRY_RESPAWN_ROOM_ID,
              },
            };
          }

          const path = traceLine(bullRoom, dir, 4);
          const targetIdx = path.indexOf(targetRoomId);

          if (targetIdx === -1) {
            moveBullAlong(path);
            bullEncounter = {
              ...bullEncounter,
              chargeCooldown: 2,
            };
            commitBullEncounter();
            return nextState;
          }

          const stepsToTarget = targetIdx + 1;
          const behind = countBehind(targetRoomId, dir, 4);

          if (behind === 0) {
            moveBullAlong(path.slice(0, stepsToTarget));
            log(
              "With nowhere to carry through, it smashes into the barrier and recoils, stunned.",
            );
            bullEncounter = {
              ...bullEncounter,
              stunnedTurns: 2,
              chargeCooldown: 3,
            };
            commitBullEncounter();
            return nextState;
          }

          if (behind === 1) {
            const nextAfterTarget = getNextRoom(targetRoomId, dir);
            const moveRooms = path.slice(0, stepsToTarget);
            if (nextAfterTarget) moveRooms.push(nextAfterTarget);

            moveBullAlong(moveRooms);
            log("It thunders past and skids hard, stopping just in time.");
            bullEncounter = {
              ...bullEncounter,
              chargeCooldown: 2,
            };
            commitBullEncounter();
            return nextState;
          }

          moveBullAlong(path);
          bullEncounter = {
            ...bullEncounter,
            chargeCooldown: 2,
          };
          commitBullEncounter();
          return nextState;
        }

        const line = findPlayerLine();
        if (line && rand01() < 0.85) {
          bullEncounter = {
            ...bullEncounter,
            pendingCharge: { dir: line.dir, targetRoomId: playerRoom },
          };
          const fromPlayerPerspective = oppositeDir(line.dir);
          log(
            `The bull stares at you from the ${fromPlayerPerspective}, pawing the ground. It's getting ready to charge!`,
          );
          commitBullEncounter();
          return nextState;
        }

        if (bullRoom === playerRoom) {
          log(
            "The bull snorts and shifts its weight, close enough that you can feel the tremor in the ground.",
          );
          commitBullEncounter();
          return nextState;
        }

        if (rand01() < 0.2) {
          const exits = getRoomExits(bullRoom) ?? [];
          const candidates = exits
            .map((exit: any) => exit.toRoomId)
            .filter(
              (roomId: string | undefined) =>
                roomId && region.includes(roomId),
            );

          if (candidates.length > 0) {
            const idx = Math.floor(rand01() * candidates.length);
            moveBullTo(candidates[idx]);
          }
        }

        commitBullEncounter();
        return nextState;
      },
    },
  },
];
