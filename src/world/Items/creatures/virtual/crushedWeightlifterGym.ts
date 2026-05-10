import { Item } from "@game/types/itemTypes";

export const crushedWeightlifterGymItems: Item[] = [
  {
    id: "CrushedWeightlifter",
    name: "The struggling man",
    itemCategory: "animate",
    initialDescription: `A muscular man with copper hair stands near one of the benches, every muscle bulging as he holds a barbell with massive weights at either end up over his head. He's managing, but his arms and legs are beginning to quiver, and the look on his face is strained, and uncertain.`,
    description: `It's hard to believe the guy is able to lift such a huge weight like that, but while it's impressive, it doesn't look very safe.`,
    location: "CrushedWeightlifterGymMemory",
    vocab: [
      "henk",
      "umboltz",
      "weightlifter",
      "meathead",
      "crushed",
      "barbell",
      "barbel",
      "weights",
    ],
    itemClass: "solid",
    itemWeight: 250,
    itemSize: 2,
  },
  {
    id: "CrushedWeightlifterMemorySpotBot",
    name: "The robot gym bro",
    itemCategory: "animate",
    initialDescription:
      "A broad-shouldered robot in an Ultra Fitness tank top stands beside the struggling lifter, apparently satisfied that it is providing moral support.",
    description:
      "The robot has a muscular chassis, a projected grin, and the upbeat posture of something that has mistaken imminent tragedy for a teachable moment.",
    location: "CrushedWeightlifterGymMemory",
    vocab: ["bro", "robot", "bot", "brobot", "gymbot", "spotbot", "spot"],
    itemClass: "solid",
    itemWeight: 200,
    itemSize: 2,
  },
];
