import { Item } from "@game/types/itemTypes";

export const trashBotItems: Item[] = [
  {
    id: "TrashBot",
    name: "The little trash bot",
    itemCategory: "animate",
    initialDescription: `A little robot with treads putters around nearby.`,
    description: `This robot has a cylindrical body atop a pair of treads that it uses to get around. In front it has a pair of brushes that scour the dirt and grass, flicking any foreign objects toward the chute between them.`,
    location: "ParkMaintenance",
    vocab: [
      "trash",
      "robot",
      "bot",
      "trashbot",
      "little robot",
      "sweeper",
      "sweepbot",
    ],
    itemClass: "solid",
    itemWeight: 2,
    itemSize: 2,
  },
];
