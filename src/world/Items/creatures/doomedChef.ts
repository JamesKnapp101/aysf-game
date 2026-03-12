import { Item } from "@game/types/itemTypes";

export const doomedChefItems: Item[] = [
  {
    id: "DoomedChef",
    name: "The doomed man",
    itemCategory: "animate",
    initialDescription: `A man wearing the bloodied remains of a chef's uniform lay on his back on the floor of the walk-in, his body mangled, and twisted.`,
    description: `It's hard to say what happened to him; his body has partially dissolved, and what's left is in ruins, exposing bone and viscera. His head is intact, and somehow his eyes are still open, and looking around.`,
    location: "WalkIn",
    vocab: ["chef", "doomed", "man", "guy"],
    itemClass: "solid",
    itemWeight: 2,
    itemSize: 2,
  },
];
