import { getExitDestinationRoomId } from "../../game/helpers/itemHelpers";
import type { TickContext } from "../../game/types/context";
import type { ItemId } from "../../game/types/ids";
import type { Item } from "../../game/types/itemTypes";
import type { Exit } from "../../game/types/roomTypes";

export const creatureItems: Item[] = [
  {
    id: "cat",
    name: "black and white cat",
    itemCategory: "animate",
    meta: {
      isAlive: true,
      canMove: true,
      vision: "dark",
      hostility: "neutral",
      homeRegion: [],
    },
    description:
      "It's a smallish male black and white shorthaired cat, with a nick on one ear.",
    location: "LivingQuartersSixWest",
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
      }: TickContext) => {
        if (rng() < 0.1) return;

        const itemId = item.id as ItemId;
        const currentRoomId = state.itemState.itemRoomId[itemId];
        if (!currentRoomId) return;

        const canOpenDoors = item.meta?.canOpenDoors === true;

        const exits = getRoomExits(currentRoomId)
          .map((e) => {
            const toRoomId = getExitDestinationRoomId(state, currentRoomId, e);
            return { exit: e, toRoomId };
          })
          .filter((x): x is { exit: Exit; toRoomId: string } => !!x.toRoomId)
          .filter(({ exit }) => {
            // no door => always passable
            if (!exit.doorId) return true;

            const doorState = state.worldState.doors[exit.doorId];
            const isOpen = doorState?.isOpen === true;

            // If you truly want "only if open" no matter what, use: return isOpen;
            // Otherwise, allow door traversal if the creature can open doors.
            return isOpen || canOpenDoors;
          });

        if (!exits.length) return;

        const darkTargets: string[] = [];
        const lightTargets: string[] = [];

        for (const { toRoomId } of exits) {
          if (isRoomDark(toRoomId)) darkTargets.push(toRoomId);
          else lightTargets.push(toRoomId);
        }

        const targets = darkTargets.length ? darkTargets : lightTargets;
        if (!targets.length) return;

        const nextRoomId = targets[Math.floor(rng() * targets.length)];
        return moveItemToRoom(itemId, nextRoomId);
      },
    },
  },
];
