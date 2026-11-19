import { Item } from "@game/types/itemTypes";

export const oldManStairBottomItems: Item[] = [
  {
    id: "OldManStairBottom",
    name: "The memory ghost",
    itemCategory: "animate",
    initialDescription: `An old man crouches in the shadows under the stairwell. He's dressed in a blue robe, with wild white hair, and he's got both hands wrapped around some sort of small device.`,
    idleActions: [`The old man mutters something to himself.`],
    description: `His eyes are a little wild. He looks scared, but also very determined as he clutches an electronic timer in his hands.`,
    location: "OldManStairBottomMemory",
    vocab: ["old", "man", "blue", "robe"],
    itemClass: "solid",
    itemWeight: 2,
    itemSize: 2,
  },
];
