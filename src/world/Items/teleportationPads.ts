import type { Item } from "../../game/types/itemTypes";

export const teleportationPadItems: Item[] = [
  {
    id: "GreenTPADTerminal",
    name: "glossy green disk",
    description:
      "It's a flat, smooth disk, ringed with a shiny metallic band. It looks sturdy enough to stand on.",
    sceneryDescription:
      "On the floor of the terminal are a row of different colored glossy disks, each ringed by a shiny metallic band. The disks are large enough, and look sturdy enough, to stand on.",
    location: "TPADTerminal",
    vocab: ["green disk", "green", "disk", "pad"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isSurface: true,
    meta: {
      teleport: {
        ring: "green",
        order: 1,
        requires: ["greenbadge", "greybadge", "blackbadge"],
      },
    },
  },
  {
    id: "GreenTPADHubCenter",
    name: "glossy green disk",
    description:
      "It's a flat, smooth disk, ringed with a shiny metallic band. It looks sturdy enough to stand on.",
    sceneryDescription:
      "Just off the paved area is a four foot by four foot square stepping stone, upon which is a slightly raised green disk ringed by a shiny metal band.",
    location: "HubCenter",
    vocab: ["green", "disk", "pad"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isSurface: true,
    meta: {
      teleport: {
        ring: "green",
        order: 2,
        requires: ["greenbadge", "greybadge", "blackbadge"],
      },
    },
  },
  {
    id: "GreenTPADHydroponicsOne",
    name: "glossy green disk",
    description:
      "It's a flat, smooth disk, ringed with a shiny metallic band. It looks sturdy enough to stand on.",
    sceneryDescription:
      "In the grass near the hatch you see a four foot by four foot stepping stone, upon which is mounted a slightly raised green disk, made of a hard, glossy material.",
    location: "HydroponicsOne",
    vocab: ["green", "disk", "pad"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isSurface: true,
    meta: {
      teleport: {
        ring: "green",
        order: 3,
        requires: ["greenbadge", "greybadge", "blackbadge"],
      },
    },
  },
];
