import { Item } from "@game/types/itemTypes";

export const rhimberlySteamRoomItems: Item[] = [
  {
    id: "RhimberlySteamRoom",
    name: "A memory ghost",
    itemCategory: "animate",
    initialDescription: `An athletic young woman in a black one-piece is here, wet hair dangling over her shoulders.`,
    idleActions: [`The young woman picks at one of her fingernails.`],
    description: `She has sort of a thousand-mile stare.`,
    location: "SteamRoomMemory",
    vocab: ["young", "woman", "one-piece"],
    itemClass: "solid",
    itemWeight: 2,
    itemSize: 2,
  },
];
