import { Item } from "@game/types/itemTypes";

export const lonelyBotItems: Item[] = [
  {
    id: "LonelyBot",
    name: "The lonely robot",
    idleActions: [
      "The lonely robot adjusts its little scarf, then lets its hands fall to its sides.",
      "The lonely robot smooths an imaginary wrinkle from its workman's jumpsuit.",
      "The lonely robot glances toward you as if about to speak, but thinks better of it.",
      "The lonely robot studies its gloved hands in quiet contemplation.",
      "The lonely robot shifts its weight and watches the doorway for someone who does not arrive.",
    ],
    itemCategory: "animate",
    initialDescription: `A robot stands on the other side of the room, observing you.`,
    description: `It has a human-like chassis, an all-purpose model by the looks of it, and is fully dressed in workman's blue jumpsuit with boots and gloves. I wears a cap on its head, and even a little scarf in an attempt to hide its origins, maybe, though the face shield with the rendered face gives it away pretty quickly.`,
    location: "RobotRefuge",
    vocab: ["lonely", "robot", "bot", "lonelybot"],
    itemClass: "solid",
    itemWeight: 2,
    itemSize: 2,
  },
];
