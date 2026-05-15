import { Item } from "@game/types/itemTypes";

export const inckGlassboolItems: Item[] = [
  {
    id: "DisembodiedHeadBarBathroom",
    name: "The young man",
    itemCategory: "animate",
    initialDescription: `A young man dressed in black slacks, a white shirt, and a bow tie stands in front of the bathroom sink.`,
    description: `He looks pretty scared.`,
    location: "BarBasementHeadMemory",
    vocab: ["inck", "Glassbool", "young", "man", "stock", "boy"],
    itemClass: "solid",
    itemWeight: 250,
    itemSize: 2,
  },
  {
    id: "DisembodiedHeadBarBasement",
    name: "The young man",
    itemCategory: "animate",
    initialDescription: `A young man dressed in black slacks, a white shirt, and a bow tie stands in the shadows beneath the open hatch. He looks scared, looking up plaintively as if he wasn't sure he should stick his head up to look.`,
    description: `He looks pretty scared.`,
    location: "BarBasementHeadMemory2",
    vocab: ["inck", "Glassbool", "young", "man", "stock", "boy"],
    itemClass: "solid",
    itemWeight: 250,
    itemSize: 2,
  },
];
