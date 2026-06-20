import { Item } from "@game/types/itemTypes";

export const usherBotItems: Item[] = [
  {
    id: "UsherBot",
    name: "The robot usher",
    idleActions: [
      "The robot usher straightens a velvet rope until it hangs just so.",
      "The robot usher brushes a mote of dust from the front of its uniform.",
      `The robot usher glances suspiciously toward the bathroom.\n\n"They better not be smoking in there..." it mutters to itself.`,
      "The robot usher wakes the ticket scanner, confirms its green light, and lets it sleep again.",
      "The robot usher gestures toward the theater with silent courtesy, then lowers its arm.",
    ],
    itemCategory: "animate",
    initialDescription: `A robot wearing an usher's uniform stands near the theater doors.`,
    description: `Its rendered face glows in the dim light as it stands at the ready.`,
    location: "MovieTheaterLobby",
    vocab: ["usher", "robot", "bot", "usherbot"],
    itemClass: "solid",
    itemWeight: 2,
    itemSize: 2,
  },
];
