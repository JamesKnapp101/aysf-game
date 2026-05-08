import { Item } from "@game/types/itemTypes";

export const moxStairBottomItems: Item[] = [
  {
    id: "MoxStairBottom",
    name: "The memory ghost",
    itemCategory: "animate",
    initialDescription: `A bald man wearing a jumpsuit falls alongside you, headfirst, bare toes pointing up. He has a flashlight in one hand, and a paper note in the other that flaps in the wind.`,
    description: `He looks surprised.`,
    location: "FallenCorpseMemory",
    vocab: ["scientist", "man", "guy", "mox"],
    itemClass: "solid",
    itemWeight: 2,
    itemSize: 2,
  },
];
