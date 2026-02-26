import { appendLog } from "@game/engine/handleCommand";
import { getExitDestinationRoomId } from "@game/helpers/itemHelpers";
import { TickContext } from "@game/types/context";
import { ItemId } from "@game/types/ids";
import { Item } from "@game/types/itemTypes";
import { Exit } from "@game/types/roomTypes";

export const catItems: Item[] = [
  {
    id: "cat",
    name: "black and white cat",
    itemCategory: "animate",
    meta: {
      isAlive: true,
      canMove: true,
      canOpenDoors: true,
      vision: "dark",
      hostility: "neutral",
      homeRegion: [
        "LevelThreeCorridorFive",
        "LevelThreeCorridorSix",
        "LevelThreeCorridorSixPointSix",
        "LevelThreeCorridorSeven",
        "LevelThreeCubby",
        "LevelThreeDuct",
        "LevelThreeSecretRoom",
        "LivingQuartersFiveWest",
        "FiveWestBath",
        "FiveWestBed",
        "LivingQuartersSixEast",
        "SixEastBath",
        "SixEastBed",
      ],
      memories: [
        "You are scampering down a hallway, near the feet of tall creatures. You dart around different sets of legs as they move. A voice calls your name from somewhere behind you.",
        "You are curled up, warm and content. You are curled on the lap of the familiar creature you live with. It's hand slowly scratches your back and head as you drift in and out of sleep.",
        "You move quickly from room to room. You feel anxious. In your mind you see the clear image of a woman. Where did she go?",
        "You see two transitioning images. One of a woman. One a pile of star-shaped kibbles. Kibbles. Kibbles. Kibbles. Kibbles.",
      ],
    },
    description:
      "It's a smallish male black and white shorthaired cat, with a nick on one ear.",
    location: "seeded",
    vocab: ["cat", "kitten", "kitty"],
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
        emit,
      }: TickContext) => {
        // 60% chance the cat does nothing this tick
        const acts = rng() >= 0.6;

        const itemId = item.id as ItemId;
        const currentRoomId = state.itemState.itemRoomId[itemId];
        if (!currentRoomId) return;

        const playerRoomId = state.player.roomId;
        const playerPrevRoomId = state.player.prevRoomId;

        const home = (item.meta?.homeRegion ?? []) as string[];
        const inHome = (roomId: string) => home.includes(roomId);

        // Safety clamp: cat should never be outside homeRegion
        if (!inHome(currentRoomId)) {
          const safe = home.includes("LevelThreeSecretRoom")
            ? "LevelThreeSecretRoom"
            : home[0];
          if (safe) return moveItemToRoom(itemId, safe);
          return;
        }

        // If idle, optionally show an idle message ONLY if player is present
        if (!acts) {
          if (currentRoomId === playerRoomId) {
            const idleMsgs = [
              "The cat stretches, then yawns.",
              "The cat grooms itself, fastidious and wary.",
              "The cat’s ears twitch as it listens, then it settles again.",
            ];
            const msg = idleMsgs[Math.floor(rng() * idleMsgs.length)];
            return appendLog(state, msg);
          }
          return;
        }

        const canOpenDoors = item.meta?.canOpenDoors === true;

        // Build candidate exits, respecting doors and homeRegion restriction
        const exits = getRoomExits(currentRoomId)
          .map((e) => {
            const toRoomId = getExitDestinationRoomId(state, currentRoomId, e);
            return { exit: e, toRoomId };
          })
          .filter((x): x is { exit: Exit; toRoomId: string } => !!x.toRoomId)
          .filter(({ toRoomId }) => inHome(toRoomId))
          .filter(({ exit }) => {
            if (!exit.doorId) return true;

            const doorState = state.worldState.doors[exit.doorId];
            const isOpen = doorState?.isOpen === true;

            return isOpen || canOpenDoors;
          });

        if (!exits.length) return;

        // Prefer dark rooms (skittish), fallback to light
        const darkTargets: { toRoomId: string; exit: Exit }[] = [];
        const lightTargets: { toRoomId: string; exit: Exit }[] = [];

        for (const { toRoomId, exit } of exits) {
          if (isRoomDark(toRoomId)) darkTargets.push({ toRoomId, exit });
          else lightTargets.push({ toRoomId, exit });
        }

        const baseTargets = darkTargets.length ? darkTargets : lightTargets;
        if (!baseTargets.length) return;

        // Weighted gravitation toward the puzzle zone / hiding spot
        function weightFor(roomId: string): number {
          if (roomId === "LevelThreeSecretRoom") return 5;
          if (roomId === "LevelThreeDuct") return 5;
          if (roomId === "LevelThreeCubby") return 5;
          if (roomId.startsWith("LevelThree")) return 5;
          return 5;
        }

        // Weighted pick
        let total = 0;
        const weighted = baseTargets.map((t) => {
          const w = weightFor(t.toRoomId);
          total += w;
          return { ...t, w };
        });

        let roll = rng() * total;
        let chosen = weighted[weighted.length - 1];
        for (const t of weighted) {
          roll -= t.w;
          if (roll <= 0) {
            chosen = t;
            break;
          }
        }

        const destRoomId = chosen.toRoomId;
        const dir = chosen.exit.direction;

        function oppositeDir(dir: string): string {
          switch (dir) {
            case "north":
              return "south";
            case "south":
              return "north";
            case "east":
              return "west";
            case "west":
              return "east";
            case "up":
              return "down";
            case "down":
              return "up";
            case "in":
              return "out";
            case "out":
              return "in";
            default:
              return "nearby";
          }
        }

        const playerHereAtStart = currentRoomId === playerRoomId;
        const playerHereAtEnd = destRoomId === playerRoomId;

        const isPassBy =
          playerHereAtStart &&
          !!playerPrevRoomId &&
          destRoomId === playerPrevRoomId;

        let next = state;

        if (playerHereAtStart) {
          if (destRoomId === "LevelThreeCubby") {
            emit({
              kind: "log",
              text: "The cat squirms through the opening to the north and disappears.",
            });
          } else if (isPassBy) {
            emit({
              kind: "log",
              text: "The cat scoots past you, a blur of black and white.",
            });
          } else {
            emit({
              kind: "log",
              text: `The cat scampers off to the ${dir}.`,
            });
          }
        } else if (playerHereAtEnd) {
          const fromDir = oppositeDir(dir);
          emit({
            kind: "log",
            text: `A black and white cat darts in from the ${fromDir}, then pauses to watch you.`,
          });
        }

        // Move
        next = moveItemToRoom(itemId, destRoomId);
        return next;
      },
    },
  },
];
