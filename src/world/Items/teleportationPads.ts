import type { Item } from "../../game/types/itemTypes";

export const teleportationPadItems: Item[] = [
  // GREEN TELEPORT RING
  {
    id: "GreenTPADTerminal",
    name: "glossy green disk",
    description:
      "It's a flat, smooth disk, ringed with a shiny metallic band. It looks sturdy enough to stand on.",
    sceneryDescription:
      "On the floor of the terminal are a row of different colored glossy disks, each ringed by a shiny metallic band. The disks are large enough, and look sturdy enough, to stand on.", // Since there's several in the same room, have one describe them all instead of five separate items listed, give the others a blank sceneryDescription
    location: "TPADTerminal",
    vocab: ["green disk", "green", "disk", "pad"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isSurface: true,
    meta: {
      onPowered: `Each of the disks emits a soft, serene glow.`,
      teleport: {
        section: "teleport-pads-green",
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
      onPowered: `The disk emits a soft, serene glow.`,
      teleport: {
        section: "teleport-pads-green",
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
      onPowered: `The disk emits a soft, serene glow.`,
      teleport: {
        section: "teleport-pads-green",
        ring: "green",
        order: 3,
        requires: ["greenbadge", "greybadge", "blackbadge"],
      },
    },
  },
  // BLUE TELEPORT RING
  {
    id: "BlueTPADTerminal",
    name: "glossy blue disk",
    description:
      "It's a flat, smooth disk, ringed with a shiny metallic band. It looks sturdy enough to stand on.",
    // Since there's several in the same room, have GREEN describe them all instead of five separate items listed, give the others a blank sceneryDescription
    location: "TPADTerminal",
    vocab: ["blue disk", "blue", "disk", "pad"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isSurface: true,
    meta: {
      teleport: {
        section: "teleport-pads-blue",
        ring: "blue",
        order: 1,
        requires: ["bluebadge", "greybadge", "blackbadge"],
      },
    },
  },
  {
    id: "BlueTPADLab",
    name: "glossy blue disk",
    description:
      "It's a flat, smooth disk, ringed with a shiny metallic band. It looks sturdy enough to stand on.",
    sceneryDescription:
      "In one corner of the Lab you see a slightly raised blue disk, ringed by a shiny metal band.",
    location: "Lab",
    vocab: ["blue", "disk", "pad"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isSurface: true,
    meta: {
      onPowered: `The disk emits a soft, serene glow.`,
      teleport: {
        section: "teleport-pads-blue",
        ring: "blue",
        order: 2,
        requires: ["bluebadge", "greybadge", "blackbadge"],
      },
    },
  },
  {
    id: "BlueTPADRemoteMedicalOne",
    name: "glossy blue disk",
    description:
      "It's a flat, smooth disk, ringed with a shiny metallic band. It looks sturdy enough to stand on.",
    sceneryDescription:
      "In the corner you see a slightly raised blue disk, made of a hard, glossy material.",
    location: "RemoteMedicalOne",
    vocab: ["blue", "disk", "pad"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isSurface: true,
    meta: {
      onPowered: `The disk emits a soft, serene glow.`,
      teleport: {
        section: "teleport-pads-blue",
        ring: "blue",
        order: 3,
        requires: ["bluebadge", "greybadge", "blackbadge"],
      },
    },
  },
  // YELLOW TELEPORT RING
  {
    id: "YellowTPADTerminal",
    name: "glossy yellow disk",
    description:
      "It's a flat, smooth disk, ringed with a shiny metallic band. It looks sturdy enough to stand on.",
    // Since there's several in the same room, have GREEN describe them all instead of five separate items listed, give the others a blank sceneryDescription
    location: "TPADTerminal",
    vocab: ["yellow disk", "yellow", "disk", "pad"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isSurface: true,
    meta: {
      teleport: {
        section: "teleport-pads-yellow",
        ring: "yellow",
        order: 1,
        requires: ["yellowbadge", "greybadge", "blackbadge"],
      },
    },
  },
  {
    id: "YellowTPADPowerGrid",
    name: "glossy yellow disk",
    description:
      "It's a flat, smooth disk, ringed with a shiny metallic band. It looks sturdy enough to stand on.",
    sceneryDescription:
      "In one corner of the room you see a slightly raised yellow disk, ringed by a shiny metal band.",
    location: "PowerGrid",
    vocab: ["yellow", "disk", "pad"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isSurface: true,
    meta: {
      onPowered: `The disk emits a soft, serene glow.`,
      teleport: {
        section: "teleport-pads-yellow",
        ring: "yellow",
        order: 2,
        requires: ["yellowbadge", "greybadge", "blackbadge"],
      },
    },
  },
  {
    id: "YellowTPADRemotePowerStation",
    name: "glossy yellow disk",
    description:
      "It's a flat, smooth disk, ringed with a shiny metallic band. It looks sturdy enough to stand on.",
    sceneryDescription:
      "In the corner you see a slightly raised yellow disk, made of a hard, glossy material.",
    location: "RemotePowerStation",
    vocab: ["yellow", "disk", "pad"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isSurface: true,
    meta: {
      onPowered: `The disk emits a soft, serene glow.`,
      teleport: {
        section: "teleport-pads-yellow",
        ring: "yellow",
        order: 3,
        requires: ["yellowbadge", "greybadge", "blackbadge"],
      },
    },
  },
  // BROWN TELEPORT RING
  {
    id: "BrownTPADTerminal",
    name: "glossy brown disk",
    description:
      "It's a flat, smooth disk, ringed with a shiny metallic band. It looks sturdy enough to stand on.",
    // Since there's several in the same room, have GREEN describe them all instead of five separate items listed, give the others a blank sceneryDescription
    location: "TPADTerminal",
    vocab: ["brown disk", "brown", "disk", "pad"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isSurface: true,
    meta: {
      teleport: {
        section: "teleport-pads-brown",
        ring: "brown",
        order: 1,
        requires: ["brownbadge", "greybadge", "blackbadge"],
      },
    },
  },
  {
    id: "BrownTPADMainEngineering",
    name: "glossy brown disk",
    description:
      "It's a flat, smooth disk, ringed with a shiny metallic band. It looks sturdy enough to stand on.",
    sceneryDescription:
      "In one corner of the room you see a slightly raised brown disk, ringed by a shiny metal band.",
    location: "MainEngineering",
    vocab: ["brown", "disk", "pad"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isSurface: true,
    meta: {
      onPowered: `The disk emits a soft, serene glow.`,
      teleport: {
        section: "teleport-pads-brown",
        ring: "brown",
        order: 2,
        requires: ["brownbadge", "greybadge", "blackbadge"],
      },
    },
  },
  {
    id: "BrownTPADMaintenanceDuct",
    name: "glossy brown disk",
    description:
      "It's a flat, smooth disk, ringed with a shiny metallic band. It looks sturdy enough to stand on.",
    sceneryDescription:
      "In the corner you see a slightly raised brown disk, made of a hard, glossy material.",
    location: "MaintenanceDuct",
    vocab: ["brown", "disk", "pad"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isSurface: true,
    meta: {
      onPowered: `The disk emits a soft, serene glow.`,
      teleport: {
        section: "teleport-pads-brown",
        ring: "brown",
        order: 3,
        requires: ["brownbadge", "greybadge", "blackbadge"],
      },
    },
  },
  // WHITE TELEPORT RING
  {
    id: "WhiteTPADTerminal",
    name: "glossy white disk",
    description:
      "It's a flat, smooth disk, ringed with a shiny metallic band. It looks sturdy enough to stand on.",
    // Since there's several in the same room, have GREEN describe them all instead of five separate items listed, give the others a blank sceneryDescription
    location: "TPADTerminal",
    vocab: ["white disk", "white", "disk", "pad"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isSurface: true,
    meta: {
      teleport: {
        section: "teleport-pads-white",
        ring: "white",
        order: 1,
        requires: ["whitebadge", "greybadge", "blackbadge"],
      },
    },
  },
  {
    id: "WhiteTPADCryoLab",
    name: "glossy white disk",
    description:
      "It's a flat, smooth disk, ringed with a shiny metallic band. It looks sturdy enough to stand on.",
    sceneryDescription:
      "In one corner of the room you see a slightly raised white disk, ringed by a shiny metal band.",
    location: "CryoLab",
    vocab: ["white", "disk", "pad"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isSurface: true,
    meta: {
      onPowered: `The disk emits a soft, serene glow.`,
      teleport: {
        section: "teleport-pads-white",
        ring: "white",
        order: 2,
        requires: ["whitebadge", "greybadge", "blackbadge"],
      },
    },
  },
  {
    id: "WhiteTPADGridC3",
    name: "glossy white disk",
    description:
      "It's a flat, smooth disk, ringed with a shiny metallic band. It looks sturdy enough to stand on.",
    sceneryDescription:
      "In the corner you see a slightly raised white disk, made of a hard, glossy material.",
    location: "GridC3",
    vocab: ["white", "disk", "pad"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isSurface: true,
    meta: {
      onPowered: `The disk emits a soft, serene glow.`,
      teleport: {
        section: "teleport-pads-white",
        ring: "white",
        order: 3,
        requires: ["whitebadge", "greybadge", "blackbadge"],
      },
    },
  },
  // GREY TELEPORT RING
  {
    id: "GreyTPADTerminal",
    name: "glossy grey disk",
    description:
      "It's a flat, smooth disk, ringed with a shiny metallic band. It looks sturdy enough to stand on.",
    // Since there's several in the same room, have GREEN describe them all instead of five separate items listed, give the others a blank sceneryDescription
    location: "TPADTerminal",
    vocab: ["grey disk", "grey", "disk", "pad"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isSurface: true,
    meta: {
      teleport: {
        section: "teleport-pads-grey",
        ring: "grey",
        order: 1,
        requires: ["greybadge", "blackbadge"],
      },
    },
  },
  {
    id: "GreyTPADBridge",
    name: "glossy grey disk",
    description:
      "It's a flat, smooth disk, ringed with a shiny metallic band. It looks sturdy enough to stand on.",
    sceneryDescription:
      "In one corner of the room you see a slightly raised grey disk, ringed by a shiny metal band.",
    location: "Bridge",
    vocab: ["grey", "disk", "pad"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isSurface: true,
    meta: {
      onPowered: `The disk emits a soft, serene glow.`,
      teleport: {
        section: "teleport-pads-grey",
        ring: "grey",
        order: 2,
        requires: ["greybadge", "blackbadge"],
      },
    },
  },
];
