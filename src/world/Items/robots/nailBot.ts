import { Item } from "@game/types/itemTypes";

export const nailBotItems: Item[] = [
  {
    id: "NailBot",
    name: "The robot nail-tech",
    itemCategory: "animate",
    initialDescription: `A sassy looking robot stands nearby, looking you over.`,
    description: `It has the general appearance of an androgynous human, and is dressed in a crisp white uniform with a bright purple ascot. The face rendered on its face shield is full of sass, and warmth.`,
    location: "NailSalon",
    vocab: ["nail tech", "robot", "bot", "nailbot", "manibot", "pedibot"],
    itemClass: "solid",
    itemWeight: 2,
    itemSize: 2,
  },
];
