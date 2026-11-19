import { Item } from "@game/types/itemTypes";

export const stairSixItems: Item[] = [
  {
    id: "joelsonDendStairSix",
    name: "The memory ghost",
    itemCategory: "animate",
    initialDescription: `A young man dressed in a blue collared shirt, khaki pants, and leather shoes stands midway down the stairwell, uncertain.`,
    idleActions: [`The young man fidgets nervously.`],
    description: `He looks like he was headed down the stairs, but then he remembered something.`,
    location: "StairSixBodyMemory",
    vocab: ["young", "man", "joelson", "dend"],
    itemClass: "solid",
    itemWeight: 2,
    itemSize: 2,
  },
];
