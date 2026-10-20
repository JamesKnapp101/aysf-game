import type { Item } from "@game/types/itemTypes";

export const gymShowerItems: Item[] = ["MensShower", "WomensShower"].flatMap(
  (location): Item[] => [
    {
      id: `${location}Showers`,
      name: "communal shower",
      description:
        "It's a tiled communal shower with a series of showerheads and faucets at regular intervals. Everything is totally dry at the minute.",
      location,
      vocab: ["shower", "showers"],
      itemClass: "solid",
      itemCategory: "scenery",
      itemWeight: 200,
      itemSize: 10,
    },
    {
      id: `${location}Showerheads`,
      name: "showerheads",
      description: "The showerheads are adjustable, with multi-spray settings.",
      location,
      vocab: ["showerhead", "showerheads"],
      itemClass: "solid",
      itemCategory: "scenery",
      itemWeight: 5,
      itemSize: 2,
    },
    {
      id: `${location}Faucets`,
      name: "faucets",
      description: "Standard hot and cold.",
      location,
      vocab: ["faucet", "faucets", "water"],
      itemClass: "solid",
      itemCategory: "scenery",
      itemWeight: 5,
      itemSize: 2,
      isTurnable: true,
      commandAliases: [
        {
          verb: "turn",
          preposition: "on",
          device: "direct",
          canonicalVerb: "turn",
        },
      ],
      overrides: {
        turn: "Nothing happens. Not even a drip.",
      },
    },
    {
      id: `${location}Benches`,
      name: "wooden benches",
      description: "The wooden surface is well worn.",
      location,
      vocab: ["bench", "benches"],
      itemClass: "solid",
      itemCategory: "scenery",
      itemWeight: 80,
      itemSize: 8,
    },
  ],
);
