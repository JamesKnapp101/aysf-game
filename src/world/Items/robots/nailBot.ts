import { Item } from "@game/types/itemTypes";

export const nailBotItems: Item[] = [
  {
    id: "NailBot",
    name: "The robot nail-tech",
    idleActions: [
      "The nail-tech robot fans a set of tiny brushes across its workstation.",
      "The nail-tech robot rearranges several polish bottles into a flawless gradient.",
      "The nail-tech robot lets out a chuckle then scribbles something in its burn book.",
      "The nail-tech robot buffs an already spotless tool and holds it up for inspection.",
      "The nail-tech robot glances at your hands and raises a critical eyebrow.",
    ],
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
