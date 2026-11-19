import { Item } from "@game/types/itemTypes";

export const oldWomanCorpseItems: Item[] = [
  {
    id: "OldWomanPark",
    name: "The memory ghost",
    itemCategory: "animate",
    initialDescription: `An old woman dressed in a knit shawl sits quietly on the bench. She barely takes up any space at all as she sits, hands folded in her lap while gazing up at the blue sky.`,
    idleActions: [`The old woman lets out a weary sigh.`],
    description: `It's hard to say what she's thinking. She looks wistful, maybe, and a little sad.`,
    location: "OldWomanCorpseMemory",
    vocab: ["old", "woman"],
    itemClass: "solid",
    itemWeight: 2,
    itemSize: 2,
  },
];
