import { Item } from "@game/types/itemTypes";

export const masterOfDrinkItems: Item[] = [
  {
    id: "MasterOfDrink",
    name: "The Master of Drink",
    itemCategory: "animate",
    initialDescription: `You're not sure where you are but the air crackles here, filled by the ebb and flow of the surf, or maybe static. You feel a presence here, something close by, but just out of sight.`,
    description: `You can't see him, but you sense that he's there.`,
    location: "BarVisionQuest",
    vocab: [
      "master",
      "drink",
      "master of drink",
      "the master of drink",
      "the master",
    ],
    itemClass: "solid",
    itemWeight: 2,
    itemSize: 2,
  },
];
