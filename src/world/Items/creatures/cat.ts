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
      vision: "dark",
      hostility: "neutral",
      homeRegion: [],
      memories: [
        "You are scampering down a hallway, near the feet of tall creatures. You dart around different sets of legs as they move. A voice calls your name from somewhere behind you.",
        "You are curled up, warm and content. You are curled on the lap of the familiar creature you live with. It's hand slowly scratches your back and head as you drift in and out of sleep.",
        "You move quickly from room to room. You feel anxious. In your mind you see the clear image of a woman. Where did she go?",
        "You see two transitioning images. One of a woman. One a pile of star-shaped kibbles. Kibbles. Kibbles. Kibbles. Kibbles.",
      ],
    },
    description:
      "It's a smallish male black and white shorthaired cat, with a nick on one ear.",
    location: "LivingQuartersOneEast",
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
            if (!exit.doorId) return true;

            const doorState = state.worldState.doors[exit.doorId];
            const isOpen = doorState?.isOpen === true;

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
