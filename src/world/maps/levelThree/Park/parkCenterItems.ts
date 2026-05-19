import type { Item } from "@game/types/itemTypes";

export const parkCenterItems: Item[] = [
  {
    id: "ParkCenterStoneCircle",
    name: "sand colored stone circle",
    description:
      "The sand colored stone is polished to a mirror shine.",
    sceneryDescription:
      "the grass gives way to a wide circle of sand colored stone, polished to a mirror shine.",
    location: "ParkCenter",
    vocab: ["stone", "circle", "sand", "colored", "pavement", "grass"],
    itemClass: "solid",
    itemCategory: "scenery",
    meta: {
      sceneryDescriptionOrder: 1,
    },
    itemWeight: 500,
    itemSize: 10,
  },
  {
    id: "dias",
    name: "circular onyx dais",
    description:
      "The circular dais is made of polished onyx and stands at the center of the stone circle.",
    sceneryDescription:
      "In the center of the circle stands a circular onyx dais.",
    location: "ParkCenter",
    vocab: ["dais", "dias", "onyx", "platform", "base"],
    itemClass: "solid",
    itemCategory: "scenery",
    meta: {
      sceneryDescriptionOrder: 2,
    },
    itemWeight: 300,
    itemSize: 10,
  },
  {
    id: "obelisk",
    name: "large vantawhite obelisk",
    description:
      "The obelisk is an impossible, clean white, rising two stories from the onyx dais.",
    sceneryDescription:
      "Atop the dais rests a large vantawhite obelisk that towers two stories in the air.",
    location: "ParkCenter",
    vocab: ["obelisk", "monument", "stone", "vantawhite", "white"],
    itemClass: "solid",
    itemCategory: "scenery",
    meta: {
      sceneryDescriptionOrder: 3,
    },
    itemWeight: 500,
    itemSize: 10,
    isReadable: true,
    readableText: "To The Infinite Beyond! - Walt Pixar, circa 02000 BC2",
  },
  {
    id: "ParkCenterEngravedRing",
    name: "engraved stone ring",
    description:
      "An engraved ring of stone circles the base of the obelisk.",
    sceneryDescription:
      "Around the base of the obelisk is an engraved ring of stone that reads 'To The Infinite Beyond! - Walt Pixar, circa 02000 BC2'.",
    location: "ParkCenter",
    vocab: ["ring", "engraving", "engraved", "stone", "inscription"],
    itemClass: "solid",
    itemCategory: "scenery",
    meta: {
      sceneryDescriptionOrder: 4,
    },
    itemWeight: 100,
    itemSize: 8,
    isReadable: true,
    readableText: "To The Infinite Beyond! - Walt Pixar, circa 02000 BC2",
  },
  {
    id: "ParkCenterBrickPaths",
    name: "radiating brick paths",
    description:
      "Brick paths radiate away from the stone circle toward the rest of the park.",
    sceneryDescription:
      "Brick paths radiate from the stone circle in every direction, leading to other areas of the park.",
    location: "ParkCenter",
    vocab: ["paths", "path", "brick", "radiating", "walkway"],
    itemClass: "solid",
    itemCategory: "scenery",
    meta: {
      sceneryDescriptionOrder: 5,
    },
    itemWeight: 100,
    itemSize: 10,
  },
];
