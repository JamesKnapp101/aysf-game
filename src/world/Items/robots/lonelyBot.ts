import { Item } from "@game/types/itemTypes";

export const lonelyBotItems: Item[] = [
  {
    id: "LonelyBot",
    name: "The lonely robot",
    itemCategory: "animate",
    initialDescription: `A robot stands on the other side of the room, observing you.`,
    description: `It has a human-like chassis, an all-purpose model by the looks of it, and is fully dressed in workman's blue jumpsuit with boots and gloves. I wears a cap on its head, and even a little scarf in an attempt to hide its origins, maybe, though the face shield with the rendered face gave it away pretty quickly.`,
    location: "RobotRefuge",
    vocab: ["lonely", "robot", "bot", "lonelybot"],
    itemClass: "solid",
    itemWeight: 2,
    itemSize: 2,
  },
];
