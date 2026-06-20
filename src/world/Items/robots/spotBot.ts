import { Item } from "@game/types/itemTypes";

export const spotBotItems: Item[] = [
  {
    id: "SpotBot",
    name: "The robot gym bro",
    idleActions: [
      "The robot uses a towel to wipe down some of the equipment.",
      "The robot returns a stray dumbbell to the rack with effortless precision.",
      "The robot checks the collars on a barbell, tightening each one with a sharp twist.",
      "The robot rolls its broad shoulders and performs a perfectly calibrated stretch.",
      "The robot gives the weight bench an encouraging slap, as if trying to motivate it.",
    ],
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
