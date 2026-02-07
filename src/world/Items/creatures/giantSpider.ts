import { TickContext } from "@game/types/context";
import { Item } from "@game/types/itemTypes";

export const giantSpiderItems: Item[] = [
  {
    id: "spider",
    name: "massive spider",
    itemCategory: "animate",
    meta: {
      isAlive: true,
      canMove: false,
      vision: "dark",
      hostility: "neutral",
      homeRegion: [],
      memories: [],
    },
    description:
      "The creature is equal parts hideous and pitiable, its abdomen swollen to painful proportions and its long, slender legs barely able to move.",
    location: "HydroponicsOne",
    vocab: ["spider", "giant spider", "massive spider"],
    itemClass: "solid",
    itemWeight: 200,
    itemSize: 200,
    overrides: {
      tick: ({
        state,
        item,
        rng,
        moveItemToRoom,
        getRoomExits,
        isRoomDark,
      }: TickContext) => {},
    },
  },
];
