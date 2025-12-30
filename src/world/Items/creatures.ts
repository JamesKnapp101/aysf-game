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
      memories: [
        "You are scampering down a hallway, near the feet of tall creatures. You dart around different sets of legs as they move. A voice calls your name from somewhere behind you.",
        "You are curled up, warm and content. You are curled on the lap of the familiar creature you live with. It's hand slowly scratches your back and head as you drift in and out of sleep.",
        "You move quickly from room to room. You feel anxious. In your mind you see the clear image of a woman. Where did she go?",
        "You see two transitioning images. One of a woman. One a pile of star-shaped kibbles. Kibbles. Kibbles. Kibbles. Kibbles.",
      ],
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
  {
    id: "gorilla",
    name: "silverback gorilla",
    itemCategory: "animate",
    meta: {
      isAlive: true,
      canMove: true,
      canOpenDoors: true,
      vision: "dark",
      hostility: "aggressive",
      homeRegion: [],
      memories: [
        "You are standing in the zoo area with a young man standing in front of you. The man smiles warmly. The man holds out a toy stuffed bear. Like bear. Like man. You take the bear and hold it to your chest...",
        "You are sitting in the zoo area with a young man standing in front of you. Man has shiny stinger in hand. Needle with plunger. You feel anxiety. Urge to lash out, but the young man pets you. Scratches your head. Soothes you. You let him sting with needle.",
        "You are lying in soft bedding. A cryopod. Holding bear. Still feel anxiety, but man is by your side, smiling. Know man. Trust man. He pets you on the head as he coaxes the bear away. Feel very tired...",
        "You are lying on a threadbare, blue flannel blanket, drifting in and out of sleep. Like blanket. Blanket smell like me. Smell like man. The blanket makes you feel safe, and calm.",
        "You see the male accompanied by another. Don't know other, but the hairless male trusts it so you feel a little more relaxed...^",
        "you are sitting on a hard, smooth surface near a set of bars.  The groups of mostly hairless creatures that pass through have stopped for the day, but the awful combination of smells still lingers and you feel miserable.  A moment later the door that the black, mostly hairless creature usually comes through to leave food opens.  He enters, but this time he has no food, and he is accompanied by a smaller, pink male.^",
      ],
    },
    description:
      "It's a huge male silverback gorilla...standing so close to it you can truly appreciate its massiveness; it must be over three times your size and at least 600 pounds. It's incredible shoulder, arm, and chest muscles look capable of bending steel but there does seem to be a curious intelligence in its sunken eyes.",
    location: "ZooTwo",
    vocab: ["gorilla", "ape", "jinto"],
    itemClass: "solid",
    itemWeight: 600,
    itemSize: 300,
    overrides: {
      tick: ({
        state,
        item,
        rng,
        moveItemToRoom,
        getRoomExits,
        isRoomDark,
      }: TickContext) => {
        if (rng() < 0.9) return;

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
