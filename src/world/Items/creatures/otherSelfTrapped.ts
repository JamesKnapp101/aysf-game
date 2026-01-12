import { TickContext } from "@game/types/context";
import { Item } from "@game/types/itemTypes";

export const catItems: Item[] = [
  {
    id: "OtherSelfTrapped",
    name: "pinned man",
    itemCategory: "animate",
    meta: {
      isAlive: true,
      canMove: false,
      vision: "normal",
      hostility: "neutral",
      homeRegion: [],
      memories: [],
    },
    description: "A man, pinned underneath a collapsed beam.",
    location: "Warehouse",
    vocab: ["man", "injured man", "pinned man"],
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
        if (rng() < 0.9) return;

        // This is copied over from the cat, so uses it
      },
    },
  },
];
