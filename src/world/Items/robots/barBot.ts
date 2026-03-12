import { Item } from "@game/types/itemTypes";

export const barBotItems: Item[] = [
  {
    id: "BarBot",
    name: "The robot bartender",
    itemCategory: "animate",
    initialDescription: `A robot stands behind the bar, ready to serve, or provide conversation.`,
    description: `The robot has a human build, and stands about six feet tall. It's snappily dressed in slacks and a buttoned white shirt, with a bow tie and leather suspenders. The face that glows on its face shield looks handsome, and empathetic.`,
    location: "Bar",
    vocab: ["barbot", "robot", "bot", "bartender", "mixologist"],
    itemClass: "solid",
    itemWeight: 2,
    itemSize: 2,
  },
];
