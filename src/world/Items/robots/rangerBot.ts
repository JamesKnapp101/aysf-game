import { Item } from "@game/types/itemTypes";

export const rangerBotItems: Item[] = [
  {
    id: "RangerBot",
    name: "Ranger Rick",
    itemCategory: "animate",
    initialDescription: `A robot wearing a park ranger uniform stands in front of the entrance to the west.`,
    description: `The unit's chassis is molded to have human proportions, if one with a low center of gravity, and is able to fit into an unaltered human uniform. It wears a ranger hat on its head, and the cheerful eyes on its rendered face watch you from beneath the brim.`,
    location: "ParkEntrance",
    vocab: ["ranger", "robot", "bot", "rangerbot"],
    itemClass: "solid",
    itemWeight: 2,
    itemSize: 2,
  },
];
