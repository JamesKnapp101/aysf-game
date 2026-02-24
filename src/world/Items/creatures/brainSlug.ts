import { Item } from "@game/types/itemTypes";

export const brainSlugItems: Item[] = [
  {
    id: "BrainSlug",
    name: "brain slug",
    named: (state) => {
      const hydrated = state.worldState.brainSlug.isHydrated;
      return hydrated ? `green, gelatinous slug` : `dried green rag`;
    },
    itemCategory: "collectable",
    initialDescription: `Laying atop the dresser is a dried green rag, with a little note next to it that reads 'Return to Edwardix - Don't forget!'`,
    describe: (state, item) => {
      const hydrated = state.worldState.brainSlug.isHydrated;
      const attachedTo = state.worldState.brainSlug.attachedTo;
      if (hydrated) {
        if (attachedTo === "ComaDude") {
          return `It brings to mind a jellyfish of some sort with a translucent dark green color. It has a gelatinous body the size of a grapefruit, with many plump, dangling tentacles that currently cling to the scalp of an unconscious young man.`;
        }
        return `It brings to mind a jellyfish of some sort with a translucent dark green color. It has a gelatinous body the size of a grapefruit, with many plump, dangling tentacles.`;
      } else {
        return `It's a dark green rag, all wrinkled, dried, and crusty. You're not sure what kind of fabric it is.`;
      }
    },
    location: "SixEastBed",
    vocab: [
      "gelatinous",
      "green",
      "slug",
      "brain",
      "jellyfish",
      "rag",
      "dry",
      "crusty",
      "holothuroidea",
      "adduco",
    ],
    itemClass: "solid",
    itemWeight: 2,
    itemSize: 2,
    description: "It's a green something...",
  },
];
