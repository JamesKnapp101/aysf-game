import type { Item } from "../../game/types/itemTypes";

type WaterTemps = "frozen" | "cold" | "ambient" | "hot" | "boiling";

export const generalItems: Item[] = [
  {
    id: "water",
    name: "water",
    itemCategory: "fluid",
    isConsumable: true,
    meta: {
      liquid: {
        temperature: "ambient" as WaterTemps,
        purity: "unknown",
        frozenName: "ice",
      },
    },
    description: "Good old H2O",
    location: "",
    vocab: ["water"],
    itemClass: "liquid",
    itemWeight: 0,
    itemSize: 0,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
];
