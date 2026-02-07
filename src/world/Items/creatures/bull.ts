import { appendLog } from "@game/engine/handleCommand";
import { TickContext } from "@game/types/context";
import { GameState } from "@game/types/gameTypes";
import { Item } from "@game/types/itemTypes";

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
      homeRegion: [
        "PresA",
        "PresB",
        "PresC",
        "PresD",
        "PresE",
        "PresF",
        "PresG",
      ],
      memories: [],
      chargeCooldown: 3,
      stunnedTurns: 2,
    },
    description:
      "The bull is huge, with a thick, black hide and a powerful, muscular frame. Its horns curve menacingly from its head, and its dark eyes glint, never leaving you for long. It stands with a low, threatening posture, ready to charge at any perceived threat.",
    location: "PresF",
    vocab: ["bull", "steer"],
    itemClass: "solid",
    itemWeight: 600,
    itemSize: 400,
    overrides: {
      tick: ({
        state,
        item,
        rng,
        moveItemToRoom,
        getRoomExits,
        getPlayerRoomId,
        triggerPlayerDeath,
      }: TickContext & {
        triggerPlayerDeath?: (deathMessage: string, cause: string) => void;
      }): GameState | void => {
        let nextState = state;

        const bullRoom = item.location;
        const playerRoom = getPlayerRoomId
          ? getPlayerRoomId()
          : state.player.roomId;

        const meta = (item.meta ?? {}) as any;

        const log = (text: string) => {
          nextState = appendLog(nextState, text);
        };

        const rand01 = () =>
          typeof rng === "function" ? rng() : Math.random();

        const getNextRoom = (
          fromRoomId: string,
          dir: string
        ): string | undefined => {
          const exits = getRoomExits(fromRoomId) ?? [];
          const ex = exits.find((e: any) => e.direction === dir);
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
          maxSteps: number
        ): string[] => {
          const rooms: string[] = [];
          let cur = startRoomId;
          for (let i = 0; i < maxSteps; i++) {
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
          max: number
        ): number => {
          return traceLine(targetRoomId, dir, max).length;
        };

        const moveBullTo = (roomId: string) => {
          nextState = moveItemToRoom(item.id, roomId);
        };

        const moveBullAlong = (rooms: string[]) => {
          for (const r of rooms) moveBullTo(r);
        };

        // ----------------------------
        // Meta fields
        // ----------------------------
        const pendingCharge = meta.pendingCharge as
          | { dir: string; targetRoomId: string }
          | undefined;

        meta.chargeCooldown = Math.max(0, meta.chargeCooldown ?? 0);
        meta.stunnedTurns = Math.max(0, meta.stunnedTurns ?? 0);

        if (meta.isAlive === false || meta.canMove === false) return;

        const region: string[] = meta.homeRegion ?? [];
        const inRegion =
          region.includes(playerRoom) && region.includes(bullRoom);
        if (!inRegion) return;

        // ----------------------------
        // Stun handling
        // ----------------------------
        if (meta.stunnedTurns > 0) {
          meta.stunnedTurns -= 1;
          if (meta.stunnedTurns === 0) {
            log(
              "The bull shakes its head, snorting hard, and regains its footing."
            );
          } else {
            log(
              "The bull is still stunned, hooves scraping as it tries to steady itself."
            );
          }
          return nextState;
        }

        // ----------------------------
        // Cooldown handling
        // ----------------------------
        if (meta.chargeCooldown > 0 && !pendingCharge) {
          meta.chargeCooldown -= 1;

          if (bullRoom === playerRoom) {
            log("The bull looms close, breathing hot through its nostrils.");
          } else if (rand01() < 0.25) {
            log("The bull grazes in tense circles, keeping one eye on you.");
          }

          // Optional: tiny reposition during cooldown
          if (rand01() < 0.15) {
            const exits = getRoomExits(bullRoom) ?? [];
            const candidates = exits
              .map((e: any) => e.toRoomId)
              .filter((rid: string | undefined) => rid && region.includes(rid));

            if (candidates.length > 0) {
              const idx = Math.floor(rand01() * candidates.length);
              moveBullTo(candidates[idx]);
            }
          }

          return nextState;
        }

        // ----------------------------
        // Resolve telegraphed charge
        // ----------------------------
        if (pendingCharge) {
          const { dir, targetRoomId } = pendingCharge;

          // Clear pending charge
          delete meta.pendingCharge;

          log("The bull lowers its head and charges!");

          const lineNow = traceLine(bullRoom, dir, 4);
          const playerStillInLine = lineNow.includes(playerRoom);

          if (playerStillInLine) {
            log(
              "Too slow—at the last second it corrects course and slams into you with bone-crushing force."
            );

            if (triggerPlayerDeath) {
              triggerPlayerDeath(
                "Too slow—at the last second it corrects course and slams into you with bone-crushing force.",
                "bull"
              );
              return nextState;
            }

            (nextState.player as any).isAlive = false;
            (nextState as any).gameOver = (nextState as any).gameOver ?? {
              reason: "bull",
            };
            return nextState;
          }

          const path = traceLine(bullRoom, dir, 4);
          const targetIdx = path.indexOf(targetRoomId);

          if (targetIdx === -1) {
            // Just go as far as possible
            moveBullAlong(path);
            meta.chargeCooldown = 2;
            return nextState;
          }

          const stepsToTarget = targetIdx + 1;
          const behind = countBehind(targetRoomId, dir, 4);

          if (behind === 0) {
            moveBullAlong(path.slice(0, stepsToTarget));
            log(
              "With nowhere to carry through, it smashes into the barrier and recoils, stunned."
            );
            meta.stunnedTurns = 2;
            meta.chargeCooldown = 3;
            return nextState;
          }

          if (behind === 1) {
            const nextAfterTarget = getNextRoom(targetRoomId, dir);
            const moveRooms = path.slice(0, stepsToTarget);
            if (nextAfterTarget) moveRooms.push(nextAfterTarget);

            moveBullAlong(moveRooms);
            log("It thunders past and skids hard, stopping just in time.");
            meta.chargeCooldown = 2;
            return nextState;
          }

          // 2+ behind: full charge
          moveBullAlong(path);
          meta.chargeCooldown = 2;
          return nextState;
        }

        // ----------------------------
        // Telegraph a new charge
        // ----------------------------
        const line = findPlayerLine();
        if (line) {
          const willTelegraph = rand01() < 0.85;
          if (willTelegraph) {
            meta.pendingCharge = { dir: line.dir, targetRoomId: playerRoom };
            const fromPlayerPerspective = oppositeDir(line.dir);
            log(
              `The bull stares at you from the ${fromPlayerPerspective}, pawing the ground. It's getting ready to charge!`
            );
            return nextState;
          }
        }

        // ----------------------------
        // Otherwise: wander
        // ----------------------------
        if (bullRoom === playerRoom) {
          log(
            "The bull snorts and shifts its weight, close enough that you can feel the tremor in the ground."
          );
          return nextState;
        }

        if (rand01() < 0.2) {
          const exits = getRoomExits(bullRoom) ?? [];
          const candidates = exits
            .map((e: any) => e.toRoomId)
            .filter((rid: string | undefined) => rid && region.includes(rid));

          if (candidates.length > 0) {
            const idx = Math.floor(rand01() * candidates.length);
            moveBullTo(candidates[idx]);
            // Optional: log only if player is nearby, etc.
          }
        }

        return nextState;
      },
    },
  },
];
