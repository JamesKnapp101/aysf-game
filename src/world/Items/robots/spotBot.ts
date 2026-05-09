import { Item } from "@game/types/itemTypes";

export const spotBotItems: Item[] = [
  {
    id: "SpotBot",
    name: "The robot gym bro",
    itemCategory: "animate",
    initialDescription: `A big, broad-shouldered robot wearing a tank top sporting the gym's logo stands to one side, its thick arms crossed.`,
    description: `Its chassis gives the impression of it being almost comically muscular, with very broad shoulders, big arms, and almost no neck. It's wearing a tank top and shorts, and the expression of its projected face is cocky, but friendly.`,
    location: "GymWeightRoom",
    vocab: ["bro", "robot", "bot", "brobot", "gymbot", "spotbot"],
    itemClass: "solid",
    itemWeight: 2,
    itemSize: 2,
  },
];
