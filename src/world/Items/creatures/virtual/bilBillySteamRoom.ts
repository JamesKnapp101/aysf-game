import { Item } from "@game/types/itemTypes";

export const bilBillySteamRoomItems: Item[] = [
  {
    id: "BilBillySteamRoom",
    name: "A memory ghost",
    itemCategory: "animate",
    initialDescription: `A fit young man in a pair of swim trunks is here, slick with sweat.`,
    idleActions: [`The young man fidgets nervously.`],
    description: `He looks concerned about something.`,
    location: "SteamRoomMemory",
    vocab: ["young", "man", "swimsuit", "trunks"],
    itemClass: "solid",
    itemWeight: 2,
    itemSize: 2,
  },
];
