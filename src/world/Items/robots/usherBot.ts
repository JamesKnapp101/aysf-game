import { Item } from "@game/types/itemTypes";

export const usherBotItems: Item[] = [
  {
    id: "UsherBot",
    name: "The robot usher",
    itemCategory: "animate",
    initialDescription: `A robot wearing an usher's uniform stands near the theater doors.`,
    description: `Its rendered face glows in the dim light as it stands at the ready..`,
    location: "MovieEntrance",
    vocab: ["usher", "robot", "bot", "usherbot"],
    itemClass: "solid",
    itemWeight: 2,
    itemSize: 2,
  },
];
